
// ## Detecting collisions against a sphere

//
// Spheres are one of the simplest objects for rays to interact with, since
// the geometrical math for finding intersections and reflections with them
// is pretty straightforward.
function sphereIntersection(sphere, ray) {
    var eye_to_center = Vector.subtract(sphere.point, ray.point),
        // picture a triangle with one side going straight from the camera point
        // to the center of the sphere, another side being the vector.
        // the final side is a right angle.
        //
        // This equation first figures out the length of the vector side
        v = Vector.dotProduct(eye_to_center, ray.vector),
        // then the length of the straight from the camera to the center
        // of the sphere
        eoDot = Vector.dotProduct(eye_to_center, eye_to_center),
        // and compute a segment from the right angle of the triangle to a point
        // on the `v` line that also intersects the circle
        discriminant = (sphere.radius * sphere.radius) - eoDot + (v * v);
    
        if (Math.abs(  (Vector.length(eye_to_center)-sphere.radius) /sphere.radius) < 0.1) return;
	
    // If the discriminant is negative, that means that the sphere hasn't
    // been hit by the ray
    if (discriminant < 0) {
        return;
    } else {
        // otherwise, we return the distance from the camera point to the sphere
        // `Math.sqrt(dotProduct(a, a))` is the length of a vector, so
        // `v - Math.sqrt(discriminant)` means the length of the the vector
        // just from the camera to the intersection point.
        return [v - Math.sqrt(discriminant), null];
    }
}

// A normal is, at each point on the surface of a sphere or some other object,
// a vector that's perpendicular to the surface and radiates outward. We need
// to know this so that we can calculate the way that a ray reflects off of
// a sphere.
function sphereNormal(sphere, pos) {
    return Vector.unitVector(
        Vector.subtract(pos, sphere.point));
}

//returns u,v coordinates in texture map of the intersection point 
function sphereColor(scene, sphere, point){
    var center2Pt = Vector.subtract(point, sphere.point);
    var phi = Math.acos(center2Pt.z/sphere.radius);
    var theta = Math.atan(center2Pt.y/center2Pt.x);
    if(theta < 0){
        theta=-theta;
    }
    var u = Math.round((phi/Math.PI)*scene.textures[sphere.texture].width); //scale to [0-imgWidth]
    var v = Math.round((theta/(2*Math.PI))*scene.textures[sphere.texture].height);
    var objColor = {};
    objColor.x = scene.textures[sphere.texture].data.data[(scene.textures[sphere.texture].width*v*4) + (u*4)];
    objColor.y = scene.textures[sphere.texture].data.data[(scene.textures[sphere.texture].width*v*4) + (u*4) + 1];
    objColor.z = scene.textures[sphere.texture].data.data[(scene.textures[sphere.texture].width*v*4) + (u*4) + 2];
    return objColor;
}

function updateSphere(sphere, timeStep){
    var vx = sphere.Vx;
    var vy = sphere.Vy;
    var vz = sphere.Vz;
    sphere.point.x+=(vx*timeStep);
    sphere.boundingBoxPos.x+=(vx*timeStep);
    sphere.point.y+=(vy*timeStep);
    sphere.boundingBoxPos.y+=(vy*timeStep);
    sphere.point.z+=(vz*timeStep);
    sphere.boundingBoxPos.z+=(vz*timeStep);
}
