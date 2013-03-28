
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

DcmViewer.prototype.setParsedFiles = function(files) {
    this.numFiles = files.length;
    this.painter.setSeries(files);
    this.painter.drawImg();
    this.eventsEnabled = true;
    var self = this;
    updateInfo();
    $("#slider").slider({
        value: 0,
        min: 0,
        max: self.numFiles - 1,
        step: 1,
        slide: function(e, ui) {
            self.scrollOne(ui.value);
        }
    });
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

// TODO: überprüfen auf undefined
updateInfo = function(_this) {
    $('#patientsName').text(_this.currentFile.PatientsName + ' (' + _this.currentFile.PatientsSex + ') ' + _this.currentFile.PatientID);
    var x = _this.currentFile.PatientsBirthDate;
    $('#age').text(new Date(x.slice(6) + "/" + x.slice(4, 6) + "/" + x.slice(0, 4)).toLocaleDateString());
    $('#wCenter').text(_this.wc.toFixed(0));
    $('#wWidth').text(_this.ww.toFixed(0));
    x = _this.currentFile.SeriesDate;
    var time = _this.currentFile.SeriesTime;
    $('#studyDate').text(new Date(x.slice(6) + "/" + x.slice(4, 6) + "/" + x.slice(0, 4)).toLocaleDateString() + '  ' + time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4, 6));
    $('#studyDescription').text(_this.currentFile.StudyDescription);
};