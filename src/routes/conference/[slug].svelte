<script context="module" lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import { addressName } from '$lib/store';

	export async function load({ page }: LoadInput): Promise<LoadOutput> {
		const { slug } = page.params;
		return { props: { slug } };
	}
</script>

<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { OPENHOUSE_ADDRESS } from '$lib/contracts/openhouse.js';
	import { OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse.js';
	import { ethAddress, token } from '$lib/store';
	import { RingLoader } from 'svelte-loading-spinners';
	import type { Writable } from 'svelte/store';

	const chain: Writable<any> = getContext('chain');

	export let slug = undefined;
	let iframeApi = false;
	let connected = false;
	let transactionFailed = false;

	onMount(async () => {
		const domain = import.meta.env.VITE_JITSI_DOMAIN || 'video.collaboratory.io';

		const options = {
			roomName: slug,
			width: '100%',
			height: 700,
			userInfo: {
				displayName: $addressName
			},
			parentNode: document.querySelector('#meet'),
			jwt: $token
		};

		if (chain && $chain) {
			const contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
			console.log('from address: ' + $ethAddress);
			contract.methods
				.addRoom(slug)
				.send({ from: $ethAddress })
				.on('transactionHash', function (hash) {
					console.log('transactionHash: ' + hash);
				})
				.on('confirmation', function (confirmationNumber, receipt) {
					if (!connected) {
						iframeApi = new (window as any).JitsiMeetExternalAPI(domain, options);
						connected = true;
					}
					console.log('confirmationNumber: ' + confirmationNumber);
				})
				.on('receipt', function (receipt) {
					// receipt example
					console.log(receipt);
				})
				.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.error(error);
					transactionFailed = true;
				});
		} else {
			console.error('Chain not available');
		}
	});
</script>

<section>
	{#if !transactionFailed}
		{#if connected}
			<h1>Connected to {slug}</h1>
		{/if}
		{#if !connected}
			<h1>Connecting to {slug}</h1>
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
</style>
