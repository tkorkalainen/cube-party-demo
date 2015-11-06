THREE.SkyShader = {

	uniforms: {

		"texture": { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",
		
		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D texture;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sample = texture2D(texture, vUv);",
			"gl_FragColor = vec4(sample.xyz, sample.w);",

		"}"

	].join("\n")

};

