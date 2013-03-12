$(document).ready(function(){
    test("Parse a single element, little-endian, implicit VR", function() {
        var buf = new Uint8Array(Array(0xe0, 0x7f, 0x10, 0x00, 0x04, 0x00, 0x00, 0x00,
                                       0x34, 0x12, 0x78, 0x56));
        
        var ts = "1.2.840.10008.1.2";
        var element_reader = get_element_reader(ts);
        var offset = 0;
        var element = new DataElement(is_little_endian[ts]);
        offset = element_reader.read_element(buf, 0, element);
        equal(element.vr, "ox", "vr");
        equal(element.vl, 4, "vl");
        console.log("Setting VR to OW for testing");
        element.vr = "OW";
        equal(element.vr, "OW", "vr");
        equal(element.tag.toString(16), 0x7fe00010.toString(16), "tag");
        var value = element.get_value();
        equal(value[0].toString(16), 0x1234.toString(16), "value[0]");
        equal(value[1].toString(16), 0x5678.toString(16), "value[1]");
        equal(offset, 12, "offset");
    });

    test("Parse a single element, little-endian, explicit VR", function() {
        var buf = new Uint8Array(Array(0xe0, 0x7f, 0x10, 0x00, 0x4f, 0x57, 0x00, 0x00,
                                       0x04, 0x00, 0x00, 0x00, 0x34, 0x12, 0x78, 0x56));
        
        var ts = "1.2.840.10008.1.2.1";
        var element_reader = get_element_reader(ts);
        var offset = 0;
        var element = new DataElement(is_little_endian[ts]);
        offset = element_reader.read_element(buf, 0, element);
        equal(element.vr, "OW", "vr");
        equal(element.vl, 4, "vl");
        equal(element.tag.toString(16), 0x7fe00010.toString(16), "tag");
        var value = element.get_value();
        equal(value[0].toString(16), 0x1234.toString(16), "value[0]");
        equal(value[1].toString(16), 0x5678.toString(16), "value[1]");
        equal(offset, 16, "offset");
    });

    test("Parse a single element, big-endian, explicit VR", function() {
        var buf = new Uint8Array(Array(0x7f, 0xe0, 0x00, 0x10, 0x4f, 0x57, 0x00, 0x00, 
                                       0x00, 0x00, 0x00, 0x04, 0x12, 0x34, 0x56, 0x78));
        
        var ts = "1.2.840.10008.1.2.2";
        var element_reader = get_element_reader(ts);
        var offset = 0;
        var element = new DataElement(is_little_endian[ts]);
        offset = element_reader.read_element(buf, 0, element);
        equal(element.vr, "OW", "vr");
        equal(element.vl, 4, "vl");
        equal(element.tag.toString(16), 0x7fe00010.toString(16), "tag");
        var value = element.get_value();
        equal(value[0].toString(16), 0x1234.toString(16), "value[0]");
        equal(value[1].toString(16), 0x5678.toString(16), "value[1]");
        equal(offset, 16, "offset");
    });
    test("Parse a sequence element w. explicit length, little-endian, explicit VR", function() {
        var buf = new Uint8Array(Array(0x08, 0x00, 0x11, 0x11, 0x53, 0x51, 0x00, 0x00, 0x62, 0x00, 0x00, 0x00, 0xfe, 0xff, 0x00, 0xe0, 0x5a, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x55, 0x4c, 0x04, 0x00, 0x4e, 0x00, 0x00, 0x00, 0x08, 0x00, 0x50, 0x11, 0x55, 0x49, 0x18, 0x00, 0x31, 0x2e, 0x32, 0x2e, 0x38, 0x34, 0x30, 0x2e, 0x31, 0x30, 0x30, 0x30, 0x38, 0x2e, 0x33, 0x2e, 0x31, 0x2e, 0x32, 0x2e, 0x33, 0x2e, 0x33, 0x00, 0x08, 0x00, 0x55, 0x11, 0x55, 0x49, 0x26, 0x00, 0x31, 0x2e, 0x32, 0x2e, 0x38, 0x34, 0x30, 0x2e, 0x31, 0x31, 0x33, 0x37, 0x30, 0x34, 0x2e, 0x31, 0x2e, 0x31, 0x31, 0x31, 0x2e, 0x31, 0x31, 0x33, 0x32, 0x2e, 0x31, 0x32, 0x31, 0x37, 0x34, 0x38, 0x34, 0x35, 0x36, 0x37, 0x2e, 0x36));

        var ts = "1.2.840.10008.1.2.1";
        var element_reader = get_element_reader(ts);
        var offset = 0;
        var element = new DataElement(is_little_endian[ts]);
        offset = element_reader.read_element(buf, 0, element);

        equal(element.vr, "SQ", "vr");
        equal(element.vl, 0x62, "vr");
        equal(element.sequence_items.length, 3, "Item count");
        //equal(element.vl, 4, "vl");
        return;
    });
    test("Parse nested sequence element w. implicit length, little-endian, implicit VR", function() {
        /* DCMDUMP:
        (0008,1115) SQ (Sequence with undefined length #=1)     # u/l, 1 ReferencedSeriesSequence
          (fffe,e000) na (Item with undefined length #=4)         # u/l, 1 Item
            (0008,0000) UL 60                                       #   4, 1 IdentifyingGroupLength
            (0008,1140) SQ (Sequence with undefined length #=1)     # u/l, 1 ReferencedImageSequence
              (fffe,e000) na (Item with undefined length #=3)         # u/l, 1 Item
                (0008,0000) UL 16                                       #   4, 1 IdentifyingGroupLength
                (0008,1150) UI (no value available)                     #   0, 0 ReferencedSOPClassUID
                (0008,1155) UI (no value available)                     #   0, 0 ReferencedSOPInstanceUID
              (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
            (fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
            (0020,0000) UL 8                                        #   4, 1 ImageGroupLength
            (0020,000e) UI (no value available)                     #   0, 0 SeriesInstanceUID
          (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
        (fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
        */
        
        var buf = new Uint8Array(Array(0x08, 0x00, 0x15, 0x11, 0xff, 0xff, 0xff, 0xff, 0xfe, 0xff, 0x00, 0xe0, 0xff, 0xff, 0xff, 0xff, 0x08, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x3c, 0x00, 0x00, 0x00, 0x08, 0x00, 0x40, 0x11, 0xff, 0xff, 0xff, 0xff, 0xfe, 0xff, 0x00, 0xe0, 0xff, 0xff, 0xff, 0xff, 0x08, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x08, 0x00, 0x50, 0x11, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x55, 0x11, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0x0d, 0xe0, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x20, 0x00, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0x0d, 0xe0, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00));

        var ts = "1.2.840.10008.1.2";
        var element_reader = get_element_reader(ts);
        var offset = 0;
        var element = new DataElement(is_little_endian[ts]);
        offset = element_reader.read_element(buf, 0, element);

        equal(element.vr, "SQ", "vr");
        equal(element.sequence_items.length, 4, "Top SQ item count");
        equal(element.sequence_items[1].sequence_items.length, 3, "Nested SQ item items");
        equal(offset, buf.length, "Offset");
    });

    test("Parse private sequence element, assume SQ if next tag is itemstart", function() {
        /* DCMDUMP:
        (2001,9000) SQ (Sequence with undefined length #=1)     # u/l, 1 Unknown Tag & Data
          (fffe,e000) na (Item with undefined length #=32)        # u/l, 1 Item
            (0008,0000) UL 140                                      #   4, 1 IdentifyingGroupLength
            (0008,0016) UI (no value available)                     #   0, 0 SOPClassUID
            (0008,0018) UI (no value available)                     #   0, 0 SOPInstanceUID
          (fffe,e00d) na (ItemDelimitationItem)                   #   0, 0 ItemDelimitationItem
        (fffe,e0dd) na (SequenceDelimitationItem)               #   0, 0 SequenceDelimitationItem
        */
        
        var buf = new Uint8Array(Array(0x01, 0x20, 0x00, 0x90, 0xff, 0xff, 0xff, 0xff, 0xfe, 0xff, 0x00, 0xe0, 0xff, 0xff, 0xff, 0xff, 0x08, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x8c, 0x00, 0x00, 0x00, 0x08, 0x00, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x00, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0x0d, 0xe0, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xff, 0xdd, 0xe0, 0x00, 0x00, 0x00, 0x00));
        

        var ts = "1.2.840.10008.1.2";
        var element_reader = get_element_reader(ts);
        var offset = 0;
        var element = new DataElement(is_little_endian[ts]);
        offset = element_reader.read_element(buf, 0, element);

        equal(element.vr, "SQ", "vr");
        equal(element.sequence_items.length, 3, "SQ item count");
        equal(offset, buf.length, "Offset");
    });

    test("Write tag little endian", function() {
        var buffer = new Uint8Array(4);
        write_tag_LE(buffer, 0, 0xff11ee22);
        equal(buffer[0], 0x11, '1st byte');
        equal(buffer[1], 0xff, '2nd byte');
        equal(buffer[2], 0x22, '3rd byte');
        equal(buffer[3], 0xee, '4th byte');
    });

    test("Write tag big endian", function() {
        var buffer = new Uint8Array(4);
        write_tag_BE(buffer, 0, 0xff11ee22);
        equal(buffer[0], 0xff, '1st byte');
        equal(buffer[1], 0x11, '2nd byte');
        equal(buffer[2], 0xee, '3rd byte');
        equal(buffer[3], 0x22, '4th byte');
    });

    test("Write 16-bit number little endian", function() {
        var buffer = new Uint8Array(2);
        write_number_LE(buffer, 0, 2, 17454);
        equal(buffer[0], 0x2e, '1st byte');
        equal(buffer[1], 0x44, '2nd byte');
    });

    test("Write 16-bit number big endian", function() {
        var buffer = new Uint8Array(2);
        write_number_BE(buffer, 0, 2, 17454);
        equal(buffer[0], 0x44, '1st byte');
        equal(buffer[1], 0x2e, '2nd byte');
    });

    test("Write 32-bit number little endian", function() {
        var buffer = new Uint8Array(4);
        write_number_LE(buffer, 0, 4, 1374263);
        equal(buffer[0], 0x37, '1st byte');
        equal(buffer[1], 0xf8, '2nd byte');
        equal(buffer[2], 0x14, '3rd byte');
        equal(buffer[3], 0x00, '4th byte');
    });

    test("Write 32-bit number little endian", function() {
        var buffer = new Uint8Array(4);
        write_number_BE(buffer, 0, 4, 1374263);
        equal(buffer[0], 0x00, '1st byte');
        equal(buffer[1], 0x14, '2nd byte');
        equal(buffer[2], 0xf8, '3rd byte');
        equal(buffer[3], 0x37, '4th byte');
    });
});
