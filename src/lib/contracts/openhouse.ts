//export const OPENHOUSE_ADDRESS = '0xFf3D0372a03118cB6343EAEE7A7918e73982e872';	 // Rinkeby Testnet
export const OPENHOUSE_ADDRESS = '0xd19f41Da8f24b0Cec339DceD41dE2FcABe22647a'; // Ropsten Testnet
export const OPENHOUSE_CONTRACT: any[] = [
	{
		inputs: [
			{
				internalType: 'string',
				name: 'name',
				type: 'string'
			},
			{
				internalType: 'bool',
				name: 'isPublic',
				type: 'bool'
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
		name: 'roomExists',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool'
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
		name: 'roomIsPublic',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool'
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
