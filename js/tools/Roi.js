/**
 * @desc Implements the length measurement functionality. Lenght is calculated by using the PixelSpacing of the image and Pythagoras' theorem.
 * @author Michael Kaserer e1025263@student.tuwien.ac.at
 * @required All tools must implement following functions:
 * click(x, y, painters)
 * mousedown(x, y, painters)
 * mouseup(x, y, painters)
 * mousemove(x, y, painters)
 * mouseout(x, y, painters)
 **/
function Roi() {
    this.started = false;
    this.startX = 0;
    this.startY = 0;
    this.lineColor = '#0f0';
}

Roi.prototype.setColor = function(hex) {
    this.lineColor = hex;
};

Roi.prototype.click = function() {
};

Roi.prototype.mousedown = function(x, y) {
    this.startX = x;
    this.startY = y;
    this.started = true;
    this.lineColor = '#0f0';
};

Roi.prototype.mouseup = function(x, y, painters, target) {
    if(this.started && this.startX !== x && this.startY !== y){
        // calculate and show length
        var painter = getPainterFromId(target.id, painters);
        var context = painter.context;
        var dist = calculateDist(painter, this.startX, this.startY, x, y);
        context.font = ".8em Helvetica";
        context.fillStyle = this.lineColor;
        context.fillText(dist, x + 3, y + 3);
    }
    this.started = false;
};

Roi.prototype.mousemove = function(x, y, painters, target) {
    if(this.started) {
        var painter = getPainterFromId(target.id, painters);
        var context = painter.context;
        getPainterFromId(target.id, painters).drawImg();
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(x, y);
        context.strokeStyle = this.lineColor;
        context.stroke();
        context.closePath();
    }
};

Roi.prototype.mouseout = function() {
    this.started = false;
};

var getPainterFromId = function(id, painters) {
    for(var i = 0, len = painters.length; i < len; i++) {
        if(painters[i].canvas.id === id) {
            return painters[i];
        }
    }
    return null;
};

/**
 * Calculates the distance between two points considering the PixelSpacing and scale.
 * @param {CanvasPainter} painter
 * @param {Number} startX   X-value of the start point
 * @param {Number} startY   Y-value of the start point
 * @param {Number} endX     X-value of the end point
 * @param {Number} endY     Y-value of the end point
 * @returns {Number} Length betwen the two points
 */
var calculateDist = function(painter, startX, startY, endX, endY) {
    var pixelSpacing = painter.currentFile.PixelSpacing ? painter.currentFile.PixelSpacing : [1, 1];
    var a = (endX - startX) * pixelSpacing[0] / painter.getScale(); 
    var b = (endY - startY) * pixelSpacing[1] / painter.getScale();
    
    return (Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) / 10).toFixed(3) + ' cm';
};