<script>
	import { getContext } from 'svelte';
	import { RingLoader } from 'svelte-loading-spinners';
	import Button from '$lib/components/Button.svelte';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import SendTip from './SendTip.svelte';

	const chain = getContext('chain');
	const address = getContext('address');

	export let displayName = '';
	export let room = '';
	export let kicking = false;
	export let success = false;
	export let error = false;
	export let size = 'small';
	export let primarySpeaker = false;

	async function onKick() {
		if (kicking) return false;

		error = false;
		success = false;
		kicking = true;

		let contract;
		contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		const kickUser = contract.methods.kickUser(displayName, room);
		kickUser
			.send({ from: $address })
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
			.on('error', function (err, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				success = false;
				error = true;
				console.error('transaction failure', err);
				kicking = false;
			});
	}
</script>

<div class="participant" class:primarySpeaker>
	<h4>{displayName}</h4>
	<div class="participant__details">
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
				--bg="linear-gradient(to bottom, var(--color-red), var(--color-red-60))"
				--hover-bg="linear-gradient(to bottom, var(--color-red-60), var(--color-red))"
				{size}
				on:click={onKick}
				disabled={kicking}
			>
				<slot>Vote to Kick</slot>
			</Button> &nbsp;
		{/if}
		<SendTip
			--bg="linear-gradient(to bottom, var(--color-blue), var(--color-blue-60))"
			--hover-bg="linear-gradient(to bottom, var(--color-blue-60), var(--color-blue))"
			size="small"
			to={displayName}>Send Tip</SendTip
		>
	</div>
</div>

<style>
	.participant {
		background: var(--color-blue-20);
		padding: 12px;
		border-radius: 6px;
	}
	.participant.primarySpeaker {
		background: var(--color-green-30);
	}
	.participant.primarySpeaker h4 {
		color: var(--color-green-60);
	}
	.participant__details {
		display: flex;
		justify-content: right;
	}
	.participant h4 {
		color: var(--color-aqua-90);
		font-size: 24px;
		padding: 0 0 12px 0;
		text-align: center;
	}
	.success {
		color: hsl(140, 55%, 65%);
		padding: 12px 0;
	}
	.error {
		color: hsl(4, 95%, 65%);
		padding: 12px 0;
	}
</style>
