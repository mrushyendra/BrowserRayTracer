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
  fileReader.onload = function(e){scene = parseSceneDescr(e.target.result);}
  fileReader.readAsText(files[0]);
}

function parseSceneDescr(sceneRaw){
  return JSON.parse(sceneRaw);
}
