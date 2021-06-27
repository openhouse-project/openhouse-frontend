<script>
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { writable } from 'svelte/store';
	import SendTip from '$lib/components/SendTip.svelte';

	const chain = getContext('chain');
	const address = getContext('address');
	const rooms = writable([]);
	const myRooms = writable([]);

	export let conferenceId = '';
	const onFormSubmit = () => {
		goto(`/conference/${conferenceId}`);
	};

	let contract;
	$: if (chain && $chain) {
		contract = new $chain.eth.Contract(OPENHOUSE_CONTRACT, OPENHOUSE_ADDRESS);
		const listRooms = contract.methods.listRooms();
		listRooms.call().then((result) => {
			$rooms = result;
		});

		const listMyRooms = contract.methods.listSenderRooms();
		listMyRooms.call({ from: $address }).then((result) => {
			$myRooms = result;
		});
	}
</script>

<section class="join__hero">
	{#if $address !== ROOT_ADDRESS}
		<div in:slide out:slide class="join__form">
			<h1>Join or Create a Conference</h1>
			<form on:submit|preventDefault={onFormSubmit}>
				<input type="text" name="conferenceId" id="conferenceId" bind:value={conferenceId} />
				<Button attach="left" type="submit">Join</Button>
			</form>
		</div>
	{:else}
		<div in:slide out:slide>
			<h1>Connect a Wallet</h1>
		</div>
	{/if}
</section>
<section class="rooms__container">
	<h2>My Conferences</h2>
	<div class="rooms">
		{#if $myRooms && $myRooms.length}
			{#each $myRooms as room}
				<a href="/conference/{room}">{room}</a>
			{/each}
		{:else}
			<p>
				You're not registered for any conferences yet. Join or create one using the form above or
				the list below.
			</p>
		{/if}
	</div>
	<h2>All Conferences</h2>

	<div class="rooms">
		{#if $rooms && $rooms.length}
			{#each $rooms as room}
				<a href="/conference/{room}">{room}</a>
			{/each}
		{:else}
			<p>
				There are no conferences registered yet. Use the form above to be the first to register.
			</p>
		{/if}
	</div>
</section>
<section class="tip">
	<SendTip />
</section>

<style>
	section {
		padding: 24px;
	}
	.join__hero {
		background: linear-gradient(to bottom, hsl(235, 25%, 15%), hsl(235, 25%, 5%));
		padding: 24px 48px;
		font-size: 48px;
		color: white;
		display: flex;
		height: 400px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.join__hero h1 {
		margin: 42px auto 12px auto;
		text-align: center;
	}

	.join__hero form {
		display: inline-flex;
		margin: 48px auto 24px auto;
	}

	.join__hero input,
	.join__hero :global(button) {
		border-radius: 12px;
		font-size: 42px;
		height: 64px;
		padding: 12px 24px;
	}
	.join__hero input {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.join__hero :global(button) {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.join__form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	section.rooms__container,
	section.tip {
		max-width: 1000px;
		margin: auto;
	}
	section.tip {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.rooms {
		display: flex;
		padding: 24px 12px;
		margin-bottom: 24px;
	}
	.rooms a,
	.rooms p {
		align-items: center;
		padding: 12px 24px;
		margin: 6px 12px;
		background: hsl(235, 35%, 15%);
		text-decoration: none;
		font-size: 24px;
		color: goldenrod;
		line-height: 1.5;
	}
	.rooms a:hover {
		background: hsl(235, 35%, 25%);
	}
</style>
