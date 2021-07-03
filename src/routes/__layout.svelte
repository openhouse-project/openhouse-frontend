<script>
	import MonoChain, { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Buffer } from 'buffer';
	import { browser } from '$app/env';
	import Theme from '$lib/components/Theme.svelte';
	import SendTip from '$lib/components/SendTip.svelte';
	import '$lib/styles/global.css';

	if (browser) window.Buffer = Buffer;
</script>

<Theme>
	<MonoChain let:address let:domain let:requestAccounts let:balance>
		<header>
			<section>
				<a id="brand" href="/">OpenHouse</a>
			</section>
			<section class="connect">
				{#if [ROOT_ADDRESS, undefined, ''].includes(address)}
					<Button on:click={requestAccounts}>Connect</Button>
				{:else}
					{#if domain !== ''}
						<span class="domain">{domain}</span>
					{:else}
						<span class="address">{address}</span>
					{/if}
					<span class="currency">ETH</span><span class="balance">{balance.eth}</span>
				{/if}
			</section>
		</header>
		<section id="tipbar">
			<span>v0.0.1</span>
			<SendTip size="small" />
		</section>
		<main>
			<slot />
		</main>
	</MonoChain>
</Theme>
