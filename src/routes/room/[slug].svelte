<script lang="ts">
	import { page } from '$app/stores';
	import { getContext, tick } from 'svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { PARTICIPANT_ACCESS_TOKEN_CONTRACT, PARTICIPANT_ACCESS_TOKEN_BYTECODE } from '$lib/contracts/pat';
	import { addressName, address, token } from '$lib/store';
	import { RingLoader } from 'svelte-loading-spinners';
	import type { Writable } from 'svelte/store';
	import { variables } from '$lib/variables';
	import type Web3 from 'web3';
	import Button from '$lib/components/Button.svelte';
	import SendTip from '$lib/components/SendTip.svelte';
	import Participant from '$lib/components/Participant.svelte';
	import PendingParticipant from '$lib/components/PendingParticipant.svelte';
	import Input from '$lib/components/Input.svelte';
	import { goto } from '$app/navigation';

	const chain: Writable<Web3> = getContext('chain');

	let contract;
	let patContractAddress;
	let iframeApi: any = false;
	let connected = false;
	let transactionFailed = false;
	let loading = false;
	let dominantSpeaker: false | string = false;
	let participantsList: Array<any> = [];

	let roomExists = false;
	let isMember = false;
	let isPublic = true;
	let createPublic = false;

	let invitee = '';

	let creating = false;
	let minting = false;
	let joining = false;

	let requestedToJoin = false;
	let pendingMemberships: Array<string> = [];

	const domain = variables.jitsiDomain ?? 'video.collaboratory.io';

	async function requestJoinRoom() {
		loading = true;
		contract.methods
			.requestToJoinRoom($page.params.slug)
			.send( { from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info({ transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				loading = false;
				requestedToJoin = true;
				console.info({ confirmationNumber, receipt });
				pollForMembershipChanges();
			})
			.on('receipt', function (receipt) {
				// receipt example
				console.info({ receipt });
			})
			.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.error(error);
				console.info({ receipt });
				transactionFailed = true;
				loading = false;
			});
	}

	async function createRoom() {
		loading = true;
		creating = true;
		const toDeploy =  new $chain.eth.Contract(PARTICIPANT_ACCESS_TOKEN_CONTRACT);
		const patContract = await toDeploy
			.deploy({
				data: PARTICIPANT_ACCESS_TOKEN_BYTECODE,
				arguments: [$address]
			})
			.send({ from: $address }, function (error, transactionHash) {})
			.on('error', function (error) {
				console.error(error);
				transactionFailed = true;
				loading = false;
			})
			.on('transactionHash', function (transactionHash) {
				console.info('Transaction hash: ' + transactionHash);
			})
			.on('receipt', function (receipt) {
				console.info('Deployed address: ' + receipt.contractAddress); // contains the new contract address
			})
			.on('confirmation', function (confirmationNumber, receipt) {});
		creating = false;
		console.log(patContract.options.address); // instance with the new contract address
		// This mints a token to the caller's address
		let tokenMinted = false;
		minting = true;
		patContract.methods
			.safeMint($address)
			.send( { from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info({ transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				console.info({ confirmationNumber, receipt });
				// When the access token is minted, call the OpenHouse contract to register the room->PAT contract mapping
				if (!tokenMinted) {
					minting = false;
					tokenMinted = true;
					joining = true;
					contract.methods
						.createRoomWithContract($page.params.slug, patContract.options.address, createPublic)
						.send({ from: $address })
						.on('transactionHash', function (transactionHash) {
							console.info({ transactionHash });
						})
						.on('confirmation', function (confirmationNumber, receipt) {
							loading = false;
							isMember = true;
							console.info({ confirmationNumber, receipt });
							joining = false;
						})
						.on('receipt', function (receipt) {
							// receipt example
							console.info({ receipt });
						})
						.on('error', function (error, receipt) {
							// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
							console.error(error);
							console.info({ receipt });
							transactionFailed = true;
							loading = false;
							tokenMinted = false;
						});
				}
			})
			.on('receipt', function (receipt) {
				// receipt example
				console.info({ receipt });
			})
			.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.error(error);
				console.info({ receipt });
				transactionFailed = true;
				loading = false;
			});
	}

	function initializeJitsi() {
		if (!connected && $addressName) {
			tick().then(() => {
				const options = {
					roomName: $page.params.slug,
					height: 600,
					userInfo: {
						displayName: $address
					},
					parentNode: (window as any).document.querySelector('#meet'),
					jwt: $token
				};
				iframeApi = new (window as any).JitsiMeetExternalAPI(domain, options);
				iframeApi.addEventListener('dominantSpeakerChanged', (event) => {
					const participants = iframeApi.getParticipantsInfo();
					const participant = participants.find((p) => p.participantId === event.id);
					dominantSpeaker = participant?.displayName;
				});
				connected = true;
				pollForMembershipChanges();
			});
		}
	}

	async function getPendingMemberships() {
		contract.methods
			.getMembershipRequests($page.params.slug)
			.call()
			.then((list) =>{
				console.log(list);
				pendingMemberships = list;
		});
	}

	async function pollForMembershipChanges() {
		while (isMember && connected) {
			let isMem = await isUserInRoom();
			if (!isMem) {
				isMember = isMem;
				iframeApi.executeCommand('hangup');
				goto('/');
			}
			console.log('isMem = ' + isMem);
			participantsList = iframeApi.getParticipantsInfo();
			await getPendingMemberships();
			await sleep(1000);
		}
		while (!isMember) {
			let isMem = await isUserInRoom();
			if (isMem) {
				isMember = isMem;
				contract.methods
					.removeMembershipRequest($page.params.slug, $address)
					.send({from: $address})
					.on('transactionHash', function (transactionHash) {
						console.info({ transactionHash });
					})
					.on('confirmation', function (confirmationNumber, receipt) {
						initializeJitsi();
					}).on('receipt', function (receipt) {
				// receipt example
						console.info({ receipt });
					})
					.on('error', function (error, receipt) {
						// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
						console.error('transaction failure', error);
					});
			}
			await sleep(1000);
		}
	}

	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	async function getPatContractAddress() {
		return await contract.methods
			.getAddressForRoom($page.params.slug)
			.call({from: $address});
	}

	async function getPatContract() {
		patContractAddress = await getPatContractAddress();
		return new $chain.eth.Contract(PARTICIPANT_ACCESS_TOKEN_CONTRACT, patContractAddress);
	}

	const onFormSubmit = async () => {
		const patContract = await getPatContract();
		patContract.methods
			.safeMint(invitee)
			.send({from :$address})
			.on('transactionHash', function (transactionHash) {
				console.info({ transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				console.info({ confirmationNumber, receipt });
			})
			.on('receipt', function (receipt) {
				// receipt example
				console.info({ receipt });
			})
			.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.error(error);
				console.info({ receipt });
			});
	}

	async function isUserInRoom() {
		const patContract = await getPatContract();
		let tokenBalance = await patContract.methods.balanceOf($address).call();
		console.log('Token balance: ' + tokenBalance);
		return tokenBalance > 0;
	}

	$: if (chain && $chain && $token && $addressName && !iframeApi) {
		contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		contract.methods
			.roomExists($page.params.slug)
			.call({ from: $address })
			.then((exists) => {
				console.log('Room exists', $page.params.slug, $address, exists);
				roomExists = exists;

				if (roomExists) {
					isUserInRoom()
						.then((isMem) => {
							isMember = isMem;
							if (!isMember) {
								contract.methods
									.getMembershipRequests($page.params.slug)
									.call()
									.then((membersList) =>{
										if (membersList.includes($address.toString())) {
											requestedToJoin = true;
										}
								});
								// TODO: mint a new token for the joining user if possible?
							}
						});
				}
			});
	}

	$: if (chain && $chain && isMember && !connected) {
		initializeJitsi();
	}
