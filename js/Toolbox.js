/**
 * @desc 
 * @author Michael Kaserer
 **/
function Toolbox() {
    this.tools = {
        'Window level': new WindowLevel(),
        'Zoom': new Zoom(),
        'Move': new Move(),
        'Roi': new Roi()
    };
     this.currentTool = this.tools['Window level'];
}

/**
 * Sets the currentTool by its name.
 * @param {String} funcName
 */
Toolbox.prototype.setCurrentTool = function(funcName) {
    this.currentTool = this.tools[funcName];
};