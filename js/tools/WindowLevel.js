/*
 * All tools must implement following functions
 * click(x, y, painter)
 * mousedown(x, y, painter)
 * mouseup(x, y, painter)
 * mousemove(x, y, painter)
 * mouseout(x, y, painter)
 */
function WindowLevel() {
    this.started = false;
    this.curX = 0;
    this.curY = 0;
    //this.painter.setWindowLevel(wc, ww);
    //this.painter.drawImage();
}

WindowLevel.prototype.click = function() {
};

WindowLevel.prototype.mousedown = function() {
    this.started = true;
};

WindowLevel.prototype.mouseup = function() {
    this.started = false;
};

WindowLevel.prototype.mousemove = function(x, y, painter) {
    if(this.started) {
        var curWindowing = painter.getWindowing();
        var deltaX = x - this.curX;
        var deltaY = this.curY - y;
//        console.log(curWindowing + ' ' + x +' '+ y);
        painter.setWindowing(curWindowing[0] + deltaX, curWindowing[1] + deltaY);
        painter.drawImg();
    }
    this.curX = x;
    this.curY = y;
};

WindowLevel.prototype.mouseout = function() {
    this.started = false;
};