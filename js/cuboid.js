// ## Detecting collisions against a cuboid

function cuboidIntersection(cuboid, ray) {
    //r + td = x, (x-r)/d = t
    var txMin = (cuboid.pos.x - ray.point.x)/ray.vector.x;
    var txMax = (cuboid.pos.x + cuboid.dim.x - ray.point.x)/ray.vector.x;
    if(txMin > txMax){
      var tmp = txMin;
      txMin = txMax;
      txMax = tmp;
    }

    var tyMin = (cuboid.pos.y - ray.point.y)/ray.vector.y;
    var tyMax = (cuboid.pos.y + cuboid.dim.y - ray.point.y)/ray.vector.y;
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

    var tzMin = (cuboid.pos.z - ray.point.z)/ray.vector.z;
    var tzMax = (cuboid.pos.z + cuboid.dim.z - ray.point.z)/ray.vector.z;
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
    var center = Vector.add(cuboid.pos, Vector.scale(cuboid.dim, 2));
    var center2Pos = Vector.subtract(pos, center);

    var xDistance = Math.abs(cuboid.dim.x - Math.abs(center2Pos.x));
    var min = Infinity;
    if(xDistance < min){
        min = xDistance;
        normal = {x: 1, y: 0, z: 0};
        if(center2Pos.x < 0)
            Vector.scale(normal, -1);
    }

    var yDistance = Math.abs(cuboid.dim.y - Math.abs(center2Pos.y));
    if(yDistance < min){
        min = yDistance;
        normal = {x: 0, y: 1, z: 0};
        if(center2Pos.y < 0)
            Vector.scale(normal, -1);
    }

    var zDistance = Math.abs(cuboid.dim.z - Math.abs(center2Pos.z));
    if(zDistance < min){
        min = zDistance;
        normal = {x: 0, y: 0, z: 1};
        if(center2Pos.z < 0)
            Vector.scale(normal, -1);
    }
    return normal;
}

