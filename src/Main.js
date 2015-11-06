// Globals

/* global Nanobar */
/* global $ */
/* global Director */
/* global Events */
/* global AudioHandler */
/* global Stats */
/* global Detector */
/* global Scene1 */
/* global Scene2 */
/* global Scene3 */
/* global Scene4 */
/* global Scene5 */
/* global Scene6 */
/* global Cube */
/* global Loader */
/* global THREE */
/* global TWEEN */

var events = new Events();

var Main = function () {

	var stats;
	
	// Parameters
	var audioParams = {
		beatDetection: true,
		bpmRate: 100
	};

	var screenParams = {
		antiAlias: false,
		aspectRatio: 2.2
	};

	var images = {
		sky: null,
		water: null,
		gradient: null,
		particle: null,
		particle2: null,
		dickbutt: null,
		creditsTomi: null,
		creditsModels: null,
		cubeParty: null,
		textParticles: null,
		explosion: null
	};

	var audio = {
		audio1:  null,
		audio2: null
	};

	var models = {
		duck: null,
		statue: null
	}
	
	// Load
	function load() {

		var manager = new THREE.LoadingManager();

		// Loading progress
		manager.onProgress = function (item, loaded, total) {
			$("#demo").html('Loading realtime demo... ' + Math.floor(loaded / total * 100) + '%');
		};
		
		// Loading completed 
		manager.onLoad = function () {
			$("#demo").removeClass('disabled');
			$("#demo").html('Run realtime demo')
		};

		var imageLoader = new THREE.ImageLoader(manager);
		var modelLoader = new THREE.OBJMTLLoader(manager);
		
		var audioLoader = new THREE.AudioLoader(manager);

		audioLoader.load('res/mp3/Demo.mp3', function (object) {
			audio.audio1 = object;
		});

		audioLoader.load('res/mp3/Demo2.mp3', function (object) {
			audio.audio2 = object;
		});
		
		modelLoader.load("res/models/statue.obj", "res/models/statue.mtl", function (object) {
			models.statue = object;
		});

		modelLoader.load("res/models/duck.obj", "res/models/duck.mtl", function (object) {
			models.duck = object;
		});

		imageLoader.load('res/textures/sky.jpg', function (image) {
			images.sky = createTexture(image);
		});

		imageLoader.load('res/textures/particle.png', function (image) {
			images.particle2 = createTexture(image);
		});

		imageLoader.load('res/textures/particle2.png', function (image) {
			images.particle = createTexture(image);
		});

		imageLoader.load('res/textures/text-particles.png', function (image) {
			images.textParticles = createTexture(image);
		});

		imageLoader.load('res/textures/dickbutt.png', function (image) {
			images.dickbutt = image;
		});

		imageLoader.load('res/textures/water-normals.jpg', function (image) {
			images.water = createTexture(image);
		});

		imageLoader.load('res/textures/credits-tomi.png', function (image) {
			images.creditsTomi = createTexture(image);
		});

		imageLoader.load('res/textures/credits-models.png', function (image) {
			images.creditsModels = createTexture(image);
		});

		imageLoader.load('res/textures/cube-party-2015.png', function (image) {
			images.cubeParty = createTexture(image);
		});

		imageLoader.load('res/textures/explosion.png', function (image) {
			images.explosion = createTexture(image);
		});

	}

	function init() {
		
		$("#menu").hide();
		$("html, body").css("overflow", "hidden"); 
		
		// Detect WebGL
		if (!Detector.webgl) { Detector.addGetWebGLMessage(); }

		// Init document
		document.onselectstart = function () { return false; };

/*
		// Show stats
		stats = new Stats();
		$('#stats').append(stats.domElement);
		stats.domElement.id = "stats";
		stats.setMode(1); // // 0: fps, 1: ms, 2: mb
*/
		
		// Init handlers
		AudioHandler.init();
		Director.init();
		Cube.init();
		Scene1.init();
		Scene2.init();
		Scene3.init();
		Scene4.init();
		Scene5.init();
		Scene6.init();

		Director.addAction(0, function () {

			// Set cameras
			Cube.getCamera().position.set(0, 0, 400);
			//Cube.getCube().visible = false;
			//Cube.getCube().rotation.set( Math.PI / 2 , 0, 0 );
			//Cube.getCube().rotation.set( 0, -Math.PI / 2, 0);
			//Cube.getCube().rotation.set( 0, -Math.PI, 0);
			//Cube.getCube().rotation.set(0, -Math.PI * 3 / 2, 0);
			
			//Scene4.play();

			Scene1.getCamera().position.set(0, 0, 600);
			Scene1.play();

			Scene2.getCamera().position.set(0, 0, 400);
			Scene2.getOcclusionCamera().position.set(0, 0, 400);

			Scene3.getCamera().position.set(0, 0, 0);

			Scene4.getCamera().position.set(0, 0, 800);
			Scene5.getCamera().position.set(0, 0, 150);
			Scene6.getCamera().position.set(0, 15, 100);

			Scene2.stop();
			Scene3.stop();
			Scene4.stop();
			Scene5.stop();
			Scene6.stop();

		});

		// Scene 1
		Director.addAction(0.5, function () {
			Cube.getCube().visible = true;
		});
		Director.addAction(1, function () {
			Cube.getLabel().visible = false;
		});
		Director.addTween(1, 1, Scene1.getCamera().position, { x: 300, y: 230, z: -230 }, TWEEN.Easing.Cubic.InOut);
		Director.addTween(2, 1, Scene1.getCamera().position, { x: 100, y: 200, z: 180 }, TWEEN.Easing.Cubic.InOut);

		// Scene 2
		Director.addAction(3, function () { Scene2.play(); });
		Director.addTween(3, 1, Cube.getCube().rotation, { x: 0, y: -Math.PI / 2, z: 0 }, TWEEN.Easing.Cubic.InOut);
		Director.addAction(4, function () { Scene1.stop(); });
		
		// Scene 3
		Director.addAction(6, function () { Scene3.play(); });
		Director.addTween(6, 1, Cube.getCube().rotation, { x: 0, y: -Math.PI, z: 0 }, TWEEN.Easing.Cubic.InOut);
		Director.addAction(7, function () { Scene2.stop(); });

		Director.addTween(7, 2, Scene3.getCamera().position, { x: 0, y: 0, z: 10000 }, TWEEN.Easing.Cubic.InOut);
		Director.addTween(9, 2, Scene3.getCamera().position, { x: 2500, y: 0, z: 1000 }, TWEEN.Easing.Cubic.InOut);
		Director.addTween(9, 2, Scene3.getCamera().rotation, { x: 0, y: Math.PI / 2, z: 0 }, TWEEN.Easing.Cubic.InOut);

		// Scene 4
		Director.addAction(11, function () { Scene4.play(); });
		Director.addTween(11, 1, Cube.getCube().rotation, { x: 0, y: -Math.PI * 3 / 2, z: 0 }, TWEEN.Easing.Cubic.InOut);
		Director.addAction(12, function () { Scene3.stop(); });
		//Director.addTween(13, 1, Scene4.parameters, { cameraOffsetX: 200, cameraOffsetY: 0, cameraOffsetZ: 200 }, TWEEN.Easing.Cubic.InOut);

		// Scene 5
		Director.addAction(14, function () { Scene5.play(); });
		Director.addTween(14, 1, Cube.getCube().rotation, { x: Math.PI / 2, y: 0, z: 0 }, TWEEN.Easing.Cubic.InOut);
		Director.addTween(15, 1, Cube.getCamera().position, { x: 0, y: 0, z: 300 }, TWEEN.Easing.Cubic.InOut);
		Director.addAction(15, function () { Scene4.stop(); });

		// Scene 6
		Director.addAction(16, function () { Scene6.play(); });
		Director.addTween(16, 1, Cube.getCamera().position, { x: 0, y: 0, z: 400 }, TWEEN.Easing.Cubic.InOut);
		Director.addTween(16, 1, Cube.getCube().rotation, { x: -Math.PI / 2, y: 0, z: 0 }, TWEEN.Easing.Cubic.InOut);
		Director.addAction(17, function () { Scene5.stop(); });

		// Handle resize event
		window.addEventListener('resize', onResize, false);

		onResize();
		update();
	}

	function update() {
		requestAnimationFrame(update);
		//stats.update();
		events.emit("update");
	}


	function onDocumentDragOver(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		return false;
	}

	function onResize() {
		Cube.onResize();
	}

	function createTexture(image) {
		var texture = new THREE.Texture();
		texture = new THREE.Texture();
		texture.image = image;
		texture.needsUpdate = true;

		return texture;
	}

	return {
		load: load,
		init: init,
		audioParams: audioParams,
		screenParams: screenParams,
		images: images,
		audio: audio,
		models: models
	};

} ();

// Load resources after DOM is fully loaded
$(document).ready(function () {
	Main.load();
});