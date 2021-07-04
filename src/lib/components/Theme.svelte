<div class="theme">
	<slot />
</div>

<style>
	:root {
		--color-blue-hue: 230;
		--color-blue-saturation: 65%;
		--color-blue-base: var(--color-blue-hue), var(--color-blue-saturation);
		--color-blue: hsl(var(--color-blue-base), 50%);
		--color-blue-5: hsl(var(--color-blue-base), 5%);
		--color-blue-10: hsl(var(--color-blue-base), 10%);
		--color-blue-20: hsl(var(--color-blue-base), 20%);
		--color-blue-30: hsl(var(--color-blue-base), 30%);
		--color-blue-40: hsl(var(--color-blue-base), 40%);
		--color-blue-50: hsl(var(--color-blue-base), 50%);
		--color-blue-60: hsl(var(--color-blue-base), 60%);
		--color-blue-70: hsl(var(--color-blue-base), 70%);
		--color-blue-80: hsl(var(--color-blue-base), 80%);
		--color-blue-90: hsl(var(--color-blue-base), 90%);
		--color-blue-95: hsl(var(--color-blue-base), 95%);

		--color-orange-hue: 40;
		--color-orange-saturation: 85%;
		--color-orange-base: var(--color-orange-hue), var(--color-orange-saturation);
		--color-orange: hsl(var(--color-orange-base), 50%);
		--color-orange-5: hsl(var(--color-orange-base), 5%);
		--color-orange-10: hsl(var(--color-orange-base), 10%);
		--color-orange-20: hsl(var(--color-orange-base), 20%);
		--color-orange-30: hsl(var(--color-orange-base), 30%);
		--color-orange-40: hsl(var(--color-orange-base), 40%);
		--color-orange-50: hsl(var(--color-orange-base), 50%);
		--color-orange-60: hsl(var(--color-orange-base), 60%);
		--color-orange-70: hsl(var(--color-orange-base), 70%);
		--color-orange-80: hsl(var(--color-orange-base), 80%);
		--color-orange-90: hsl(var(--color-orange-base), 90%);
		--color-orange-95: hsl(var(--color-orange-base), 95%);

		--color-green-hue: 76;
		--color-green-saturation: 65%;
		--color-green-base: var(--color-green-hue), var(--color-green-saturation);
		--color-green: hsl(var(--color-green-base), 50%);
		--color-green-5: hsl(var(--color-green-base), 5%);
		--color-green-10: hsl(var(--color-green-base), 10%);
		--color-green-20: hsl(var(--color-green-base), 20%);
		--color-green-30: hsl(var(--color-green-base), 30%);
		--color-green-40: hsl(var(--color-green-base), 40%);
		--color-green-50: hsl(var(--color-green-base), 50%);
		--color-green-60: hsl(var(--color-green-base), 60%);
		--color-green-70: hsl(var(--color-green-base), 70%);
		--color-green-80: hsl(var(--color-green-base), 80%);
		--color-green-90: hsl(var(--color-green-base), 90%);
		--color-green-95: hsl(var(--color-green-base), 95%);

		--color-red-hue: 345;
		--color-red-saturation: 65%;
		--color-red-base: var(--color-red-hue), var(--color-red-saturation);
		--color-red: hsl(var(--color-red-base), 50%);
		--color-red-5: hsl(var(--color-red-base), 5%);
		--color-red-10: hsl(var(--color-red-base), 10%);
		--color-red-20: hsl(var(--color-red-base), 20%);
		--color-red-30: hsl(var(--color-red-base), 30%);
		--color-red-40: hsl(var(--color-red-base), 40%);
		--color-red-50: hsl(var(--color-red-base), 50%);
		--color-red-60: hsl(var(--color-red-base), 60%);
		--color-red-70: hsl(var(--color-red-base), 70%);
		--color-red-80: hsl(var(--color-red-base), 80%);
		--color-red-90: hsl(var(--color-red-base), 90%);
		--color-red-95: hsl(var(--color-red-base), 95%);

		--color-yellow-hue: 88;
		--color-yellow-saturation: 55%;
		--color-yellow-base: var(--color-yellow-hue), var(--color-yellow-saturation);
		--color-yellow: hsl(var(--color-yellow-base), 50%);
		--color-yellow-5: hsl(var(--color-yellow-base), 5%);
		--color-yellow-10: hsl(var(--color-yellow-base), 10%);
		--color-yellow-20: hsl(var(--color-yellow-base), 20%);
		--color-yellow-30: hsl(var(--color-yellow-base), 30%);
		--color-yellow-40: hsl(var(--color-yellow-base), 40%);
		--color-yellow-50: hsl(var(--color-yellow-base), 50%);
		--color-yellow-60: hsl(var(--color-yellow-base), 60%);
		--color-yellow-70: hsl(var(--color-yellow-base), 70%);
		--color-yellow-80: hsl(var(--color-yellow-base), 80%);
		--color-yellow-90: hsl(var(--color-yellow-base), 90%);
		--color-yellow-95: hsl(var(--color-yellow-base), 95%);

		--color-aqua-hue: 209;
		--color-aqua-saturation: 100%;
		--color-aqua-base: var(--color-aqua-hue), var(--color-aqua-saturation);
		--color-aqua: hsl(var(--color-aqua-base), 50%);
		--color-aqua-5: hsl(var(--color-aqua-base), 5%);
		--color-aqua-10: hsl(var(--color-aqua-base), 10%);
		--color-aqua-20: hsl(var(--color-aqua-base), 20%);
		--color-aqua-30: hsl(var(--color-aqua-base), 30%);
		--color-aqua-40: hsl(var(--color-aqua-base), 40%);
		--color-aqua-50: hsl(var(--color-aqua-base), 50%);
		--color-aqua-60: hsl(var(--color-aqua-base), 60%);
		--color-aqua-70: hsl(var(--color-aqua-base), 70%);
		--color-aqua-80: hsl(var(--color-aqua-base), 80%);
		--color-aqua-90: hsl(var(--color-aqua-base), 90%);
		--color-aqua-95: hsl(var(--color-aqua-base), 95%);
	}

	:global(body.noscroll) {
		width: 100vw;
		height: 100vh;
		position: fixed;
		overflow: hidden;
	}

	.theme {
		font-size: 18px;
		line-height: 1.125em;
		color: var(--color-blue-95);
	}
</style>
