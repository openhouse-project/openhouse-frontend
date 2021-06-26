<script lang="ts">
	import { getContext, onMount, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import type { Writable } from 'svelte/store';

	export let room;

	const connection: Writable<any> = getContext('connection');
	const jitsi: Writable<any> = getContext('jitsi');

	let instance: any = false;
	export let conference = writable({
		status: 'initializing',
		room: instance,
		dominantSpeakerId: null,
		userId: '',
		role: ''
	});
	setContext('conference', conference);
	const Jitsi = (window as any).JitsiMeetJS;

	export let participants = writable([]);
	setContext('participants', participants);

	export let tracks = writable([]);
	setContext('tracks', tracks);

	export let localTracks = writable({ audio: false, video: false, desktop: false });
	setContext('localTracks', localTracks);

	export let devices = writable([]);
	setContext('devices', devices);

	export let micEnabled = writable(false);
	export let videoEnabled = writable(false);
	export let screenEnabled = writable(false);
	export let audioGranted = writable(false);
	export let videoGranted = writable(false);
	export let desktopGranted = writable(false);

	onMount(async () => {
		Jitsi.createLocalTracks({ devices: ['audio', 'video'] })
			.then(onLocalTracks)
			.catch((err) => {
				console.error('Could not enable microphone', err);
				$micEnabled = false;
			});

		Jitsi.mediaDevices.enumerateDevices((dev) => {
			console.log('devices', dev);
			$devices = dev;
		});
	});

	$: if (
		$connection.status === 'connected' &&
		$conference.status === 'initializing' &&
		$conference.room === false
	) {
		console.log('conference preinit');
		$conference.status = 'joining';
		console.log('conference init');
		instance = $jitsi.initJitsiConference(room, {
			openBridgeChannel: 'websocket'
		});
		console.log('registering events');
		instance.on(Jitsi.events.conference.TRACK_ADDED, onTrackAdded);
		instance.on(Jitsi.events.conference.TRACK_REMOVED, onTrackRemoved);
		instance.on(Jitsi.events.conference.TRACK_MUTE_CHANGED, onTrackMuteChanged);
		instance.on(Jitsi.events.conference.DOMINANT_SPEAKER_CHANGED, onDominantSpeakerChanged);
		instance.on(Jitsi.events.conference.DEVICE_LIST_CHANGED, onDeviceListChanged);
		instance.on(Jitsi.events.conference.CONFERENCE_JOINED, onConferenceJoined);
		instance.on(Jitsi.events.conference.USER_ROLE_CHANGED, onUserRoleChanged);
		instance.on(Jitsi.events.conference.USER_JOINED, onUserJoined);
		instance.on(Jitsi.events.conference.USER_LEFT, onUserLeft);
		console.log('joining');
		instance.join();
		$conference.userId = instance.myUserId();
	}

	function onTrackAdded(e) {
		console.log('Track added', e);
	}

	function onTrackRemoved(e) {
		console.log('Track removed', e);
	}

	function onTrackMuteChanged(e) {
		console.log('Track mute change', e);
	}

	function onDominantSpeakerChanged(e) {
		console.log('Dominant speaker changed', e);
	}

	function onDeviceListChanged(e) {
		console.log('Device list changed', e);
	}

	function onLocalTracks(e) {
		Jitsi.mediaDevices.isDevicePermissionGranted('video').then((value) => {
			$videoGranted = value;
		});
		Jitsi.mediaDevices.isDevicePermissionGranted('audio').then((value) => {
			$audioGranted = value;
		});
		Jitsi.mediaDevices.isDevicePermissionGranted('desktop').then((value) => {
			$desktopGranted = value;
		});
		console.log('onLocalTracks', e);
	}

	function onConferenceJoined(e) {
		console.log('onConferenceJoined', e);
		$conference.status = 'joined';
	}

	function onUserRoleChanged(userId, role) {
		if (userId === $conference.userId) {
			$conference.role = role;
		}
	}

	function onUserJoined(userId) {
		console.log('User joined', userId);
		if (!$participants.includes(userId)) $participants = [...$participants, userId];
	}

	function onUserLeft(userId) {
		console.log('User left', userId);
		$participants = $participants.filter((p) => p !== userId);
	}
</script>

<slot
	{participants}
	{conference}
	{devices}
	{micEnabled}
	{videoEnabled}
	{screenEnabled}
	canChangeAudioDevice={Jitsi && Jitsi.mediaDevices.isDeviceChangeAvailable('audio')}
	canChangeVideoDevice={Jitsi && Jitsi.mediaDevices.isDeviceChangeAvailable('video')}
/>
