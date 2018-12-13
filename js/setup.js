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

// # The Scene
// In this file, the original red/blue/white room with overhead white light, and orange and blue corner lights
var scene = {};

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

    //add the required transformation matrices and their inverses
    for(var i = 0; i < scene.objects.length; ++i){
        if((scene.objects[i].type == "cone") || (scene.objects[i].type == "cylinder") || (scene.objects[i].type == "cuboid") ||
        (scene.objects[i].type == "plane")){
            scene.objects[i].R = math.matrix([[Math.cos(scene.objects[i].rz), -Math.sin(scene.objects[i].rz), 0, 0], 
                    [Math.sin(scene.objects[i].rz), Math.cos(scene.objects[i].rz), 0, 0], [0,0,1,0], [0,0,0,1]]);
            //TInv - Inverse translation matrix, RInv - Inverse rotation matrix, SInv - Inverse scaling matrix
            scene.objects[i].TInv = math.matrix([[1,0,0,-scene.objects[i].Tx], [0,1,0,-scene.objects[i].Ty], [0,0,1, -scene.objects[i].Tz], [0,0,0,1]]);
            scene.objects[i].RInv = math.matrix([[Math.cos(-scene.objects[i].rz), -Math.sin(-scene.objects[i].rz), 0, 0], 
                    [Math.sin(-scene.objects[i].rz), Math.cos(-scene.objects[i].rz), 0, 0], [0,0,1,0], [0,0,0,1]]);
            scene.objects[i].SInv = math.matrix([[1/scene.objects[i].sx, 0, 0, 0], [0, 1/scene.objects[i].sy, 0, 0], 
                    [0,0,1/scene.objects[i].sz, 0], [0,0,0,1]]);
            //precompute S^-1 * R^-1 * T^-1 and S^-1 & R^-1
            scene.objects[i].SRTInv = math.multiply(scene.objects[i].SInv, math.multiply(scene.objects[i].RInv, scene.objects[i].TInv));
            scene.objects[i].SRInv = math.multiply(scene.objects[i].SInv, scene.objects[i].RInv);
        }
    }

    //load textures
    for(var i = 0; i < scene.textures.length; ++i){
        var img = new Image();
        img.src = scene.textures[i].url;
        img.textureIdx = i;
        img.onload = function() {
            var textureCanvas = document.createElement('canvas');
            textureCanvas.width = img.width;
            textureCanvas.height = img.height;
            textureCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
            scene.textures[img.textureIdx].width = img.width;
            scene.textures[img.textureIdx].height = img.height;
            scene.textures[img.textureIdx].data = textureCanvas.getContext('2d').getImageData(0,0,img.width, img.height);
        }
    }

    return scene;
}

function parseSceneDescr(sceneRaw){
  return JSON.parse(sceneRaw);
}
