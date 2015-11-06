// Audio loader. Tested only with Chrome 45.0.2454.101 m.

THREE.AudioLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.AudioLoader.prototype = {

	constructor: THREE.AudioLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var cached = THREE.Cache.get( url );

		if ( cached !== undefined ) {

			if ( onLoad ) {

				setTimeout( function () {

					onLoad( cached );

				}, 0 );

			}

			return cached;

		}

		var audio = document.createElement("audio");
		if ("src" in audio) {
			audio.autoPlay = false;
		}
		else {
			audio = document.createElement("bgsound");
			audio.volume = -10000;
		}
	
		audio.addEventListener( 'canplaythrough', function ( event ) {

			THREE.Cache.add( url, this );

			if ( onLoad ) onLoad( this );

			scope.manager.itemEnd( url );

		}, false );

		if ( onProgress !== undefined ) {

			audio.addEventListener( 'progress', function ( event ) {

				onProgress( event );

			}, false );

		}

		audio.addEventListener( 'error', function ( event ) {

			if ( onError ) onError( event );

			scope.manager.itemError( url );

		}, false );

		if ( this.crossOrigin !== undefined ) audio.crossOrigin = this.crossOrigin;

		scope.manager.itemStart( url );

		audio.src = url;

		return audio;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
