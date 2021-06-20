<script>
	import {
		createConnectionStore,
		localTracksStore,
		DEFAULT_JITSI_CONFIG,
		Mirror
	} from 'jitsi-svelte';
	import Conference from './Conference.svelte';
	let mirrorPage = true;
	let shareDesktop = false;
	const connection = createConnectionStore(DEFAULT_JITSI_CONFIG, 'openhouse-test');
	const conferences = connection.conferencesStore;
	conferences.join('openhouse-test');

</script>

{#if mirrorPage}
	<div class="centered">
		<p>You're about to join a video meeting</p>
		<Mirror on:done={() => (mirrorPage = false)} />
	</div>
{/if}
<div>{$connection ? 'Connected' : 'Not Connected'}</div>

{#each Object.entries($conferences) as [conferenceId, conference], key}
	<Conference {conferenceId} {conference} permitEntry={!mirrorPage} />
	<button on:click={() => conferences.leave(conferenceId)}>Leave Conference</button>
{/each}

<button
	on:click={() => {
		shareDesktop = !shareDesktop;
		localTracksStore.shareDesktop(shareDesktop);
	}}
>
	{shareDesktop ? 'Stop Sharing Screen' : 'Share Screen'}
</button>

<style>
	p {
		font-family: Verdana, Geneva, Tahoma, sans-serif;
	}
	.centered {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

</style>
