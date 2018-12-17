// # Raytracing
// Code modified from the Literate Raytracer
// https://github.com/tmcw/literate-raytracer

/*
 * Globals
 */

var c = document.getElementById('c'),
    width = 640, // * 0.5,
    height = 480 ; // * 0.5;

c.width = width;
c.height = height;

var ctx = c.getContext('2d');
var data = ctx.getImageData(0, 0, width, height);

var scene = {};

//Array to hold the saved frames
var frames = [];

//Setup event handler to read file when uploaded
document.getElementById('sceneDescrUpload').addEventListener('change', handleFileSelect, false);

//https://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-reading-files
//Read file data and call parseSceneDescr on the raw string to save as a Scene object
function handleFileSelect(evt){
  var files = evt.target.files;
  if(files.length < 1){
    console.log("No file detected");
    return;
  }

  var fileReader = new FileReader();
  fileReader.onload = function(e){scene = loadScene(e.target.result);}
  fileReader.readAsText(files[0]);
}

function loadScene(sceneRaw){
    var scene = parseSceneDescr(sceneRaw);

    precomputeTransformations(scene);

    //load textures
    for(var i = 0; i < scene.textures.length; ++i){
        var img = new Image();
        img.onload = (function(value) {
                return function(){
                    this.textureIdx = value;
                    var textureCanvas = document.createElement('canvas');
                    textureCanvas.width = this.width;
                    textureCanvas.height = this.height;
                    textureCanvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height);
                    scene.textures[this.textureIdx].width = this.width;
                    scene.textures[this.textureIdx].height = this.height;
                    scene.textures[this.textureIdx].data = textureCanvas.getContext('2d').getImageData(0,0,this.width, this.height);
                }
        })(i);
        img.src = scene.textures[i].url;
    }

    //function pointers to functions that update translation and rotation factors of an object based on the timestep
    scene.updatePosFns = {
        "sphere" : updateSphere,
        "triangle" : updateTri,
        "plane" : updatePlane,
        "cuboid" : updateCuboid,
        "cone" : updateCone,
        "spheretex" : updateSphere,
        "spherelong" : updateSphere,
        "cylinder" : updateCylinder
    };

    scene.mapTextureFns = {
        "sphere" : sphereColor,
        "triangle" : triangleColor,
        "plane" : planeColor,
        "cuboid" : cuboidColor,
        "cone" : coneColor,
        "spheretex" : sphereColor,
        "spherelong" : sphereColor,
        "cylinder" : cylinderColor
    };

    return scene;
}

function parseSceneDescr(sceneRaw){
  return JSON.parse(sceneRaw);
}

function precomputeTransformations(scene){
    //precompute and store the required transformation matrices and their inverses
    for(var i = 0; i < scene.objects.length; ++i){
        if((scene.objects[i].type == "cone") || (scene.objects[i].type == "cylinder") || (scene.objects[i].type == "cuboid") ||
        (scene.objects[i].type == "plane")){
            //store angles for for easy reference and convert to radians
            var rx = (scene.objects[i].rx/180)*Math.PI ; var ry = (scene.objects[i].ry/180)*Math.PI; var rz = (scene.objects[i].rz/180)*Math.PI;

            scene.objects[i].R = math.matrix([[Math.cos(ry)*Math.cos(rz), -Math.cos(rx)*Math.sin(rz) + Math.sin(rx)*Math.sin(ry)*Math.cos(rz), 
                    Math.sin(rx)*Math.sin(rz) + Math.cos(rx)*Math.sin(ry)*Math.cos(rz), 0],
                    [Math.cos(ry)*Math.sin(rz), Math.cos(rx)*Math.cos(rz) + Math.sin(rx)*Math.sin(ry)*Math.sin(rz),
                    -Math.sin(rx)*Math.cos(rz) + Math.cos(rx)*Math.sin(ry)*Math.sin(rz),0],
                    [-Math.sin(ry), Math.sin(rx)*Math.cos(ry), Math.cos(rx)*Math.cos(ry), 0],
                    [0, 0, 0, 1]]);
            scene.objects[i].RInv = math.transpose(scene.objects[i].R);

            //TInv - Inverse translation matrix, RInv - Inverse rotation matrix, SInv - Inverse scaling matrix
            scene.objects[i].TInv = math.matrix([[1,0,0,-scene.objects[i].Tx], [0,1,0,-scene.objects[i].Ty], [0,0,1, -scene.objects[i].Tz], [0,0,0,1]]);
            scene.objects[i].SInv = math.matrix([[1/scene.objects[i].sx, 0, 0, 0], [0, 1/scene.objects[i].sy, 0, 0], 
                    [0,0,1/scene.objects[i].sz, 0], [0,0,0,1]]);
            //precompute S^-1 * R^-1 * T^-1 and S^-1 & R^-1
            scene.objects[i].SRTInv = math.multiply(scene.objects[i].SInv, math.multiply(scene.objects[i].RInv, scene.objects[i].TInv));
            scene.objects[i].SRInv = math.multiply(scene.objects[i].SInv, scene.objects[i].RInv);
        }
    }
}

function downloadFrames(frames){
    var link = document.getElementById('downloadLink');
    for(var frame = 0; frame < frames.length; ++frame){
        var fileName = 'frame' + (frame+1) + '.png';
        link.setAttribute('download', fileName);
        link.setAttribute('href', frames[frame]);
        link.click();
    }
}
