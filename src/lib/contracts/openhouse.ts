//export const OPENHOUSE_ADDRESS = '0xFf3D0372a03118cB6343EAEE7A7918e73982e872';	 // Rinkeby Testnet
export const OPENHOUSE_ADDRESS = '0xBbC2D50c34E1FD70Dbe82dBba3657d1949c65cD0'; // Ropsten Testnet
export const OPENHOUSE_CONTRACT: any[] = [
	{
		inputs: [
			{
				internalType: 'string',
				name: 'name',
				type: 'string'
			}
		],
		name: 'addRoom',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	},
	{
		inputs: [],
		name: 'listRooms',
		outputs: [
			{
				internalType: 'string[]',
				name: '',
				type: 'string[]'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [],
		name: 'listSenderRooms',
		outputs: [
			{
				internalType: 'string[]',
				name: '',
				type: 'string[]'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: 'name',
				type: 'string'
			}
		],
		name: 'members',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]'
			}
		],
		stateMutability: 'view',
		type: 'function'
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: 'name',
				type: 'string'
			}
		],
		name: 'senderIsInRoom',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool'
			}
		],
		stateMutability: 'view',
		type: 'function'
	}
];
