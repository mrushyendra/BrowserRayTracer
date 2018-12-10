
// ## Detecting collisions against a triangle

//
function triIntersection(tri, ray) {

// compute triangle normal and d in plane equation
var triNorm = triNormal(tri);
var d = -1 * Vector.dotProduct (tri.point1, triNorm);

// compute where ray intersects plane
var dist = -1 * (Vector.dotProduct(ray.point,triNorm)+d)/Vector.dotProduct(ray.vector, triNorm);

// if behind the ray starting point, we are done -- no intersection
if (dist < 0.001) return undefined;


var P = Vector.add(ray.point,Vector.scale(ray.vector, dist));



// do inside test, edge by edge on triangle

var v1 = Vector.subtract(tri.point1, ray.point);
var v2 = Vector.subtract(tri.point2, ray.point);

var n1 = Vector.unitVector(Vector.crossProduct(v2,v1));
var d1 = -1 * Vector.dotProduct(ray.point,n1);
if ( (d1 + Vector.dotProduct(P,n1)) < 0) return undefined;



var v3 = Vector.subtract(tri.point3, ray.point);
n1 = Vector.unitVector(Vector.crossProduct(v3,v2));
d1 = -1 *Vector.dotProduct(ray.point,n1);
if ( (d1 + Vector.dotProduct(P,n1)) < 0) return undefined ;

n1 = Vector.unitVector(Vector.crossProduct(v1,v3));
d1 = -1* Vector.dotProduct(ray.point,n1);
if ( (d1 + Vector.dotProduct(P,n1)) < 0) return undefined;


return dist;


}

// A normal is, at each point on the surface of a sphere or some other object,
// a vector that's perpendicular to the surface and radiates outward. We need
// to know this so that we can calculate the way that a ray reflects off of
// the surface
function triNormal(tri) {
    return Vector.unitVector(
        Vector.crossProduct(Vector.subtract(tri.point2,tri.point1) ,Vector.subtract(tri.point3,tri.point1)) 
         );
}

