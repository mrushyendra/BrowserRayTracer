// ## Detecting collisions against a cone

/*
 * apex : {x,y,z}
 * axis : {x,y,z}
 * axisLength
 * theta
 */

function coneIntersection(cone, ray) {
    
    /*
    //non-axis aligned cone
    //https://www.maths.tcd.ie/~dwmalone/p/rt95.pdf
    var alpha = Math.cos((cone.theta/180)*Math.PI);
    var alphaSq = alpha*alpha;

    var a = alphaSq - Math.pow(Vector.dotProduct(ray.vector, cone.axis), 2);
    var b = 2*(alphaSq*(Vector.dotProduct(Vector.subtract(ray.point, cone.apex),ray.vector)) - (Vector.dotProduct(ray.vector, cone.axis) * 
                Vector.dotProduct(Vector.subtract(ray.point, cone.apex), cone.axis)));
    var c = alphaSq - Math.pow(Vector.dotProduct(Vector.subtract(ray.point, cone.apex),cone.axis),2);

    var discriminant = (b*b) - (4*a*c);
    if(discriminant < 0) return;

    var t1 = (-b + Math.sqrt(discriminant))/(2*a);
    var t2 = (-b - Math.sqrt(discriminant))/(2*a);
    
    var t = t1;
    if(t < 0){
        t = t2;
    }
    if(t < 0){
        return;
    }

    var intersectionPt = Vector.add(ray.point, Vector.scale(ray.vector, t));
    var b = Vector.subtract(intersectionPt, cone.apex); //vector from apex to intersection pt
    var lenAxis = Vector.length(b)*alpha;
    if(lenAxis > cone.axisLength)
        return;
    */
    
    //axis aligned cone along y axis
    var a = (ray.vector.x*ray.vector.x) + (ray.vector.z*ray.vector.z) - (ray.vector.y*ray.vector.y);
    var b = (2*ray.point.x*ray.vector.x + 2*ray.point.z*ray.vector.z - 2*ray.point.y*ray.vector.y);
    var c = (ray.point.x*ray.point.x) + (ray.point.z*ray.point.z) - (ray.point.y*ray.point.y);

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

    var intersectionPt = Vector.add(ray.point, Vector.scale(ray.vector, t));
    if((intersectionPt.y < cone.yMin) || (intersectionPt.y > cone.yMax)){
        return; //outside the finite cone
    }
    
    return Vector.length(Vector.scale(ray.vector, t));
}

function coneNormal(cone, pos) {
    var alpha = Math.cos((cone.theta/180)*Math.PI);
    var hyp = Vector.length(Vector.subtract(pos, cone.apex))/alpha;
    var b = Vector.add(cone.apex, Vector.scale(cone.axis, hyp));
    var normal = Vector.subtract(pos, b);

    return Vector.unitVector(normal);
}
