THREE.WaveShader = {

	uniforms: {

		"time": 	{ type: "f", value: 0.0 },
		"color":    { type: "c", value: new THREE.Color( 0x000000 ) },
		"strength": { type: "f", value: 20.0 }
		
	},

	vertexShader: [

		"uniform float time;",
		"uniform float strength;",

		"const vec3 axisx = vec3(1.0, 0.0, 0.0);",
		"const vec3 axisy = vec3(0.0, 1.0, 0.0);",
		"const vec3 axisz = vec3(0.0, 0.0, 1.0);",

		"const vec3 center = vec3(0.0, 0.0, 0.0);",

		"void main() {",

			"vec3 directionVec = normalize(position);",

			"float xangle = dot(axisx, directionVec) * 2.5;",
			"float yangle = dot(axisy, directionVec) * 3.0;",
			"float zangle = dot(axisz, directionVec) * 3.5;",
			"vec3 animated = position;",

			"float time = time*0.15;",

			"float cosx = cos(time + xangle);",
			"float sinx = sin(time + xangle);",
			"float cosy = cos(time + yangle);",
			"float siny = sin(time + yangle);",
			"float cosz = cos(time + zangle);",
			"float sinz = sin(time + zangle);",

			"animated.x += directionVec.x * cosx * siny * cosz * strength;",
			"animated.y += directionVec.y * sinx * cosy * sinz * strength;",
			"animated.z += directionVec.z * sinx * cosy * cosz * strength;",

			"vec4 mvPosition = modelViewMatrix * vec4( animated, 1.0 );",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",

		"void main() {",

			"gl_FragColor = vec4( color, 1.0 );",
			
		"}"

	].join("\n")

};
