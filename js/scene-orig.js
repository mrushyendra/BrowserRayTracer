
function parseSceneDescr(sceneRaw){
  return JSON.parse(sceneRaw);
}

// ## The Camera
//
// Our camera is pretty simple: it's a point in space, where you can imagine
// that the camera 'sits', a `fieldOfView`, which is the angle from the right
// to the left side of its frame, and a `vector` which determines what
// angle it points in.

// updated for Assn 6 so that camera.vector is more descriptively camera.toPoint
// updated for Assn 6 so that there is a camera.up instead of using vector.UP

/*
scene.camera = {
// the eye location
    point: {
        x: 50,
        y: 50,
        z: 400
    },
    fieldOfView: 40,
// point indicated direction of view
    toPoint: {
        x: 50,
        y: 50,
        z: 0
    },
// added explicitly (this was always the up direction before)
    up: {
	x: 0,
	y: 1,
	z: 0
    }
};

// ## Lights
//
// Lights are defined only as points in space - surfaces that have lambert
// shading will be affected by any visible lights.
// updated so that lights have a type and color 

scene.lights = [

   {
// a light in center and above
// omni is visible in all directions, no fall-off
   type: 'omni',
   point: {
    x: 50,
    y: 95,
    z: 50
    },
// green,  bright
   color: {
   x: 100,
   y: 255,
   z: 50
   },
  
},
// front and in the upper left
// bright, reddish 
   {
   type: 'omni',
   point: {
    x: 5,
    y: 95,
    z: 100
    },
   color: {
   x: 255,
   y: 120,
   z: 100
   },
  
}, 
// front and lower right
// bluish 
 {
   type: 'omni',
   point: {
    x: 95,
    y: 5,
    z: 100
    },
   color: {
   x: 50,
   y: 50,
   z: 200
   },

},
];

// ## Objects
//
// This raytracer handles sphere objects, with any color, position, radius,
// and surface properties.
// updated so that objects and their materials are defined separately

scene.objects = [

// our main test objects
// are spheres sitting on the floor
  
       
    {
        type: 'spherelong',
        point: {
            x: 70,
            y: 25,
            z: 50
        },
        mat: 0,
        radius: 25
    },

    {
        type: 'spherelong',
        point: {
            x: 20,
            y: 10,
            z: 50
        },
        mat: 0,
        radius: 10
    },

{
        type: 'spherelong',
        point: {
            x: 60,
            y: 60,
            z: 60
        },
        mat: 0,
        radius: 5
    },

{
        type: 'spherelong',
        point: {
            x: 20,
            y: 30,
            z: 60
        },
        mat: 0,
        radius: 5
    },
// back wall, ceiling and floor are white
// these won't show up until triangle intersection is implemented

// back wall
{
	type: 'triangle',
	point1: {
	x: 0, y: 0, z: 0
	},
	point2: {
	x: 100, y: 0, z: 0
	},
	point3: {
	x: 0, y: 100, z: 0
	},
	mat: 1
},
{
	type: 'triangle',
	point1: {
	x: 100, y: 0, z: 0
	},
	point2: {
	x: 100, y: 100, z: 0
	},
	point3: {
	x: 0, y: 100, z: 0
	},
	mat: 1
},
// floor
{
	type: 'triangle',
	point1: {
	x: 0, y: 0, z: 0
	},
	point2: {
	x: 0, y: 0, z: 100
	},
	point3: {
	x: 100, y: 0, z: 100
	},
	mat: 1
},
{
	type: 'triangle',
	point1: {
	x: 100, y: 0, z: 100
	},
	point2: {
	x: 100, y: 0, z: 0
	},
	point3: {
	x: 0, y: 0, z: 0
	},
	mat: 1
},
// ceiling
{
	type: 'triangle',
	point1: {
	x: 0, y: 100, z: 0
	},
	point2: {
        x: 100, y: 100, z: 0
	},
	point3: {
        x: 100, y: 100, z: 100	
	},
	mat: 1
},
{
	type: 'triangle',
	point1: {
	x: 100, y: 100, z: 100
	},
	point2: {
	x: 0, y:100, z: 100
	},
	point3: {
	x: 0, y: 100, z: 0
	},
	mat: 1
},

// left wall, red

{
	type: 'triangle',
	point1: {
	x: 0, y: 0, z: 0
	},
	point2: {
        x: 0, y: 100, z: 0
	},
	point3: {
        x: 0, y: 100, z: 100	
	},
	mat: 2
},
{
	type: 'triangle',
	point1: {
	x: 0, y: 100, z: 100
	},
	point2: {
	x: 0, y:0, z: 100
	},
	point3: {
	x: 0, y: 0, z: 0
	},
	mat: 2
},


// right wall, blue

{
	type: 'triangle',
	point1: {
	x: 100, y: 0, z: 0
	},
	point2: {
        x: 100, y: 0, z: 100
	},
	point3: {
        x: 100, y: 100, z: 100	
	},
	mat: 3
},
{
	type: 'triangle',
	point1: {
	x: 100, y: 100, z: 100
	},
	point2: {
	x: 100, y:100, z: 0
	},
	point3: {
	x: 100, y: 0, z: 0
	},
	mat: 3
}

];

// type can include specular, lambertian and ambient

scene.mats = [
// material 0

{
	type: 'orig',
	color: {
               x: 255,
               y: 255,
               z: 255
        	},
        specular: 0.9,
        lambert: 0.0,
        ambient: 0.00
},
// material 1
// diffuse white
{
	type: 'orig',
	color: {
               x: 255,
               y: 255,
               z: 255
        	},
       specular: 0.0,
        lambert: 0.9,
        ambient: 0.05
},
// material 2
// diffuse red
{
	type: 'orig',
	color: {
		x: 255,
		y: 90,
		z: 90
		},
        specular: 0.,
	lambert: 0.9,
	ambient: 0.1
},
// material 3
//diffuse blue
{
	type: 'orig',
	color: {
		x: 90,
		y: 90,
		z: 255
		},
        specular: 0.0,
	lambert: 0.9,
	ambient: 0.0
},
// material 4
//mirror
{
	type: 'orig',
	color: {
		x: 255,
		y: 255,
		z: 255
		},
        specular: 0.9,
	lambert: 0.05,
	ambient: 0.05
}
]
*/

