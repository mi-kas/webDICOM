/*
 * All tools must implement following functions
 * click(x, y, painters)
 * dblclick(x, y, painters)
 * mousedown(x, y, painters)
 * mouseup(x, y, painters)
 * mousemove(x, y, painters)
 * mouseout(x, y, painters)
 */
function Roi() {
    this.started = false;
    this.startX = 0;
    this.startY = 0;
    this.color = '#0f0';
}

Roi.prototype.setColor = function(hex) {
    this.color = hex;
};

Roi.prototype.click = function() {
};

Roi.prototype.mousedown = function(x, y) {
    this.startX = x;
    this.startY = y;
    this.started = true;
};

Roi.prototype.mouseup = function(x, y, painters, target) {
    if(this.started) {
        // calculate and show length
        var painter = getPainterFromId(target.id, painters);
        var context = painter.context;
        var dist = calculateDist(painter, this.startX, this.startY, x, y);
        context.font = "10px Helvetica";
        context.fillStyle = this.color;
        context.fillText(dist, x + 3, y + 3);
        this.started = false;
    }
};

Roi.prototype.mousemove = function(x, y, painters, target) {
    if(this.started) {
        var painter = getPainterFromId(target.id, painters);
        var context = painter.context;
        getPainterFromId(target.id, painters).drawImg();
        context.beginPath();
        context.moveTo(this.startX, this.startY);
        context.lineTo(x, y);
        context.strokeStyle = this.color;
        context.stroke();
        context.closePath();
    }
};

Roi.prototype.mouseout = function() {
    this.started = false;
};

//var drawLine = function(x, y, context) {
//    painters[0].context.clearRect(0, 0, painters[0].canvas.width, painters[0].canvas.height);
//    context.beginPath();
//    context.moveTo(this.startX, this.startY);
//    context.lineTo(x, y);
//    context.strokeStyle = '#0f0';
//    context.stroke();
//    context.closePath();
//};

var getPainterFromId = function(id, painters) {
    for(var i = 0, len = painters.length; i < len; i++) {
        if(painters[i].canvas.id === id) {
            return painters[i];
        }
    }
    return null;
};

var calculateDist = function(painter, startX, startY, endX, endY) {
    var pixelSpacing = painter.currentFile.PixelSpacing ? painter.currentFile.PixelSpacing : [1, 1];
    var a = (endX - startX) * pixelSpacing[0] / painter.getScale(); 
    var b = (endY - startY) * pixelSpacing[1] / painter.getScale();
    return Math.sqrt(Math.abs(a^2 + b^2)).toFixed(2) + 'mm';
};