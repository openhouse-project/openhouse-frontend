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

	export let slug;
	export let web3 = undefined;
	var connected = false;

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
		var api = new JitsiMeetExternalAPI(domain, options);
		connected = true;
		const Web3 = await import('web3/dist/web3.min.js').then((mod) => mod.default);
		web3 = new Web3(Web3.givenProvider || 'https://sokol.poa.network');
		console.log(OPENHOUSE_CONTRACT)
		const contract = new web3.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		console.log('from address: ' + $ethAddress);
		contract.methods.addRoom(slug).send({from: $ethAddress});
	});
</script>

<section>
	{#if connected}
		<h1>Connected to {slug}</h1>
	{/if}
	{#if !connected}
		<h1>Connecting to {slug}</h1>
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
