/*
 * All tools must implement following functions
 * click(x, y, painter)
 * mousedown(x, y, painter)
 * mouseup(x, y, painter)
 * mousemove(x, y, painter)
 * mouseout(x, y, painter)
 */
function Move() {
    this.started = false;
    this.curX = 0;
    this.curY = 0;
}

Move.prototype.click = function() {
};

Move.prototype.dblclick = function(x, y, painter) {
    painter.reset();
};

Move.prototype.mousedown = function() {
    this.started = true;
};

Move.prototype.mouseup = function() {
    this.started = false;
};

Move.prototype.mousemove = function(x, y, painter) {
    if(this.started) {
        var deltaX = x - this.curX;
        var deltaY = y - this.curY;

        painter.setPan(painter.getPan()[0] + deltaX, painter.getPan()[1] + deltaY);
        painter.drawImg();
    }
    this.curX = x;
    this.curY = y;
};

Move.prototype.mouseout = function() {
    this.started = false;
};

