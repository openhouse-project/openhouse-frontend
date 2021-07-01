<script lang="ts">
	import { page } from '$app/stores';
	import { getContext, tick } from 'svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { addressName, address, token } from '$lib/store';
	import { RingLoader } from 'svelte-loading-spinners';
	import type { Writable } from 'svelte/store';
	import { variables } from '$lib/variables';
	import type Web3 from 'web3';
	import Button from '$lib/components/Button.svelte';
	import SendTip from '$lib/components/SendTip.svelte';
	import Participant from '$lib/components/Participant.svelte';
	import { goto } from '$app/navigation';

	const chain: Writable<Web3> = getContext('chain');

	let contract;
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

	const domain = variables.jitsiDomain ?? 'video.collaboratory.io';

	function sendTransaction() {
		loading = true;
		contract.methods
			.addRoom($page.params.slug, createPublic)
			.send({ from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info({ transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				loading = false;
				isMember = true;
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

	async function pollForMembershipChanges() {
		while (isMember && connected) {
			let isMem = await contract.methods.senderIsInRoom($page.params.slug).call({ from: $address });
			if (!isMem) {
				isMember = isMem;
				iframeApi.executeCommand('hangup');
				goto("/");
			}
			console.log('isMem = ' + isMem);
			participantsList = iframeApi.getParticipantsInfo();
			await sleep(1000);
		}
	}

	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
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
					contract.methods
						.senderIsInRoom($page.params.slug)
						.call({ from: $address })
						.then((isMem) => {
							isMember = isMem;
							if (!isMember) {
								contract.methods
									.roomIsPublic($page.params.slug)
									.call({ from: $address })
									.then((isPub) => {
										isPublic = isPub;
									});
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
		{#if connected}
			<h4>Connected</h4>
		{/if}
	</div>
	{#if !isMember}
		{#if loading}
			<RingLoader size="120" color="#FF3E00" unit="px" duration="1s" />
		{:else if !roomExists}
			<div class="room__create">
				<p>This conference does not exist yet!</p>
				<Button fullWidth size="large" on:click={sendTransaction}>Create this Conference</Button>
				<label for="public"
					>Anyone can view member list & topic <input
						type="checkbox"
						name="public"
						id="public"
						bind:checked={createPublic}
					/></label
				>
			</div>
		{:else if !isPublic}
			<p>
				This conference room is private. <Button on:click={sendTransaction}
					>Join this Conference</Button
				>
			</p>
		{:else}
			<p>Public room view, i.e. list of room members</p>
			<Button on:click={sendTransaction}>Join this Conference</Button>
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
