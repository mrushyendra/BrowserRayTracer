// ## Detecting collisions against a cone

/*
 * apex : {x,y,z}
 * axis : {x,y,z}
 * theta
 * scaling: sx, sy, sz
 * translation: tx, ty, tz
 * rotation: rx, ry, rz
 */

function coneIntersection(cone, ray) {
    /* Assume precomputed: 
    calc TInv matrix from Tx, Ty, Tz
    calc RInv matrix from rx, ry, rz
    calc SInv matrix from sx, sy, sz
    */    

    //transform ray into object space
    //console.log(ray);
    var rayPtArr = [ray.point.x, ray.point.y, ray.point.z, 1];
    rayPtArr = math.multiply(cone.SInv, math.multiply(cone.RInv, math.multiply(cone.TInv,rayPtArr))); 
    var rayVecArr = [ray.vector.x, ray.vector.y, ray.vector.z, 0];
    rayVecArr = math.multiply(cone.SInv, math.multiply(cone.RInv,rayVecArr)); 

    rayPtArr = rayPtArr.valueOf(); //get array representation back
    rayVecArr = rayVecArr.valueOf();
    var rayNew = {};
    rayNew.point = {x: rayPtArr[0], y: rayPtArr[1], z: rayPtArr[2]};
    rayNew.vector = {x: rayVecArr[0], y: rayVecArr[1], z: rayVecArr[2]};
    //console.log(rayNew);

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
    //basic trigonometry to calculate length of hypotenuse, then calculate normal in object space by joining end of hyp with intersection pt
    var intersectionPtArr = [pos.x, pos.y, pos.z, 1]; 
    intersectionPtArr = math.multiply(cone.SInv, math.multiply(cone.RInv, math.multiply(cone.TInv,intersectionPtArr))); //convert to obj space
    intersectionPtArr = intersectionPtArr.valueOf();
    var intersectionPtnew = {x: intersectionPtArr[0], y: intersectionPtArr[1], z: intersectionPtArr[2]};//in obj space

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
