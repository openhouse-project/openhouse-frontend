<script>
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { writable } from 'svelte/store';

	const chain = getContext('chain');
	const address = getContext('address');
	const rooms = writable([]);

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
	}
</script>

{#if $address !== ROOT_ADDRESS}
	<section transition:slide class="join__hero">
		<h1>Join a Conference</h1>
		<form on:submit|preventDefault={onFormSubmit}>
			<input type="text" name="conferenceId" id="conferenceId" bind:value={conferenceId} />
			<Button attach="left" type="submit">Join</Button>
		</form>
	</section>
{/if}
<section>
	<h2>Available Conferences</h2>
	{#if $rooms && $rooms.length}
		<div class="rooms">
			{#each $rooms as room}
				<a href="/conference/{room}">{room}</a>
			{/each}
		</div>
	{:else}
		<p>There are no conferences registered yet. Use the form above to be the first to register.</p>
	{/if}
</section>

<style>
	section {
		padding: 24px 48px;
	}
	.join__hero {
		background: rebeccapurple;
		padding: 24px 48px;
		font-size: 48px;
		color: white;
		display: flex;
		flex-direction: column;
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
	.rooms {
		display: flex;
		padding: 12px 0;
	}
	.rooms a {
		padding: 6px 24px 6px 0;
		text-decoration: none;
		font-size: 24px;
		color: royalblue;
	}
	.rooms a:hover,
	.rooms a:visited {
		color: rebeccapurple;
	}
</style>
