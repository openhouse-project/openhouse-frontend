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
	export let size = 'large';

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

{#if success}
	<p class="success"><slot name="success">Thank you for your generosity!</slot></p>
{/if}
<slot name="error" {error}>
	{#if error}
		<p class="error">
			<b>Oops!</b> An error was encountered when sending your transaction. Double check the address of
			the recipient and try again.
		</p>
	{/if}
</slot>
{#if sending}
	<RingLoader />
	<p>Sending tip...</p>
{:else}
	<Button
		{size}
		--bg="linear-gradient(to bottom, var(--color-orange), var(--color-red))"
		--hover-bg="linear-gradient(to bottom, var(--color-orange-40), var(--color-red-40))"
		on:click={onSendTip}
		disabled={sending}
	>
		<slot {success} {error} {sending}>Tip the Openhouse Project</slot>
	</Button>
{/if}

<style>
	.success {
		color: hsl(140, 55%, 65%);
		padding: 12px 0;
	}
	.error {
		color: hsl(4, 95%, 65%);
		padding: 12px 0;
	}
</style>
