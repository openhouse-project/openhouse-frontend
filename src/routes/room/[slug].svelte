<script lang="ts">
	const RARIBLE_API_BASE = 'https://api-dev.rarible.com/protocol/v0.1/ethereum';
	import { page } from '$app/stores';
	import { getContext, tick } from 'svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import {
		PARTICIPANT_ACCESS_TOKEN_CONTRACT,
		PARTICIPANT_ACCESS_TOKEN_BYTECODE
	} from '$lib/contracts/pat';
	import { addressName, address, token } from '$lib/store';
	import { RingLoader } from 'svelte-loading-spinners';
	import type { Writable } from 'svelte/store';
	import { variables } from '$lib/variables';
	import type Web3 from 'web3';
	import Button from '$lib/components/Button.svelte';
	import SendTip from '$lib/components/SendTip.svelte';

	//const ipfs = create({host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
	import Participant from '$lib/components/Participant.svelte';
	import PendingParticipant from '$lib/components/PendingParticipant.svelte';
	import Input from '$lib/components/Input.svelte';
	import { goto } from '$app/navigation';

	const chain: Writable<Web3> = getContext('chain');

	interface ParticipantData {
		displayName?: string;
	}

	let contract;
	let patContractAddress;
	let iframeApi: any = false;
	let connected = false;
	let transactionFailed = false;
	let loading = false;
	let dominantSpeaker: false | string = false;
	let participantsList: Array<ParticipantData> = [];

	let roomExists = false;
	let isMember = false;
	let createPublic = false;
	let nfts = [];
	let backgroundImageUrl = 'https://austingriffith.com/images/paintings/zebra.jpg';

	let invitee = '';

	let creating = false;
	let minting = false;
	let joining = false;

	let requestedToJoin = false;
	let pendingMemberships: Array<string> = [];

	const domain = variables.jitsiDomain ?? 'video.collaboratory.io';

	async function loadNFTBackgrounds() {
		const stored = localStorage.getItem('jitsiLocalStorage');
		const jitsiStorage = (stored && JSON.parse(stored)) || {};
		let storedImages = [];
		if (jitsiStorage && jitsiStorage.virtualBackgrounds) {
			storedImages = JSON.parse(jitsiStorage.virtualBackgrounds);
		}
		if (!storedImages) {
			storedImages = [];
		}

		const tokenReq = await fetch(`${RARIBLE_API_BASE}/nft/items/byOwner?owner=${$address}`);
		const tokenRes = await tokenReq.json();
		console.log('nfts - tokenRes', { stored, jitsiStorage, tokenRes });
		let imagesChanged = false;
		nfts =
			tokenRes &&
			(await Promise.all(
				tokenRes.items.map(async (item) => {
					const nftReq = await fetch(`${RARIBLE_API_BASE}/nft/items/${item.id}/meta`);
					const nftRes = nftReq.status === 200 && (await nftReq.json());
					return nftRes && nftRes.image ? { ...item, ...nftRes } : false;
				})
			).then((items) => {
				return Promise.all(
					items
						.filter((item) => !!item && item.image)
						.map(async (item) => {
							const nft = {
								id: item.id,
								tokenId: item.tokenId,
								url: (item.image.url.PREVIEW || item.image.url.ORIGINAL).replace(
									'ipfs://',
									'https://ipfs.io/'
								),
								name: item.name,
								description: item.description
							};
							try {
								if (!storedImages.find((n) => n.id === nft.id.substr(2))) {
									imagesChanged = true;
									console.log('Registering new NFT', nft);
									const dataUrl = await imageToUri(nft.url);
									storedImages.push({
										id: nft.id.substr(2),
										src: dataUrl
									});
								}
							} catch (err) {
								//ignore cors error when downloading images from 3rd part hosted servers
							}
							return nft;
						})
				).then((res) => {
					// localStorage.setItem(
					// 	'accountNfts',
					// 	JSON.stringify({ items: result, ts: new Date().valueOf() })
					// );
					if (imagesChanged) {
						console.log('ntf - storing virtualBackgrounds', storedImages);
						// console.log('setting storage', { jitsiStorage, storedImages });
						jitsiStorage.virtualBackgrounds = JSON.stringify(storedImages);
						localStorage.setItem('jitsiLocalStorage', JSON.stringify(jitsiStorage));
					}
					return res;
				});
			}));
	}

	async function imageToUri(url) {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			let base_image = new Image();
			base_image.setAttribute('crossOrigin', 'anonymous');
			base_image.onload = function () {
				let w, h;
				if (base_image.width > 800 || base_image.height > 800) {
					if (base_image.width > base_image.height) {
						w = 800;
						h = base_image.height / (base_image.width / 800);
					} else {
						h = 800;
						w = base_image.width / (base_image.height / 800);
					}
				} else {
					w = base_image.width;
					h = base_image.height;
				}
				canvas.width = w;
				canvas.height = h;
				ctx.drawImage(base_image, 0, 0);
				resolve(canvas.toDataURL('image/jpeg', 0.4));
				canvas.remove();
			};
			base_image.src = url;
			setTimeout(() => {
				reject(false);
			}, 3000);
		});
	}

	async function requestJoinRoom() {
		loading = true;
		contract.methods
			.requestToJoinRoom($page.params.slug)
			.send({ from: $address })
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
		const toDeploy = new $chain.eth.Contract(PARTICIPANT_ACCESS_TOKEN_CONTRACT);
		const patContract = await toDeploy
			.deploy({
				data: PARTICIPANT_ACCESS_TOKEN_BYTECODE,
				arguments: [$address]
			})
			.send({ from: $address })
			.on('error', function (error) {
				console.error('PAT contract error:', error);
				transactionFailed = true;
				loading = false;
			})
			.on('transactionHash', function (transactionHash) {
				console.info('PAT contract TX hash:', transactionHash);
			})
			.on('receipt', function (receipt) {
				console.info('PAT contract deployed to address:' + receipt.contractAddress); // contains the new contract address
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				console.info('PAT contract confirmation:', { confirmationNumber, receipt });
			});
		creating = false;
		// This mints a token to the caller's address
		let tokenMinted = false;
		minting = true;
		patContract.methods
			.safeMint($address)
			.send({ from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info('PAT safeMint TX hash:', { transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				console.info('PAT safeMint confirmation:', { confirmationNumber, receipt });
				// When the access token is minted, call the OpenHouse contract to register the room->PAT contract mapping
				if (!tokenMinted) {
					minting = false;
					tokenMinted = true;
					joining = true;
					contract.methods
						.createRoomWithContract($page.params.slug, patContract.options.address, createPublic)
						.send({ from: $address })
						.on('transactionHash', function (transactionHash) {
							console.info('createRoomWithContract TX hash:', { transactionHash });
						})
						.on('confirmation', function (confirmationNumber, receipt) {
							loading = false;
							isMember = true;
							console.info('createRoomWithContract confirmation:', { confirmationNumber, receipt });
							joining = false;
						})
						.on('receipt', function (receipt) {
							// receipt example
							console.info('createRoomWithContract receipt:', { receipt });
						})
						.on('error', function (error, receipt) {
							// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
							console.error('createRoomwithContract error:', error);
							console.info({ receipt });
							transactionFailed = true;
							loading = false;
							tokenMinted = false;
						});
				}
			})
			.on('receipt', function (receipt) {
				// receipt example
				console.info('PAT safeMint receipt:', { receipt });
			})
			.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.error('PAT safeMint error:', error);
				console.info({ receipt });
				transactionFailed = true;
				loading = false;
			});
	}

	async function initializeJitsi() {
		if (!connected && $addressName) {
			connected = true;
			console.log('Initializing jitsi');
			try {
				await loadNFTBackgrounds();
			} catch (error) {
				console.error(error);
			}
			
			await tick();
			const options = {
				roomName: $page.params.slug,
				height: 600,
				userInfo: {
					displayName: $address
				},
				parentNode: window.document.querySelector('#meet'),
				jwt: $token,
				configOverwrite: { backgroundImageUrl: backgroundImageUrl }
			};
			iframeApi = new (window as any).JitsiMeetExternalAPI(domain, options);
			iframeApi.addEventListener('dominantSpeakerChanged', (event) => {
				const participants = iframeApi.getParticipantsInfo();
				const participant = participants.find((p) => p.participantId === event.id);
				dominantSpeaker = participant?.displayName;
			});
			pollForMembershipChanges();
		}
	}

	async function getPendingMemberships() {
		contract.methods
			.getMembershipRequests($page.params.slug)
			.call()
			.then((list) => {
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
			participantsList = iframeApi.getParticipantsInfo();
			await getPendingMemberships();
			await sleep(3000);
		}
		while (!isMember) {
			let isMem = await isUserInRoom();
			if (isMem) {
				isMember = isMem;
				contract.methods
					.removeMembershipRequest($page.params.slug, $address)
					.send({ from: $address })
					.on('transactionHash', function (transactionHash) {
						console.info('PAT removeMembershipRequest TX hash:', { transactionHash });
					})
					.on('confirmation', function (confirmationNumber, receipt) {
						console.log('PAT removeMembershipRequest confirmation:', {
							confirmationNumber,
							receipt
						});
						initializeJitsi();
					})
					.on('receipt', function (receipt) {
						// receipt example
						console.info('PAT removeMembershipRequest receipt:', { receipt });
					})
					.on('error', function (error, receipt) {
						// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
						console.error('PAT removeMembershipRequest error:', error, receipt);
					});
			}
			await sleep(3000);
		}
	}

	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	async function getPatContractAddress() {
		return await contract.methods.getAddressForRoom($page.params.slug).call({ from: $address });
	}

	async function getPatContract() {
		patContractAddress = await getPatContractAddress();
		return new $chain.eth.Contract(PARTICIPANT_ACCESS_TOKEN_CONTRACT, patContractAddress);
	}

	const onFormSubmit = async () => {
		const patContract = await getPatContract();
		patContract.methods
			.safeMint(invitee)
			.send({ from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info('PAT safeMint TX hash:', { transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				console.info('PAT safeMint confirmation:', { confirmationNumber, receipt });
			})
			.on('receipt', function (receipt) {
				// receipt example
				console.info('PAT safeMint receipt:', { receipt });
			})
			.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.error('PAT safeMint error:', error);
				console.info({ receipt });
			});
	};

	async function isUserInRoom() {
		const patContract = await getPatContract();
		let tokenBalance = await patContract.methods.balanceOf($address).call();
		return tokenBalance > 0;
	}

	$: if (chain && $chain && $token && $address && !iframeApi) {
		contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		contract.methods
			.roomExists($page.params.slug)
			.call()
			.then((exists) => {
				roomExists = exists;

				if (roomExists) {
					isUserInRoom().then((isMem) => {
						isMember = isMem;
						if (!isMember) {
							contract.methods
								.getMembershipRequests($page.params.slug)
								.call()
								.then((membersList) => {
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
		<div />
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
				{#if requestedToJoin}
					Your request to join is pending.{:else}<Button on:click={requestJoinRoom}
						>Request to join</Button
					>{/if}
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
					<SendTip size="small" to={dominantSpeaker} resetOnSuccess>
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
			{#if connected}
				<form on:submit|preventDefault={onFormSubmit} class="invite__form">
					<Input
						type="text"
						name="addressInvite"
						id="addressInvite"
						bind:value={invitee}
						placeholder="Participant ETH Address"
					/>
					<Button attach="left" type="submit" disabled={!connected}>Invite Participant</Button>
				</form>
			{/if}
			<Button
				--bg="linear-gradient(to bottom, var(--color-green-30), var(--color-green-40))"
				--hover-bg="linear-gradient(to bottom, var(--color-green-40), var(--color-green-30))"
				on:click={() => {
					loadNFTBackgrounds();
				}}>Update NFT Backgrounds</Button
			>
		</div>
		<div class="participants__container">
			<div class="participants__pending">
				<h3>Pending Participants</h3>
				{#if pendingMemberships.length > 0}
					{#each pendingMemberships as p}
						<PendingParticipant
							user={p}
							contractAddress={patContractAddress}
							room={$page.params.slug}
						/>
					{/each}
				{/if}
			</div>
			<div class="participants__active">
				<h3>Participants</h3>
				{#if participantsList.length > 1}
					{#each participantsList as participant}
						<div class="participant">
							<Participant
								primarySpeaker={dominantSpeaker === participant.displayName}
								displayName={participant.displayName}
								room={$page.params.slug}
							/>
						</div>
					{/each}
				{/if}
			</div>
		</div>
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
		padding: 0 12px 24px 12px;
	}
	.toolbar {
		background: var(--color-aqua-10);
		padding: 12px 12px 12px 24px;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
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
	.invite__form {
		display: flex;
		border: 2px solid var(--color-blue-50);
	}
	.invite__form :global(input) {
		height: 42px;
	}
	.participants__container {
		display: flex;
		flex-wrap: wrap;
	}
	.participants__pending,
	.participants__active {
		width: 50%;
		padding: 6px 12px;
	}
	.participant {
		margin: 6px 12px;
	}
	h3 {
		color: var(--color-red-70);
		margin: 0 0 12px 0;
	}
</style>
