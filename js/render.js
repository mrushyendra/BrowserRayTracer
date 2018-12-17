
function render(scene) {
    //unpack the scene to make it easier to reference
    console.log(scene);
    var camera = scene.camera,
        objects = scene.objects,
        lights = scene.lights;

    var octree = new Octree(new Point(0,0,0), {x: width, y: height, z: 500});
    octree.insertObjects(objects);
    var img = [ ];
    var img2 = [ ];

    var eyeVector = Vector.unitVector(Vector.subtract(camera.toPoint, camera.point)),
        vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, camera.up)),
        vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector)),

        fovRadians = Math.PI * (camera.fieldOfView / 2) / 180,
        heightWidthRatio = height / width,
        halfWidth = Math.tan(fovRadians),
        halfHeight = heightWidthRatio * halfWidth,
        camerawidth = halfWidth * 2,
        cameraheight = halfHeight * 2,
        pixelWidth = camerawidth / (width - 1),
        pixelHeight = cameraheight / (height - 1);

    var index, color;
    var ray = {
        point: camera.point
    };

    var N = parseInt(document.getElementById('N').value);
    var timeStep = 10;
    if(N < 1 || N > 20){
        console.log("Too few/many frames to save"); //debug
        N = 1; //default
    }

    for(var frame = 0; frame < N; ++frame){

        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
              // turn the raw pixel `x` and `y` values into values from -1 to 1
              // and use these values to scale the facing-right and facing-up
              // vectors so that we generate versions of the `eyeVector` that are
              // skewed in each necessary direction.

                color = Vector.ZERO;
              
            //antialiasing by shooting multiple rays per pixel
              for (var s = -.4; s < .5; s+=.4) {
                    for (var r = -.4; r < .5; r +=.4) {
                  var xcomp = Vector.scale(vpRight, ((x+s) * pixelWidth) - halfWidth);
                  var ycomp = Vector.scale(vpUp, ((y+r) * pixelHeight) - halfHeight);

                  ray.vector = Vector.unitVector(Vector.add3(eyeVector, xcomp, ycomp));

                  // use the vector generated to raytrace the scene, returning a color
                  // as a `{x, y, z}` vector of RGB values
                  color = Vector.add(color, trace(ray, scene, octree, 0));
                } 
              }
              
              color = Vector.scale(color, 0.1111111); 
              index = (x  * 3) + (y * width*  3);
              img[index + 0] = color.x;
              img[index + 1] = color.y;
              img[index + 2] = color.z;

            }
        }
        // adjust so fits into 0 to 255
        img2 = tone_map(img);

        //reverse direction of image to make it appear right side up, since canvas is computed top-down, with (0,0) at top left
        for(x=0;x<width;x++){
          for(y=0;y <height;y++){
            index = (x * 3) + (y* width  * 3);
            d_index = (x * 4) + ((height-1 -y)* width * 4);
            data.data[d_index + 0] = img2[index+ 0];
            data.data[d_index + 1] = img2[index +1];
            data.data[d_index + 2] = img2[index+2];
            data.data[d_index + 3] = 255;
          }
        } 

        ctx.putImageData(data, 0, 0);
        //save as image
        frames.push(c.toDataURL("image/png").replace("image/png", "image/octet-stream"));

        
        scene = updateScene(scene, timeStep);
        objects = scene.objects;
        octree = new Octree(new Point(0,0,0), {x: width, y: height, z: 500});
        octree.insertObjects(objects);    
        
    }

    //make download button available once all frames have been created
    document.getElementById('downloadBtn').style.display = "block";
}

function updateScene(scene, timeStep){
    for(var i = 0; i < scene.objects.length; ++i){
        scene.updatePosFns[scene.objects[i].type](scene.objects[i], timeStep); //call function for respective shape to update its position in the scene
    }
    precomputeTransformations(scene); //recompute the matrix transformations for primitives
    return scene;
}

