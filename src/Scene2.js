Scene2 = function () {

	var run = true;
	var shaderTime = 0;
	var light;
	var camera, occlusionCamera;
	var scene, occlusionScene
	var object, occlusionObject;
	var grPass;
	var renderComposer, finalcomposer, occlusionComposer;
	var screenW = 512;
	var screenH = 512;
	var blurriness = 2;
	var meshCount = 100;
	var tween;

	function init() {

		// Event handlers
		events.on("update", update);
		events.on("onBeat", onBeat);
		
		// Scene & object for holding all meshes
		object = new THREE.Object3D();
		scene = new THREE.Scene();
		scene.add(object);
		
		// Camera
		camera = new THREE.PerspectiveCamera(70, 800 / 600, 1, 3000);
		scene.add(camera);

		// Occlusion scene for volumetric light approximation (a.k.a. godrays)
		occlusionScene = new THREE.Scene();

		occlusionCamera = camera.clone();
		occlusionCamera.position = camera.position;

		occlusionObject = new THREE.Object3D();
		occlusionScene.add(occlusionObject);
		
		// Geometry & material for icosahedrons
		var geometry = new THREE.IcosahedronGeometry(1);
		var material = new THREE.MeshPhongMaterial({ color: 0x00ff33, specular: 0x555555, shininess: 5 });
		
		// Geometry & material for occlusion icosahedrons
		var occlusionGeometry = geometry.clone();
		var occlusionMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, map: null });

		// Sphere spiral of icosahedrons
		var phi = 0;
		for (var i = 0; i < meshCount; i++) {

			// Sphere spiral			
			var ss = 2.0 / Math.sqrt(meshCount / 2);
			var z = -1 + 2 * i / (meshCount - 1);
			var r = Math.sqrt(1 - z * z);
			phi = phi + (ss / r);
			if (i == 0 || i == (meshCount - 1)) {
				phi = 0;
			}
			var x = (Math.sin(phi) * r) * 1000;
			var y = (Math.cos(phi) * r) * 1000;
			z = z * 1000;

			// Random colors
			var color = new THREE.Color();
			color.setRGB(Math.random(), Math.random(), Math.random());
			material = new THREE.MeshPhongMaterial({ color: color, specular: 0x555555, shininess: 5 });

			// Mesh
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(x, y, z).normalize();
			mesh.position.multiplyScalar(150);
			mesh.scale.x = mesh.scale.y = mesh.scale.z = 25;
			mesh.castShadow = true;
			mesh.receiveShadow = true;

			object.add(mesh);
			
			// Occlusion
			var occlusionMesh = new THREE.Mesh(occlusionGeometry, occlusionMaterial);
			occlusionMesh.position.set(x, y, z).normalize();
			occlusionMesh.position.multiplyScalar(150);
			occlusionMesh.scale.x = occlusionMesh.scale.y = occlusionMesh.scale.z = 25;

			occlusionObject.add(occlusionMesh);
		}

		// Light sphere		
		var sphereMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, emissive: 0xffffff });
		var sphere = new THREE.Mesh(new THREE.SphereGeometry(40, 20, 20), sphereMaterial);
		object.add(sphere);

		// Floor
		var floorMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
		var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000.1, 1000.1), floorMaterial);
		floor.receiveShadow = true;
		floor.position.set(0, -250, 0);
		floor.scale.x = 2;
		floor.rotation.set(-Math.PI / 2, 0, 0);
		scene.add(floor);
		
		// Back wall
		var wallMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
		var wall = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000, 16, 16), wallMaterial);
		wall.receiveShadow = true;
		wall.position.set(0, 0, -1000);
		wall.rotation.set(0, 0, 0);
		scene.add(wall);

		// Lights
		light = new THREE.PointLight(0xffffff, 1, 0);
		scene.add(light);

		// Directional light for the shadows
		var directionalLight = new THREE.DirectionalLight(0xffffff, 0.01);
		directionalLight.castShadow = true;
		directionalLight.position.set(0, 200, 0);
		scene.add(directionalLight);
		
		// Common render target params
		var renderTargetParameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		};

		// Render target for occlusion
		var occlusionRenderTarget = new THREE.WebGLRenderTarget(screenW / 2, screenH / 2, renderTargetParameters);
 
		// Render passes
		var renderPass = new THREE.RenderPass(scene, camera);
		var occlusionRenderPass = new THREE.RenderPass(scene, camera);

		// Film shader pass
		var filmPass = new THREE.ShaderPass(THREE.FilmShader);
		filmPass.uniforms["grayscale"].value = 0;
		filmPass.uniforms["sIntensity"].value = 0.2;
		filmPass.uniforms["sCount"].value = 720;
		
		// Effect composer for basic rendering and film shader
		var renderTarget1 = new THREE.WebGLRenderTarget(screenW, screenH, renderTargetParameters);
		renderComposer = new THREE.EffectComposer(Cube.getRenderer(), renderTarget1);
		renderComposer.addPass(renderPass);
		renderComposer.addPass(filmPass);		



		// Simple blur shader passes
		var hblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
		var vblur = new THREE.ShaderPass(THREE.VerticalBlurShader);
		hblur.uniforms["h"].value = blurriness / screenW;
		vblur.uniforms["v"].value = blurriness / screenH;
		
		// Godray shader pass
		grPass = new THREE.ShaderPass(THREE.GodRaysShader);
		grPass.uniforms['fExposure'].value = 0.3;
		grPass.uniforms['fDecay'].value = 0.98;
		grPass.uniforms['fDensity'].value = 0.8;
		grPass.uniforms['fWeight'].value = 0.7;
		grPass.uniforms['fClamp'].value = 1.0;
		grPass.needsSwap = true;

		// Effect composer for godray
		occlusionComposer = new THREE.EffectComposer(Cube.getRenderer(), occlusionRenderTarget);
		occlusionComposer.addPass(occlusionRenderPass);
		occlusionComposer.addPass(hblur);
		occlusionComposer.addPass(vblur);
		occlusionComposer.addPass(hblur);
		occlusionComposer.addPass(vblur);
		occlusionComposer.addPass(grPass);


		// Blend godray and basic render pass
		var finalPass = new THREE.ShaderPass(THREE.AdditiveBlendShader);
		finalPass.uniforms['tBase'].value = renderTarget1;
		finalPass.uniforms['tAdd'].value = occlusionComposer.renderTarget1;
		finalPass.uniforms['amount'].value = 1;
		
		// Effect composer
		finalcomposer = new THREE.EffectComposer(Cube.getRenderer(), Cube.getRenderTarget2());
		finalcomposer.addPass(finalPass);
	}

	function onBeat() {

		if (!run) { return; }
		if (!Main.audioParams.beatDetection) return; 

		// Distort on beat
		tween = new TWEEN.Tween({ value: 1 })
            .to({ value: 0.6 }, 3000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
				grPass.uniforms['fDecay'].value = this.value;
				light.intensity = this.value;

            })
			.onComplete(function () {
				grPass.uniforms['fDecay'].value = 0.6;
				light.intensity = this.value;
			})
            .start();
	}

	function update(t) {

		if (!run) { return; }

		TWEEN.update(t);

		shaderTime += 0.1;

		// Rotate mesh groups
		object.rotation.x = shaderTime / 10;
		object.rotation.y = shaderTime / 20;

		occlusionObject.rotation.x = shaderTime / 10;
		occlusionObject.rotation.y = shaderTime / 20;

		// Scale effect
		object.scale.x = object.scale.y = object.scale.z =
		occlusionObject.scale.x = occlusionObject.scale.y = occlusionObject.scale.z =
		1 + 0.25 * Math.sin(shaderTime / 4);

		// Move
		object.position.x =
		occlusionObject.position.x =
		light.position.x =
		250 * Math.sin(shaderTime / 8);

		// Keep cameras in sync 
		occlusionCamera.position = camera.position;
		occlusionCamera.lookAt(occlusionScene.position);
		camera.lookAt(scene.position);

		// Light position is the center of godray effect 
		var lPos = THREE.Extras.Utils.projectOnScreen(light, camera);
		grPass.uniforms["fX"].value = lPos.x;
		grPass.uniforms["fY"].value = lPos.y;

		// Render
		renderComposer.render(0.1);
		occlusionComposer.render(0.1);
		finalcomposer.render(0.1);
	}

	return {
		init: init,
		update: update,
		getCamera: function () { return camera; },
		getOcclusionCamera: function () { return occlusionCamera; },
		getScene: function () { return scene; },
		play: function () { run = true; },
		stop: function () { run = false; }
	};
} ();