
function DcmViewer(canvasId) {
    this.canvasId = canvasId;
    this.files = [];
}

DcmViewer.prototype.init = function() {
//    this.canvas = document.getElementById(this.canvasId);
//    this.context = canvas.getContext("2d");
    this.painter = new CanvasPainter(this.canvasId);
};

DcmViewer.prototype.loadFiles = function(rawFiles) {
    this.files = [];

    for(var i = 0; i < rawFiles.length; i++) {
        this.loadFile(rawFiles[i], i);
    }
};

DcmViewer.prototype.loadFile = function(rawFile) {
    var tmpPainter = this.painter;
    var reader = new FileReader();
    reader.readAsArrayBuffer(rawFile);
    reader.onload = function(evt) {
        if(evt.target.readyState === FileReader.DONE) {
            var array = new Uint8Array(evt.target.result);
            var parser = new DicomParser(array);
            var file = parser.parse_file();
            
            // TODO: Hier noch überprüfung auf RescaleSlope, Intercept, ww & wc und ggf setzen
            
            tmpPainter.setFile(file);
            tmpPainter.drawImg();
        }
    };
};