Scene4 = function () {

	var run = true;
	var shaderTime = 0;
	var renderComposer, glowComposer, finalComposer;
	var camera;
	var scene;
	var cameraTarget;
	var water;
	var text;
	var plasmaShader;
	var plasmaUniforms;
	var plasmaBall;
	var ribbonTarget;
	var r = 0;
	var position = new THREE.Vector3(0,0,0);
	var vectors;
	var ribbons;
	var delta
			
	function init() {

		// Event handlers
		events.on("update", update);

		// Scene
		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x667799, 1, 750);
		
		// Camera
		camera = new THREE.PerspectiveCamera(50, 800 / 600, 1, 60000);
		
		// Light
		var light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(-0.5, 0.7, -0.75);
		scene.add(light);

		// Camera target
		cameraTarget = new THREE.Object3D();
		cameraTarget.position.set(0, -75 / 2, 0);
		scene.add(cameraTarget);

		// Text
		var textGeometry = new THREE.TextGeometry(
			"Greetings to everyone at Cube Party 2015! :)", {
				size: 20,
				height: 1,
				curveSegments: 8,
				font: "Archive"
			}
		);

		var textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });

		text = new THREE.Mesh(textGeometry, textMaterial);
		text.position.set(200, -30, 700);
		scene.add(text);		

		// Plasma shader
		plasmaShader = THREE.PlasmaShader;

		plasmaUniforms = THREE.UniformsUtils.clone(plasmaShader.uniforms);
		plasmaUniforms.texture.value = Main.images.explosion;

		// Plasma material		
		var plasmaMaterial = new THREE.ShaderMaterial({
			uniforms: plasmaUniforms,
			vertexShader: plasmaShader.vertexShader,
			fragmentShader: plasmaShader.fragmentShader
		});

		// Plasma ball
		plasmaBall = new THREE.Mesh(new THREE.IcosahedronGeometry(120, 4), plasmaMaterial);
		plasmaBall.position.set(0, 50, -100);
		scene.add(plasmaBall);

		// Ribbons
		vectors = new Vectors( 500, 1, null );

		var ribbonMaterials = [
			new THREE.MeshBasicMaterial( { color:0xFFFFFF, fog: false } )
		];

		ribbons = new Ribbons(5, vectors.array, scene, ribbonMaterials);

		ribbons.settings.ribbonPulseMultiplier_1 = 5;
		ribbons.settings.ribbonPulseMultiplier_2 = 5;
		ribbons.settings.ribbonMin = 0.5;
		ribbons.settings.ribbonMax = 3;
							
		// Object for ribbons to follow
		ribbonTarget = new THREE.Object3D();
		ribbonTarget.position.z = 16000;							
							
		// Sky		
		var skyGeometry = new THREE.SphereBufferGeometry(5000, 60, 40);

		var skyShader = THREE.SkyShader;
		var skyUniforms = THREE.UniformsUtils.clone(skyShader.uniforms);
		skyUniforms.texture.value = Main.images.sky;

		var skyMaterial = new THREE.ShaderMaterial({
			side: THREE.FrontSide,
			uniforms: skyUniforms,
			vertexShader: skyShader.vertexShader,
			fragmentShader: skyShader.fragmentShader
		});

		var sky = new THREE.Mesh(skyGeometry, skyMaterial);
		sky.scale.set(-1, 1, 1);
		sky.rotation.order = 'XZY';
		sky.renderOrder = 1000.0;
		scene.add(sky);  		
		
		// Water		
		var waterNormals = Main.images.water;
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 		
		
		water = new THREE.Water(Cube.getRenderer(), camera, scene, {
			textureWidth: 256,
			textureHeight: 256,
			waterNormals: waterNormals,
			alpha: 1.0,
			sunDirection: light.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			betaVersion: 0,
			side: THREE.FrontSide
		});
		
		var waterMesh = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(5000, 5000, 10, 10),
			water.material
			);
		waterMesh.add(water);
		waterMesh.rotation.x = - Math.PI * 0.5;
		waterMesh.position.y = -35;
		scene.add(waterMesh);

		// Common render target params
		var renderTargetParameters = { 
			minFilter: THREE.LinearFilter, 
			magFilter: THREE.LinearFilter, 
			format: THREE.RGBFormat, 
			stencilBuffer: true 
		};
				
		// Render pass
		var clearMask = new THREE.ClearMaskPass();
		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
		var renderPass = new THREE.RenderPass(scene, camera);

		// Render composer
		var renderTarget1 = new THREE.WebGLRenderTarget( 1024, 1024, renderTargetParameters );
		renderComposer = new THREE.EffectComposer( Cube.getRenderer(), renderTarget1 );
		renderComposer.addPass( renderPass );
		renderComposer.addPass( clearMask );
		renderComposer.addPass( copyPass );
		
		// Glow composer
		var hblurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );
		var vblurPass = new THREE.ShaderPass( THREE.VerticalBlurShader );
		hblurPass.uniforms[ 'h' ].value = 3 / 1024;
		vblurPass.uniforms[ 'v' ].value = 3 / 1024;
		var renderTarget2 = new THREE.WebGLRenderTarget( 256, 256, renderTargetParameters );
		glowComposer = new THREE.EffectComposer( Cube.getRenderer(), renderTarget2);
		glowComposer.addPass( renderPass );
		glowComposer.addPass( hblurPass );
		glowComposer.addPass( vblurPass );
		glowComposer.addPass( hblurPass );
		glowComposer.addPass( vblurPass );

		// Blend 1st end 2nd passes using additive blend shader
		var blendPass = new THREE.ShaderPass( THREE.AdditiveBlendShader );
		blendPass.uniforms[ 'tBase' ].value = renderTarget1;
		blendPass.uniforms[ 'tAdd' ].value = renderTarget2;
		blendPass.uniforms[ 'amount' ].value = 0.3;

		// Film shader pass
		var filmPass = new THREE.ShaderPass(THREE.FilmShader);
		filmPass.uniforms["grayscale"].value = 0;
		filmPass.uniforms["sIntensity"].value = 0.2;
		filmPass.uniforms["sCount"].value = 720;
		
		// Effect composer
		finalComposer = new THREE.EffectComposer(Cube.getRenderer(), Cube.getRenderTarget4());
		finalComposer.addPass(blendPass);
		finalComposer.addPass( clearMask );
		finalComposer.addPass( copyPass );
		finalComposer.addPass(filmPass);
	}

	function update(t) {

		if (!run) { return; }

		shaderTime += 0.1;

		// Move text
		text.position.x -= 0.5;
		
		// Camera		
		cameraTarget.position.x = plasmaBall.position.x + Math.cos(shaderTime / 32) * 25;
		cameraTarget.position.y = plasmaBall.position.y + Math.sin(shaderTime / 32) * 50;
		camera.lookAt(cameraTarget.position);

		camera.rotation.x = 0.025 * Math.cos(shaderTime / 8);
		camera.rotation.z = 0.025 * Math.sin(shaderTime / 8);

		// Ribbons
		delta = 20;
		r += delta/1500;
		ribbonTarget.position.z = 300*Math.sin(r*3);
		ribbonTarget.position.x = 300*Math.cos(r*3);
		ribbonTarget.position.y = 30*Math.cos(r*15) + 50;
				
		vectors.update(ribbonTarget.position, delta);
		ribbons.update(position, delta);
		
		// Water
		water.material.uniforms.time.value += 1.0 / 60.0;
		water.render();

		// Plasma shader
		plasmaUniforms.time.value = shaderTime * 0.01;

		// Render
		renderComposer.render(0.1);
		glowComposer.render(0.1);
		finalComposer.render(0.1);
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
