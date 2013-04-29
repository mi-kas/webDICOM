/**
 * @desc 
 * @author Michael Kaserer e1025263@student.tuwien.ac.at
 **/
function Tree() {
    var dcmTree = {};
    var _html = [];

    this.render = function(list) {
        dcmTree = {};
        _html = [];

        $('#errorMsg').empty();
        $('#fileTree').empty().html(dcmRender(buildFromDcmList(list))).tree({
            expanded: 'li:first'
        }).hide();
    };

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