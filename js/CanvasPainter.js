/**
 * @desc CanvasPainter is used to draw a Dicom file on a HTML-canvas element. Scale, windowing and pan can be altered.
 * @param {String} canvasId Id of the HTML-canvas element for the painter.
 * @author Michael Kaserer
 **/
function CanvasPainter(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.currentFile;
    this.series;
    this.ww;
    this.wc;
    this.scale;
    this.pan; //[panX, panY]
}

/**
 * Sets a Dicom series to the painter and sorts it by InstanceNumber.
 * @param {Array} serie An array with Dicom files of a series. 
 */
CanvasPainter.prototype.setSeries = function(serie) {
    // Sort by InstanceNumber
    serie.sort(function(a, b) {
        return a.InstanceNumber - b.InstanceNumber;
    });
    this.series = serie;
    this.currentFile = this.series[0];
    this.wc = this.series[0].WindowCenter;
    this.ww = this.series[0].WindowWidth;
    this.scale = calculateRatio(this.currentFile.Columns, this.currentFile.Rows, this.canvas.width, this.canvas.height);
    this.pan = [0, 0];
};

/**
 * 
 * @param {Number} wc   Window center
 * @param {Number} ww   Window with
 */
CanvasPainter.prototype.setWindowing = function(wc, ww) {
    this.wc = wc;
    this.ww = ww;
};

/**
 * 
 * @returns {Array} Window center and window with
 */
CanvasPainter.prototype.getWindowing = function() {
    return [this.wc, this.ww];
};

/**
 * 
 * @param {Number} scale
 */
CanvasPainter.prototype.setScale = function(scale) {
    this.scale = scale;
};

/**
 * 
 * @returns {Number}
 */
CanvasPainter.prototype.getScale = function() {
    return this.scale;
};

/**
 * 
 * @param {Number} panX
 * @param {Number} panY
 */
CanvasPainter.prototype.setPan = function(panX, panY) {
    this.pan[0] = panX;
    this.pan[1] = panY;
};

/**
 * 
 * @returns {Array}
 */
CanvasPainter.prototype.getPan = function() {
    return this.pan;
};

/**
 * Resets window with & center, scale and pan to the original values and draws the Dicom image. 
 */
CanvasPainter.prototype.reset = function() {
    this.wc = this.series[0].WindowCenter;
    this.ww = this.series[0].WindowWidth;
    this.scale = calculateRatio(this.currentFile.Columns, this.currentFile.Rows, this.canvas.width, this.canvas.height);
    this.pan = [0, 0];
    this.drawImg();
};

/**
 * Draws the current Dicom file to the canvas element. Uses the windowing function to map the Dicom pixel values the 8bit canvas values.
 */
CanvasPainter.prototype.drawImg = function() {
    //Change here width and height of the new canvas
    var width = this.canvas.width;
    var height = this.canvas.height;
    var tempcanvas = document.createElement("canvas");
    tempcanvas.height = this.currentFile.Rows;
    tempcanvas.width = this.currentFile.Columns;
    var tempContext = tempcanvas.getContext("2d");
    
    // Windowing function
    var lowestVisibleValue = this.wc - this.ww / 2.0;
    var highestVisibleValue = this.wc + this.ww / 2.0;
    
    // color the new canvas black
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, width, height);
    var imgData = tempContext.createImageData(this.currentFile.Columns, this.currentFile.Rows);
    var pixelData = this.currentFile.PixelData;
    
    if(typeof pixelData === 'undefined' || pixelData.length === 0) {
        $('#errorMsg').append("<p class='ui-state-error ui-corner-all'><span class='ui-icon ui-icon-alert'></span>Can't display image: "+ this.currentFile.PatientsName +" "+ this.currentFile.SeriesDescription +"</p>");
        return;
    }
    
    // loop throug all pixel values and set R, G, B and alpha.
    for(var i = 0, len = imgData.data.length; i < len; i += 4) {
        var intensity = pixelData[(i / 4)];
        intensity = intensity * this.currentFile.RescaleSlope + this.currentFile.RescaleIntercept;
        intensity = (intensity - lowestVisibleValue) / (highestVisibleValue - lowestVisibleValue);
        intensity = intensity < 0.0 ? 0.0 : intensity;
        intensity = intensity > 1.0 ? 1.0 : intensity;
        intensity *= 255.0;

        imgData.data[i + 0] = intensity; // R
        imgData.data[i + 1] = intensity; // G
        imgData.data[i + 2] = intensity; // B
        imgData.data[i + 3] = 255;       // alpha
    }

    // Scale the image
    var targetWidth = this.scale * this.currentFile.Rows;
    var targetHeight = this.scale * this.currentFile.Columns;
    var xOffset = (width - targetWidth) / 2 + this.pan[0];
    var yOffset = (height - targetHeight) / 2 + this.pan[1];
    
    // Draw it on the referencing canvas
    tempContext.putImageData(imgData, 0, 0);
    this.context.drawImage(tempcanvas, xOffset, yOffset, targetWidth, targetHeight);
};

/**
 * Private help function to compute the perfect scale for the canvas element with a certain height and width.
 * @param {Number} srcWidth     Width of the Dicom image
 * @param {Number} srcHeight    Height of the Dicom image
 * @param {Number} maxWidth     Width of the canvas element
 * @param {Number} maxHeight    Height of the canvas element
 * @returns {Number} Computed scale
 */
calculateRatio = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight];
    ratio = Math.min(ratio[0], ratio[1]);

    return ratio;
};