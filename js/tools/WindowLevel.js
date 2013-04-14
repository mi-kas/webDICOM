/*
 * All tools must implement following functions
 * click(x, y, painter)
 * dblclick(x, y, painter)
 * mousedown(x, y, painter)
 * mouseup(x, y, painter)
 * mousemove(x, y, painter)
 * mouseout(x, y, painter)
 */
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
        var deltaX = x - this.curX;
        var deltaY = this.curY - y;
        var newX = curWindowing[0] + deltaX;
        var newY = curWindowing[1] + deltaY;
//        painter.setWindowing(newX, newY);
//        painter.drawImg();
        
        for(var i = 0, len = painters.length; i < len; i++) {
            painters[i].setWindowing(newX, newY);
            painters[i].drawImg();
        }
        $('#wCenter').text('WC: ' + newX.toFixed(0));
        $('#wWidth').text('WW: ' + newY.toFixed(0));
    }
    this.curX = x;
    this.curY = y;
};

WindowLevel.prototype.mouseout = function() {
    this.started = false;
};