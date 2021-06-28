<script>
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { OPENHOUSE_ADDRESS, OPENHOUSE_CONTRACT } from '$lib/contracts/openhouse';
	import { writable } from 'svelte/store';
	import Icon from '$lib/components/Icon.svelte';

	const chain = getContext('chain');
	const address = getContext('address');
	const rooms = writable([]);
	const myRooms = writable([]);
	const requestAccounts = getContext('requestAccounts');

	let heroRef;
	let ethPos = [100, 100];
	function onMouseMove(e) {
		const rect = heroRef && heroRef.getBoundingClientRect();
		ethPos[0] = (e.clientX / window.innerWidth) * rect.width;
		ethPos[1] = (e.clientY / window.innerHeight) * rect.height;
	}

	let action = 'Join';
	let showForm = false;
	let roomName = '';
	let roomNameExists = false;
	let formValid = false;
	let loading = false;
	let createPublic = false;
	let transactionFailed = false;
	let transactionSubmitted = false;
	$: {
		formValid = (action === 'Join' && roomNameExists) || (action === 'Create' && !roomNameExists);
	}

	const onFormSubmit = async () => {
		let isMember = false;
		if (action === 'Join' && roomNameExists) {
			await contract.methods
				.senderIsInRoom(roomName)
				.call({ from: $address })
				.then((isMem) => {
					isMember = true;
				});
		}
		if (action === 'Create' || !isMember) {
			loading = true;
			contract.methods
				.addRoom(roomName, createPublic)
				.send({ from: $address })
				.on('transactionHash', function (transactionHash) {
					transactionSubmitted = true;
					console.info({ transactionHash });
				})
				.on('confirmation', function (confirmationNumber, receipt) {
					console.info({ confirmationNumber, receipt });
					loading = false;
					goto(`/conference/${roomName}`);
				})
				.on('receipt', function (receipt) {
					// receipt example
					console.info({ receipt });
				})
				.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.error(error);
					console.info({ receipt });
					transactionFailed = true;
					loading = false;
				});
		} else {
			goto(`/conference/${roomName}`);
		}
	};

	let roomNameDebounce;
	let roomExists;
	const onNameInput = () => {
		formValid = false;
		roomNameExists = false;
		if (!roomName || !roomName.length || !contract) return;
		clearTimeout(roomNameDebounce);
		roomNameDebounce = setTimeout(async () => {
			roomExists = contract.methods.roomExists(roomName);
			roomNameExists = await roomExists.call();
		}, 250);
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

<svelte:window on:mousemove={onMouseMove} />
<section class="join__hero" bind:this={heroRef}>
	<img
		class="ethlogo"
		alt="Ethereum Logo"
		src="/eth.svg"
		height="400px"
		style="left:{ethPos[0]}px;top:{ethPos[1]}px;"
	/>
	{#if $address !== ROOT_ADDRESS}
		<div in:slide out:slide class="join__form">
			{#if transactionFailed}
				<h1>Error</h1>
				<p class="helper">An error was encountered while submitting your transaction.</p>
			{:else if transactionSubmitted}
				<h1>Transacting</h1>
				<p class="helper">Submitting your transaction...</p>
			{:else if !showForm}
				<h1>
					<span>I want to</span>
					<span
						on:click={() => {
							action = action === 'Join' ? 'Create' : 'Join';
						}}
						class="join__action {action.toLowerCase()}"
						>{action} <Icon --size="42px">expand_more</Icon></span
					> <span>a Room</span>
				</h1>
				<div class="join__next">
					<Button
						size="large"
						on:click={() => {
							showForm = true;
							onNameInput();
						}}>Get Started</Button
					>
				</div>
			{:else}
				<form transition:slide on:submit|preventDefault={onFormSubmit}>
					<label for="roomName">
						{#if action === 'Join'}
							What's the name of the room you'd like to join?
						{:else}
							What do you want to name your room?
						{/if}
					</label>

					<div>
						<input
							on:input={onNameInput}
							type="text"
							name="roomName"
							id="roomName"
							bind:value={roomName}
						/>
						<Button attach="left" type="submit" disabled={loading || !formValid}>
							{#if loading}Loading...{:else}{action} Room{/if}
						</Button>
					</div>
					{#if action === 'Create'}
						<div transition:slide class="helper">
							<label for="public">Anyone can view member list & topic</label>
							<input type="checkbox" name="public" id="public" bind:checked={createPublic} />
						</div>
					{/if}
					{#if !formValid}
						<span transition:slide class="helper">
							{#if roomName === ''}You must supply a valid room name.
							{:else if action === 'Join'}This room doesn't exist!
							{:else}This room already exists!{/if}
						</span>
					{/if}
					<Button
						--bg="linear-gradient(to bottom, rgba(40,40,40,0.25), rgb(20,20,20,0.25))"
						--hover-bg="linear-gradient(to bottom, rgba(50,50,50,0.35), rgb(30,30,30,0.35))"
						on:click={() => {
							showForm = false;
						}}>Go Back</Button
					>
				</form>
			{/if}
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
		<h2>My Rooms</h2>
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
		<h2>All Rooms</h2>

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
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		color: var(--color-aqua);
		border: 2px solid transparent;
		padding: 0 6px 0 12px;
		user-select: none;
		background: hsla(var(--color-blue-base), 32%, 42%);
		text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.21);
		box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.18);
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
		align-items: flex-start;
		justify-content: flex-start;
		width: 100vw;
		text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.18);
		overflow: hidden;
	}

	.join__hero h1 {
		margin: 24px auto;
		width: 100%;
		line-height: 1.25;
		z-index: 1;
	}
	.helper {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 16px;
		padding-bottom: 12px;
		opacity: 0.69;
	}
	.helper label {
		width: 100%;
		padding-right: 12px;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		text-align: right;
	}

	.join__hero form {
		z-index: 1;
		display: flex;
		flex-direction: column;
		line-height: 1.25;
		justify-content: flex-end;
		box-sizing: border-box;
	}

	.join__hero input:not([type='checkbox']) {
		font-size: 42px;
		height: 64px;
		padding: 12px 24px;
		z-index: 1;
	}

	.join__hero :global(button) {
		z-index: 1;
	}
	.join__hero form > div {
		display: flex;
		margin: 12px 0;
	}
	.join__hero input {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		background: hsla(var(--color-blue-base), 15%, 70%);
		flex: 1 1 auto;
	}
	.join__form,
	.join__connect {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
	}
	.join__next {
		display: flex;
		justify-content: flex-end;
		width: 100%;
		padding-top: 24px;
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
		flex-wrap: wrap;
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

	.join__hero img.ethlogo {
		position: absolute;
		z-index: 0;
		pointer-events: none;
		animation-name: bounce;
		animation-delay: 0;
		animation-duration: 30s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		transform: translateY(-50%) translateX(-50%);
		top: 40px;
		left: 4px;
		animation-duration: 10s;
	}
	@keyframes bounce {
		0% {
			height: 420px;
			transform: translateY(-50%) translateX(-50%) rotate(0deg);
		}
		50% {
			transform: translateY(-50%) translateX(-50%) rotate(180deg);
			height: 200px;
		}
		100% {
			height: 420px;
			transform: translateY(-50%) translateX(-50%) rotate(359deg);
		}
	}

	@media (max-width: 768px) {
		.rooms {
			flex-direction: column;
		}
		.join__hero h1 {
			text-align: center;
		}
		.join__hero form {
			width: 100%;
		}
		.join__hero form input[type='text'] {
			width: 100%;
		}
		.join__hero span:not(.join__action) {
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.join__hero form div {
			flex-direction: column;
		}
	}

	@media (min-width: 1024px) {
		.join__hero {
			padding: 24px 48px;
			font-size: 48px;
			overflow: hidden;
		}
		.join__hero form {
			margin: 48px auto 24px auto;
		}
	}
</style>
