// # Raytracing
// Code modified from the Literate Raytracer
// https://github.com/tmcw/literate-raytracer

// # Setup modified to get rid of chunky pixels that were scaled
var c = document.getElementById('c'),
    width = 640, // * 0.5,
    height = 480 ; // * 0.5;

// Get a context in order to generate a proper data array. We aren't going to
// use traditional Canvas drawing functions like `fillRect` - instead this
// raytracer will directly compute pixel data and then put it into an image.
c.width = width;
c.height = height;
// c.style.cssText = 'width:' + (width * 2) + 'px;height:' + (height*2) + 'px';
var ctx = c.getContext('2d'),
    data = ctx.getImageData(0, 0, width, height);






