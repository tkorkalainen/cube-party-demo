THREE.WaveParticleShader = {

	uniforms: {

		"time": 	{ type: "f", value: 0.0 },
		"color":    { type: "c", value: new THREE.Color( 0xffffff ) },
		"texture":  { type: "t", value: null },
		"strength": { type: "f", value: 20.0 }

	},

	vertexShader: [

		"attribute float size;",
		"attribute float lng;",
		"attribute float seed;",
		"attribute vec3 customColor;",
		
		"uniform float time;",
		"uniform float strength;",

		"varying vec3 vColor;",

		"const vec3 axisx = vec3(1.0, 0.0, 0.0);",
		"const vec3 axisy = vec3(0.0, 1.0, 0.0);",
		"const vec3 axisz = vec3(0.0, 0.0, 1.0);",

		"const vec3 center = vec3(0.0, 0.0, 0.0);",


		"void main() {",

			"vColor = customColor;",

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

			"float localTime = (lng*0.75 + time + seed*2.0)*0.3 + seed;",

			"vec3 mov = vec3( sin(localTime+sinx), -cos(localTime*seed+siny), cos(localTime+sinz) );",

			"if (seed < 0.5) {",
				"mov *= -1.0;",
			"}",
			"animated += mov*(lng-40.0)*0.35;",

			"vec4 mvPosition = modelViewMatrix * vec4( animated, 1.0 );",
			"float s = 2.0 + (lng-40.0)*0.6;",
			
			"gl_PointSize = s * ( 500.0 / length( mvPosition.xyz ) );",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D texture;",
		"varying vec3 vColor;",

		"void main() {",

			"float depth = gl_FragCoord.z / gl_FragCoord.w;",
			"float fogFactor = smoothstep( 250.0, 0.0, depth );",

			"vec4 outColor = texture2D( texture, gl_PointCoord );",
			"if ( outColor.a < 0.2 ) discard;",

			"gl_FragColor = vec4( (color * vColor) * fogFactor, 1.0 );",
			
		"}"

	].join("\n")

};
