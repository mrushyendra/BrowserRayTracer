// for Assign 5
// Compute normal of object

function objectNormal(object, point, intersectPtObjSpace){

if (object.type == 'sphere') return (sphereNormal (object, point));

if (object.type == 'spheretex'){
	var newnorm = Vector.subtract(point, object.point);
	// angle to vertical is theta
	newnorm=Vector.unitVector(newnorm);
	diff = Math.cos(20*3.14159*Math.abs(point.y - object.point.y)/object.radius);
	newnorm.y += .2*diff;
	newnorm= Vector.unitVector(newnorm);
	return (newnorm);
};

if (object.type == 'spherelong'){
    var newNorm = Vector.subtract(point, object.point);
	// angle to vertical is theta
	newNorm=Vector.unitVector(newNorm);
    var theta = Math.atan((point.x - object.point.x)/(point.z - object.point.z));
    var diff = Math.cos(30*theta);
	newNorm.z += .2*diff;
	newNorm= Vector.unitVector(newNorm);
    return (newNorm);
}

if (object.type == 'triangle') return (triNormal(object));

if (object.type == 'cuboid') return (cuboidNormal(object, point, intersectPtObjSpace));

if (object.type == 'cone') return (coneNormal(object, point, intersectPtObjSpace));

if (object.type == 'cylinder') return (cylinderNormal(object, point, intersectPtObjSpace));

if (object.type == 'plane') return (planeNormal(object, point, intersectPtObjSpace));

}
