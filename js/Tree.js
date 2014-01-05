/**
 * @desc Builds a tree structure from a array of Dicom files.
 * @author Michael Kaserer 
 **/
function Tree() {
    var dcmTree = {};
    var _html = [];

    /**
     * Takes an array of Dicom files as input and computes a tree structure with html unordered lists.
     * @param {Array} list
     */
    this.render = function(list) {
        dcmTree = {};
        _html = [];
        
        // Render the tree with the jqueryTree plugin
        $('#fileTree').empty().html(dcmRender(buildFromDcmList(list))).tree({
            expanded: 'li:first'
        });
    };

    /**
     * Builds a JSON tree structure form a array of Dicom files. 1st level --> PatientsName. 2nd level --> SeriesDescription.
     * @param {Array} files Array with Dicom files
     * @returns JSON tree structure
     */
    var buildFromDcmList = function(files) {
        for(var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            var level1 = file.PatientsName ? file.PatientsName : 'undefined';
            var level2 = file.SeriesDescription ? file.SeriesDescription : 'undefined';

            if(!dcmTree[level1]) {
                dcmTree[level1] = {};
                dcmTree[level1][level2] = [];
                dcmTree[level1][level2].push(i);
            } else {
                if(!dcmTree[level1][level2]) {
                    dcmTree[level1][level2] = [];
                    dcmTree[level1][level2].push(i);
                } else {
                    dcmTree[level1][level2].push(i);
                }
            }
        }
        return dcmTree;
    };

    /**
     * Build a HTML unordered list from a JSON tree structure.
     * @param {JSON} tree
     * @returns HTML ul
     */
    var dcmRender = function(tree) {
        if(tree) {
            for(var object in tree) {
                if($.isArray(tree[object])) { // series have an array - patients a object
                    _html.push('<li><a href="#" data-type="file" data-index="' + tree[object] + '" >', object, '</a></li>');
                } else {
                    _html.push('<li><a href="#" data-type="folder">', object, '</a>');
                    _html.push('<ul>');
                    dcmRender(tree[object]);
                    _html.push('</ul>');
                }
            }
            return _html.join('');
        }
    };
}