
function DcmViewer() {
    this.toolbox = new Toolbox(this.painter);
    this.scrollIndex = 0;
    this.eventsEnabled = false;
    this.numFiles = 0;
    this.painters = [];
}

DcmViewer.prototype.init = function() {
    this.matrixHandler($('#matrixView').val());
};

DcmViewer.prototype.setCurrentTool = function(toolName) {
    this.toolbox.setCurrentTool(toolName);
};

DcmViewer.prototype.setParsedFiles = function(files) {
    this.numFiles = files.length;
    for(var i = 0, len = this.painters.length; i < len; i++) {
        this.painters[i].setSeries(files);
        // setting files shifted to the painters
        var index = (this.scrollIndex + i) % this.numFiles;
        this.painters[i].currentFile = this.painters[i].series[index];
        this.painters[i].drawImg();
    }
    this.eventsEnabled = true;
//    clearInfo();
//    updateInfo(this.painter);
    if(this.numFiles > 1) {
        var self = this;
        $("#slider").slider('option', {
            max: self.numFiles - 1,
            disabled: false,
            slide: function(e, ui) {
                self.scrollOne(ui.value);
            }
        });
    }
    //console.log(this.numFiles);
};

DcmViewer.prototype.eventHandler = function(e) {
    if(this.eventsEnabled) {
        // Firefox doesn't have the offsetX/offsetY properties -> own calculation
        e.x = !e.offsetX ? (e.pageX - $(e.target).offset().left) : e.offsetX;
        e.y = !e.offsetY ? (e.pageY - $(e.target).offset().top) : e.offsetY;

        //Update X & Y values
        $('#xPos').text('X: ' + e.x.toFixed(0));
        $('#yPos').text('Y: ' + e.y.toFixed(0));

        // pass the event to the currentTool of the toolbox
        var eventFunc = this.toolbox.currentTool[e.type];
        if(eventFunc) {
            eventFunc(e.x, e.y, this.painters);
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
        var tmp = [];
        for(var i = 0, len = this.painters.length; i < len; i++) {
            var index = (this.scrollIndex + i) % this.numFiles;
            tmp.push(index);
            this.painters[i].currentFile = this.painters[i].series[index];
            this.painters[i].drawImg();
        }
        //console.log(tmp);
//        var instanceNum = this.painter.currentFile.InstanceNumber ? this.painter.currentFile.InstanceNumber : ' - ';
//        $('#instanceNum').text(instanceNum + ' / ' + this.numFiles);

        return this.scrollIndex;
    }
};

DcmViewer.prototype.scrollOne = function(num) {
    this.scrollIndex = num;
    for(var i = 0, len = this.painters.length; i < len; i++) {
        var index = (this.scrollIndex + i) % this.numFiles;
        this.painters[i].currentFile = this.painters[i].series[index];
        this.painters[i].drawImg();
    }

//    var instanceNum = this.painter.currentFile.InstanceNumber ? this.painter.currentFile.InstanceNumber : ' - ';
//    $('#instanceNum').text(instanceNum + ' / ' + this.numFiles);
};

DcmViewer.prototype.matrixHandler = function(e) {
    var rows = e.split(',')[0];
    var columns = e.split(',')[1];
    var width = parseInt($('#viewer').width());
    var height = parseInt($('#viewer').height()) - 72;
    var cellWidth = width / columns;
    var cellHeight = height / rows;

    $('#viewerScreen').empty();
    var newPainters = [];

    for(var y = 0; y < rows; y++) {
        var rowName = 'row' + y;
        $('#viewerScreen').append('<div id="' + rowName + '" class="viewerRows"></div>');
        for(var x = 0; x < columns; x++) {
            $('#' + rowName).append('<div id="column' + x + '" class="viewerCells" style="width:' + cellWidth + 'px; height:' + cellHeight + 'px;"></div>');
            //var newSize = Math.min(cellWidth, cellHeight);
            var tmpId = '#' + rowName + ' #column' + x;
            var newId = 'canvas' + x + '' + y;
            $(tmpId).append('<canvas id="' + newId + '" width="' + cellWidth + '" height="' + cellHeight + '">Your browser does not support HTML5 canvas</canvas>');
            
            var tmpPainter = new CanvasPainter(newId);
            newPainters.push(tmpPainter);
            if(this.eventsEnabled) {
                // setting files shifted to the painters
                var index = (this.scrollIndex + x + y) % this.numFiles;
                tmpPainter.setSeries(this.painters[0].series);
                tmpPainter.currentFile = tmpPainter.series[index];
                tmpPainter.drawImg();
            }
        }
    }
    this.painters = newPainters;
};

DcmViewer.prototype.resetHandler = function() {
    if(this.eventsEnabled) {
        for(var i = 0, len = this.painters.length; i < len; i++) {
            this.painters[i].reset();
        }
    }
};

DcmViewer.prototype.openMetaDialog = function() {
    var sortObject = function(o) {
        var sorted = {},
                key, a = [];

        for(key in o) {
            if(o.hasOwnProperty(key)) {
                a.push(key);
            }
        }

        a.sort();

        for(key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    };
    var file = sortObject(this.painter.currentFile);
    var table = document.createElement('table');

    var head = document.createElement('thead');
    var headRow = document.createElement("tr");
    var headCell1 = document.createElement("td");
    var headText1 = document.createTextNode('Feldname');
    headCell1.appendChild(headText1);
    var headCell2 = document.createElement("td");
    var headText2 = document.createTextNode('Inhalt');
    headCell2.appendChild(headText2);
    headRow.appendChild(headCell1);
    headRow.appendChild(headCell2);
    head.appendChild(headRow);
    table.appendChild(head);

    var body = document.createElement('tbody');

    $.each(file, function(key, value) {
        if(value !== undefined && typeof value !== 'object' && !$.isFunction(value)) {
            var currentRow = document.createElement("tr");
            var cell1 = document.createElement("td");
            var text1 = document.createTextNode(key);
            cell1.appendChild(text1);
            var cell2 = document.createElement("td");
            var text2 = document.createTextNode(value);
            cell2.appendChild(text2);
            currentRow.appendChild(cell1);
            currentRow.appendChild(cell2);
            body.appendChild(currentRow);
        }
    });
    table.appendChild(body);

    return table;
};

var updateInfo = function(_this) {
    var isValidDate = function(d) {
        if(Object.prototype.toString.call(d) !== "[object Date]")
            return false;
        return !isNaN(d.getTime());
    };

    var pName = _this.currentFile.PatientsName ? _this.currentFile.PatientsName : ' - ';
    var pSex = _this.currentFile.PatientsSex ? ' (' + _this.currentFile.PatientsSex + ') ' : ' ';
    var pID = _this.currentFile.PatientID ? _this.currentFile.PatientID : ' - ';
    var x = _this.currentFile.PatientsBirthDate;
    var pDate = '';

    if(x) {
        var d = new Date(x.slice(0, 4) + "/" + x.slice(4, 6) + "/" + x.slice(6, 8));
        if(isValidDate(d)) {
            pDate = d.toLocaleDateString();
            if(_this.currentFile.PatientsAge) {
                pDate += '  ' + _this.currentFile.PatientsAge;
            }
        }
    }

    var instanceNum = _this.currentFile.InstanceNumber ? _this.currentFile.InstanceNumber : ' - ';

    x = _this.currentFile.SeriesDate;
    var time = _this.currentFile.SeriesTime;
    var sDate = '';
    if(x) {
        var d = new Date(x.slice(0, 4) + "/" + x.slice(4, 6) + "/" + x.slice(6, 8));
        if(isValidDate(d)) {
            sDate = d.toLocaleDateString();
            if(time) {
                sDate += '  ' + time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4, 6);
            }
        }
    }

    var sDesc = _this.currentFile.StudyDescription ? _this.currentFile.StudyDescription : ' - ';

    $('#patientsName').text(pName + pSex + pID);
    $('#age').text(pDate);
    $('#wCenter').text('WC: ' + _this.wc.toFixed(0));
    $('#wWidth').text('WW: ' + _this.ww.toFixed(0));
    $('#xPos').text('X: 0');
    $('#yPos').text('Y: 0');
    $('#instanceNum').text(instanceNum + ' / ' + _this.series.length);
    $('#studyDate').text(sDate);
    $('#studyDescription').text(sDesc);
};

var clearInfo = function() {
    $('#patientsName').text('');
    $('#age').text('');
    $('#wCenter').text('');
    $('#wWidth').text('');
    $('#xPos').text('');
    $('#yPos').text('');
    $('#instanceNum').text('');
    $('#studyDate').text('');
    $('#studyDescription').text('');
};