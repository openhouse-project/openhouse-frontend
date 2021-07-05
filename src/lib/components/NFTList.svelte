<script>
	const API_BASE = 'https://api-dev.rarible.com/protocol/v0.1/ethereum';
	import { createEventDispatcher } from 'svelte';
	import { SyncLoader } from 'svelte-loading-spinners';

	export let address;
	export let active = false;
	const dispatch = createEventDispatcher();

	$: document.body.classList.toggle('noscroll', active);

	let nfts = false;
	// let nfts = localStorage.getItem('accountNfts');
	// if (nfts)
	// 	try {
	// 		const parsed = JSON.parse(nfts);
	// 		if (parsed && new Date().valueOf() - parsed.ts < 300000) nfts = parsed.items;
	// 		else nfts = false;
	// 	} catch (err) {
	// 		console.error('Invalid localStorage NFTs');
	// 	}

	$: if (address && !nfts && active) {
		nfts = (async () => {
			const tokenReq = await fetch(`${API_BASE}/nft/items/byOwner?owner=${address}`);
			const tokenRes = await tokenReq.json();
			console.log('nfts - tokenRes', tokenRes);
			return Promise.all(
				tokenRes.items.map(async (item) => {
					const nftReq = await fetch(`${API_BASE}/nft/items/${item.id}/meta`);
					const nftRes = nftReq.status === 200 && (await nftReq.json());
					return nftRes && nftRes.image ? nftRes : false;
				})
			).then((items) => {
				const result = items
					.filter((item) => !!item && item.image)
					.map((item) => {
						return {
							id: item.id,
							tokenId: item.tokenId,
							url: (item.image.url.PREVIEW || item.image.url.ORIGINAL).replace(
								'ipfs://',
								'https://ipfs.io/'
							),
							name: item.name,
							description: item.description
						};
					});
				console.log('nfts - result', result);
				// localStorage.setItem(
				// 	'accountNfts',
				// 	JSON.stringify({ items: result, ts: new Date().valueOf() })
				// );
				return result;
			});
		})();
	}

	function onSelect(item) {
		dispatch('select', item);
		active = false;
	}
</script>

<svelte:window
	on:click={(e) => {
		console.log(e.target);
		if (e.target.className.includes('nfts__overlay')) {
			active = !active;
		}
	}}
/>

<div class="nfts__overlay" class:active>
	<h1>Available NFT Backgrounds</h1>
	<span>Click an image to select it. Click anywhere else to close this modal.</span>
	<div class="nfts">
		{#if !nfts}
			<SyncLoader />
		{:else}
			{#await nfts}
				<SyncLoader />
			{:then items}
				{#each items as nft}
					<div class="nft" on:click={() => onSelect(nft)}>
						<img src={nft.url} alt={nft.description} />
						<span>{nft.name}</span>
					</div>
				{/each}
			{/await}
		{/if}
	</div>
</div>

<style>
	.nfts__overlay {
		position: fixed;
		width: 100vw;
		height: 100vh;
		left: 0;
		top: 0;
		background: hsl(var(--color-blue-hue), var(--color-blue-saturation), 10%, 0.9);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 1s;
	}
	.nfts__overlay.active {
		opacity: 1;
		pointer-events: all;
	}
	h1 {
		margin-bottom: 24px;
	}
	.nfts__overlay > span {
		color: var(--color-blue-80);
		margin-bottom: 24px;
	}
	.nfts {
		display: flex;
		flex-wrap: wrap;
	}
	.nft {
		cursor: pointer;
		display: flex;
		flex-direction: column;
		background: var(--color-blue-40);
		padding: 12px;
		border-radius: 6px;
	}
	.nft span {
		padding: 12px 0 0 0;
	}
	.nft img {
		object-fit: cover;
		height: 120px;
	}
</style>
