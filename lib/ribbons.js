var Vectors = function ( length, divider, startPos ) {
	
	var that = this;

	that.array = [];
	var i;

	that.initSettings = {
		length : length || 50
	}

	that.settings = {
		divider : divider || 4,
		absoluteTrail : false,
		startPosition : startPos || new THREE.Vector3(0,0,16000)
	}	

	// vectors
	for ( i = 0; i < that.initSettings.length; ++i ) {

		var position = new THREE.Vector3(0,0,0);
		position.copy(that.settings.startPosition);

		var obj = { position: position, lastposition: new THREE.Vector3(0,0,0), normal: new THREE.Vector3(0,1,0), scale: 1 };
		that.array.push(obj);

	}

	this.update = function (position, delta) {

		var optimalDivider = delta/16;

		for (i=0; i < that.initSettings.length; ++i ) {
			var obj = that.array[i];

			if (i == 0) {
				
				var tox = position.x;
				var toy = position.y;
				var toz = position.z;

			} else {
				
				var tox = that.array[i-1].lastposition.x;
				var toy = that.array[i-1].lastposition.y;
				var toz = that.array[i-1].lastposition.z;

			}

			that.array[i].lastposition.x = obj.position.x;
			that.array[i].lastposition.y = obj.position.y;
			that.array[i].lastposition.z = obj.position.z;

			if (that.settings.absoluteTrail) {

				obj.position.x = tox;
				obj.position.y = toy;
				obj.position.z = toz;

			} else {

				var moveX = (tox-obj.position.x)/Math.max(1, (that.settings.divider/optimalDivider) );
				var moveY = (toy-obj.position.y)/Math.max(1, (that.settings.divider/optimalDivider) );
				var moveZ = (toz-obj.position.z)/Math.max(1, (that.settings.divider/optimalDivider) );

				obj.position.x += moveX;
				obj.position.y += moveY;
				obj.position.z += moveZ;
			}

		}

	}

	this.reset = function ( x,y,z ) {

		for (var i=0; i<that.array.length; ++i ) {
			var obj = that.array[i];
			obj.position.x = x;
			obj.position.y = y;
			obj.position.z = z;
		}

	}

}



var Ribbon = function (in_length, in_height, in_segments) {

	var scope = this;

	var length = in_length || 100;
	var height = in_height || 10;
	var segments = in_segments || 10;

	THREE.Geometry.call(this);

	var halfHeight = height/2;
	var segmentWidth = length/segments;
	var tempVertices = [];

	// vertices
	for (var i=0; i<(segments+2); ++i ) {
		var x = i*segmentWidth
		var y_up = halfHeight;
		var y_down = -halfHeight;
		var z = 0;
		tempVertices.push(v(x,y_up,z));
		tempVertices.push(v(x,y_down,z));
	}

	// faces
	for (var i=0; i<segments*2; i+=2 ) {
		//face 1
		f3( tempVertices[i], tempVertices[i+2], tempVertices[i+1] );
		//face 2
		f3( tempVertices[i+2], tempVertices[i+3], tempVertices[i+1] );
	}

	//this.computeCentroids();
	this.computeFaceNormals();
	this.computeVertexNormals();
	//this.sortFacesByMaterial();

	function v( x, y, z ) {
		var i = scope.vertices.push( new THREE.Vector3( x, y, z ) );
		return i-1;
	}

	function f3( a, b, c ) {
		scope.faces.push( new THREE.Face3( a, b, c ) );
	}

}

Ribbon.prototype = new THREE.Geometry();
Ribbon.prototype.constructor = Ribbon;



var Ribbons = function ( numOfRibbons, vectorArray, scene, ribbonMaterials ) {
	
	var that = this;

	var ribbonArray = [];
	var ribbonMeshArray = [];
	var scene = scene;

	that.initSettings = {
		numOfRibbons : numOfRibbons || 6
	}

	that.settings = {
		ribbonPulseMultiplier_1 : 5.5,
		ribbonPulseMultiplier_2 : 5.5,
		ribbonMin : 1.5,
		ribbonMax : 3,
		visible : true
	}
	
	var r = 0;
	var i;

	for ( i = 0; i < that.initSettings.numOfRibbons; ++i ) {

		var ribbon = new Ribbon( 15, 6, vectorArray.length - 20 );
		var ribbonMesh = new THREE.Mesh( ribbon, ribbonMaterials[ i % ribbonMaterials.length ] );
		ribbon.dynamic = true;
		ribbonMesh.doubleSided = true;
		ribbonMesh.frustumCulled = false;
		//ribbonMesh.position.set( 0, 0, 0 ); // hide ribbons at the beginning
		scene.add( ribbonMesh );

		var offset = 1+Math.floor( Math.random()*19 );

		var obj = {r:ribbon, rm:ribbonMesh, offset:offset}

		ribbonArray.push(obj);
		ribbonMeshArray.push(ribbonMesh);

	}

	this.changeColor = function (colorArray, opacity) {
		for ( i = 0; i < that.initSettings.numOfRibbons; ++i ) {
			ribbonArray[i].rm.materials[0].color.setHex(colorArray[i%colorArray.length]);
			ribbonArray[i].rm.materials[0].opacity = opacity;
		}
	}

	this.update = function (position,delta) {

		r += delta/700;

		for (i=0; i<vectorArray.length; ++i ) {
			
			var x = vectorArray[i].position.x;
			var y = vectorArray[i].position.y;
			var z = vectorArray[i].position.z;

			// ribbons
			for (var k=0; k<numOfRibbons; ++k ) {
				var ribbon = ribbonArray[k].r;
				var offset = ribbonArray[k].offset;

				if (i < offset) {
					continue;
				}

				var pulse = Math.cos((i-r*10)/50)*that.settings.ribbonPulseMultiplier_1;

				var pulse2 = Math.cos((i-r*10)/8)*that.settings.ribbonPulseMultiplier_2;

				var inc = (Math.PI*2)/ribbonArray.length;
				var thisinc = k*inc;
				var offsetz = Math.cos(thisinc+((i-r*10)/8))*pulse;
				var offsety = Math.sin(thisinc+((i-r*10)/8))*pulse;

				for (var j=0; j<2; ++j ) {
					var index = ((i-offset)*2)+j;

					if (ribbon.vertices[index] == undefined) {
						continue;
						break;
					}

					// for twister
					var adder = i-(r*2);
					var w = Math.max(that.settings.ribbonMin, i/(10+pulse2));
					w = Math.min(w, that.settings.ribbonMax);
					var extrax = Math.cos(adder/3)*w;
					var extray = Math.sin(adder/3)*w;

					ribbon.vertices[index].x = x - position.x+extrax+offsetz;
					if (j==0) {
						ribbon.vertices[index].y = y+extray+offsety - position.y;
						ribbon.vertices[index].z = z+extrax+offsetz - position.z;
					} else {
						ribbon.vertices[index].y = y-extray+offsety - position.y;
						ribbon.vertices[index].z = z-extrax+offsetz - position.z;
					}
				}

			}
		}

		for (i=0; i<ribbonArray.length; ++i ) {
			var ribbonMesh = ribbonArray[i].rm;
			ribbonMesh.position = position;
			ribbon = ribbonArray[i].r;
			ribbon.verticesNeedUpdate = true;
		}
	}
}
