// ## Detecting collisions against a cuboid

function cuboidIntersection(cuboid, ray) {
    /* Assume precomputed: 
    calc TInv matrix from Tx, Ty, Tz
    calc RInv matrix from rx, ry, rz
    calc SInv matrix from sx, sy, sz
    */    

    //transform ray into object space
    var rayPtArr = [ray.point.x, ray.point.y, ray.point.z, 1];
    rayPtArr = math.multiply(cuboid.SRTInv, rayPtArr);
    var rayVecArr = [ray.vector.x, ray.vector.y, ray.vector.z, 0];
    rayVecArr = math.multiply(cuboid.SRInv, rayVecArr);

    rayPtArr = rayPtArr.valueOf(); //get array representation back
    rayVecArr = rayVecArr.valueOf();
    var rayNew = {};
    rayNew.point = {x: rayPtArr[0], y: rayPtArr[1], z: rayPtArr[2]};
    rayNew.vector = {x: rayVecArr[0], y: rayVecArr[1], z: rayVecArr[2]};

    //r + td = x, (x-r)/d = t
    var txMin = (cuboid.pos.x - rayNew.point.x)/rayNew.vector.x;
    var txMax = (cuboid.pos.x + cuboid.dim.x - rayNew.point.x)/rayNew.vector.x;
    if(txMin > txMax){
      var tmp = txMin;
      txMin = txMax;
      txMax = tmp;
    }

    var tyMin = (cuboid.pos.y - rayNew.point.y)/rayNew.vector.y;
    var tyMax = (cuboid.pos.y + cuboid.dim.y - rayNew.point.y)/rayNew.vector.y;
    if(tyMin > tyMax){
      var tmp = tyMin;
      tyMin = tyMax;
      tyMax = tmp;
    }

    if((txMin > tyMax) || (tyMin > txMax)){
      return;
    }

    if(tyMin > txMin){
      txMin = tyMin;
    }

    if(tyMax < txMax){
      txMax = tyMax;
    }

    var tzMin = (cuboid.pos.z - rayNew.point.z)/rayNew.vector.z;
    var tzMax = (cuboid.pos.z + cuboid.dim.z - rayNew.point.z)/rayNew.vector.z;
    if(tzMin > tzMax){
      var tmp = tzMin;
      tzMin = tzMax;
      tzMax = tmp;
    }

    if((txMin > tzMax) || (tzMin > txMax)){
      return;
    }

    if(tzMin > txMin){
      txMin = tzMin;
    }

    if(tzMax < txMax){
      txMax = tzMax;
    }
    
    if(txMin < 0){ //intersection pt is behind ray origin
        if(txMax < 0){
            return;
        } else{
            return txMax;
        }
    } else {
        return txMin;
    }
}

function cuboidNormal(cuboid, pos){
    //convert intersection pt to obj space
    var intersectionPtArr = [pos.x, pos.y, pos.z, 1]; 
    intersectionPtArr = math.multiply(cuboid.SRTInv, intersectionPtArr);
    intersectionPtArr = intersectionPtArr.valueOf();
    var intersectionPtnew = {x: intersectionPtArr[0], y: intersectionPtArr[1], z: intersectionPtArr[2]};//in obj space

    var normalObjSpace = {x:0, y:0, z:0};
    var eps = 0.1;
    if(Math.abs(intersectionPtnew.x - cuboid.pos.x) < eps){
        normaObjSpace = {x : -1, y : 0, z : 0};
    } else if(Math.abs(intersectionPtnew.y - cuboid.pos.y) < eps){
        normalObjSpace = {x : 0, y : -1, z : 0};
    } else if(Math.abs(intersectionPtnew.z - cuboid.pos.z) < eps){
        normalObjSpace = {x : 0, y : 0, z : -1};
    } else if(Math.abs(intersectionPtnew.x - (cuboid.pos.x + cuboid.dim.x)) < eps){
        normalObjSpace = {x : 1, y : 0, z : 0};
    } else if(Math.abs(intersectionPtnew.y - (cuboid.pos.y + cuboid.dim.y)) < eps){
        normalObjSpace = {x : 0, y : 1, z : 0};
    } else if(Math.abs(intersectionPtnew.z - (cuboid.pos.z + cuboid.dim.z)) < eps){
        normalObjSpace = {x : 0, y : 0, z : 1};
    }

    //convert to world space
    var normalArr = [normalObjSpace.x, normalObjSpace.y, normalObjSpace.z, 0];
    normalArr = math.multiply(cuboid.R, math.multiply(cuboid.SInv, normalArr));
    normalArr = normalArr.valueOf();
    var normal = {x: normalArr[0], y: normalArr[1], z: normalArr[2]};

    return Vector.unitVector(normal);
}

