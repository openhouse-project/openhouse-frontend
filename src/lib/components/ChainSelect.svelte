<script lang="ts">
	import { onMount } from 'svelte';

	import Icon from './Icon.svelte';

	export let chain;
	export let syncAccount;

	export let chainId = 0;
	export let chainName = 'Loading';

	let selecting = false;
	let ref;
	let rect;
	onMount(() => {
		rect = ref.getBoundingClientRect();
	});

	console.log('chain', chain);

	$: if (chain)
		chain.eth.net.getId().then((id) => {
			console.log('Chain id', id);
			chainId = id;
		});

	$: chainName = SUPPORTED_CHAINS.find((c) => c.chainId === chainId)?.chainName;

	export const SUPPORTED_CHAINS = [
		{
			chainId: 1,
			// rpcUrl: 'https://mainnet.infura.io/v3/',
			chainName: 'Ethereum Mainnet'
		},
		{
			chainId: 3,
			// rpcUrl: 'https://ropsten.infura.io/v3/',
			chainName: 'Ropsten Testnet'
		},
		{
			chainId: 137,
			rpcUrls: ['https://rpc-mainnet.maticvigil.com/'],
			chainName: 'Matic Mainnet'
		}
	];

	function setActiveChain(selectedChain) {
		console.info('Attempting to change the active chain', selectedChain);
		if ((window as any).ethereum) {
			(window as any).ethereum
				.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${selectedChain.chainId.toString(16)}` }]
				})
				.then(() => {
					chainId = selectedChain.chainId;
					chainName = selectedChain.chainName;
					if (syncAccount) syncAccount();
				})
				.catch((e) => {
					if (e.code === 4902) {
						(window as any).ethereum
							.request({
								method: 'wallet_addEthereumChain',
								params: [
									{
										chainId: `0x${selectedChain.chainId.toString(16)}`,
										chainName: selectedChain.chainName,
										rpcUrls: selectedChain.rpcUrls
									}
								]
							})
							.then(() => {
								chainId = selectedChain.chainId;
								chainName = selectedChain.chainName;
								if (syncAccount) syncAccount();
							})
							.catch((err) => {
								console.error('Failed to register chain with wallet', err);
							});
					} else {
						console.error('Unexpected error when attempting to select chain', e);
					}
				});
		}
		selecting = false;
	}
</script>

<div
	class="chains__current"
	bind:this={ref}
	on:click={() => {
		selecting = !selecting;
	}}
>
	{chainName}
	<Icon>expand_more</Icon>
</div>

<div
	class="chains__select"
	class:visible={selecting}
	style="top:{(rect && rect.top + 42) || 48}px;right:{(rect && window.innerWidth - rect.right) ||
		0}px;"
>
	{#each SUPPORTED_CHAINS as supportedChain}
		<div class="chains__option" on:click={() => setActiveChain(supportedChain)}>
			{supportedChain.chainName}
		</div>
	{/each}
</div>

<style>
	.chains__current {
		padding: 0 12px;
		background: rgba(0, 0, 0, 0.25);
		border-radius: 6px;
		margin-right: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: background 250ms;
	}
	.chains__current:hover {
		background: rgba(0, 0, 0, 0.35);
	}
	.chains__current :global(span) {
		margin-left: 3px;
		font-size: 0.9em;
	}
	.chains__select {
		position: absolute;
		top: 0;
		right: 0;
		display: none;
		background: var(--color-blue-40);
		box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.15), -2px -2px 2px rgba(0, 0, 0, 0.15),
			-2px 2px 2px rgba(0, 0, 0, 0.15), 2px -2px 2px rgba(0, 0, 0, 0.15);
		z-index: 5;
		cursor: pointer;
	}
	.chains__select.visible {
		display: block;
	}
	.chains__option {
		padding: 6px 12px;
	}
	.chains__option:hover {
		background: var(--color-blue-30);
		color: var(--color-green-70);
	}
	.chains__option:not(:last-child) {
		border-bottom: 2px solid var(--color-blue-50);
	}
</style>
