<script context="module" lang="ts">
	export const ROOT_ADDRESS = '0x0000000000000000000000000000000000000000';
	export const TIP_ADDRESS = '0x834356a88C66897FA0A05a61964a91A607956ee3';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { addressName, ethAddress, token } from '$lib/store';
	import ENS from 'ethjs-ens';

	const BALANCE_CHECK_INTERVAL = 5000;

	export let ens = writable(undefined);
	export let web3 = writable(undefined);
	setContext('chain', web3);

	export const address = writable(ROOT_ADDRESS);
	export const accounts = writable([]);
	export const balance = writable('');
	export const ethBalance = writable('');
	export const domain = writable(false);

	setContext('address', address);
	setContext('balance', balance);
	setContext('ethBalance', ethBalance);

	let balanceLoading = false;
	let balanceCheckInterval;
	onMount(async () => {
		const Web3 = await import('web3/dist/web3.min.js').then((mod) => mod.default);
		let provider;
		if (!Web3.givenProvider) {
			const WalletConnect = await import('@walletconnect/web3-provider/dist/umd/index.min.js').then(
				(mod) => mod.default.default
			);
			provider = new WalletConnect({ infuraId: `${import.meta.env.VITE_INFURA_ID}` });
			await provider.enable();
		} else {
			provider = Web3.givenProvider;
		}
		$web3 = new Web3(provider);
		$ens = new ENS({ provider: $web3.currentProvider, network: '1' });
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
			$balance = await $web3.eth.getBalance($address);
			$ethBalance = $web3.utils.fromWei($balance, 'ether');
			balanceLoading = false;
		}
		return $balance;
	}

	export async function requestAccounts(): Promise<void> {
		$accounts = await $web3.eth.requestAccounts();
		$address = $accounts[0];
		ethAddress.set($address);
		addressName.set($address);
		$domain = await ensDomain($address);

		const tkn = await getToken();
		if (!tkn) {
			const challenge = await getChallengeForAddress($address);
			const signature = await $web3.eth.personal.sign(challenge, $address, '');
			const response = await fetch(`/auth/login.json`, {
				method: 'POST',
				cache: 'no-cache',
				redirect: 'error',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ address: $address, signature: signature })
			});
			const json = await response.json();
			$token = json?.token;
		} else {
			$token = tkn;
		}
	}

	export async function getToken(): Promise<string | false> {
		const response = await fetch(`/auth.json`, {
			headers: { Accept: 'application/json', Cache: 'no-cache' },
			credentials: 'same-origin'
		});
		const { token } = await response.json();
		return token;
	}

	export async function getChallengeForAddress(address: string): Promise<string> {
		const response = await fetch(`/auth/challenge/${address}.json`, { credentials: 'same-origin' });
		const { challenge } = await response.json();
		return challenge;
	}

	async function ensDomain(address) {
		try {
			const resolved = await $ens.reverse(address);
			addressName.set(resolved);
			return resolved;
		} catch (e) {
			console.log(e);
			return null;
		}
	}
</script>

<slot
	address={$address}
	balance={$balance}
	ethBalance={$ethBalance}
	chain={web3}
	domain={$domain}
	{requestAccounts}
/>
