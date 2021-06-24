import { writable } from 'svelte/store'

export const addressName = writable('Anonymous');
export const ethAddress = writable('');
export const token = writable('');