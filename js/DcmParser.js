function DcmParser() {
    this.files = [];
}

DcmParser.prototype.parseFiles = function(rawFiles, callback) {
    var self = this;

    var setupReader = function(rawFile, j, length) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(rawFile);
        reader.onload = function(evt) {
            if(evt.target.readyState === FileReader.DONE) {
                var array = new Uint8Array(evt.target.result);
                var parser = new DicomParser(array);
                var file = parser.parse_file();
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
                // file.DataIndex = index;
                self.files.push(file);
                //str.length > 0 ? console.log(str) : str;

                if(j === (length - 1)) {
                    callback(self.files);
                }
            }
        };
    };

    for(var i = 0; i < rawFiles.length; i++) {
        setupReader(rawFiles[i], i, rawFiles.length);
    }
};