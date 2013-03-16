/*
 * All tools must implement following functions
 * click(x, y, painter)
 * dblclick(x, y, painter)
 * mousedown(x, y, painter)
 * mouseup(x, y, painter)
 * mousemove(x, y, painter)
 * mouseout(x, y, painter)
 */
function Zoom() {
    this.started = false;
//    this.curX = 0;
    this.curY = 0;
}

Zoom.prototype.click = function() {
};

Zoom.prototype.dblclick = function(x, y, painter) {
    painter.reset();
};

Zoom.prototype.mousedown = function() {
    this.started = true;
};

Zoom.prototype.mouseup = function() {
    this.started = false;
};

Zoom.prototype.mousemove = function(x, y, painter) {
    if(this.started) {
//        var deltaX = x - this.curX;
        var deltaY = this.curY - y;
        painter.setScale(painter.getScale() + deltaY / 100.0);
        painter.drawImg();
    }
//    this.curX = x;
    this.curY = y;
};

Zoom.prototype.mouseout = function() {
    this.started = false;
};



