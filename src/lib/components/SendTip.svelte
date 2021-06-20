<script>
	import { createEventDispatcher } from 'svelte';
	import { getContext } from 'svelte';
	import { TIP_ADDRESS } from './MonoChain.svelte';

	const chain = getContext('chain');
	const address = getContext('address');
	const dispatch = createEventDispatcher();

	export let sending = false;
	async function onSendTip() {
		if (sending) return false;

		sending = true;
		const tx = await chain.eth.sendTransaction({
			// gasPrice: $web3.utils.toHex($web3.utils.toWei('30', 'gwei')),
			gasLimit: chain.utils.toHex('21000'),
			from: $address,
			to: TIP_ADDRESS,
			value: chain.utils.toHex(chain.utils.toWei('1', 'finney'))
		});
		dispatch('success', tx);
		sending = false;
	}

</script>

<button on:click|preventDefault={onSendTip} disabled={sending}>Send Tip</button>
