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
function DicomParser(buffer) {
    this.buffer = buffer;
}

DicomParser.prototype.read_number = function(offset, length) {
    // NOTE: Only little endian
    var it = offset+length-1;
    var n = 0;
    for(;it>=offset;--it)
    {
        var tmp = this.buffer[it];
        n = n*256 + this.buffer[it];
    }
    return n;
}


DicomParser.prototype.read_string = function(start, len) {
    var s = ""
    var end = start+len;
    for(var i=start;i<end;++i) {
        s += String.fromCharCode(this.buffer[i]);
    }
    return s;
}

DicomParser.prototype.read_VR = function(offset) {
    return this.read_string(offset, 2);
}

DicomParser.prototype.read_tag = function(offset) {
    var vl = this.buffer[offset+1]*256*256*256 + this.buffer[offset]*256*256 +
             this.buffer[offset+3]*256 + this.buffer[offset+2];
    return vl;
}

DicomParser.prototype.parse_file = function() {
    var file = new DcmFile();
    // Look for DICM at pos 128
    var magicword = this.read_string(128, 4);
    if(magicword != "DICM")
    {
        //log("DICM key NOT found, aborting");
        console.log("no magic word found");
        return;
    }
    // File Meta Information should always use Explicit VR Little Endian(1.2.840.10008.1.2.1)
    // Parse Meta Information Group Length
    var offset = 132;
    var tag = this.read_tag(offset);
    offset += 4;

    var vr = this.read_VR(offset);
    offset += 2;

    var vl = this.read_number(offset, 2);
    offset += 2;

    var value = this.read_number(offset, vl);
    offset += vl;
    var meta_element_end = offset+value;

    // Parse File Meta Information
    while(offset < meta_element_end) {
        var meta_element = new DataElement(true);
        offset = meta_element_reader.read_element(this.buffer, offset, meta_element);
        file.meta_elements[meta_element.tag] = meta_element;
    }

    var transfer_syntax = file.get_meta_element(0x00020010).get_value();
    var little_endian = is_little_endian[transfer_syntax];
    // Get reader for transfer syntax
    var element_reader = get_element_reader(transfer_syntax);
    if(element_reader == undefined)
        throw "Unknown TransferSyntaxUID";

    // Parse Dicom-Data-Set
    while(offset + 6 < this.buffer.length) {
        var data_element = new DataElement(little_endian);

        offset = element_reader.read_element(this.buffer, offset, data_element);
        file.data_elements[data_element.tag] = data_element;
        if(data_element.tag in dcmdict)
            file[dcmdict[data_element.tag][1]] = data_element.get_value();
    }

    if(element_reader._implicit && 'PixelData' in file && file.PixelData == undefined) {
        if(file.BitsStored == 16) {
            data_element = file.data_elements[dcmdict['PixelData']];
            data_element.vr = "OW";
            file[dcmdict[data_element.tag][1]] = data_element.get_value(); 
        } else if(file.BitsStored == 8) {
            data_element = file.data_elements[dcmdict['PixelData']];
            data_element.vr = "OB";
            file[dcmdict[data_element.tag][1]] = data_element.get_value(); 
        }
    }
    return file;
}
