/**
 * @desc Implements the zoom functionality.
 * @author Michael Kaserer e1025263@student.tuwien.ac.at
 * @required All tools must implement following functions:
 * click(x, y, painters)
 * mousedown(x, y, painters)
 * mouseup(x, y, painters)
 * mousemove(x, y, painters)
 * mouseout(x, y, painters)
 **/
function Zoom() {
    this.started = false;
    this.curY = 0;
}

Zoom.prototype.click = function() {
};

Zoom.prototype.mousedown = function() {
    this.started = true;
};

Zoom.prototype.mouseup = function() {
    this.started = false;
};

Zoom.prototype.mousemove = function(x, y, painters) {
    if(this.started) {
        var deltaY = this.curY - y;
        var newDeltaY = painters[0].getScale() + deltaY / 100.0;
        
        for(var i = 0, len = painters.length; i < len; i++) {
            painters[i].setScale(newDeltaY);
            painters[i].drawImg();
        }
    }
    this.curY = y;
};

Zoom.prototype.mouseout = function() {
    this.started = false;
};



