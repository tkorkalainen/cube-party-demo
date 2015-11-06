THREE = THREE || {};
THREE.Extras = THREE.Extras || {};
THREE.Extras.Utils = THREE.Extras.Utils || {};

/*! Projects object origin into screen space coordinates using provided camera */
THREE.Extras.Utils.projectOnScreen = function(object, camera)
{
	var vector = new THREE.Vector3();

    var widthHalf = 0.5;
    var heightHalf = 0.5;

    object.updateMatrixWorld();
    vector.setFromMatrixPosition(object.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };	
}