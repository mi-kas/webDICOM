
function DcmViewer(canvasId) {
    this.canvasId = canvasId;
    this.files = [];
    this.painter = new CanvasPainter(this.canvasId);
    this.toolbox = new Toolbox(this.painter);
}

DcmViewer.prototype.setCurrentTool = function(toolName) {
    this.toolbox.setCurrentTool(toolName);
};

DcmViewer.prototype.loadFiles = function(rawFiles) {
    for(var i = 0; i < rawFiles.length; i++) {
        this.loadFile(rawFiles[i], i);
    }
};

DcmViewer.prototype.loadFile = function(rawFile) {
    var _this = this;
    var tmpPainter = this.painter;
    var reader = new FileReader();
    reader.readAsArrayBuffer(rawFile);
    reader.onload = function(evt) {
        if(evt.target.readyState === FileReader.DONE) {
            var array = new Uint8Array(evt.target.result);
            var parser = new DicomParser(array);
            var file = parser.parse_file();
            _this.files.push(file);
            var str = '';

            if(typeof file.RescaleSlope === 'undefined') {
                file.RescaleSlope = 1;
                str += 'RescaleSlope undefined, ';
            }
            if(typeof file.RescaleIntercept === 'undefined') {
                file.RescaleIntercept = 0;
                str += 'RescaleIntercept undefined, ';
            }
            if(typeof file.WindowCenter === 'undefined') {
                file.WindowCenter = 85;
                str += 'WindowCenter undefined, ';
            }
            if(typeof file.WindowWidth === 'undefined') {
                file.WindowWidth = 171;
                str += 'WindowWidth undefined, ';
            }
            if($.isArray(file.WindowCenter)) {
                file.WindowCenter = file.WindowCenter[0];
                str += 'WindowCenter isArray, ';
            }
            if($.isArray(file.WindowWidth)) {
                file.WindowWidth = file.WindowWidth[0];
                str += 'WindowWidth isArray ';
            }
            str.length > 0 ? console.log(str) : str;

            _this.painter.setFile(file);
            _this.painter.drawImg();
        }
    };
};

DcmViewer.prototype.eventHandler = function(e) {
    // firefox doesn't have offsetX
    e.x = !e.offsetX ? (e.pageX - $(e.target).offset().left) : e.offsetX;
    e.y = !e.offsetY ? (e.pageY - $(e.target).offset().top) : e.offsetY;
//    console.log(e.x +' '+ e.y);

    // pass the event to the currentTool of the toolbox
    var eventFunc = this.toolbox.currentTool[e.type];
    if(eventFunc) {
        eventFunc(e.x, e.y, this.painter);
    }
};

DcmViewer.prototype.scrollHandler = function(e) {
    if(this.files.length > 1) {
        
    }
};