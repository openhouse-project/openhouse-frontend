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

	export let slug;
	var connected = false;

	onMount(() => {
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
