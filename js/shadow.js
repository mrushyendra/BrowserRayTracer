// This is the part that makes objects cast shadows on each other: from here
// we'd check to see if the area in a shadowy spot can 'see' a light, and when
// this returns `false`, we make the area shadowy.

function isLightVisible(pt, scene, light) {

    var distObject =  intersectScene({ 
		point: pt, 
		vector: Vector.unitVector(Vector.subtract( light, pt)) 
		}, scene);

   return (distObject[0] > Vector.length(Vector.subtract(light, pt)) -.005);   // was  > -0.005

}
