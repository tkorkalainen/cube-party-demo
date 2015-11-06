/* global Dancer */

// Handles audio loading, playback, analysis + publishes audio data 

AudioHandler = function () {

	var dancer, dancerSync;

	function init() {

		// Load music track
		dancer = new Dancer();
		dancer.load( Main.audio.audio1 );

		// Load sync track
		dancerSync = new Dancer();
		dancerSync.load( Main.audio.audio2 );
		dancerSync.setVolume(0);
		
		// Setup kick/beat detection
		dancerSync.createKick({
			onKick: function () {
				events.emit("onBeat");
			},
			threshold: 0.05,
			frequency: [0, 20],
			decay: 0.1
		}).on();
		
		// Wait for load to finish
		Dancer.isSupported() || play();
		!dancer.isLoaded() && !dancerSync.isLoaded() ? dancer.bind('loaded', play) : play();
	}

	function play() {
		dancer.play();
		dancerSync.play();
	}

	return {
		init: init,
		play: play,
		dancer: function () { return dancer; }
	};
} ();