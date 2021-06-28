<script>
	import MonoChain, { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Buffer } from 'buffer';
	import { browser } from '$app/env';
	import Theme from '$lib/components/Theme.svelte';
	import SendTip from '$lib/components/SendTip.svelte';

	if (browser) window.Buffer = Buffer;
</script>

<Theme>
	<MonoChain let:address let:domain let:requestAccounts let:ethBalance>
		<header>
			<section>
				<a id="brand" href="/">OpenHouse</a>
			</section>
			<section class="connect">
				{#if address === ROOT_ADDRESS}
					<Button on:click={requestAccounts}>Connect</Button>
				{:else}
					{#if domain}
						<span class="domain">{domain}</span>
					{:else}
						<span class="address">{address}</span>
					{/if}
					<span class="currency">ETH</span><span class="balance">{ethBalance}</span>
				{/if}
			</section>
		</header>
		<section class="tip">
			<span>Early Access Beta</span>
			<SendTip size="small" />
		</section>
		<main>
			<slot />
		</main>
	</MonoChain>
</Theme>

<style global>
	html,
	body {
		margin: 0;
		padding: 0;
		font-family: 'Roboto', sans-serif;
		font-size: 18px;
		line-height: 1.125em;
		background: var(--color-blue-20);
		color: var(--color-blue-95);
	}
	input:not([type='checkbox']),
	select,
	textarea,
	button {
		font-family: 'Roboto', sans-serif;
		font-size: 18px;
		height: 36px;
		line-height: 24px;
		appearance: none;
		padding: 6px 12px;
		background: var(--color-blue-20);
		color: white;
		outline: none;
		border: 3px solid transparent;
	}

	input:focus-within,
	select:focus-within,
	textarea:focus-within {
		border: 3px solid var(--border-color, var(--color-aqua-60));
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
		padding: 6px 24px;
		display: flex;
		justify-content: space-between;
		background: linear-gradient(to top, var(--color-blue-50), var(--color-blue-40));
		color: var(--color-aqua-70);
	}
	header a#brand {
		margin: 0;
		font-size: 28px;
		color: var(--color-aqua-70);
		text-decoration: none;
	}
	header section {
		display: flex;
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

	span.domain,
	span.address {
		font-weight: bold;
		margin-right: 24px;
	}
	span.currency {
		margin-right: 8px;
	}
	span.balance,
	span.domain,
	span.address {
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 128px;
		white-space: nowrap;
	}

	section.tip {
		display: flex;
		padding: 12px;
		align-items: center;
		justify-content: space-between;
		background: var(--color-blue-20);
		color: var(--color-aqua-70);
		padding: 12px 24px;
	}

	@media (max-width: 420px) {
		header {
			flex-direction: column;
		}
	}

	@media (min-width: 1024px) {
		header section {
			width: 33%;
		}
	}
</style>
