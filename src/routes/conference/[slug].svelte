<script lang="ts">
	import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { addressName, ethAddress, token } from '$lib/store';
	import { RingLoader } from 'svelte-loading-spinners';
	import type { Writable } from 'svelte/store';
	import type Web3 from 'web3';
	import Button from '$lib/components/Button.svelte';

	const chain: Writable<Web3> = getContext('chain');

	let contract;
	let iframeApi = false;
	let connected = false;
	let transactionFailed = false;
	let loading = false;

	let roomExists = false;
	let isMember = false;
	let isPublic = true;
	let createPublic = false;

	const domain = import.meta?.env?.VITE_JITSI_DOMAIN || 'video.collaboratory.io';

	function sendTransaction() {
		loading = true;
		contract.methods
			.addRoom($page.params.slug, createPublic)
			.send({ from: $ethAddress })
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
		if (!connected) {
			const options = {
				roomName: $page.params.slug,
				height: 700,
				userInfo: {
					displayName: $addressName
				},
				parentNode: (window as any).document.querySelector('#meet'),
				jwt: $token
			};
			iframeApi = new (window as any).JitsiMeetExternalAPI(domain, options);
			connected = true;
		}
	}

	$: if (chain && $chain && $token && $addressName && !iframeApi) {
		contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);

		contract.methods
			.roomExists($page.params.slug)
			.call({ from: $ethAddress })
			.then((exists) => {
				roomExists = exists;

				if (roomExists) {
					contract.methods
						.senderIsInRoom($page.params.slug)
						.call({ from: $ethAddress })
						.then((isMem) => {
							isMember = isMem;
							if (!isMember) {
								contract.methods
									.roomIsPublic($page.params.slug)
									.call({ from: $ethAddress })
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
			This conference does not exist yet! <Button on:click={sendTransaction}
				>Create this Conference Now</Button
			>
			<label for="public"
				>Anyone can view member list & topic <input
					type="checkbox"
					name="public"
					id="public"
					bind:checked={createPublic}
				/></label
			>
		{:else if !isPublic}
			<p>
				This conference room is private. <Button on:click={sendTransaction}
					>Join this Conference Now</Button
				>
			</p>
		{:else}
			<p>Public room view, i.e. list of room members</p>
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
</style>
