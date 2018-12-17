//given an intersection point and light source, returns true if there exists direct path from object to light
function isLightVisible(pt, scene, octree, light) {

    var distObject =  intersectScene({ 
		point: pt, 
		vector: Vector.unitVector(Vector.subtract( light, pt)) 
		}, octree, scene);

    return (distObject[0] > Vector.length(Vector.subtract(light, pt)) -.005);   // was  > -0.005

}
