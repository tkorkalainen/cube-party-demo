THREE.ParticleShader = {

	uniforms: {

		"color":     { type: "c", value: new THREE.Color( 0xffffff ) },
		"texture":   { type: "t", value: null },
		"fog": 		 { type: "f", value: 0.0 }

	},

	vertexShader: [

		"attribute float size;",
		"attribute vec3 customColor;",

		"varying vec3 vColor;",

		"void main() {",

			"vColor = customColor;",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",

			"gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D texture;",
		"uniform float fog;",

		"varying vec3 vColor;",

		"void main() {",

			"float fogFactor = fog;",

			"if (fogFactor == 0.0) {",
				"float depth = gl_FragCoord.z / gl_FragCoord.w;",
				"fogFactor = smoothstep( 200.0, 100.0, depth );",
			"}",
		
			"gl_FragColor = vec4( (color * vColor) * fogFactor, 1.0 );",
			"gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",

		"}"

	].join("\n")

};