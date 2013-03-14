
function Toolbox(painter) {
    this.painter = painter;
    this.currentTool = this.windowLevel;
    this.tools = {
        'Window level': Toolbox.prototype.windowLevel,
        'Zoom': Toolbox.prototype.zoom,
        'Move': Toolbox.prototype.move
    };
}

Toolbox.prototype.setCurrentTool = function(funcName) {
    this.currentTool = this.tools[funcName];
};

Toolbox.prototype.windowLevel = function() {
    // All tools may implement any of the following functions
    // mousedown(x, y)
    // mouseup(x, y)
    // mousemove(x, y)
    // mouseclick(x, y)
    // draw(canvas)
    // set_file(file)
    console.log('window Level');
    //this.painter.setWindowLevel(wc, ww);
    //this.painter.drawImage();
};

Toolbox.prototype.zoom = function() {
    console.log('zoom');
};

Toolbox.prototype.move = function() {
    console.log('move');
};