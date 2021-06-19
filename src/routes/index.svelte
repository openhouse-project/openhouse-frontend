<script>
	import { browser } from '$app/env';

</script>

<svelte:head>
	<script src="https://cdn.jsdelivr.net/npm/jquery@3.5.0/dist/jquery.min.js"></script>
	<script src="https://meet.jit.si/libs/lib-jitsi-meet.min.js"></script>
</svelte:head>

<h1>Jitsi Test</h1>
{#if browser}
	{#await import('$lib/Home.svelte') then Home}
		<svelte:component this={Home.default} />
	{/await}
{:else}
	Loading...
{/if}
