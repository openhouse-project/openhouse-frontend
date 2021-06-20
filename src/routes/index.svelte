<script>
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';
	import { ROOT_ADDRESS } from '$lib/components/MonoChain.svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';

	const address = getContext('address');
	export let conferenceId = '';
	const onFormSubmit = () => {
		console.log('Joining', conferenceId);
		goto(`/conference/${conferenceId}`);
	};

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
	<h1>Welcome to OpenHouse</h1>

	<hr />

	<h3>Summary</h3>
	<p>
		Openhouse is a project to prototype a decentralised “Clubhouse”, using Jitsi and Ethereum, as
		part of Hackmoney hackathon.
	</p>
	<p>
		HackMoney is a 3-week remote hackathon from June 18th to July 9th 2021, organised by ETHGlobal.
	</p>

	<hr />

	<h3>Approach</h3>
	<p>
		We are comitted to starting by integrating jitsi-meet with Ethereum, to allow users to login
		with their Ethereum wallets as their identity.
	</p>
	<p>
		After this, we intend to integrate the user-access-control module in jitsi-meet, with a
		custom-built decentralised database running on Ethereum blockchain.
	</p>
	<p>
		A proposed next step would be to create an onchain governance mechanism to allow community to
		control access. Also, to integrate with ENS for human-readable name-labelling.
	</p>

	<hr />

	<h4>Project update</h4>
	<p>The project was conceived, and the initial team formed on 18 June 2021.</p>
	<p>
		The skillsets of the initial team range from UX Design, Solutions Architecture, Business
		Operations and Software Development. Software experience include Jitsi, Ethereum, Livepeer,
		golang, Java, C++, Python, Spring, React, Node, as well as Solidity for smart contracting.
	</p>

	<hr />

	<h4>Resources</h4>
	Discord server github
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

</style>
