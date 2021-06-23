<script context="module" lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import { addressName } from '$lib/store.js';

	export async function load({ page }: LoadInput): Promise<LoadOutput> {
		const { slug } = page.params;
		return { props: { slug } };
	}

</script>

<script lang="js">
	import { onMount } from 'svelte';
	import { OPENHOUSE_ADDRESS } from '$lib/contracts/openhouse.js';
	import { OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse.js';
	import { ethAddress } from '$lib/store.js';
	import { RingLoader } from 'svelte-loading-spinners';

	export let slug;
	export let web3 = undefined;
	var connected = false;
	var transactionFailed = false;

	onMount(async () => {
		const domain = 'localhost:8443';
		const options = {
			roomName: slug,
			width: 700,
			height: 700,
			userInfo: {
				displayName: $addressName
			},
			parentNode: document.querySelector('#meet')
		}
		
		const Web3 = await import('web3/dist/web3.min.js').then((mod) => mod.default);
		web3 = new Web3(Web3.givenProvider || 'https://sokol.poa.network');
		console.log(OPENHOUSE_CONTRACT)
		const contract = new web3.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		console.log('from address: ' + $ethAddress);
		contract.methods.addRoom(slug).send({from: $ethAddress})
			.on('transactionHash', function(hash){
				console.log('transactionHash: ' + hash);
			})
			.on('confirmation', function(confirmationNumber, receipt){
				if (!connected) {
					var api = new JitsiMeetExternalAPI(domain, options);
					connected = true;
				}
				console.log('confirmationNumber: ' + confirmationNumber);
			})
			.on('receipt', function(receipt){
				// receipt example
				console.log(receipt);
			})
			.on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.log(error);
				transactionFailed = true;
			});
	});
</script>

<section>
	{#if !transactionFailed}
		{#if connected}
			<h1>Connected to {slug}</h1>
		{/if}
		{#if !connected}
			<h1>Connecting to {slug}</h1>
			<RingLoader size="120" color="#FF3E00" unit="px" duration="1s"></RingLoader>
		{/if}
	{/if}
	{#if transactionFailed}
		<h1>Transaction failed. Please try again.</h1>
	{/if}
	<div id='meet'></div>
</section>

<style>
	section {
		padding: 24px 12px 6px 12px;
	}
	h1 {
		padding-bottom: 24px;
	}
</style>
