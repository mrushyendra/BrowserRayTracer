/* Detecting collisions against a cone
 *
 * https://www.cl.cam.ac.uk/teaching/1999/AGraphHCI/SMAG/node2.html
 * apex: tip of cone (0,0,0)
 * axis: central axis of cone (0,1,0) - aligned along y axis
 */

function coneIntersection(cone, ray) {
    /* Assume precomputed: 
    calc TInv matrix from Tx, Ty, Tz
    calc RInv matrix from rx, ry, rz
    calc SInv matrix from sx, sy, sz
    */    

    //transform ray into object space
    var rayPtArr = [ray.point.x, ray.point.y, ray.point.z, 1];
    rayPtArr = math.multiply(cone.SRTInv, rayPtArr);
    var rayVecArr = [ray.vector.x, ray.vector.y, ray.vector.z, 0];
    rayVecArr = math.multiply(cone.SRInv, rayVecArr);

    rayPtArr = rayPtArr.valueOf(); //get array representation back
    rayVecArr = rayVecArr.valueOf();
    var rayNew = {};
    rayNew.point = {x: rayPtArr[0], y: rayPtArr[1], z: rayPtArr[2]};
    rayNew.vector = {x: rayVecArr[0], y: rayVecArr[1], z: rayVecArr[2]};

    //calculate t
    var a = (rayNew.vector.x*rayNew.vector.x) + (rayNew.vector.z*rayNew.vector.z) - (rayNew.vector.y*rayNew.vector.y);
    var b = (2*rayNew.point.x*rayNew.vector.x + 2*rayNew.point.z*rayNew.vector.z - 2*rayNew.point.y*rayNew.vector.y);
    var c = (rayNew.point.x*rayNew.point.x) + (rayNew.point.z*rayNew.point.z) - (rayNew.point.y*rayNew.point.y);

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

    //calculate intersection pt in object space to see if it lies in finite limits of cone
    var intersectionPt = Vector.add(rayNew.point, Vector.scale(rayNew.vector, t));
    if((intersectionPt.y < cone.yMin) || (intersectionPt.y > cone.yMax)){
        return; //outside the finite cone
    }
    
    return Vector.length(Vector.scale(ray.vector, t)); //actual intersection point = ray.point + ray.vector*t
}

function coneNormal(cone, pos) {
    //convert intersection pt to obj space
    var intersectionPtArr = [pos.x, pos.y, pos.z, 1]; 
    intersectionPtArr = math.multiply(cone.SRTInv, intersectionPtArr);
    intersectionPtArr = intersectionPtArr.valueOf();
    var intersectionPtnew = {x: intersectionPtArr[0], y: intersectionPtArr[1], z: intersectionPtArr[2]};//in obj space

    //calculate normal in object space
    //basic trigonometry to calculate length of hypotenuse, then calculate normal in object space by joining end of hyp with intersection pt
    var alpha = Math.cos((cone.theta/180)*Math.PI);
    var hyp = Vector.length(Vector.subtract(intersectionPtnew, cone.apex))/alpha;
    var b = Vector.add(cone.apex, Vector.scale(cone.axis, hyp));
    var normalObjSpace = Vector.subtract(intersectionPtnew, b);

    //convert to world space
    var normalArr = [normalObjSpace.x, normalObjSpace.y, normalObjSpace.z, 0];
    normalArr = math.multiply(cone.R, math.multiply(cone.SInv, normalArr));
    normalArr = normalArr.valueOf();
    var normal = {x: normalArr[0], y: normalArr[1], z: normalArr[2]};

    return Vector.unitVector(normal);
}

function coneColor(scene, cone, point){
    //convert intersection pt to obj space
    var intersectionPtArr = [point.x, point.y, point.z, 1]; 
    intersectionPtArr = math.multiply(cone.SRTInv, intersectionPtArr);
    intersectionPtArr = intersectionPtArr.valueOf();
    var intersectionPtnew = {x: intersectionPtArr[0], y: intersectionPtArr[1], z: intersectionPtArr[2]};//in obj space   

    //similar triangles to calculate r', then calc the angle phi that yields the x and z components of the r'
    //phi = [0,2pi], u = [0-1]
    var height = Math.abs(cone.yMax - 0);
    var u = Math.abs(intersectionPtnew.y);
    var radius = height*Math.tan((cone.theta/180)*Math.PI);
    var phi = Math.acos((intersectionPtnew.x * height)/(u*radius));

    u = Math.round((u/height)*scene.textures[cone.texture].width); //scale to [0-imgWidth]
    var v = Math.round((phi/(2*Math.PI))*scene.textures[cone.texture].height);
    var objColor = {};
    objColor.x = scene.textures[cone.texture].data.data[(scene.textures[cone.texture].width*v*4) + (u*4)];
    objColor.y = scene.textures[cone.texture].data.data[(scene.textures[cone.texture].width*v*4) + (u*4) + 1];
    objColor.z = scene.textures[cone.texture].data.data[(scene.textures[cone.texture].width*v*4) + (u*4) + 2];
    return objColor;
}
