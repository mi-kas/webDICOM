
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

CanvasPainter.prototype.setFile = function(file) {
    this.currentFile = file;
    this.wc = file.WindowCenter;
    this.ww = file.WindowWidth;
    this.scale = file.Scale;
    this.pan = file.Pan;
};

CanvasPainter.prototype.setSeries = function(serie) {
    // Sort by InstanceNumber
    serie.sort(function(a, b) {
        return a.InstanceNumber - b.InstanceNumber;
    });
    this.series = serie;
    this.currentFile = this.series[0];
    this.wc = this.series[0].WindowCenter;
    this.ww = this.series[0].WindowWidth;
    this.scale = 1;
    this.pan = [0, 0];
};

CanvasPainter.prototype.setWindowing = function(wc, ww) {
    this.wc = wc;
    this.ww = ww;
};

CanvasPainter.prototype.getWindowing = function() {
    return [this.wc, this.ww];
};

CanvasPainter.prototype.setScale = function(scale) {
    this.scale = scale;
};

CanvasPainter.prototype.getScale = function() {
    return this.scale;
};

CanvasPainter.prototype.setPan = function(panX, panY) {
    this.pan[0] = panX;
    this.pan[1] = panY;
};

CanvasPainter.prototype.getPan = function() {
    return this.pan;
};

CanvasPainter.prototype.reset = function() {
    this.wc = this.series[0].WindowCenter;
    this.ww = this.series[0].WindowWidth;
    this.scale = 1;
    this.pan = [0, 0];
    this.drawImg();
};

CanvasPainter.prototype.drawImg = function() {
//    this.canvas.height = this.currentFile.Rows;
//    this.canvas.width = this.currentFile.Columns;
    var lowestVisibleValue = this.wc - this.ww / 2.0;
    var highestVisibleValue = this.wc + this.ww / 2.0;

    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, 512, 512);
    var imgData = this.context.createImageData(this.currentFile.Columns, this.currentFile.Rows);
    var pixelData = this.currentFile.PixelData;

    for(var i = 0; i < imgData.data.length; i += 4) {
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

    var ratio = calculateRatio(this.currentFile.Columns, this.currentFile.Rows, 512, 512);
    var targetWidth = ratio * this.scale * this.currentFile.Rows;
    var targetHeight = ratio * this.scale * this.currentFile.Columns;
    var xOffset = (this.canvas.width - targetWidth) / 2 + this.pan[0];
    var yOffset = (this.canvas.height - targetHeight) / 2 + this.pan[1];

    var tempcanvas = document.createElement("canvas");
    tempcanvas.height = this.currentFile.Rows;
    tempcanvas.width = this.currentFile.Columns;
    var tempContext = tempcanvas.getContext("2d");

    tempContext.putImageData(imgData, 0, 0);
    this.context.drawImage(tempcanvas, xOffset, yOffset, targetWidth, targetHeight);
};

calculateRatio = function(srcWidth, srcHeight, maxWidth, maxHeight) {
    var ratio = [maxWidth / srcWidth, maxHeight / srcHeight];
    ratio = Math.min(ratio[0], ratio[1]);

    return ratio;
};
