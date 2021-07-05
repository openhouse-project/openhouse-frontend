<script>
	import { getContext } from 'svelte';
	import { RingLoader } from 'svelte-loading-spinners';
	import Button from '$lib/components/Button.svelte';
	import { PARTICIPANT_ACCESS_TOKEN_CONTRACT } from '$lib/contracts/pat';

	const chain = getContext('chain');
	const address = getContext('address');

	export let user = '';
	export let contractAddress = '';
	export let inviting = false;
	export let success = false;
	export let error = false;
	export let size = 'large';

	async function invite() {
		if (inviting) return false;

		error = false;
		success = false;
		inviting = true;

		let contract;
		contract = new $chain.eth.Contract(PARTICIPANT_ACCESS_TOKEN_CONTRACT, contractAddress);
		const safeMint = contract.methods.safeMint(user);
		safeMint.send({ from: $address })
			.on('transactionHash', function (transactionHash) {
				console.info({ transactionHash });
			})
			.on('confirmation', function (confirmationNumber, receipt) {
				success = true;
				inviting = false;
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
				inviting = false;
			});
	}
</script>

{#if success}
	<p class="success"><slot name="success">Your request to invite {$user} has been processed.</slot></p>
<slot name="error" {error}>
	{#if error}
		<p class="error">
			<b>Oops!</b> An error was encountered when sending your transaction.
		</p>
	{/if}
</slot>
{:else}
{#if inviting}
	<RingLoader />
	<p>Inviting...</p>
{:else}
	<Button
		{size}
		--bg="linear-gradient(to bottom, var(--color-red), var(--color-red-60))"
		--hover-bg="linear-gradient(to bottom, var(--color-red-60), var(--color-red))"
		on:click={invite}
		disabled={inviting}
	>
		<slot {success} {error} {inviting}>Invite {user}</slot>
	</Button>
{/if}
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
