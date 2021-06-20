<script context="module" lang="ts">
	export const ROOT_ADDRESS = '0x0000000000000000000000000000000000000000';
	export const TIP_ADDRESS = '0x834356a88C66897FA0A05a61964a91A607956ee3';

</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import ENS from 'ethjs-ens';

	const BALANCE_CHECK_INTERVAL = 5000;

	export let ens;
	export let web3 = undefined;
	setContext('chain', web3);

	export const address = writable(ROOT_ADDRESS);
	export const accounts = writable([]);
	export const balance = writable('');
	export const domain = writable(false);
	setContext('address', address);
	setContext('balance', balance);

	let balanceLoading = false;
	let balanceCheckInterval;
	onMount(async () => {
		const Web3 = await import('web3/dist/web3.min.js').then((mod) => mod.default);
		web3 = new Web3(Web3.givenProvider || 'https://sokol.poa.network');
		ens = new ENS({ provider: web3.currentProvider, network: '1' });
		await requestAccounts();
		await getBalance();
		balanceCheckInterval = setInterval(getBalance, BALANCE_CHECK_INTERVAL);
		return () => {
			clearInterval(balanceCheckInterval);
		};
	});

	export async function getBalance(): Promise<string> {
		if (web3 && $address !== ROOT_ADDRESS && !balanceLoading) {
			balanceLoading = true;
			$balance = await web3.eth.getBalance($address);
			balanceLoading = false;
		}
		return $balance;
	}

	export async function requestAccounts(): Promise<void> {
		$accounts = await web3.eth.requestAccounts();
		$address = $accounts[0];
		$domain = await ensDomain($address);
	}

	async function ensDomain(address) {
		const resolved = await ens.reverse(address);
		console.log(resolved);
		return resolved;
	}

</script>

<slot address={$address} balance={$balance} chain={web3} domain={$domain} {requestAccounts} />