</script>

<section>
	<div class="heading">
		<h1>{$page.params.slug}</h1>
		<div>
			{#if connected}
			<form on:submit|preventDefault={onFormSubmit}>
				<Input
					type="text"
					name="addressInvite"
					id="addressInvite"
					bind:value={invitee}
				/>
				<Button attach="left" type="submit" disabled={!connected}>
					Add address
				</Button>
			</form>
			{/if}
		</div>
		{#if connected}
			<h4>Connected</h4>
		{/if}
	</div>
	{#if !isMember}
		{#if loading}
			<p>
			{#if creating}Creating...{/if}
			{#if minting}Minting...{/if}
			{#if joining}Joining..{/if}
			</p>
			<RingLoader size="120" color="#FF3E00" unit="px" duration="1s" />
		{:else if !roomExists}
			<div class="room__create">
				<p>This conference does not exist yet!</p>
				<Button fullWidth size="large" on:click={createRoom}>Create this Conference</Button>
				<label for="public"
					>Anyone can view member list & topic <input
						type="checkbox"
						name="public"
						id="public"
						bind:checked={createPublic}
					/></label
				>
			</div>
		{:else}
			<p>
				This conference room is private. 
				{#if requestedToJoin} Your request to join is pending.{:else}<Button on:click={requestJoinRoom}>Request to join</Button>{/if}
			</p>
		{/if}
	{:else if !transactionFailed}
		{#if !connected}
			<RingLoader size="120" color="#FF3E00" unit="px" duration="1s" />
		{/if}
	{/if}
	{#if transactionFailed}
		<h1>Transaction failed. Please try again.</h1>
	{/if}
	<div id="meet" />
	{#if connected}
		<div class="toolbar">
			{#if dominantSpeaker}
				<div class="tipspeaker">
					<SendTip to={dominantSpeaker} resetOnSuccess>
						Tip Speaker
						<svelte:fragment slot="success">Your tip was sent successfully!</svelte:fragment>
					</SendTip>
					<div class="tipspeaker__id">
						({dominantSpeaker})
					</div>
				</div>
			{:else}
				Waiting for participants
			{/if}
		</div>
		{#if pendingMemberships.length > 0}
			{#each pendingMemberships as p}
				<PendingParticipant user={p} contractAddress={patContractAddress} room={$page.params.slug}/> 
			{/each}
		{/if}
		{#if participantsList.length > 1}
		{#each participantsList as p}
		<div class="participants">
			<div>
				<Participant user={p.displayName} room={$page.params.slug}/>
				{p.displayName}
			</div>
		</div>
	{/each}
		{/if}
	{/if}
</section>

<style>
	section {
		padding: 24px 12px 6px 12px;
	}
	h1 {
		padding-bottom: 24px;
	}
	.heading {
		display: flex;
		justify-content: space-between;
	}
	.toolbar {
		background: var(--color-aqua-10);
		padding: 12px 24px;
	}
	.tipspeaker {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.tipspeaker__id {
		font-size: 12px;
		padding-top: 12px;
	}

	.room__create {
		text-align: center;
		margin: auto;
		max-width: 420px;
	}
</style>
