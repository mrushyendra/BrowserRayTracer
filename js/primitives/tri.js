
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

return [dist, null];
}

function triNormal(tri) {
    return Vector.unitVector(Vector.crossProduct(Vector.subtract(tri.point2,tri.point1) ,Vector.subtract(tri.point3,tri.point1)));
}

function triangleColor(scene, tri, point){
    var vec12 = Vector.subtract(tri.point2, tri.point1);
    var vec13 = Vector.subtract(tri.point3, tri.point1);
    var vec1P = Vector.subtract(point, tri.point1);
    var vec3P = Vector.subtract(point, tri.point3);
    var vec32 = Vector.subtract(tri.point2, tri.point3);

    //area of triangles defined by the various tri points and intersection pt. Avoid dividing by 2 for optimization
    var area123 = Vector.length(Vector.crossProduct(vec12, vec13));
    var area1P3 = Vector.length(Vector.crossProduct(vec1P, vec13));
    var area1P2 = Vector.length(Vector.crossProduct(vec1P, vec12));
    var area3P2 = Vector.length(Vector.crossProduct(vec3P, vec32));
    
    //barycentric coordinates
    var alpha = area1P3/area123;
    var beta = area1P2/area123;
    var gamma = area3P2/area123;

    var u = Math.round(alpha*tri.textureMapCoords[0].u + beta*tri.textureMapCoords[1].u + gamma*tri.textureMapCoords[2].u);
    var v= Math.round(alpha*tri.textureMapCoords[0].v + beta*tri.textureMapCoords[1].v + gamma*tri.textureMapCoords[2].v);

    //calculate cylindrical coordinates, then transform to u,v coords
    var objColor = {};
    objColor.x = scene.textures[tri.texture].data.data[(scene.textures[tri.texture].width*v*4) + (u*4)];
    objColor.y = scene.textures[tri.texture].data.data[(scene.textures[tri.texture].width*v*4) + (u*4) + 1];
    objColor.z = scene.textures[tri.texture].data.data[(scene.textures[tri.texture].width*v*4) + (u*4) + 2];
    return objColor;
}

function updateTri(tri, timeStep){
    var vx = tri.Vx;
    var vy = tri.Vy;
    var vz = tri.Vz;
    tri.point1.x+=(vx*timeStep);
    tri.point2.x+=(vx*timeStep);
    tri.point3.x+=(vx*timeStep);
    tri.boundingBoxPos.x+=(vx*timeStep);
    tri.point1.y+=(vy*timeStep);
    tri.point2.y+=(vy*timeStep);
    tri.point3.y+=(vy*timeStep);
    tri.boundingBoxPos.y+=(vy*timeStep);
    tri.point1.z+=(vz*timeStep);
    tri.point2.z+=(vz*timeStep);
    tri.point3.z+=(vz*timeStep);
    tri.boundingBoxPos.z+=(vz*timeStep);
}
