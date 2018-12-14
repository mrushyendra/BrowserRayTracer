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
    if(t1 < 0 && t2 < 0){
        return;
    }

    if(t1 > t2){
        var temp = t1;
        t1 = t2;
        t2 = temp;
    }

    if(t1 < 0.1){
        t = t2;
    } else {
        //check intersection with top and bottom of cylinder, if both intersection points are on either side of yMin/yMax
        var pt1 = Vector.add(rayNew.point, Vector.scale(rayNew.vector, t1));
        var pt2 = Vector.add(rayNew.point, Vector.scale(rayNew.vector, t2));
        if(pt1.y < cylinder.yMin && cylinder.yMin < pt2.y){
            t = (cylinder.yMin - rayNew.point.y)/rayNew.vector.y;
        } else if (pt1.y > cylinder.yMax && cylinder.yMax > pt2){
            t = (cylinder.yMax - rayNew.point.y)/rayNew.vector.y;
        } else {
            t = t1; //intersection with side
        }
    }
    if(t < 0.1)
        return;

    //calculate intersection pt in object space to see if it lies in finite limits of cylinder
    var intersectionPt = Vector.add(rayNew.point, Vector.scale(rayNew.vector, t));
    if((intersectionPt.y < (cylinder.yMin - 0.1)) || (intersectionPt.y > (cylinder.yMax + 0.1))){
        return; //outside the finite cylinder
    }
    
    return [Vector.length(Vector.scale(ray.vector, t)), intersectionPt]; //actual intersection point = ray.point + ray.vector*t
}

function cylinderNormal(cylinder, pos, intersectPtObjSpace) {
    var intersectionPtnew = intersectPtObjSpace;
    var normalObjSpace = {x: 0, y: 0, z: 0};
    var eps = 0.1;
    
    if(Math.abs(intersectionPtnew.y - cylinder.yMin) <=  eps){ //for bottom face of cylinder
        normalObjSpace = {x: 0, y: -1, z: 0};
    } else if (Math.abs(intersectionPtnew.y - cylinder.yMax) <= eps){ //top face
        normalObjSpace = {x: 0, y: 1, z: 0};
    } else {
        //calculate normal in object space
        //basic trigonometry to calculate length of hypotenuse, then calculate normal in object space by joining end of hyp with intersection pt
        var hyp = Vector.subtract(intersectionPtnew, cylinder.center);
        var adj = (Vector.dotProduct(hyp, cylinder.axis))/(Vector.length(cylinder.axis));
        var adjVec = Vector.scale(cylinder.axis, adj);
        normalObjSpace = Vector.subtract(hyp, adjVec);
    }

    //convert normal to world space
    var normalArr = [normalObjSpace.x, normalObjSpace.y, normalObjSpace.z, 0];
    normalArr = math.multiply(cylinder.R, math.multiply(cylinder.SInv, normalArr));
    normalArr = normalArr.valueOf();
    var normal = {x: normalArr[0], y: normalArr[1], z: normalArr[2]};

    return Vector.unitVector(normal);
}

function cylinderColor(scene, cylinder, point, intersectPtObjSpace){
    var intersectionPtnew = intersectPtObjSpace;
    var eps = 0.1;
    var u = 0; var v = 0;
    
    //texture on top and bototn of cylinder
    if((Math.abs(intersectionPtnew.y - cylinder.yMin) <=  eps) || (Math.abs(intersectionPtnew.y - cylinder.yMax) <= eps)){
        var r = Math.sqrt((intersectionPtnew.x * intersectionPtnew.x) + (intersectionPtnew.z * intersectionPtnew.z));
        var phi = Math.acos(intersectionPtnew.x/r);
        u = Math.round((r/cylinder.r)*scene.textures[cylinder.texture].width); //scale to [0-imgWidth]
        v = Math.round((phi/(2*Math.PI))*scene.textures[cylinder.texture].height);
    } else {
        //calculate cylindrical coordinates, then transform to u,v coords
        u = Math.abs(intersectionPtnew.y);
        var height = Math.abs(cylinder.yMax);
        var phi = Math.acos(intersectionPtnew.x/cylinder.r);
        u = Math.round((u/height)*scene.textures[cylinder.texture].width); //scale to [0-imgWidth]
        v = Math.round((phi/(2*Math.PI))*scene.textures[cylinder.texture].height);
    }

    var objColor = {};
    objColor.x = scene.textures[cylinder.texture].data.data[(scene.textures[cylinder.texture].width*v*4) + (u*4)];
    objColor.y = scene.textures[cylinder.texture].data.data[(scene.textures[cylinder.texture].width*v*4) + (u*4) + 1];
    objColor.z = scene.textures[cylinder.texture].data.data[(scene.textures[cylinder.texture].width*v*4) + (u*4) + 2];
    return objColor;
}

function updateCylinder(cylinder, timeStep){
    var vx = cylinder.Vx;
    var vy = cylinder.Vy;
    var vz = cylinder.Vz;
    cylinder.Tx+=(vx*timeStep);
    cylinder.boundingBoxPos.x+=(vx*timeStep);
    cylinder.Ty+=(vy*timeStep);
    cylinder.boundingBoxPos.y+=(vy*timeStep);
    cylinder.Tz+=(vz*timeStep);
    cylinder.boundingBoxPos.z+=(vz*timeStep);
}
