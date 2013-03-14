
function CanvasPainter(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext("2d");
    this.currentFile;
    this.ww;
    this.wc;
    this.scale = 1;
    this.pan = [0, 0]; //[panX, panY]
}

CanvasPainter.prototype.setFile = function(file) {
    this.currentFile = file;
};

CanvasPainter.prototype.setWindowing = function(wc, ww) {
    this.ww = ww;
    this.wc = wc;
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

CanvasPainter.prototype.drawImg = function() {
    this.canvas.height = this.currentFile.Rows;
    this.canvas.width = this.currentFile.Columns;
    var lowestVisibleValue = this.currentFile.WindowCenter - this.currentFile.WindowWidth / 2.0;
    var highestVisibleValue = this.currentFile.WindowCenter + this.currentFile.WindowWidth / 2.0;

    this.context.fillStyle = "rgb(0,0,0)";
    this.context.fillRect(0, 0, this.currentFile.Columns, this.currentFile.Rows);
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

    var ratio = this.currentFile.Columns / this.currentFile.Rows;
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
