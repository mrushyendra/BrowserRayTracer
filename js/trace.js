

function trace(ray, scene, octree, depth) {
    // This is a recursive method: if we hit something that's reflective,
    // then the call to `surface()` at the bottom will return here and try
    // to find what the ray reflected into. Since this could easily go
    // on forever, first check that we haven't gone more than three bounces
    // into a reflection.
    if (depth > 5) return Vector.ZEROcp;

    var distObject = intersectScene(ray, octree, scene);

    // If we don't hit anything, fill this pixel with the background color -
    // in this case, white.
    if (distObject[0] === Infinity) {
        return Vector.ZERO;
    } 

    var dist = distObject[0],
        intersectPtObjSpace = distObject[1],
        object = distObject[2];

    // The `pointAtTime` is another way of saying the 'intersection point'
    // of this ray into this object. We compute this by simply taking
    // the direction of the ray and making it as long as the distance
    // returned by the intersection check.
    var pointAtTime = Vector.add(ray.point, Vector.scale(ray.vector, dist));

    return surface(ray, scene, octree, object, pointAtTime, intersectPtObjSpace, objectNormal(object, pointAtTime, intersectPtObjSpace), depth);
}

