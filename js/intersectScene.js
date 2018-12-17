// # Detecting collisions against all objects
//
//For the ray supplied, determine the closest object it hits, if any, and return object + distance to object
function intersectScene(ray, octree, scene) {
    // The base case is that it hits nothing, and travels for `Infinity`
    var closest = [Infinity, null, null];

    // But for each object, we check whether it has any intersection,
    // and compare that intersection - is it closer than `Infinity` at first,
    // and then is it closer than other objects that have been hit?
    
    closest = octree.intersectOctree(ray);
    return closest;
}

