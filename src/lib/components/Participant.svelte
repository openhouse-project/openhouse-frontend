<script>
	import { getContext } from 'svelte';
	import { RingLoader } from 'svelte-loading-spinners';
	import Button from '$lib/components/Button.svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';

	const chain = getContext('chain');
	const address = getContext('address');

	export let user = '';
	export let room = '';
	export let kicking = false;
	export let success = false;
	export let error = false;
	export let size = 'large';

	async function onKick() {
		if (kicking) return false;

		error = false;
		success = false;
		kicking = true;

		let contract;
		contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		const kickUser = contract.methods.kickUser(user, room);
		kickUser.send({ from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info({ transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				success = true;
				kicking = false;
			})
			.on('receipt', function (receipt) {
				// receipt example
				console.info({ receipt });
			})
			.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				success = false;
				error = true;
				console.error('transaction failure', err);
				kicking = false;
			});
	}
</script>

{#if success}
	<p class="success"><slot name="success">Your request to kick has been processed</slot></p>
{/if}
<slot name="error" {error}>
	{#if error}
		<p class="error">
			<b>Oops!</b> An error was encountered when sending your transaction.
		</p>
	{/if}
</slot>
{#if kicking}
	<RingLoader />
	<p>Kicking...</p>
{:else}
	<Button
		{size}
		--bg="linear-gradient(to bottom, var(--color-red), var(--color-red-60))"
		--hover-bg="linear-gradient(to bottom, var(--color-red-60), var(--color-red))"
		on:click={onKick}
		disabled={kicking}
	>
		<slot {success} {error} {kicking}>Kick {user}</slot>
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
