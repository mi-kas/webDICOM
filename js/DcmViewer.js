
function DcmViewer(canvasId) {
    this.canvasId = canvasId;
    this.painter = new CanvasPainter(this.canvasId);
    this.toolbox = new Toolbox(this.painter);
    this.scrollIndex = 0;
    this.eventsEnabled = false;
    this.numFiles = 0;
}

DcmViewer.prototype.setCurrentTool = function(toolName) {
    this.toolbox.setCurrentTool(toolName);
};

DcmViewer.prototype.loadFiles = function(rawFiles) {
    var files = [];
    this.numFiles = rawFiles.length;
    for(var i = 0; i < rawFiles.length; i++) {
        this.loadFile(rawFiles[i], i, rawFiles.length, files);
    }
};

DcmViewer.prototype.loadFile = function(rawFile, index, end, files) {
    var _this = this;
    var reader = new FileReader();
    reader.readAsArrayBuffer(rawFile);
    reader.onload = function(evt) {
        if(evt.target.readyState === FileReader.DONE) {
            var array = new Uint8Array(evt.target.result);
            var parser = new DicomParser(array);
            var file = parser.parse_file();
            files.push(file);
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
//            str.length > 0 ? console.log(str) : str;

            if(index === end - 1) {
                // Sort by InstanceNumber
                files.sort(function(a, b) {
                    return a.InstanceNumber - b.InstanceNumber;
                });
                _this.painter.setSeries(files);
                _this.painter.drawImg();
                _this.eventsEnabled = true;
                files = null;
            }
        }
    };
};

DcmViewer.prototype.eventHandler = function(e) {
    if(this.eventsEnabled) {
        // Firefox doesn't have the offsetX/offsetY properties -> own calculation
        e.x = !e.offsetX ? (e.pageX - $(e.target).offset().left) : e.offsetX;
        e.y = !e.offsetY ? (e.pageY - $(e.target).offset().top) : e.offsetY;

        // pass the event to the currentTool of the toolbox
        var eventFunc = this.toolbox.currentTool[e.type];
        if(eventFunc) {
            eventFunc(e.x, e.y, this.painter);
        }
    }
};

DcmViewer.prototype.scrollHandler = function(evt) {
    if(this.numFiles > 1 && this.eventsEnabled) {
        evt.preventDefault();
        var e = evt.originalEvent;

        // Firefox uses detail. Chrome and Safari wheelDelta. Normalizing the different units.
        var delta = e.detail ? e.detail : -e.wheelDelta / 3.0;
        this.scrollIndex = (delta >= 1) ? this.scrollIndex + 1 : (delta <= -1) ? this.scrollIndex - 1 : this.scrollIndex;

        // cyclic scrolling
        this.scrollIndex = (this.scrollIndex < 0) ? this.numFiles - 1 : (this.scrollIndex > this.numFiles - 1) ? 0 : this.scrollIndex;

        this.painter.currentFile = this.painter.series[this.scrollIndex];
        this.painter.drawImg();
        return this.scrollIndex;
    }
};

DcmViewer.prototype.scrollOne = function(num) {
        this.scrollIndex = num;
        this.painter.currentFile = this.painter.series[this.scrollIndex];
        this.painter.drawImg();
};