Cube = function () {

	var renderer;
	var composer;
	var renderTarget1, renderTarget2, renderTarget3, renderTarget4, renderTarget5, renderTarget6;
	var cube;
	var scene;
	var camera;
	var object;
	var cubeGeometry, planeCubeParty;

	var fishEyeParameters = {
		horizontalFOV: 140,
		strength: 0.5,
		cylindricalRatio: 2
	};

	function init() {

		// Event handlers
		events.on("update", update);
		
		// Create screen renderer
		renderer = new THREE.WebGLRenderer({ antialias: Main.screenParams.antiAlias, preserveDrawingBuffer: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000);
		renderer.sortObjects = false;
		renderer.autoClear = true;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		$('#canvas').append(renderer.domElement);
		
		// Camera
		camera = new THREE.PerspectiveCamera(50, 800 / 600, 1, 3000);
		
		// Scene
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x000000, 1, 2000);
		scene.add(camera);		

		// Object
		object = new THREE.Object3D();
		object.visible = false;
		scene.add(object);

		// Render to material using own render target. One render target per cube side.
		renderTarget1 = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
		var material1 = new THREE.MeshPhongMaterial({ map: renderTarget1 });

		renderTarget2 = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
		var material2 = new THREE.MeshPhongMaterial({ map: renderTarget2 });

		renderTarget3 = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
		var material3 = new THREE.MeshPhongMaterial({ map: renderTarget3 });

		renderTarget4 = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
		var material4 = new THREE.MeshPhongMaterial({ map: renderTarget4 });

		renderTarget5 = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
		var material5 = new THREE.MeshPhongMaterial({ map: renderTarget5 });

		renderTarget6 = new THREE.WebGLRenderTarget(1024, 1024, { format: THREE.RGBFormat });
		var material6 = new THREE.MeshPhongMaterial({ map: renderTarget6 });

		// Cube	materials
		var materials = [];
		materials.push(material2); // Right side
		materials.push(material4); // Left side
		materials.push(material5); // Top side
		materials.push(material6); // Bottom side
		materials.push(material1); // Front side
		materials.push(material3); // Back side

		// Cube
		cubeGeometry = new THREE.BoxGeometry(550, 350, 550, 1, 1, 1);
		cube = new THREE.Mesh(
			cubeGeometry,
			new THREE.MeshFaceMaterial(materials)
		);
		cube.receiceShadow = true;
		cube.castShadow = true;
		object.add(cube);

		// Lights
		object.add(new THREE.AmbientLight(0x222222));
		var light1 = new THREE.DirectionalLight(0xffffff);
		var light2 = new THREE.DirectionalLight(0xffffff);
		var light3 = new THREE.DirectionalLight(0xffffff);
		var light4 = new THREE.DirectionalLight(0xffffff);
		var light5 = new THREE.DirectionalLight(0xffffff);
		light1.position.set(1, 50, 100);
		light2.position.set(1, 50, -100);
		light3.position.set(100, 50, 1);
		light4.position.set(-100, 50, 1);
		light5.position.set(1, -100, 50);
		object.add(light1);
		object.add(light2);
		object.add(light3);
		object.add(light4);
		object.add(light5);
		
		// Spot light
		var spotLight = new THREE.SpotLight(0xffcc88, 5, 500);
		spotLight.position.set(0.0001, 1000, 0.0001);
		spotLight.target = cube;
		spotLight.shadowCameraFov = 60;
		spotLight.castShadow = true;
		spotLight.shadowDarkness = 0.5;
		spotLight.shadowCameraVisible = false;
		spotLight.shadowMapWidth = 1024;
		spotLight.shadowMapHeight = 1024;
		object.add(spotLight);		
				
		// Walls
		var house = new THREE.Mesh(
			new THREE.BoxGeometry(540 * 3, 300 * 3, 540 * 3, 1, 1, 1),
			new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.BackSide })
			);
		house.receiveShadow = true;
		object.add(house);
		
		// Texts
		var cubePartyImage = new THREE.MeshBasicMaterial({ map: Main.images.cubeParty, transparent: true, opacity: 1 });
		planeCubeParty = new THREE.Mesh(new THREE.PlaneGeometry(128, 128), cubePartyImage);
		planeCubeParty.overdraw = true;
		planeCubeParty.position.set(0, 0, 550 / 2);
		planeCubeParty.rotation.set(0, 0, 0);
		scene.add(planeCubeParty);
		
		var creditsTomiImage = new THREE.MeshBasicMaterial({ map: Main.images.creditsTomi, transparent: true, opacity: 1 });
		var planeCreditsTomi = new THREE.Mesh(new THREE.PlaneGeometry(128, 128), creditsTomiImage);
		planeCreditsTomi.overdraw = true;
		planeCreditsTomi.position.set(-550 / 2 - 64, -350 / 2, 0);
		planeCreditsTomi.rotation.set(Math.PI / 2, 0, 0);
		object.add(planeCreditsTomi);

		var creditsModelsImage = new THREE.MeshBasicMaterial({ map: Main.images.creditsModels, transparent: true, opacity: 1 });
		var planeCreditsModels = new THREE.Mesh(new THREE.PlaneGeometry(128, 128), creditsModelsImage);
		planeCreditsModels.overdraw = true;
		planeCreditsModels.position.set(550 / 2 + 64, -350 / 2, 0);
		planeCreditsModels.rotation.set(Math.PI / 2, 0, 0);
		object.add(planeCreditsModels);
		
		
		// Effects manager
		composer = new THREE.EffectComposer(renderer);
		composer.addPass(new THREE.RenderPass(scene, camera));

		// Fisheye
		var fishEye = new THREE.ShaderPass(THREE.FishEyeShader);
		composer.addPass(fishEye);
		fishEye.renderToScreen = true;

		var height = Math.tan(THREE.Math.degToRad(fishEyeParameters.horizontalFOV) / 2) / camera.aspect;

		camera.fov = Math.atan(height) * 2 * 180 / 3.1415926535;
		camera.updateProjectionMatrix();

		fishEye.uniforms["strength"].value = fishEyeParameters.strength;
		fishEye.uniforms["height"].value = height;
		fishEye.uniforms["aspectRatio"].value = camera.aspect;
		fishEye.uniforms["cylindricalRatio"].value = fishEyeParameters.cylindricalRatio;
	}

	function onResize() {

		$('#canvas').css({ top: 0 });

		// Use fixed aspect ratio
		camera.aspect = Main.screenParams.aspectRatio;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	
	function update(t) {

		camera.lookAt(cube.position);

		composer.render();
	}

	return {
		init: init,
		update: update,
		onResize: onResize,
		getRenderer: function () { return renderer; },
		getCamera: function () { return camera; },
		getScene: function () { return scene; },
		getCube: function () { return object; },
		getLabel: function () { return planeCubeParty; },
		getRenderTarget1: function () { return renderTarget1; },
		getRenderTarget2: function () { return renderTarget2; },
		getRenderTarget3: function () { return renderTarget3; },
		getRenderTarget4: function () { return renderTarget4; },
		getRenderTarget5: function () { return renderTarget5; },
		getRenderTarget6: function () { return renderTarget6; }
	};
} ();
