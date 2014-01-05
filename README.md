# webDICOM

Implementation of a web-based (JavaScript and HTML5 only) DICOM viewer as part of my Bachelor's thesis. 
Features:
- Load and display DICOM images by specifying a directory 
- Sort images by patient’s name and study’s name
- Show sorted images in a tree–view
- Scrolling through images of a series
- Changing the windowing function 
- Zoom
- Move
- Length measurement
- 1×1, 1×2, 2×2 and 4×4 grid–view
- Show patient and study information in the corners 
- Display all DICOM attributes of the image
- Reset functionality

The user can upload a folder with DICOM images. The files are then parsed and sorted by patient's name & 
series description and viewed in a tree view. By clicking on a series, the images are displayed in the viewer.

##Visualization
The visualisation of DICOM images is done with the HTML5 canvas element. 

##Browser support
Best performance and user expierence with Google Chrome under Mac OS X. 
Other browsers accept only multiple files.

##Status
Basic functionality is in place. Still to do:
- Support for compressed DICOMs (JPEG, JPEG2000, JPEG-LS)
- Windows support

##Used libraries
- [jQuery](http://jquery.com/) & [jQuery UI](http://jqueryui.com/)
- [jQuery Bootstrap](http://addyosmani.github.io/jquery-ui-bootstrap/)
- [jQuery Custom File Input Plugin](https://github.com/filamentgroup/jQuery-Custom-File-Input)
- [SelectBoxIt](http://gregfranko.com/jquery.selectBoxIt.js/)
- [jQueryTree](https://code.google.com/p/dwpe/source/browse/trunk/tree/js/jQuery.tree.js?r=36)
- [jsdicom-lib](https://github.com/Infogosoft/jsdicom-lib)

##Demo
A demo can be found [here](http://mi-kas.github.io/webDICOM/demo/).

##License
[GNU GPLv3](http://www.gnu.org/licenses/gpl-3.0)

webDICOM is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 3 as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).
