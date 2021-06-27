<script>
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { writable } from 'svelte/store';
	import SendTip from '$lib/components/SendTip.svelte';
	import Icon from '$lib/components/Icon.svelte';

	const chain = getContext('chain');
	const address = getContext('address');
	const rooms = writable([]);
	const myRooms = writable([]);
	const requestAccounts = getContext('requestAccounts');

	let action = 'Join';

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
	<img class="ethlogo" alt="Ethereum Logo" src="/eth.svg" height="400px" />
	{#if $address !== ROOT_ADDRESS}
		<div in:slide out:slide class="join__form">
			<h1>
				I want to <span
					on:click={() => {
						action = action === 'Join' ? 'Create' : 'Join';
					}}
					class="join__action {action.toLowerCase()}"
					>{action} <Icon --size="42px">expand_more</Icon></span
				> a Conference
			</h1>
			<form on:submit|preventDefault={onFormSubmit}>
				<input type="text" name="conferenceId" id="conferenceId" bind:value={conferenceId} />
				<Button attach="left" type="submit">Join</Button>
			</form>
		</div>
	{:else}
		<div in:slide out:slide class="join__connect">
			<h1>Connect a wallet to continue</h1>
			<Button on:click={requestAccounts}>Connect Wallet</Button>
		</div>
	{/if}
</section>

{#if $address !== ROOT_ADDRESS}
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
{/if}

<style>
	section {
		padding: 24px;
	}
	.join__action {
		cursor: pointer;
		color: var(--color-aqua);
		border: 2px solid var(--color-blue-20);
		border-radius: 8px;
		padding: 6px 24px;
		user-select: none;
		background: hsla(var(--color-blue-base), 15%, 70%);
	}
	.join__action:hover {
		border-color: var(--color-aqua-60);
	}
	.join__action.create {
		color: var(--color-green);
	}
	.join__hero {
		position: relative;
		padding: 12px 24px;
		font-size: 24px;
		background-color: #4158d0;
		background-image: linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%);

		color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100vw;
	}

	.join__hero h1 {
		margin: 42px auto 12px auto;
		text-align: center;
		line-height: 1.25;
		z-index: 1;
	}

	.join__hero form {
		z-index: 1;
		display: inline-flex;
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
		background: hsla(var(--color-blue-base), 15%, 70%);
		width: 100%;
	}
	.join__hero img.ethlogo {
		position: absolute;
		z-index: 0;
		pointer-events: none;
	}
	.join__form,
	.join__connect {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
	section.rooms__container,
	section.tip {
		background: var(--color-blue-10);
		color: white;
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
		background: var(--color-blue-20);
		text-decoration: none;
		font-size: 24px;
		color: var(--color-green);
		line-height: 1.5;
	}
	.rooms a:hover {
		background: var(--color-blue-30);
	}

	@media (max-width: 420px) {
		.rooms {
			flex-direction: column;
		}
	}

	@media (min-width: 1024px) {
		.join__hero {
			padding: 24px 48px;
			font-size: 48px;
			min-height: 400px;
		}
		.join__hero form {
			margin: 48px auto 24px auto;
		}
	}
</style>
