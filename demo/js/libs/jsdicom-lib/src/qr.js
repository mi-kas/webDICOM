/**
* Copyright 2012 Infogosoft
*
* This file is part of jsdicom.
*
* jsdicom is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
*
* jsdicom is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along with jsdicom. If not, see http://www.gnu.org/licenses/.
*/

function getTagByName(tagname, ds) { 
    return $.map($.grep(ds, function (a) { 
        return a['name'] == tagname; }), function (tag) { 
            return tag['value']; 
        })[0];
}

function getTagsInArray(array, tagnames) {
    return $.map(array, function(ds) {
        tags = {};
        $.each(tagnames, function(i, tagname) {
            tags[tagname] = getTagByName(tagname, ds);
        });
        return tags;
    });
}

function listPacsNames(success) {
    $.getJSON('/', function(data) {
        success(data['pacsnames']);
    });
}

function findAllPatients(pacsname, success) {
    $.getJSON('/' + pacsname + '/find/patient?PatientID&PatientsName', function(data) {
        success(getTagsInArray(data['datasets'], ["Patient's Name", 'Patient ID']));
    });
}

function findStudiesInPatient(pacsname, patientid, success) {
    $.getJSON('/' + pacsname + '/find/study?PatientID=' + patientid + '&StudyDate&StudyTime&StudyDescription&StudyInstanceUID', function(data) {
        success(getTagsInArray(data['datasets'], ['Study Date', 'Study Time', 'Study Instance UID', 'Study Description']));
    });
}

function findSeriesInStudy(pacsname, patientid, studyinstanceuid, success) {
    $.getJSON('/' + pacsname + '/find/series?PatientID=' + patientid + '&StudyInstanceUID=' + studyinstanceuid + '&Modality&SeriesInstanceUID&SeriesNumber&SeriesDate&SeriesTime&SeriesDescription', function(data) {
        success(getTagsInArray(data['datasets'], ['Modality', 'Series Instance UID', 'Series Number', 'Series Date', 'Series Time', 'Series Description']));
    });
}

function findImagesInSeries(pacsname, patientid, studyinstanceuid, seriesinstanceuid, success) {
    $.getJSON('/' + pacsname + '/find/image?PatientID=' + patientid + '&StudyInstanceUID=' + studyinstanceuid + '&SeriesInstanceUID=' + seriesinstanceuid + '&SOPInstanceUID', function(data) {
        success($.map(getTagsInArray(data['datasets'], ['SOP Instance UID']), 
                      function(t) { 
                          return '/' + pacsname + '/get/image?PatientID=' + patientid + '&StudyInstanceUID=' + studyinstanceuid + '&SeriesInstanceUID=' + seriesinstanceuid + '&SOPInstanceUID=' + t['SOP Instance UID']
                      }));
    });
}

function load_images_in_series(app, pacsname, patientid, studyinstanceuid, seriesinstanceuid)
{
    app.curr_file_idx = 0;
    app.files_loaded = 0;

    findImagesInSeries(pacsname, patientid, studyinstanceuid, seriesinstanceuid, function(urls) {
        for(var i=0;i<urls.length;++i) {
            app.load_url(urls[i], i, urls.length);
        }

        $("#slider").slider({
            value: 0,
            max: urls.length-1,
            slide: function(ui, event) {
                app.curr_file_idx = event.value; //$(this).slider('value');
                app.curr_tool.set_file(app.files[app.curr_file_idx]);
                app.draw_image();
            }
        });
    });
}
