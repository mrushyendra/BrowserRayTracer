/* Detecting collisions against a cylinder
 *
 * https://www.cl.cam.ac.uk/teaching/1999/AGraphHCI/SMAG/node2.html
 * center: center of cyilnder (0,0,0)
 * axis: central axis of cylinder (0,1,0) - aligned along y axis
 */

function cylinderIntersection(cylinder, ray) {
    /* Assume precomputed: 
    calc TInv matrix from Tx, Ty, Tz
    calc RInv matrix from rx, ry, rz
    calc SInv matrix from sx, sy, sz
    */    

    //transform ray into object space
    var rayPtArr = [ray.point.x, ray.point.y, ray.point.z, 1];
    rayPtArr = math.multiply(cylinder.SRTInv, rayPtArr);
    var rayVecArr = [ray.vector.x, ray.vector.y, ray.vector.z, 0];
    rayVecArr = math.multiply(cylinder.SRInv, rayVecArr);

    rayPtArr = rayPtArr.valueOf(); //get array representation back
    rayVecArr = rayVecArr.valueOf();
    var rayNew = {};
    rayNew.point = {x: rayPtArr[0], y: rayPtArr[1], z: rayPtArr[2]};
    rayNew.vector = {x: rayVecArr[0], y: rayVecArr[1], z: rayVecArr[2]};

    //calculate t
    var a = (rayNew.vector.x*rayNew.vector.x) + (rayNew.vector.z*rayNew.vector.z);
    var b = (2*rayNew.point.x*rayNew.vector.x + 2*rayNew.point.z*rayNew.vector.z);
    var c = (rayNew.point.x*rayNew.point.x) + (rayNew.point.z*rayNew.point.z) - (cylinder.r*cylinder.r);

    var discriminant = (b*b) - (4*a*c);
    if(discriminant < 0) return;

    var t1 = (-b + Math.sqrt(discriminant))/(2*a);
    var t2 = (-b - Math.sqrt(discriminant))/(2*a);
    
    var t = t1;
    if(t1 < 0 && t2 < 0){
        return;
    }
    if(t1 < 0){
        t = t2;
    } else if (t2 < 0){
        t = t1;
    } else {
        t = Math.min(t1,t2);
    }

    if(t < 0.1)
        return;

    //calculate intersection pt in object space to see if it lies in finite limits of cylinder
    var intersectionPt = Vector.add(rayNew.point, Vector.scale(rayNew.vector, t));
    if((intersectionPt.y < cylinder.yMin) || (intersectionPt.y > cylinder.yMax)){
        return; //outside the finite cylinder
    }
    
    return [Vector.length(Vector.scale(ray.vector, t)), intersectionPt]; //actual intersection point = ray.point + ray.vector*t
}

function cylinderNormal(cylinder, pos, intersectPtObjSpace) {
    var intersectionPtnew = intersectPtObjSpace;

    //calculate normal in object space
    //basic trigonometry to calculate length of hypotenuse, then calculate normal in object space by joining end of hyp with intersection pt
    var hyp = Vector.subtract(intersectionPtnew, cylinder.center);
    var adj = (Vector.dotProduct(hyp, cylinder.axis))/(Vector.length(cylinder.axis));
    var adjVec = Vector.scale(cylinder.axis, adj);
    var normalObjSpace = Vector.subtract(hyp, adjVec);

    //convert normal to world space
    var normalArr = [normalObjSpace.x, normalObjSpace.y, normalObjSpace.z, 0];
    normalArr = math.multiply(cylinder.R, math.multiply(cylinder.SInv, normalArr));
    normalArr = normalArr.valueOf();
    var normal = {x: normalArr[0], y: normalArr[1], z: normalArr[2]};

    return Vector.unitVector(normal);
}

function cylinderColor(scene, cylinder, point, intersectPtObjSpace){
    var intersectionPtNew = intersectPtObjSpace;

    //calculate cylindrical coordinates, then transform to u,v coords
    var u = Math.abs(intersectionPtnew.y);
    var height = Math.abs(cylinder.yMax);
    var phi = Math.acos(intersectionPtnew.x/cylinder.r);
    u = Math.round((u/height)*scene.textures[cylinder.texture].width); //scale to [0-imgWidth]
    var v = Math.round((phi/(2*Math.PI))*scene.textures[cylinder.texture].height);
    var objColor = {};
    objColor.x = scene.textures[cylinder.texture].data.data[(scene.textures[cylinder.texture].width*v*4) + (u*4)];
    objColor.y = scene.textures[cylinder.texture].data.data[(scene.textures[cylinder.texture].width*v*4) + (u*4) + 1];
    objColor.z = scene.textures[cylinder.texture].data.data[(scene.textures[cylinder.texture].width*v*4) + (u*4) + 2];
    return objColor;
}
