Scene6 = function () {

	var run = true;
	var shaderTime = 0;
	var renderComposer;
	var camera
	var scene;
	var lookAt = new THREE.Vector3(0, 0, 0);
	var statue;
	var geometry;

	function init() {

		// Event handlers
		events.on("update", update);

		// Scene		
		scene = new THREE.Scene();
		
		// Camera
		camera = new THREE.PerspectiveCamera(70, 800 / 600, 1, 30000);

		// Lights
		var light1 = new THREE.DirectionalLight(0xffffff, 2.0);
		light1.position.set(0, 1, 0);
		scene.add(light1);

		var light2 = new THREE.DirectionalLight(0xffffff, 0.25);
		light2.position.set(-100, -100, 0);
		scene.add(light2);

		var light3 = new THREE.DirectionalLight(0xffffff, 0.25);
		light3.position.set(100, -100, 0);
		scene.add(light3);

		// Statue
		var statueMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x555555, shininess: 1, shading: THREE.SmoothShading });

		statue = Main.models.statue;
		statue.scale.x = statue.scale.y = statue.scale.z = 0.1;
		statue.rotation.set(0, -0.5, 0);
		statue.position.set(-0.5, 0, 80);
		statue.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = statueMaterial;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		
		scene.add(statue);

		// Background sphere
		var sphereGeometry = new THREE.SphereBufferGeometry(20000, 40, 40);
		var sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, specular: 0x888888, emissive: 0x888888, side: THREE.BackSide });
		var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
		scene.add(sphere);  		
		
		// Render pass
		var renderPass = new THREE.RenderPass(scene, camera);
		
		// Film pass
		var filmPass = new THREE.ShaderPass(THREE.FilmShader);
		filmPass.uniforms["grayscale"].value = 0;
		filmPass.uniforms["sIntensity"].value = 0.2;
		filmPass.uniforms["sCount"].value = 1440;
		
		// Effect composer
		renderComposer = new THREE.EffectComposer(Cube.getRenderer(), Cube.getRenderTarget6());
		renderComposer.addPass(renderPass);
		renderComposer.addPass(filmPass);
	}

	function update(t) {

		if (!run) { return; }

		shaderTime += 0.1;
		
		// Camera
		camera.position.x = statue.position.x + 20 * Math.cos(shaderTime / 20);
		camera.position.z = statue.position.z + 20 * Math.sin(shaderTime / 20);
		camera.position.y = 10;
		statue.position.copy(lookAt);
		lookAt.y = 25;
		camera.lookAt(lookAt);

		// Statue
		statue.position.y = (Math.sin(0.00025 + shaderTime / 5)) / 10 + 10;
		statue.rotation.z = (Math.sin(0.00025 + shaderTime / 10)) / 20;
		statue.rotation.x = (Math.sin(0.00025 + shaderTime / 10)) / 20;

		// Render
		renderComposer.render(0.1);
	}

	return {
		init: init,
		update: update,
		getCamera: function () { return camera; },
		getScene: function () { return scene; },
		play: function () { run = true; },
		stop: function () { run = false; }
	};
} ();






