
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

            console.log(file);
            var str = '';

            // TODO: Hier noch überprüfung auf RescaleSlope, Intercept, ww & wc setzen
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
                str += 'WindowCenter undefined ';
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

            tmpPainter.setFile(file);
            tmpPainter.drawImg();
        }
    };
};