Scene1 = function () {

	var run = true;
	var shaderTime = 0;
	var duck
	var duckPivot;
	var cubeCamera;
	var effectComposer;
	var camera;
	var scene;
	var donutsObject;
	var donuts = [];
	var bars = [];

	function init() {

		// Event handlers
		events.on("update", update);
		
		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(70, 800 / 600, 1, 3000);
		scene.add(camera);
		
		// Donut object for holding all donut meshes
		donutsObject = new THREE.Object3D();
		donutsObject.position.set(0, 0, 0);
		donutsObject.rotation.set(0, 0, -1);
		scene.add(donutsObject);

		// Geometry and material for donuts
		var donutGeometry = new THREE.TorusGeometry(10, 5, 16, 16);
		var donutMaterial = new THREE.MeshPhongMaterial({ color: 0x771111, specular: 0x555555, shininess: 30 });
		
		// Create donuts
		for (var i = 0; i < 80; i++) {

			var donutMesh = new THREE.Mesh(donutGeometry, donutMaterial);

			// First circle
			if (i < 40) {
				donutMesh.position.y = Math.random() * 20;
				donutMesh.position.x = 225 * Math.cos(i);
				donutMesh.position.z = 225 * Math.sin(i);
			}
			// Second circle
			else {
				donutMesh.position.x = Math.random() * 20;
				donutMesh.position.y = 225 * Math.cos(i);
				donutMesh.position.z = 225 * Math.sin(i);
			}

			// Rotate and scale
			donutMesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			donutMesh.scale.x = donutMesh.scale.y = donutMesh.scale.z = 0.5 + Math.random();

			// Shadows
			donutMesh.castShadow = true;
			donutMesh.receiveShadow = true;

			donutsObject.add(donutMesh);
			donuts.push(donutMesh);
		}

		// Raster bars
		for (var i = 0; i < 10; i++) {

			var size = 512;
			var width = 512;
			var height = 512;
			var canvas = document.createElement("canvas");
			var context = canvas.getContext("2d");
			canvas.width = width;
			canvas.height = height;
			context.rect(0, 0, size, size);
			var gradient = context.createLinearGradient(0, 0, 0, size);
			var multiplier = 0.5;
			var color = makeGradient(i * multiplier, i * multiplier, i * multiplier, 0, 2, 4);
			gradient.addColorStop(0.0, '#000000');
			gradient.addColorStop(0.5, color);
			gradient.addColorStop(1.0, '#000000');

			// Gradient
			context.fillStyle = gradient;
			context.fill();
			var texture = new THREE.Texture(canvas);
			texture.needsUpdate = true;
			var rasterBarMaterial = new THREE.MeshBasicMaterial({ map: texture });
			var rasterBarGeometry = new THREE.PlaneGeometry(1000, 50);

			var bar = new THREE.Mesh(rasterBarGeometry, rasterBarMaterial);
			bar.position.set(0, 0, -500 + i * 0.5);
			bar.rotation.set(0, 0, 0);

			var bar2 = bar.clone();
			bar2.position.set(-500 + i * 0.5, 0, 0);
			bar2.rotation.set(0, Math.PI / 2, 0);

			var bar3 = bar.clone();
			bar3.position.set(500 - i * 0.5, 0, 0);
			bar3.rotation.set(0, -Math.PI / 2, 0);

			var bar4 = bar.clone();
			bar4.position.set(0, 0, 500 - i * 0.5);
			bar4.rotation.set(0, Math.PI, 0);

			var barObject = new THREE.Object3D();
			barObject.add(bar);
			barObject.add(bar2);
			barObject.add(bar3);
			barObject.add(bar4);

			scene.add(barObject);
			bars.push(barObject);
		}

		// Cube camera for reflective material
		cubeCamera = new THREE.CubeCamera(1, 100000, 1024);
		scene.add(cubeCamera);

		// Duck
		var reflectiveMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: cubeCamera.renderTarget });
		duck = Main.models.duck;
		duck.scale.x = duck.scale.y = duck.scale.z = 100;
		duck.position.set(0, -125, 0);
		duck.rotation.set(0, 0, 0);
		duck.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = reflectiveMaterial;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(duck);
		
		// Duck pivot point
		duckPivot = new THREE.Object3D();
		duck.add(duckPivot);

		// Lights
		var light1 = new THREE.DirectionalLight(0x7a9ab7, 4);
		light1.position.set(0, 240, 0);
		light1.castShadow = true;
		light1.shadowDarkness = 0.25;
		light1.shadowMapWidth = 512;
		light1.shadowMapHeight = 512;
		scene.add(light1);

		var light2 = new THREE.DirectionalLight(0x455462, 2);
		light2.position.set(0, -240, 0);
		scene.add(light2);		

		// Floor
		var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x455462 });
		var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000.1, 1000.1), floorMaterial);
		floor.receiveShadow = true;
		floor.position.set(0, -250, 0);
		floor.rotation.set(-Math.PI / 2, 0, 0);
		scene.add(floor);

		// Ceiling
		var ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0x7a9ab7 });
		var ceiling = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000.1, 1000.1), ceilingMaterial);
		ceiling.receiveShadow = true;
		ceiling.position.set(0, 250, 0);
		ceiling.rotation.set(Math.PI / 2, 0, 0);
		scene.add(ceiling);

		// Render target parameters
		var renderTargetParameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: true
		};
		
		// Render pass
		var renderPass = new THREE.RenderPass(scene, camera);
		renderPass.clear = true;
		
		// C64 shader pass
		var C64effect = new THREE.ShaderPass(THREE.C64Shader);
		
		// Dither shader pass
		var ditherEffect = new THREE.ShaderPass(THREE.DitherShader);
		
		// Pixelate shader pass
		var pixelateEffect = new THREE.ShaderPass(THREE.PixelateShader);
		pixelateEffect.uniforms['size'].value.x = 1024;
		pixelateEffect.uniforms['size'].value.y = 1024;
		pixelateEffect.uniforms['pixelSize'].value = 128;		

		// Film shader pass
		var filmEffect = new THREE.ShaderPass(THREE.FilmShader);
		filmEffect.uniforms["grayscale"].value = 0;
		filmEffect.uniforms["sIntensity"].value = 0.2;
		filmEffect.uniforms["sCount"].value = 1440;

		// Effect composer
		effectComposer = new THREE.EffectComposer(Cube.getRenderer(), Cube.getRenderTarget1()); // Render to texture
		effectComposer.addPass(renderPass);
		effectComposer.addPass(pixelateEffect);
		effectComposer.addPass(ditherEffect);
		effectComposer.addPass(C64effect);
		effectComposer.addPass(filmEffect);
	}

	function makeGradient(frequency1, frequency2, frequency3,
		phase1, phase2, phase3,
		center, width) {
		if (center == undefined) center = 128;
		if (width == undefined) width = 127;

		var red = Math.sin(frequency1 + phase1) * width + center;
		var grn = Math.sin(frequency2 + phase2) * width + center;
		var blu = Math.sin(frequency3 + phase3) * width + center;

		return RGB2Color(red, grn, blu);
	}

	function RGB2Color(r, g, b) {
		return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
	}

	function byte2Hex(n) {
		var nybHexString = "0123456789ABCDEF";
		return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
	}

	function update(t) {

		if (!run) { return; }

		shaderTime += 0.1;

		// Always look at the duck
		camera.lookAt(duckPivot.position);
		
		// Rotate donut group/object
		donutsObject.rotation.y -= 0.003;
		donutsObject.rotation.x -= 0.003;

		// Rotate individual donuts
		for (var i = 0; i < donuts.length; i++) {
			var donut = donuts[i];
			donut.rotation.x += 0.005;
			donut.rotation.y += 0.004;
			donut.rotation.z += 0.003;
		}		

		// Move raster bars
		for (var i = 0; i < bars.length; i++) {
			var bar = bars[i];
			bar.position.y = 225 * Math.sin(shaderTime / 5 - i * 25);
		}

		// Render cube map
		duck.visible = false;
		cubeCamera.position.copy(duckPivot.position);
		cubeCamera.updateCubeMap(Cube.getRenderer(), scene);
		duck.visible = true;

		// Render
		effectComposer.render();
	}

	return {
		init: init,
		update: update,
		getCamera: function () { return camera; },
		getScene: function () { return scene; },
		play: function () { Cube.getRenderer().autoClear = true; run = true; },
		stop: function () { Cube.getRenderer().autoClear = false; run = false; }
	};
} ();