<script context="module" lang="ts">
	export const ROOT_ADDRESS = '0x0000000000000000000000000000000000000000';
	export const TIP_ADDRESS = '0x834356a88C66897FA0A05a61964a91A607956ee3';
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';
	import {
		accounts,
		addressName,
		address,
		balance,
		domain,
		network,
		web3,
		ens,
		token
	} from '$lib/store';
	import ENS from 'ethjs-ens';

	const ACCOUNT_SYNC_INTERVAL = 5000;
	setContext('chain', web3);
	setContext('address', address);
	setContext('balance', balance);
	setContext('requestAccounts', requestAccounts);

	let balanceLoading = false;
	let balanceCheckInterval;
	onMount(async () => {
		const Web3 = await import('web3/dist/web3.min.js').then((mod) => mod.default);
		let provider;
		if (!Web3.givenProvider) {
			const WalletConnect = await import('@walletconnect/web3-provider/dist/umd/index.min.js').then(
				(mod) => mod.default.default || mod.default
			);
			if (WalletConnect) {
				provider = new WalletConnect({ infuraId: `${import.meta.env.VITE_INFURA_ID}` });
				await provider.enable();
			}
		} else {
			provider = Web3.givenProvider;
		}
		$web3 = new Web3(provider);
		$network = await $web3.eth.net.getId();
		$ens = new ENS({ provider: $web3.currentProvider, network: $network });
		await requestAccounts();
		await getBalance();
		await getToken();
		await syncAccount();
		balanceCheckInterval = setInterval(syncAccount, ACCOUNT_SYNC_INTERVAL);
		return () => {
			clearInterval(balanceCheckInterval);
		};
	});

	export async function syncAccount(force = false): Promise<void> {
		$accounts = await $web3.eth.getAccounts();
		if (force || $accounts[0] !== $address) {
			console.log('Syncing account', $accounts[0]);
			// Invalidate the token
			$token = '';
			if ($accounts[0] === undefined) {
				$balance.wei = 0;
				$balance.eth = 0;
				$domain = '';
				$addressName = 'guest';
				$address = '';
			} else {
				$address = $accounts[0];
				$domain = await ensDomain($address).catch(() => '');
				$addressName = $domain || $address;
			}
		}
		await getBalance();
	}

	export async function getBalance(): Promise<number> {
		if (web3 && $web3 && $address !== undefined && $address !== ROOT_ADDRESS && !balanceLoading) {
			balanceLoading = true;
			$balance.wei = await $web3.eth.getBalance($address);
			$balance.eth = $web3.utils.fromWei($balance.wei, 'ether');
			balanceLoading = false;
		}
		return $balance.eth;
	}

	export async function requestAccounts(): Promise<void> {
		$accounts = await $web3.eth.requestAccounts();
		await syncAccount();
	}

	export async function getToken(): Promise<void> {
		const tkn = await fetchToken();
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

	export async function fetchToken(): Promise<string | false> {
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

	async function ensDomain(address): Promise<string> {
		return $ens.reverse(address);
	}

	$: $addressName = $domain ?? $address;
</script>

<slot
	address={$address}
	addressName={$addressName}
	balance={$balance}
	chain={$web3}
	domain={$domain}
	{requestAccounts}
/>
