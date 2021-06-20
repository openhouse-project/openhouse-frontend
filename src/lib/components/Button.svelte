<script lang="ts">
	export let type = 'button';
	export let attach: string | undefined = undefined;

</script>

<button on:click {type} class="button {attach ? `attach--${attach}` : ''}">
	<slot />
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border-radius: 4px;
		background: var(--bg, royalblue);
		color: var(--fg, white);
		border: var(--border, none);
		font-size: var(--font-size, 24px);
		cursor: pointer;
	}
	button.attach--left {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	button.attach--right {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	button:hover {
		background: var(--hover-bg, darkblue);
	}

</style>
