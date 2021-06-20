<script context="module" lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load({ page }: LoadInput): Promise<LoadOutput> {
		const { slug } = page.params;
		return { props: { slug } };
	}

</script>

<script lang="ts">
	import { onMount } from 'svelte';

	export let slug;

</script>

<section>
	<h1>Connecting to {slug}</h1>
</section>

<style>
	section {
		padding: 24px 12px 6px 12px;
	}

</style>
