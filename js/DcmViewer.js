
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

DcmViewer.prototype.showSeries = function(files) {
    this.numFiles = files.length;
    for(var i = 0, len = this.painters.length; i < len; i++) {
        this.painters[i].setSeries(files);
        // setting files shifted to the painters
        var index = (this.scrollIndex + i) % this.numFiles;
        this.painters[i].currentFile = this.painters[i].series[index];
        this.painters[i].drawImg();
        // update info
        updateInfo(this.painters[i], getSelector(this.painters[i]));
    }
    this.eventsEnabled = true;
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
};

DcmViewer.prototype.inputHandler = function(e) {

};

DcmViewer.prototype.eventHandler = function(e) {
    if(this.eventsEnabled) {
        // Firefox doesn't have the offsetX/offsetY properties -> own calculation
        e.x = !e.offsetX ? (e.pageX - $(e.target).offset().left) : e.offsetX;
        e.y = !e.offsetY ? (e.pageY - $(e.target).offset().top) : e.offsetY;

        $('.xPos').text('X: ' + e.x.toFixed(0));
        $('.yPos').text('Y: ' + e.y.toFixed(0));

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
            // Update instance number
            var instanceNum = this.painters[i].currentFile.InstanceNumber ? this.painters[i].currentFile.InstanceNumber : ' - ';
            $(getSelector(this.painters[i]) + ' #instanceNum').text(instanceNum + ' / ' + this.numFiles);
        }

        return this.scrollIndex;
    }
};

DcmViewer.prototype.scrollOne = function(num) {
    this.scrollIndex = num;
    for(var i = 0, len = this.painters.length; i < len; i++) {
        var index = (this.scrollIndex + i) % this.numFiles;
        this.painters[i].currentFile = this.painters[i].series[index];
        this.painters[i].drawImg();
        // Update instance number
        var instanceNum = this.painters[i].currentFile.InstanceNumber ? this.painters[i].currentFile.InstanceNumber : ' - ';
        $(getSelector(this.painters[i]) + ' #instanceNum').text(instanceNum + ' / ' + this.numFiles);
    }
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
            var newId2 = 'content' + x + '' + y;
            $(tmpId).append('<div id="' + newId2 + '" class="viewerCellContent" style="display:block;"></div>');

            $('#' + newId2).append('<canvas id="' + newId + '" width="' + cellWidth + '" height="' + cellHeight + '">Your browser does not support HTML5 canvas</canvas>');
            $('#' + newId2).append('<div class="studyInfo"></div>');
            $('#' + newId2).append('<div class="patientInfo"></div>');

            var tmpPainter = new CanvasPainter(newId);
            newPainters.push(tmpPainter);
            if(this.eventsEnabled) {
                // setting files shifted to the painters
                var index = (this.scrollIndex + x + y) % this.numFiles;
                tmpPainter.setSeries(this.painters[0].series);
                tmpPainter.currentFile = tmpPainter.series[index];
                tmpPainter.drawImg();
                updateInfo(tmpPainter, getSelector(tmpPainter));
            }
        }
    }
    // Show or hide infos
    if($('#showStudyData').val() === 'true') {
        $('.studyInfo').show();
        $('.patientInfo').show();
    } else {
        $('.studyInfo').hide();
        $('.patientInfo').hide();
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
    var file = sortObject(this.painters[0].currentFile);
    var table = document.createElement('table');

    var head = document.createElement('thead');
    var headRow = document.createElement("tr");
    var headCell1 = document.createElement("th");
    var headText1 = document.createTextNode('Feldname');
    headCell1.appendChild(headText1);
    var headCell2 = document.createElement("th");
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

var updateInfo = function(_this, selector) {
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

    var ul1 = document.createElement('ul');
    var li11 = document.createElement('li');
    li11.appendChild(document.createTextNode(pName + pSex + pID));
    var li12 = document.createElement('li');
    li12.appendChild(document.createTextNode(pDate));
    var li13 = document.createElement('li');
    li13.appendChild(document.createTextNode(sDesc));
    var li14 = document.createElement('li');
    li14.appendChild(document.createTextNode(sDate));
    ul1.appendChild(li11);
    ul1.appendChild(li12);
    ul1.appendChild(li13);
    ul1.appendChild(li14);
    var ul2 = document.createElement('ul');
    var li21 = document.createElement('li');
    li21.appendChild(document.createTextNode('WC: ' + _this.wc.toFixed(0)));
    li21.setAttribute("class", "wCenter");
    var li22 = document.createElement('li');
    li22.appendChild(document.createTextNode('WW: ' + _this.ww.toFixed(0)));
    li22.setAttribute("class", "wWidth");
    var li23 = document.createElement('li');
    li23.appendChild(document.createTextNode('X: 0'));
    li23.setAttribute("class", "xPos");
    var li24 = document.createElement('li');
    li24.appendChild(document.createTextNode('Y: 0'));
    li24.setAttribute("class", "yPos");
    var li25 = document.createElement('li');
    li25.appendChild(document.createTextNode(instanceNum + ' / ' + _this.series.length));
    li25.setAttribute("id", "instanceNum");
    ul2.appendChild(li21);
    ul2.appendChild(li22);
    ul2.appendChild(li23);
    ul2.appendChild(li24);
    ul2.appendChild(li25);

    $(selector + ' .studyInfo').empty().append(ul2);
    $(selector + ' .patientInfo').empty().append(ul1);
};

var getSelector = function(painter) {
    var row = painter.canvas.id.charAt(7);
    var column = painter.canvas.id.charAt(6);
    return '#row' + row + ' #column' + column;
};