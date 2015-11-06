Scene5 = function () {

	var run = true;
	var shaderTime = 0;
	var renderComposer;
	var radius = 40;
	var particles;
	var sphere;
	var camera;
	var scene;
	var sphereUniforms, particleUniforms;
	var particleGeometry;

	function init() {

		// Event handlers
		events.on("update", update);

		// Scene
		scene = new THREE.Scene();

		// Camera
		camera = new THREE.PerspectiveCamera(50, 800 / 600, 1, 6000);
		
		// Particles
		var particleShader = THREE.WaveParticleShader;

		particleUniforms = THREE.UniformsUtils.clone(particleShader.uniforms);
		particleUniforms.texture.value = Main.images.particle2;

		var particleMaterial = new THREE.ShaderMaterial({

			uniforms: particleUniforms,
			vertexShader: particleShader.vertexShader,
			fragmentShader: particleShader.fragmentShader
		});

		particleGeometry = new THREE.BufferGeometry();

		var particleCount = 10000;

		var positionArray = [];
		var lngArray = [];
		var seedArray = [];
		var colorArray = [];

		var points = pointsOnSphere(particleCount);

		for (var i = 0; i < particleCount; i++) {

			var num = 20;

			var base = points[i];
			base.multiplyScalar(radius);
			var seed = Math.random();

			for (var j = 0; j < num; j++) {
				var vertex = new THREE.Vector3().copy(base);
				var lng = radius + (j * 0.25);
				var color = new THREE.Color(0xffffff);
				color = THREE.ColorConverter.setHSV(color, i / 7000 + 0.8, 1.4 - (j / num), (j / num) + 0.2);

				vertex.setLength(lng);
				positionArray.push(vertex);
				colorArray.push(color);
				lngArray.push(lng);
				seedArray.push(seed);
			}
		}

		var positionArray2 = new Float32Array(positionArray.length * 3);
		var lngArray2 = new Float32Array(lngArray.length);
		var seedArray2 = new Float32Array(seedArray.length);
		var colorArray2 = new Float32Array(colorArray.length * 3);

		for (var i = 0; i < lngArray.length; i++) {
			lngArray2[i] = lngArray[i];
			seedArray2[i] = seedArray[i];
		}

		for (var i = 0; i < positionArray.length; i = i + 3) {
			positionArray2[i + 0] = positionArray[i].x;
			positionArray2[i + 1] = positionArray[i].y;
			positionArray2[i + 2] = positionArray[i].z;

			colorArray2[i + 0] = colorArray[i].r;
			colorArray2[i + 1] = colorArray[i].g;
			colorArray2[i + 2] = colorArray[i].b;
		}

		particleGeometry.addAttribute('position', new THREE.BufferAttribute(positionArray2, 3));
		particleGeometry.addAttribute('lng', new THREE.BufferAttribute(lngArray2, 1));
		particleGeometry.addAttribute('seed', new THREE.BufferAttribute(seedArray2, 1));
		particleGeometry.addAttribute('customColor', new THREE.BufferAttribute(colorArray2, 3));

		particles = new THREE.Points(particleGeometry, particleMaterial);

		scene.add(particles);		
		
		// Wave ball
		var sphereShader = THREE.WaveShader;

		sphereUniforms = THREE.UniformsUtils.clone(sphereShader.uniforms);

		var sphereMaterial = new THREE.ShaderMaterial({

			uniforms: sphereUniforms,
			vertexShader: sphereShader.vertexShader,
			fragmentShader: sphereShader.fragmentShader

		});

		var sphereGeometry = new THREE.IcosahedronGeometry(radius, 4);
		sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

		scene.add(sphere);
		
		// Render pass
		var renderPass = new THREE.RenderPass(scene, camera);

		// Film pass
		var filmPass = new THREE.ShaderPass(THREE.FilmShader);
		filmPass.uniforms["grayscale"].value = 0;
		filmPass.uniforms["sIntensity"].value = 0.2;
		filmPass.uniforms["sCount"].value = 1440;
		
		// Effect composer
		renderComposer = new THREE.EffectComposer(Cube.getRenderer(), Cube.getRenderTarget5());
		renderComposer.addPass(renderPass);
		renderComposer.addPass(filmPass);
	}

	function pointsOnSphere(n) {

		var upts = new Array();
		var inc = Math.PI * (3 - Math.sqrt(5));
		var off = 2.0 / n;
		var x, y, z;
		var r;
		var phi;

		for (var k = 0; k < n; k++) {
			y = k * off - 1 + (off / 2);
			r = Math.sqrt(1 - y * y);
			phi = k * inc;
			x = Math.cos(phi) * r;
			z = Math.sin(phi) * r;

			upts.push(new THREE.Vector3(x, y, z));

		}

		return upts;
	}

	function update(t) {

		if (!run) { return; }

		shaderTime += 0.1;

		// Wave ball
		sphereUniforms.time.value = particleUniforms.time.value = shaderTime;
		
		// Render
		renderComposer.render();
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




