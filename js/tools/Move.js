/**
 * @desc Implements the move functionality. Images can be moved by clicking and dragging on it.
 * @author Michael Kaserer e1025263@student.tuwien.ac.at
 * @required All tools must implement following functions:
 * click(x, y, painters)
 * mousedown(x, y, painters)
 * mouseup(x, y, painters)
 * mousemove(x, y, painters)
 * mouseout(x, y, painters)
 **/
function Move() {
    this.started = false;
    this.curX = 0;
    this.curY = 0;
}

Move.prototype.click = function() {
};

Move.prototype.mousedown = function() {
    this.started = true;
};

Move.prototype.mouseup = function() {
    this.started = false;
};

Move.prototype.mousemove = function(x, y, painters) {
    if(this.started) {
        var deltaX = x - this.curX;
        var deltaY = y - this.curY;
        // Calculate new position
        var newPanX = painters[0].getPan()[0] + deltaX;
        var newPanY = painters[0].getPan()[1] + deltaY;
        // Draw images with all painters
        for(var i = 0, len = painters.length; i < len; i++) {
            painters[i].setPan(newPanX, newPanY);
            painters[i].drawImg();
        }
    }
    this.curX = x;
    this.curY = y;
};

Move.prototype.mouseout = function() {
    this.started = false;
};

