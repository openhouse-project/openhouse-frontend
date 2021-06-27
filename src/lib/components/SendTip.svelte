<script>
	import { getContext } from 'svelte';
	import { TIP_ADDRESS } from './MonoChain.svelte';
	import { RingLoader } from 'svelte-loading-spinners';
	import Button from '$lib/components/Button.svelte';

	const chain = getContext('chain');
	const address = getContext('address');

	export let to = TIP_ADDRESS;
	export let sending = false;
	export let success = false;
	export let error = false;

	async function onSendTip() {
		if (sending) return false;

		error = false;
		success = false;
		sending = true;
		const tx = await $chain.eth
			.sendTransaction({
				// gasPrice: $web3.utils.toHex($web3.utils.toWei('30', 'gwei')),
				gasLimit: $chain.utils.toHex('21000'),
				from: $address,
				to,
				value: $chain.utils.toHex($chain.utils.toWei('1', 'finney'))
			})
			.catch((err) => {
				console.error('transaction failure', err);
				error = err;
			});
		if (tx) {
			console.log('transaction success', tx);
			success = true;
		}
		sending = false;
	}
</script>

<slot {success} {error} {sending}>
	{#if success}
		<slot name="success">
			<p>Thank you for your generosity!</p>
		</slot>
	{:else}
		<slot name="error" {error}>
			{#if error}
				<p>An error was encountered when sending your transaction.</p>
			{/if}
		</slot>
		{#if sending}
			<RingLoader />
		{:else}
			<Button
				size="large"
				--bg="orange"
				--hover-bg="darkorange"
				on:click={onSendTip}
				disabled={sending}>Send us a Tip</Button
			>
		{/if}
	{/if}
</slot>
