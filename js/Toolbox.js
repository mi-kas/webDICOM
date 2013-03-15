
function Toolbox(painter) {
    this.painter = painter;
    this.tools = {
        'Window level': new WindowLevel(),
        'Zoom': new Zoom(),
        'Move': new Move()
    };
     this.currentTool = this.tools['Window level'];
}

Toolbox.prototype.setCurrentTool = function(funcName) {
    this.currentTool = this.tools[funcName];
};