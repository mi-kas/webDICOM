/**
 * @desc Implements the windowing function functionality.
 * @author Michael Kaserer e1025263@student.tuwien.ac.at
 * @required All tools must implement following functions:
 * click(x, y, painters)
 * mousedown(x, y, painters)
 * mouseup(x, y, painters)
 * mousemove(x, y, painters)
 * mouseout(x, y, painters)
 **/
function WindowLevel() {
    this.started = false;
    this.curX = 0;
    this.curY = 0;
}

WindowLevel.prototype.click = function() {
};

WindowLevel.prototype.mousedown = function() {
    this.started = true;
};

WindowLevel.prototype.mouseup = function() {
    this.started = false;
};

WindowLevel.prototype.mousemove = function(x, y, painters) {
    if(this.started) {
        var curWindowing = painters[0].getWindowing();
        // Calculate new values
        var deltaX = x - this.curX;
        var deltaY = this.curY - y;
        var newX = curWindowing[0] + deltaX;
        var newY = curWindowing[1] + deltaY;
        
        for(var i = 0, len = painters.length; i < len; i++) {
            painters[i].setWindowing(newX, newY);
            painters[i].drawImg();
        }
        //Update all infos
        $('.wCenter').text('WC: ' + newX.toFixed(0));
        $('.wWidth').text('WW: ' + newY.toFixed(0));
    }
    this.curX = x;
    this.curY = y;
};

WindowLevel.prototype.mouseout = function() {
    this.started = false;
};