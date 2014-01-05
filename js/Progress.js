/**
 * @desc This JavaScript worker takes the number of files and perform
 * progress with a certain delay for the progressbar.
 * It posts the current percentual value of the progressbar back to the HTML file.
 * @author Michael Kaserer
 **/
var current = 0;
var max = 100;
var self = this;

self.addEventListener('message', function(e) {
    max = e.data;
    self.postMessage('Max: ' + max);
}, false);

var progress = setInterval(function() {
    self.postMessage('Max: ' + max);
    if(current >= max) {
        clearInterval(progress);
    } else {
        current += 5;
        postMessage(((current / max) * 100).toFixed(0));
    }
}, 20);