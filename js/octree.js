/*
 * Assumes each object has a boundingBoxPos and boundingBoxDim property
 * Assumes if object passed to insert object fits inside octree
 */

function Point(x,y,z){
  this.x = x;
  this.y = y;
  this.z = z;
}

function BoundingBox(pos, xDim, yDim, zDim){
  this.pos = pos;//top left front corner - add x/y/z to get other limits of box
  this.dim = {
    x : xDim,
    y : yDim,
    z : zDim
  };

  //check if bounding box of object fits within bounding box. Return -1 if it does not
  this.fits = function(object){
    if(object.boundingBoxPos.x < this.pos.x || object.boundingBoxPos.y < this.pos.y ||
      object.boundingBoxPos.z < this.pos.z){
      return -1;
    }
    if(((object.boundingBoxPos.x + object.boundingBoxDim.x) > (this.pos.x + this.dim.x)) ||
      ((object.boundingBoxPos.y + object.boundingBoxDim.y) > (this.pos.y + this.dim.y)) ||
      ((object.boundingBoxPos.z + object.boundingBoxDim.z) > (this.pos.z + this.dim.z))){
      return -1;
    }

    return 1;
  }
}

function Octree(boundingBoxPos, boundingBoxDim){
    this.boundingBoxPos = boundingBoxPos; //bottom left front corner - add boundingBoxDim to Pos to get limits of box
    this.boundingBoxDim = boundingBoxDim;
    this.objects = []; //array of objects in the bounding box which do not fit completely into any child
    this.children = [-1,-1,-1,-1,-1,-1,-1,-1]; //child octrees, -1 if no octree yet built for that sub-volume
    this.parentOctree = null;

    //bounding volumes and positions of child octants
    this.octants = [];
    this.octants[0] = new BoundingBox(boundingBoxPos, boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[1] = new BoundingBox(new Point(boundingBoxPos.x + boundingBoxDim.x/2, boundingBoxPos.y, boundingBoxPos.z), 
            boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[2] = new BoundingBox(new Point(boundingBoxPos.x, boundingBoxPos.y + boundingBoxDim.y/2, boundingBoxPos.z), 
            boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[3] = new BoundingBox(new Point(boundingBoxPos.x + boundingBoxDim.x/2, boundingBoxPos.y + boundingBoxDim.y/2, 
                boundingBoxPos.z), boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[4] = new BoundingBox(new Point(boundingBoxPos.x, boundingBoxPos.y, boundingBoxPos.z + boundingBoxDim.z/2), 
            boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[5] = new BoundingBox(new Point(boundingBoxPos.x + boundingBoxDim.x/2, boundingBoxPos.y, boundingBoxPos.z + boundingBoxDim.z/2), 
            boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[6] = new BoundingBox(new Point(boundingBoxPos.x, boundingBoxPos.y + boundingBoxDim.y/2, boundingBoxPos.z + boundingBoxDim.z/2), 
            boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);
    this.octants[7] = new BoundingBox(new Point(boundingBoxPos.x + boundingBoxDim.x/2, boundingBoxPos.y + boundingBoxDim.y/2, boundingBoxPos.z + 
                boundingBoxDim.z/2), boundingBoxDim.x/2, boundingBoxDim.y/2, boundingBoxDim.z/2);

    //Function pointers to object intersection functions
    this.intersectionFns = {
        "sphere" : sphereIntersection,
        "spheretex" : sphereIntersection,
        "spherelong" : sphereIntersection,
        "triangle" : triIntersection,
        "cuboid" : cuboidIntersection,
        "cone" : coneIntersection,
        "cylinder" : cylinderIntersection,
        "plane" : planeIntersection
    }

    //insert single object into octree
    this.insertObject = function(object, depth){
        var inserted = false;
        //check each child octant to see if object fits completely in octant. If it does, insert object recursively

        if(depth < 4){
          for(var j = 0; j < this.octants.length; ++j){
            if(this.octants[j].fits(object) != -1){
              if(this.children[j] == -1){
                this.children[j] = new Octree(this.octants[j].pos, this.octants[j].dim);
              } 
              this.children[j].insertObject(object, depth++);
              inserted = true;
              break;
            }
          }
        }


        //object does not fit completely into any child octant, so insert into octree's objects array
        if(!inserted){
          this.objects.push(object);
        }
    }

    //insert multiple objects into octree at once
    this.insertObjects = function(objects){
        for(var i = 0; i < objects.length; ++i){
          this.insertObject(objects[i],0);
        }
    }
      
    //check if ray intersects any object in octree, return [distance, object] array if it does. Else
    //return [inf, null]
    this.intersectOctree = function(ray){ //ray = p + td; where d is the direction
        var intersection = [Infinity, null, null];
        //check intersection with each object in current octree's object list
        for(var i = 0; i < this.objects.length; ++i){
            //intersect with bounding box first
            var boxIntersection = this.intersectBox(ray, this.objects[i].boundingBoxPos, this.objects[i].boundingBoxDim);
            //check if current intersection is nearer than previous intersection
            if(boxIntersection[0] && boxIntersection[1] < intersection[0]){         
                var shapeIntersectFn = this.intersectionFns[this.objects[i].type];
                //returns array of [distance, intersectPtObjSpace] of intersection pt w/ shape
                var shapeIntersection = shapeIntersectFn(this.objects[i], ray);                 
                if(shapeIntersection){
                  shapeIntersection.push(this.objects[i]);
                  intersection = shapeIntersection; //return array of [distance, normal, object]
                }
            }
        }
        /*
         * Not used
         * reduces number of intersections with child octants to max of 3
        var testRay = ray;
        for(var i = 0; i < 3; ++i){
            var xSide = 0; var ySide = 0; var zSide = 0;
            if(testRay.point.x >= (this.boundingBoxPos.x + (this.boundingBoxDim.x/2))){
                xSide = 1;
            }
            if(testRay.point.y >= (this.boundingBoxPos.y + (this.boundingBoxDim.y/2))){
                ySide = 1;
            }
            if(testRay.point.z >= (this.boundingBoxPos.z + (this.boundingBoxDim.z/2))){
                zSide = 1;
            }
            var childOctantIdx = (xSide << 3) & (ySide << 2) & (zSide);

            if(!(this.children[childOctantIdx] == -1)){
                //var boxIntersection = this.intersectBox(ray, this.children[childOctantIdx].boundingBoxPos, this.children[childOctantIdx].boundingBoxDim);
                //if(boxIntersection[0] && boxIntersection[1] < intersection[0]){ //check if current intersection is nearer than previous intersection
                    //check if ray intersects any object in child octant
                    octantIntersection = this.children[childOctantIdx].intersectOctree(testRay);
                    if(octantIntersection[0] < intersection[0]){
                       return octantIntersection;
                    }
                //}
            }

            //intersect with three planes that divide the child octants in order to find intersection point, if any with the other octants
            var t1 = ((this.boundingBoxPos.x + (this.boundingBoxDim.x/2)) - testRay.point.x)/testRay.vector.x; 
            var intersectionPtX = Vector.add(testRay.point, Vector.scale(testRay.vector, t1));
            if(t1 <= 0){
               t1 = Infinity;
            }
            if((intersectionPtX.y < this.boundingBoxPos.y) || (intersectionPtX.y > (this.boundingBoxPos.y + this.boundingBoxDim.y))){
               t1 = Infinity; 
            } else if ((intersectionPtX.z < this.boundingBoxPos.z) || (intersectionPtX.z > (this.boundingBoxPos.z + this.boundingBoxDim.z))){
               t1 = Infinity;
            }

            var t2 = ((this.boundingBoxPos.y + (this.boundingBoxDim.y/2)) - testRay.point.y)/testRay.vector.y; 
            var intersectionPtY = Vector.add(testRay.point, Vector.scale(testRay.vector, t2));
            if(t2 <= 0){
               t2 = Infinity;
            }
            if((intersectionPtY.x < this.boundingBoxPos.x) || (intersectionPtY.x > (this.boundingBoxPos.x + this.boundingBoxDim.x))){
               t2 = Infinity;
            } else if ((intersectionPtY.z < this.boundingBoxPos.z) || (intersectionPtY.z > (this.boundingBoxPos.z + this.boundingBoxDim.z))){
               t2 = Infinity;
            }

            var t3 = ((this.boundingBoxPos.z + (this.boundingBoxDim.z/2)) - testRay.point.z)/testRay.vector.z; 
            var intersectionPtZ = Vector.add(testRay.point, Vector.scale(testRay.vector, t3));
            if(t3 <= 0){
               t3 = Infinity;
            }
            if((intersectionPtZ.x < this.boundingBoxPos.x) || (intersectionPtZ.x > (this.boundingBoxPos.x + this.boundingBoxDim.x))){
               t3 = Infinity;
            } else if ((intersectionPtZ.y < this.boundingBoxPos.y) || (intersectionPtZ.y > (this.boundingBoxPos.y + this.boundingBoxDim.y))){
               t3 = Infinity;
            }

            var t = Math.min(t1,t2,t3);
            if(t == Infinity){
                break;
            }
            testRay.point = Vector.add(testRay.point, Vector.scale(testRay.vector, t));
        }
        */

       
        //test intersection with each child octant
        for(var i = 0; i < this.children.length; ++i){
            if(this.children[i] == -1){
              continue;
            }
            var boxIntersection = this.intersectBox(ray, this.children[i].boundingBoxPos, this.children[i].boundingBoxDim);
            if(boxIntersection[0] && boxIntersection[1] < intersection[0]){ //check if current intersection is nearer than previous intersection
                //check if ray intersects any object in child octant
                octantIntersection = this.children[i].intersectOctree(ray);
                if(octantIntersection[0] < intersection[0]){
                    intersection = octantIntersection;
                }
            }
        }  
        

        return intersection;
    }

    //checks intersection of ray with a bounding box, return a tuple (intersect, t), where intersect is
    //true/false and t is the distance from ray.point to bounding box if it intersects
    //https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    this.intersectBox = function(ray, boundingBoxPos, boundingBoxDim){
        //r + td = x, (x-r)/d = t
        var txMin = (boundingBoxPos.x - ray.point.x)/ray.vector.x;
        var txMax = (boundingBoxPos.x + boundingBoxDim.x - ray.point.x)/ray.vector.x;
        if(txMin > txMax){
          var tmp = txMin;
          txMin = txMax;
          txMax = tmp;
        }

        var tyMin = (boundingBoxPos.y - ray.point.y)/ray.vector.y;
        var tyMax = (boundingBoxPos.y + boundingBoxDim.y - ray.point.y)/ray.vector.y;
        if(tyMin > tyMax){
          var tmp = tyMin;
          tyMin = tyMax;
          tyMax = tmp;
        }

        if((txMin > tyMax) || (tyMin > txMax)){
          return [false, 0];
        }

        if(tyMin > txMin){
          txMin = tyMin;
        }

        if(tyMax < txMax){
          txMax = tyMax;
        }

        var tzMin = (boundingBoxPos.z - ray.point.z)/ray.vector.z;
        var tzMax = (boundingBoxPos.z + boundingBoxDim.z - ray.point.z)/ray.vector.z;
        if(tzMin > tzMax){
          var tmp = tzMin;
          tzMin = tzMax;
          tzMax = tmp;
        }

        if((txMin > tzMax) || (tzMin > txMax)){
          return [false, 0];
        }

        if(tzMin > txMin){
          txMin = tzMin;
        }

        if(tzMax < txMax){
          txMax = tzMax;
        }

        return [true, txMin]; 
    }
}


