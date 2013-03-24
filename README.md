# webDICOM

Implementation of a web-based DICOM viewer as part of my Bachelor's thesis. Following features will be implemented:
- Loading and displaying DICOM images by specifying files or a directory
- Scrolling through the images
- Changing the windowing function
- Zoom
- Move
- Panning 
- Gallery view as a ribbon on the bottom
- Displaying patient information in the corners
- 3D view with webGL


##Visualization
The visualisation of DICOM images is done with HTML5 <canvas> and WebGL. 

##Browser support
Any WebGL and HTML5 enabled browser should work. Tested with Chrome, Firefox and Safari (Mac OS X). But best performance and user expierence with Google Chrome v25.

##Status
There is still work in progress, but basic functionality is in place. TODOs include:
- compressed DICOMs (JPEG, JPEG2000, JPEG-LS)
- WebGL visualisation
- Patient data
- Gallery view

##Demo
A demo of my work so far can be found [here](http://mi-kas.github.com/webDICOM/).