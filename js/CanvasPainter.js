
function CanvasPainter(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.currentFile;
    this.ww;
    this.wc;
    this.scale = 1;
    this.pan = [0,0];
}

CanvasPainter.prototype.setFile = function(file) {
    this.currentFile = file;
};

CanvasPainter.prototype.setWindowing = function(ww, wc) {
    this.ww = ww;
    this.wc = wc;
};

CanvasPainter.prototype.setScale = function(scale) {
    this.scale = scale;
};

CanvasPainter.prototype.setPan = function(panx, pany) {
    this.pan[0] = panx;
    this.pan[1] = pany;
};

CanvasPainter.prototype.drawImg = function() {
    tempcanvas = document.createElement("canvas");
    tempcanvas.height = this.currentFile.Rows;
    tempcanvas.width = this.currentFile.Columns;
    this.canvas.height = this.currentFile.Rows;
    this.canvas.width = this.currentFile.Columns;

    this.context.fillStyle = "rgb(0,0,0)";
    this.context.fillRect(0, 0, this.currentFile.Columns, this.currentFile.Rows);
    var imgData = this.context.createImageData(this.currentFile.Columns, this.currentFile.Rows);
    var pixelData = this.currentFile.PixelData;

    if(typeof this.currentFile.WindowCenter !== 'undefined' && typeof this.currentFile.WindowWidth !== 'undefined') {
        if($.isArray(this.currentFile.WindowCenter) && $.isArray(this.currentFile.WindowWidth)) {
            var lowestVisibleValue = this.currentFile.WindowCenter[0] - this.currentFile.WindowWidth[0] / 2.0;
            var highestVisibleValue = this.currentFile.WindowCenter[0] + this.currentFile.WindowWidth[0] / 2.0;

        } else {
            var lowestVisibleValue = this.currentFile.WindowCenter - this.currentFile.WindowWidth / 2.0;
            var highestVisibleValue = this.currentFile.WindowCenter + this.currentFile.WindowWidth / 2.0;
        }

    } else {
        var lowestVisibleValue = 85 - 171 / 2.0;
        var highestVisibleValue = 85 + 171 / 2.0;
    }


    for(var i = 0; i < imgData.data.length; i += 4) {
        var intensity = pixelData[(i / 4)];

        if(typeof this.currentFile.RescaleSlope !== 'undefined' && typeof this.currentFile.RescaleIntercept !== 'undefined') {
            intensity = intensity * this.currentFile.RescaleSlope + this.currentFile.RescaleIntercept;
        }

        intensity = (intensity - lowestVisibleValue) / (highestVisibleValue - lowestVisibleValue);
        if(intensity < 0.0)
            intensity = 0.0;
        if(intensity > 1.0)
            intensity = 1.0;

        intensity *= 255.0;

        imgData.data[i + 0] = intensity; // R
        imgData.data[i + 1] = intensity; // G
        imgData.data[i + 2] = intensity; // B
        imgData.data[i + 3] = 255; // alpha
    }
    
    this.context.putImageData(imgData, 20, 20);
    
};
