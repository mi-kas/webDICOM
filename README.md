# webDICOM

Implementation of a web-based (JavaScript and HTML5 only) DICOM viewer as part of my Bachelor's thesis. 
Following features will be implemented:
- Loading and displaying DICOM images by specifying files or a directory
- Scrolling through the images
- Changing the windowing function
- Zoom
- Move
- Panning 
- Displaying patient information in the corners

The user can upload a folder with DICOM images. The files are then parsed and sorted by patient's name & 
series description and viewed in a tree view. By clicking on a series, the images are displayed in the viewer.

##Visualization
The visualisation of DICOM images is done with the HTML5 <canvas> element. 

##Browser support
Best performance and user expierence with Google Chrome. HTML5 Upload Folder (webkitdirectory) works only with Chrome. 
Other browsers accept multiple files.

##Status
There is still work in progress, but basic functionality is in place. TODOs include:
- compressed DICOMs (JPEG, JPEG2000, JPEG-LS)
- WebGL visualisation
- Gallery view

##Demo
A demo can be found [here](http://mi-kas.github.com/webDICOM/).