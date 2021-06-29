import { writable } from 'svelte/store';

export const accounts = writable([]);
export const address = writable('');
export const addressName = writable('Anonymous');
export const balance = writable({
	eth: 0,
	wei: 0
});
export const domain = writable('');
export const ens = writable(undefined);
export const network = writable('');
export const token = writable('');
export const web3 = writable(undefined);
