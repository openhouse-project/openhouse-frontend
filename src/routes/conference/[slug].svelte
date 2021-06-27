<script lang="ts">
	import { page } from '$app/stores';
	import { getContext, onMount } from 'svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { addressName, ethAddress, token } from '$lib/store';
	import { RingLoader } from 'svelte-loading-spinners';
	import type { Writable } from 'svelte/store';
	import type Web3 from 'web3';

	const chain: Writable<Web3> = getContext('chain');

	let iframeApi = false;
	let connected = false;
	let transactionFailed = false;

	const domain = import.meta?.env?.VITE_JITSI_DOMAIN || 'video.collaboratory.io';

	$: if (chain && $chain && $token && $addressName && !iframeApi) {
		const options = {
			roomName: $page.params.slug,
			height: 700,
			userInfo: {
				displayName: $addressName
			},
			parentNode: (window as any).document.querySelector('#meet'),
			jwt: $token
		};
		const contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		const isInRoom = contract.methods.senderIsInRoom($page.params.slug);
		isInRoom.call({ from: $ethAddress }).then((isMember) => {
			if (isMember) {
				if (!connected) {
					iframeApi = new (window as any).JitsiMeetExternalAPI(domain, options);
					connected = true;
				}
			} else {
				contract.methods
					.addRoom($page.params.slug)
					.send({ from: $ethAddress })
					.on('transactionHash', function (transactionHash) {
						console.info({ transactionHash });
					})
					.on('confirmation', function (confirmationNumber, receipt) {
						if (!connected && !iframeApi) {
							iframeApi = new (window as any).JitsiMeetExternalAPI(domain, options);
							connected = true;
						}
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
					});
			}
		});
	}
</script>

<section>
	{#if !transactionFailed}
		{#if connected}
			<h1>Connected to {$page.params.slug}</h1>
		{/if}
		{#if !connected}
			<h1>Connecting to {$page.params.slug}</h1>
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
