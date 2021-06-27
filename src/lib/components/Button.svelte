<script lang="ts">
	export let type = 'button';
	export let attach: string | undefined = undefined;
	export let size = 'normal';
	export let disabled = false;
	export let fullWidth = false;
</script>

<button
	on:click
	{type}
	class="button {attach ? `attach--${attach}` : ''} button--{size}"
	class:button--fullwidth={fullWidth}
	{disabled}
>
	<slot />
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: auto;
		padding: 6px 12px;
		border-radius: 4px;
		line-height: 1.25;
		box-sizing: border-box;
		background: var(--bg, linear-gradient(to bottom, var(--color-aqua), var(--color-blue)));
		color: var(--fg, white);
		border: var(--border, none);
		font-size: var(--font-size, 24px);
		cursor: pointer;
	}
	.button--fullwidth {
		width: 100%;
	}
	.button--large {
		font-size: 32px;
		padding: 12px 24px;
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
		background: var(--hover-bg, var(--color-blue-40));
	}
	button.button[disabled] {
		--bg: hsl(0, 0%, 20%);
		--hover-bg: hsl(0, 0%, 20%);
	}
</style>
