
function DcmViewer(canvasId) {
    this.canvasId = canvasId;
    this.files = [];
    this.painter = new CanvasPainter(this.canvasId);
    this.toolbox = new Toolbox(this.painter);
    this.scrollIndex = 0;
}

DcmViewer.prototype.setCurrentTool = function(toolName) {
    this.toolbox.setCurrentTool(toolName);
};

DcmViewer.prototype.loadFiles = function(rawFiles) {
    this.files = [];
    for(var i = 0; i < rawFiles.length; i++) {
        this.loadFile(rawFiles[i], i, rawFiles.length);
    }
};

DcmViewer.prototype.loadFile = function(rawFile, index, end) {
    var _this = this;
    var reader = new FileReader();
    reader.readAsArrayBuffer(rawFile);
    reader.onload = function(evt) {
        if(evt.target.readyState === FileReader.DONE) {
            var array = new Uint8Array(evt.target.result);
            var parser = new DicomParser(array);
            var file = parser.parse_file();
            _this.files.push(file);
            var str = '';
            console.log(file);
            file.Scale = 1;
            file.Pan = [0, 0];

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

            if(index === end - 1) {
                _this.painter.setFile(file);
                _this.painter.drawImg();
            }
        }
    };
};

DcmViewer.prototype.eventHandler = function(e) {
    // firefox doesn't have offsetX
    e.x = !e.offsetX ? (e.pageX - $(e.target).offset().left) : e.offsetX;
    e.y = !e.offsetY ? (e.pageY - $(e.target).offset().top) : e.offsetY;

    // pass the event to the currentTool of the toolbox
    var eventFunc = this.toolbox.currentTool[e.type];
    if(eventFunc) {
        eventFunc(e.x, e.y, this.painter);
    }
};

DcmViewer.prototype.scrollHandler = function(evt) {
    if(this.files.length > 1) {
        evt.preventDefault();
        var e = evt.originalEvent;

        if(e.detail) {
            // Firefox
            var delta = e.detail * (-1000);
            this.scrollIndex = (delta <= -1000) ? this.scrollIndex + 1 : this.scrollIndex - 1;
        } else {
            // Non firefox browsers
            var delta = e.wheelDelta;
            if(delta > 0) {
                this.scrollIndex = (delta > 25) ? this.scrollIndex + 1 : this.scrollIndex;
            } else {
                this.scrollIndex = (delta < -25) ? this.scrollIndex - 1 : this.scrollIndex;
            }
        }
        this.scrollIndex = (this.scrollIndex < 0) ? this.files.length - 1 : (this.scrollIndex > this.files.length - 1) ? 0 : this.scrollIndex;

        // save modified values (wc, ww, pan, scale) of the image
        this.painter.currentFile.WindowCenter = this.painter.getWindowing()[0];
        this.painter.currentFile.WindowWidth = this.painter.getWindowing()[1];
        this.painter.currentFile.Scale = this.painter.getScale();
        this.painter.currentFile.Pan = this.painter.getPan();

        this.painter.setFile(this.files[this.scrollIndex]);
        this.painter.drawImg();
    }
};