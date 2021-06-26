<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const DEFAULT_JITSI_CONFIG = {
		hosts: {
			domain: 'meet.jit.si',
			muc: 'conference.meet.jit.si',
			focos: 'focus.meet.jit.si'
		},
		externalConnectUrl: 'https://meet.jit.si/http-pre-bind',
		enableP2P: true,
		p2p: {
			enabled: true,
			preferH264: true,
			disableH264: true,
			useStunTurn: true
		},
		useStunTurn: true,
		websocket: 'wss://meet.jit.si/xmpp-websocket',
		clientNode: 'http://jitsi.org/jitsimeet'
	};

	export let Jitsi = undefined;
	export const connection = writable({
		status: 'initializing'
	});
	setContext('connection', connection);
	export let jitsi = writable(undefined);
	setContext('jitsi', jitsi);

	export let room = 'openhouse';
	export let jitsiOptions = {
		...DEFAULT_JITSI_CONFIG,
		bosh: `https://meet.jit.si/http-bind?room=${room}`
	};

	onMount(() => {
		Jitsi = (window as any).JitsiMeetJS;
		Jitsi.init();
		Jitsi.setLogLevel(Jitsi.logLevels.ERROR);
		$connection.status = 'connecting';
		$jitsi = new Jitsi.JitsiConnection(null, null, jitsiOptions);
		$jitsi.addEventListener(
			Jitsi.events.connection.CONNECTION_ESTABLISHED,
			onConnectionEstablished
		);
		$jitsi.addEventListener(Jitsi.events.connection.CONNECTION_FAILED, onConnectionFailed);
		$jitsi.addEventListener(Jitsi.events.connection.CONNECTION_DISCONNECTED, onConnectionClosed);
		$jitsi.connect();
	});

	function onConnectionEstablished() {
		$connection.status = 'connected';
		console.log('Connection established');
	}

	function onConnectionFailed() {
		console.log('Connection failed');
		$connection.status = 'failed';
	}

	function onConnectionClosed() {
		console.log('Connection closed');
		$connection.status = 'closed';
	}
</script>

<slot connection={$connection} {jitsi} />
