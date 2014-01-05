/**
 * @desc Takes the files of the HTML input and parses them with the DicomParser.
 * @author Michael Kaserer 
 **/
function FileParser() {
    this.files = [];
}

/**
 * Parses all files and sets default values for not existing values of RescaleSlope, RescaleIntercept, WindowWith and WindowCenter.
 * Sorts the files alphabetically by PatientsName.
 * @param {Array} rawFiles      Files to be parsed
 * @param {function} callback   Function to be called after all files are parsed
 */
FileParser.prototype.parseFiles = function(rawFiles, callback) {
    // Reset array
    this.files = [];
    var self = this;
    var goal = rawFiles.length;
    
    var setupReader = function(rawFile) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(rawFile);
        reader.onload = function(evt) {
            if(evt.target.readyState === FileReader.DONE) {
                var array = new Uint8Array(evt.target.result);
                var parser = new DicomParser(array);
                var file = parser.parse_file();

                if(typeof file === 'undefined') {
                    goal--;
                    //console.log("Can't read file: " + rawFile.name);
                    $('#errorMsg').append("<p class='ui-state-error ui-corner-all'><span class='ui-icon ui-icon-alert'></span>Can't read file: " + rawFile.name + "</p>");
                    return;
                }
                if(typeof file.RescaleSlope === 'undefined') {
                    file.RescaleSlope = 1;
                }
                if(typeof file.RescaleIntercept === 'undefined') {
                    file.RescaleIntercept = 0;
                }
                if(typeof file.WindowCenter === 'undefined') {
                    file.WindowCenter = 85;
                }
                if(typeof file.WindowWidth === 'undefined') {
                    file.WindowWidth = 171;
                }
                if($.isArray(file.WindowCenter)) {
                    file.WindowCenter = file.WindowCenter[0];
                }
                if($.isArray(file.WindowWidth)) {
                    file.WindowWidth = file.WindowWidth[0];
                }

                self.files.push(file);
            }
        };

        reader.onloadend = function(e) {
            // Fire callback only when all files are parsed
            if(self.files.length === goal) {
                self.files.sort(function(a, b) {
                    var A = a.PatientsName.toLowerCase();
                    var B = b.PatientsName.toLowerCase();
                    if(A < B)
                        return -1;
                    if(A > B)
                        return 1;
                    return 0;
                });
                callback(self.files);
            }
        };

        reader.onerror = function(e) {
            e = e || window.event;

            switch(e.target.error.code) {
                case e.target.error.NOT_FOUND_ERR:
                    $('#errorMsg').append("<p>File not found!</p>");
                    break;
                case e.target.error.NOT_READABLE_ERR:
                    $('#errorMsg').append("<p>File not readable</p>");
                    break;
                case e.target.error.ABORT_ERR:
                    $('#errorMsg').append("<p>Read operation was aborted</p>");
                    break;
                case e.target.error.SECURITY_ERR:
                    $('#errorMsg').append("<p>File is in a locked state</p>");
                    break;
                case e.target.error.ENCODING_ERR:
                    $('#errorMsg').append("<p>Encoding error</p>");
                    break;
                default:
                    $('#errorMsg').append("<p>Read error</p>");
            }
        };
    };
    
    // call setupReader for all files
    for(var i = 0, len = rawFiles.length; i < len; i++) {
        setupReader(rawFiles[i]);
    }
};