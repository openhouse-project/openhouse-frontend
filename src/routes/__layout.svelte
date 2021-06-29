<script>
	import MonoChain, { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Buffer } from 'buffer';
	import { browser } from '$app/env';
	import { address, accounts, balance, domain } from '$lib/store';
	import Theme from '$lib/components/Theme.svelte';
	import SendTip from '$lib/components/SendTip.svelte';
	import '$lib/styles/global.css';

	let accountSelectVisible = false;

	if (browser) window.Buffer = Buffer;
</script>

<svelte:window
	on:keypress={(e) => {
		console.log('keypress', e);
	}}
/>
<Theme>
	<MonoChain let:requestAccounts let:fetchEnsDomain>
		<header>
			<section>
				<a id="brand" href="/">OpenHouse</a>
			</section>
			<section class="connect">
				{#if [ROOT_ADDRESS, '', undefined].includes($address)}
					<Button on:click={requestAccounts}>Connect</Button>
				{:else}
					<span
						on:click={() => {
							accountSelectVisible = !accountSelectVisible;
						}}
						class={$domain ? 'domain' : 'address'}>{$domain || $address}</span
					>
					<span class="currency">ETH</span><span class="balance">{$balance.eth}</span>
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
		<div id="account-select" class:visible={accountSelectVisible}>
			<ul>
				{#each $accounts as account}
					<li
						class:selected={account === $address}
						on:click={() => {
							$address = account;
						}}
					>
						{#await fetchEnsDomain(account)}
							{account}
						{:then domain}
							{domain}
						{:catch err}
							{account}
						{/await}
					</li>
				{/each}
			</ul>
			<Button size="large" on:click={requestAccounts}>Request Accounts</Button>
		</div>
	</MonoChain>
</Theme>

<style>
	span.domain,
	span.address {
		cursor: pointer;
	}
	span.domain:hover,
	span.address:hover {
		color: var(--color-aqua-90);
	}
	#account-select {
		position: absolute;
		width: 240px;
		background: hsla(var(--color-blue-base), 15%, 97%);
		box-shadow: -2px 2px 2px rgba(0, 0, 0, 0.15);
		border: 2px solid var(--color-aqua-60);
		z-index: 2;
		visibility: hidden;
	}
	#account-select.visible {
		visibility: visible;
	}

	#account-select li {
		list-style: none;
		padding: 12px 24px;
		margin: none;
	}
	#account-select li:not(:first-child) {
		border-top: 1px solid hsla(var(--color-blue-base), 70%, 15%);
	}
	#account-select li:not(:last-child) {
		border-bottom: 1px solid hsla(var(--color-blue-base), 5%, 35%);
	}

	#account-select li.selected {
		color: var(--color-green);
		list-style: circle;
	}
	#account-select :global(.button) {
		width: 100%;
	}

	@media (min-width: 768px) {
		#account-select {
			width: 320px;
			right: 0px;
			top: 54px;
		}
	}
</style>
