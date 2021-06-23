<script>
	import MonoChain, { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Buffer } from 'buffer';
	import { browser } from '$app/env';

	if (browser) window.Buffer = Buffer;
</script>

<MonoChain let:address let:domain let:requestAccounts>
	<header>
		<section>
			<h1>OpenHouse</h1>
		</section>
		<section class="connect">
			{#if address === ROOT_ADDRESS}
				<Button on:click={requestAccounts}>Connect</Button>
			{:else if domain}
				<span>{domain}</span>
			{:else}
				<span>{address}</span>
			{/if}
		</section>
	</header>
	<main>
		<slot />
	</main>
</MonoChain>

<style global>
	html,
	body {
		margin: 0;
		padding: 0;
		font-family: 'Roboto', sans-serif;
		font-size: 18px;
		line-height: 1.125em;
	}
	input,
	select,
	textarea,
	button {
		font-family: 'Roboto', sans-serif;
		font-size: 18px;
		height: 36px;
		line-height: 24px;
		appearance: none;
		padding: 6px 12px;
		border: 2px solid var(--border-color, royalblue);
	}
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 0;
		padding: 0;
	}
	* {
		box-sizing: border-box;
	}
	header {
		line-height: 42px;
		padding: 6px 12px;
		display: flex;
		justify-content: space-between;
		background: whitesmoke;
	}
	header h1 {
		margin: 0;
		font-size: 28px;
	}
	header section {
		display: flex;
		width: 33%;
	}

	header section.join {
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	header section.connect {
		justify-content: flex-end;
	}

	main > h1 {
		margin: 12px 0 18px 0;
	}
	main > h2,
	h3,
	h4,
	h5,
	h6 {
		margin: 6px 0;
	}

	main > hr {
		margin: 12px 0;
		border: none;
		border-bottom: 2px solid whitesmoke;
	}
</style>
