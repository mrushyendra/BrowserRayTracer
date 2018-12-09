

// # Detecting collisions against all objects
//
// Given a ray, let's figure out whether it hits anything, and if so,
// what's the closest thing it hits.
function intersectScene(ray, scene) {
    // The base case is that it hits nothing, and travels for `Infinity`
    var closest = [Infinity, null];
    // But for each object, we check whether it has any intersection,
    // and compare that intersection - is it closer than `Infinity` at first,
    // and then is it closer than other objects that have been hit?
    for (var i = 0; i < scene.objects.length; i++) {
        var object = scene.objects[i];
	
	if (object.type == 'sphere')  {
            dist = sphereIntersection(object, ray);       
	}

	if (object.type == 'spheretex') {
	    dist = sphereIntersection(object, ray);
	}

    if (object.type == 'spherelong'){
        dist = sphereIntersection(object, ray);
    }

	if (object.type == 'triangle') {
	    dist = triIntersection (object, ray);
        }
       
	
        if (dist !== undefined && dist > 0 && dist < closest[0]) {
            closest = [dist, object];
        }
    }
    return closest;
}

