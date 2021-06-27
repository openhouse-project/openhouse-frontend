<script lang="ts">
	export let type = 'button';
	export let attach: string | undefined = undefined;
	export let disabled = false;
	export let size = 'normal';
</script>

<button
	on:click
	{type}
	class="button {attach ? `attach--${attach}` : ''} button--{size}"
	class:disabled
	{disabled}
>
	<slot />
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border-radius: 4px;
		box-sizing: border-box;
		background: var(--bg, royalblue);
		color: var(--fg, white);
		border: var(--border, none);
		font-size: var(--font-size, 24px);
		cursor: pointer;
	}
	.button--large {
		font-size: 32px;
		padding: 24px 48px;
	}
	button.button.attach--left {
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
	button.button.disabled {
		--bg: hsl(0, 0%, 20%);
		--hover-bg: hsl(0, 0%, 20%);
	}
</style>
