<script>
	import { onMount } from 'svelte';

	import { writable } from 'svelte/store';

	export const devices = writable([]);

	onMount(() => {});

</script>
