/**
 * @desc Controller of the Dicom Viewer. Handles all user event from the GUI.
 * @author Michael Kaserer
 **/
function DcmViewer() {
    this.toolbox;
    this.tree;
    this.fileParser;
    this.scrollIndex = 0;
    this.numFiles = 0;
    this.eventsEnabled = false;
    this.painters = [];
    this.parsedFileList = [];
}

/**
 * Initialization. Calls matrixHandler function.
 */
DcmViewer.prototype.init = function() {
    this.toolbox = new Toolbox();
    this.matrixHandler($('#matrixView').val());
    this.tree = new Tree();
    this.fileParser = new FileParser();
};

/**
 * 
 * @param {String} toolName Sets the current tool of the toolbox by using the name of it. See Toolbox.js.
 */
DcmViewer.prototype.setCurrentTool = function(toolName) {
    this.toolbox.setCurrentTool(toolName);
};

/**
 * Sets the files to all painter of the viewer and enables the slider.
 * @param {Array} files Array of Dicom files
 */
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
    // Enable the slider
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

/**
 * Handles the change-event of the input element. Updates the progress bar, parses the files and renders it on a tree. Only Dicom files are processed.
 * @param {Event} e Change-event of the input element.
 */
DcmViewer.prototype.inputHandler = function(e) {
    // detect 'cancel' or no files in fileList
    if(e.target.files.length === 0) {
        return;
    }
    // for the progressbar
    progress(e.target.files.length);

    var fileList = e.target.files;
    var dcmList = [];
    this.parsedFileList = [];
    
    // only Dicom files
    for(var i = 0, len = fileList.length; i < len; i++) {
        if(fileList[i].type === "application/dicom") {
            dcmList.push(fileList[i]);
        }
    }

    var self = this;
    // parse files
    this.fileParser.parseFiles(dcmList, function(e) {
        self.parsedFileList = e;
        // render them in a tree
        self.tree.render(self.parsedFileList);
    });
};

/**
 * Handles click, mousemove, mousedown, mouseup, mouseout, mousewhell and scroll events of the viewer and passes the event to the current tool of the toolbox.
 * @param {Event} e 
 */
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
            eventFunc(e.x, e.y, this.painters, e.target);
        }
    }
};

/**
 * Scroll handler of the viewer. Updates also the slider.
 * @param {Event} evt
 */
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

/**
 * Event handler for the slider.
 * @param {Number} num Current position of the slider
 */
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

/**
 * Event handler of the drop-down menu. Calculates the sizes of each canvas according to the useres screen size.
 * @param {Event} e
 */
DcmViewer.prototype.matrixHandler = function(e) {
    var rows = e.split(',')[0];
    var columns = e.split(',')[1];
    // width and heihgt of user's screen
    var width = parseInt($('#viewer').width());
    var height = parseInt($('#viewer').height()) - 72 - (rows * 0.5); // 72px toolbar, 0.5px for the border
    // calculate canvas sizes
    var cellWidth = width / columns;
    var cellHeight = (height / rows);
    $('#viewerScreen').empty();
    var newPainters = [];

    for(var y = 0; y < rows; y++) {
        var rowName = 'row' + y;
        $('#viewerScreen').append('<div id="' + rowName + '" class="viewerRows"></div>');
        for(var x = 0; x < columns; x++) {
            $('#' + rowName).append('<div id="column' + x + '" class="viewerCells" style="width:' + cellWidth + 'px; height:' + cellHeight + 'px;"></div>');
            // new ids
            var tmpId = '#' + rowName + ' #column' + x;
            var newId = 'canvas' + x + '' + y;
            // append canvas and divs
            $(tmpId).append('<canvas id="' + newId + '" width="' + cellWidth + 'px" height="' + cellHeight + 'px">Your browser does not support HTML5 canvas</canvas>');
            $(tmpId).append('<div class="studyInfo"></div>');
            $(tmpId).append('<div class="patientInfo"></div>');
            // paint Dicom image
            var tmpPainter = new CanvasPainter(newId);
            newPainters.push(tmpPainter);
            if(this.eventsEnabled) {
                // setting files shifted to the painters
                var index = (this.scrollIndex + x + y) % this.numFiles;
                tmpPainter.setSeries(this.painters[0].series);
                tmpPainter.currentFile = tmpPainter.series[index];
                // set old values to the new painters
                tmpPainter.setWindowing(this.painters[0].getWindowing()[0], this.painters[0].getWindowing()[1]);
                //tmpPainter.setScale(this.painters[0].getScale());
                tmpPainter.setPan(this.painters[0].getPan()[0], this.painters[0].getPan()[1]);
                tmpPainter.drawImg();
                // update study and patient info
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
    // set new painters
    this.painters = newPainters;
};

/**
 * Resets all painters. 
 */
DcmViewer.prototype.resetHandler = function() {
    if(this.eventsEnabled) {
        for(var i = 0, len = this.painters.length; i < len; i++) {
            this.painters[i].reset();
        }
    }
};

/**
 * Click handler of the tree. Sets the clicked series and calls showSeries.
 * @param {Event} e Click event
 */
DcmViewer.prototype.treeClick = function(e) {
    if(e.target.nodeName === 'A' && e.target.dataset.type === 'file') {
        var serie = [];
        var arr = e.target.dataset.index.split(',');
        for(var i = 0; i < arr.length; i++) {
            serie.push(this.parsedFileList[arr[i]]);
        }
        this.showSeries(serie);
    }
};

/**
 * Builds a HTML-table with the Dicom file's meta data for jQuery Dialog.
 * @returns {HTML} table
 */
DcmViewer.prototype.openMetaDialog = function() {
    // alphabetical sort
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
    var headText1 = document.createTextNode('Field Name');
    headCell1.appendChild(headText1);
    var headCell2 = document.createElement("th");
    var headText2 = document.createTextNode('Content');
    headCell2.appendChild(headText2);
    headRow.appendChild(headCell1);
    headRow.appendChild(headCell2);
    head.appendChild(headRow);
    table.appendChild(head);

    var body = document.createElement('tbody');

    $.each(file, function(key, value) {
        if(!$.isFunction(value)) { 
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

/**
 * Updates the study and patient info using a given painter and selector.
 * @param {CanvasPainter} _this
 * @param {String} selector
 */
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

/**
 * Calculates the id of the div containing the painter.
 * @param {CanvasPainter} painter
 */
var getSelector = function(painter) {
    var row = painter.canvas.id.charAt(7);
    var column = painter.canvas.id.charAt(6);
    return '#row' + row + ' #column' + column;
};