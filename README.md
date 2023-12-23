## About

A ray tracer written in native JavaScript that should run on any mainstream browser. Features include antialiasing, Fresnel reflection and refraction, texture mapping, glossy reflectance, and multiple geometric primitives at arbitrary positions and orientations. Reads in scene descriptions from json files, and implements an octree to accelerate rendering of primitives.

![Sample rendered image](results/rayTracerRes.png?raw=true "Sample Rendered Image")

## Instructions

1. Clone the project
2. Navigate to the folder
3. Setup a simple [local HTTP server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server)
        `python3 -m http.server`
4. Open a web browser and navigate to `localhost:<port number>/renderme.html`
5. Upload any sample file from the 'sceneDescriptions' folder
6. Select 'Render'

To save multiple images of a scene at regular time steps, enter the number of frames you wish to save in the appropriate input box on the page. Note that rendering each frame might take quite while depending on your PC. Once you have rendered an image, refresh the  webpage if you wish to render a different image.




