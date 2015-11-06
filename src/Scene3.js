Scene3 = function () {

	var run = true;
	var shaderTime = 0;
	var renderComposer;
	var camera;
	var scene;
	var particleSystem;
	var geometry;
	var particles = 500000;
	var maxDistance = 6000;
	var imageScale = 25;
	var numberOfAttempts = 2;
	var zSpread = 500;

	function init() {

		// Event handlers
		events.on("update", update);

		// Scene		
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(70, 800 / 600, 1, 15000);

		// Particles
		var particleShader = THREE.ParticleShader;
		
		var particleUniforms = THREE.UniformsUtils.clone(particleShader.uniforms);
		particleUniforms.texture.value = Main.images.particle;
		particleUniforms.fog.value = 1;

		var particleMaterial = new THREE.ShaderMaterial({

			uniforms: particleUniforms,
			vertexShader: particleShader.vertexShader,
			fragmentShader: particleShader.fragmentShader,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});

		geometry = new THREE.BufferGeometry();

		var positions = new Float32Array(particles * 3);
		var colors = new Float32Array(particles * 3);
		var sizes = new Float32Array(particles);

		var color = new THREE.Color();

		// Get particle positions based on non-black image pixels
		var imgData = getImgData(Main.images.dickbutt);

		for (var i = 0, i3 = 0; i < particles; i++ , i3 += 3) {

			var position = new THREE.Vector3(
				getRand(-maxDistance, maxDistance), 
				getRand(-maxDistance, maxDistance), 
				getRand(-maxDistance, maxDistance)
			);
			var gotIt = false;
		
			// Give up after x tries
			var tries = 0;
			while (gotIt == false && tries < numberOfAttempts) {
				
				tries++;
				
				// Randomly select a pixel
				var x = Math.round(imgData.width * Math.random());
				var y = Math.round(imgData.height * Math.random());
				var pixel = getPixel(imgData, x, y);
				
				// Read color from pixel
				if (pixel.r > 0) {
					// If not black, get position
					position = new THREE.Vector3(
						(imgData.width / 2 - x) * imageScale, 
						(y - imgData.height / 2) * imageScale, 
						Math.random() * zSpread * 2 - Math.random() * zSpread
					);
					gotIt = true;
				} else {
					// If black, try again
					gotIt = false;
				}
			}

			// Position
			positions[i3 + 0] = position.x;
			positions[i3 + 1] = position.y;
			positions[i3 + 2] = position.z;

			// Color
			color.setRGB(1, 1, 1);
			colors[i3 + 0] = color.r;
			colors[i3 + 1] = color.g;
			colors[i3 + 2] = color.b;
			
			// Size
			sizes[i] = 20;

		}

		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

		particleSystem = new THREE.Points(geometry, particleMaterial);

		scene.add(particleSystem);

		// Text
		var img = new THREE.MeshBasicMaterial({
			map: Main.images.textParticles,
			transparent: true,
			opacity: 1
		});

		// Text mesh
		var plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), img);
		plane.overdraw = true;
		plane.position.set(-75, 50, -150);
		scene.add(plane);

		// Render pass
		var renderPass = new THREE.RenderPass(scene, camera);

		// Film shader pass
		var filmPass = new THREE.ShaderPass(THREE.FilmShader);
		filmPass.uniforms["grayscale"].value = 0;
		filmPass.uniforms["sIntensity"].value = 0.2;
		filmPass.uniforms["sCount"].value = 1440;
		
		// Effect composer
		renderComposer = new THREE.EffectComposer(Cube.getRenderer(), Cube.getRenderTarget3());
		renderComposer.addPass(renderPass);
		renderComposer.addPass(filmPass);
	}

	// Get pixel from image
	function getPixel(imgData, x, y) {
		var r, g, b, a, offset = x * 4 + y * 4 * imgData.width;
		r = imgData.data[offset];
		g = imgData.data[offset + 1];
		b = imgData.data[offset + 2];
		a = imgData.data[offset + 3];
		var col = new THREE.Color(0xffffff);
		col.setRGB(r / 256, g / 256, b / 256);
		return col;
	}

	// Get image data
	function getImgData(image) {
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		canvas.width = image.width;
		canvas.height = image.height;
		context.drawImage(image, 0, 0);
		var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
		return imgData;
	}
	
	// Get random number in a range
	function getRand(minVal, maxVal) {
		return minVal + (Math.random() * (maxVal - minVal));
	}

	function update(t) {

		if (!run) { return; }

		shaderTime += 0.1;

		// Rotate particles
		particleSystem.rotation.x = -shaderTime * 0.0006;
		particleSystem.rotation.y = -shaderTime * 0.0008;
		particleSystem.rotation.z = Math.PI - shaderTime * 0.002;

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




