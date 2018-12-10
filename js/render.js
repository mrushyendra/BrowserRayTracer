
function render(scene) {
    // first 'unpack' the scene to make it easier to reference
    console.log(scene);
    var camera = scene.camera,
        objects = scene.objects,
        lights = scene.lights;

    var octree = new Octree(new Point(0,0,0), {x: width, y: height, z: 500});
    octree.insertObjects(objects);
    var img = [ ];
    var img2 = [ ];

    // This process
    // is a bit odd, because there's a disconnect between pixels and vectors:
    // given the left and right, top and bottom rays, the rays we shoot are just
    // interpolated between them in little increments.
    //
    // Starting with the height and width of the scene, the camera's place,
    // direction, and field of view, we calculate factors that create
    // `width*height` vectors for each ray

    // Start by creating a simple vector pointing in the direction the camera is
    // pointing - a unit vector

    var eyeVector = Vector.unitVector(Vector.subtract(camera.toPoint, camera.point)),
        // and then we'll rotate this by combining it with a version that's turned
        // 90° right and one that's turned 90° up. 
        // we use a pure 'UP' vector to turn the camera right, and that 'right'
        // vector to turn the camera up.
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
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
          // turn the raw pixel `x` and `y` values into values from -1 to 1
          // and use these values to scale the facing-right and facing-up
          // vectors so that we generate versions of the `eyeVector` that are
          // skewed in each necessary direction.

          // For Assign 5, brute-force antialiasing with 9 samples/pixel
	        color = Vector.ZERO;
          
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

    // we computed from the bottom of the image up
    // image on the canvas has top row written first
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
}


