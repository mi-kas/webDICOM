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
function buffer_to_string(buffer, len)
{
    // Check for zeroes?
    var s = ""
    for(var i=0;i<len;++i) {
        if(buffer[i] == 0)
            break;
        s += String.fromCharCode(buffer[i]);
    }
    return s;
}

function buffer_to_string_float(buffer, len)
{
    var vals = buffer_to_string(buffer, len).split("\\").map(parseFloat);
    if(vals.length == 1)
        return vals[0];
    else
        return vals;
}

function buffer_to_unsigned_le(buffer, len) {
    var i = len-1;
    var n = 0;
    for(;i>=0;--i)
    {
        n = n*256 + buffer[i];
    }
    return n;
}

function buffer_to_unsigned_be(buffer, len) {
    var i = 0;
    var n = 0;
    for(;i<len;i++)
    {
        n = n*256 + buffer[i];
    }
    return n;
}

function buffer_to_uint16array_le(buffer, len) {
    retval = new Uint16Array(buffer.buffer, buffer.byteOffset, len/2);
    
    return retval;
}

function buffer_to_uint16array_be(buffer, len) {
    for(var i=0; i<len; i+=2) {
        ra = buffer[i];
        rb = buffer[i+1];
        buffer[i] = rb;
        buffer[i+1] = ra;
    }
    
    retval = new Uint16Array(buffer.buffer, buffer.byteOffset, len/2);
    
    return retval;
}

function buffer_to_uint8array(buffer, len) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, len);
}

function buffer_to_integer_string(buffer, len) {
    return parseInt(buffer_to_string(buffer, len));
}

// Converts value to readable format
var element_to_repr_le = {
    "AE": buffer_to_string,
    "AS": buffer_to_string,
    "DS": buffer_to_string,
    "CS": buffer_to_string,
    "UI": buffer_to_string,
    "DA": buffer_to_string,
    "PN": buffer_to_string,
    "TM": buffer_to_string,
    "UT": buffer_to_string,
    "US": buffer_to_unsigned_le,
    "UL": buffer_to_unsigned_le,
    "IS": buffer_to_integer_string
}

var element_to_repr_be = {
    "AE": buffer_to_string,
    "AS": buffer_to_string,
    "DS": buffer_to_string,
    "CS": buffer_to_string,
    "UI": buffer_to_string,
    "DA": buffer_to_string,
    "PN": buffer_to_string,
    "TM": buffer_to_string,
    "UT": buffer_to_string,
    "US": buffer_to_unsigned_be,
    "UL": buffer_to_unsigned_be,
    "IS": buffer_to_integer_string
}

var element_to_value_le = {
    "AE": buffer_to_string,
    "AS": buffer_to_string,
    "DS": buffer_to_string_float,
    "CS": buffer_to_string,
    "UI": buffer_to_string,
    "DA": buffer_to_string,
    "PN": buffer_to_string,
    "LO": buffer_to_string,
    "TM": buffer_to_string,
    "UT": buffer_to_string,
    "US": buffer_to_unsigned_le,
    "UL": buffer_to_unsigned_le,
    "IS": buffer_to_integer_string,
    "OW": buffer_to_uint16array_le,
    "OB": buffer_to_uint8array
}

var element_to_value_be = {
    "AE": buffer_to_string,
    "AS": buffer_to_string,
    "DS": buffer_to_string_float,
    "CS": buffer_to_string,
    "UI": buffer_to_string,
    "DA": buffer_to_string,
    "PN": buffer_to_string,
    "LO": buffer_to_string,
    "TM": buffer_to_string,
    "UT": buffer_to_string,
    "US": buffer_to_unsigned_be,
    "UL": buffer_to_unsigned_be,
    "IS": buffer_to_integer_string,
    "OW": buffer_to_uint16array_be,
    "OB": buffer_to_uint8array,
}

function tag_repr(tag) {
    var t = tag.toString(16).toUpperCase();
    while(t.length < 8)
        t="0"+t;
    t = "(" + t.substr(0,4) + ", " + t.substr(4,4) + ")"; 
    return t;
}
// Element to stuff
function element_repr(elem) {
    // Convert tag to dicom format
    var tag = elem.tag.toString(16).toUpperCase();
    while(tag.length < 8)
        tag="0"+tag;
    tag = "(" + tag.substr(0,4) + ", " + tag.substr(4,4) + ")"; 
    if(elem.vr in element_to_repr)
    {
        return tag + " - " + element_to_repr[elem.vr](elem.data, elem.vl);
    }
    return tag + " VR: " + elem.vr;
}

/*function zero_out_pixel_padding(file, padding_value) {
    // Zero out all pixels with value PixelPaddingValue
    for(var i=0;i<file.pixel_data.length) {
        file.pixel_data
    }
}*/
