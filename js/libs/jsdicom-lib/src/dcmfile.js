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
function DataElement(little_endian) {
    this.tag;
    this.vr;
    this.vl;
    this.data;
    this.little_endian = little_endian;
    var _get_value = function(element_to_value) {
        return function() {
            if(this.vr in element_to_value) {
                return element_to_value[this.vr](this.data, this.vl);
            } else {
                return undefined;
            }
        };
    };
    this.get_value = _get_value(this.little_endian ? element_to_value_le : element_to_value_be);

    var _get_repr = function(element_to_repr) {
        return function() {
            if(this.vr in element_to_repr) {
                return element_to_repr[this.vr](this.data, this.vl);
            } else {
                return undefined;
            }
        };
    }
    this.get_repr = _get_repr(this.little_endian ? element_to_repr_le : element_to_repr_be);
}

function DcmFile() {
    // File Meta Information
    this.meta_elements = {};
    this.data_elements = {};
}

DcmFile.prototype.get_meta_element = function(tag) {
    return this.meta_elements[tag];
}

DcmFile.prototype.get_element = function(tag) {
    return this.data_elements[tag];
}

DcmFile.prototype.get = function(tagname) {
    return this.data_elements[dcmdict[tag]].get_value();
}

DcmFile.prototype.getCTValue = function(col, row) {
    if(col < 0 || col >= this.Columns || row < 0 || row >= this.Rows)
        return undefined;
    var data_idx = (col + row*this.Columns);
    var intensity = this.PixelData[data_idx] * this.RescaleSlope + this.RescaleIntercept;
    return intensity;
}

DcmFile.prototype.getPatientCoordinate = function(col, row) {
        if (this.imagePosition == undefined || this.imageOrientationColumn == undefined || this.imageOrientationRow == undefined)
            return undefined;
        return [this.imagePosition[0] + row * this.imageOrientationRow[0] + col * this.imageOrientationColumn[0],
                this.imagePosition[1] + row * this.imageOrientationRow[1] + col * this.imageOrientationColumn[1],
                this.imagePosition[2] + row * this.imageOrientationRow[2] + col * this.imageOrientationColumn[2]];
}
