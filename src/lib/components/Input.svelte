<script>
	export let id;
	export let name;
	export let type;
	export let value;
	export let checked = false;
	export let placeholder = '';
</script>

{#if type === 'text'}
	<input
		{id}
		{name}
		{placeholder}
		type="text"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{:else if type === 'number'}
	<input
		{id}
		{name}
		{placeholder}
		type="number"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{:else if type === 'email'}
	<input
		{id}
		{name}
		{placeholder}
		type="email"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{:else if type === 'checkbox'}
	<input
		{id}
		{name}
		{placeholder}
		type="checkbox"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
		bind:checked
	/>
{:else if type === 'radio'}
	<input
		{id}
		{name}
		{placeholder}
		type="radio"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{:else if type === 'color'}
	<input
		{id}
		{name}
		{placeholder}
		type="color"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{:else if type === 'password'}
	<input
		{id}
		{name}
		{placeholder}
		type="password"
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{:else if type === 'select'}
	<select
		{id}
		{name}
		{placeholder}
		bind:value
		on:input
		on:blur
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout><slot /></select
	>
{:else if type === 'textarea'}
	<textarea
		{id}
		{name}
		{placeholder}
		bind:value
		on:input
		on:change
		on:keypress
		on:keyup
		on:keydown
		on:focusin
		on:focusout
	/>
{/if}

<style>
	input:not([type='checkbox']) {
		display: var(--input-display, flex);
		flex: 1 1 auto;
		appearance: none;
		background: var(--input-background, var(--color-blue-20));
		border: var(--input-border, 3px solid transparent);
		color: var(--input-color, white);
		font-family: 'Roboto', sans-serif;
		font-size: var(--input-font-size, 18px);
		height: var(--input-height, 36px);
		line-height: var(--input-line-height, 1.25);
		outline: none;
		padding: var(--input-padding, 6px 12px);
	}

	input:focus-within,
	select:focus-within,
	textarea:focus-within {
		border: 3px solid var(--border-color, var(--color-aqua-60));
	}
</style>
