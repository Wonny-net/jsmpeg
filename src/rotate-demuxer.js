JSMpeg.Demuxer.Rotate = (function() { "use strict";

var Rotate = function(destination) {
    this.destination = destination
    this.onRotate = function(angle) { console.log('rotate=' + angle); }
}

Rotate.prototype.connect = function (streamId, destination) {
    this.destination.connect(streamId, destination);
};

Rotate.prototype.write = function (buffer) {
    if (typeof buffer === 'string') {
        switch (true) {
            case buffer.indexOf('rotate-angle=0') > -1:
            case buffer.indexOf('rotate-angle=360') > -1:
            case buffer.indexOf('rotate-angle=-360') > -1:
                this.onRotate(0);
                break;
            case buffer.indexOf('rotate-angle=90') > -1:
            case buffer.indexOf('rotate-angle=-270') > -1:
                this.onRotate(90);
                break;
            case buffer.indexOf('rotate-angle=180') > -1:
            case buffer.indexOf('rotate-angle=-180') > -1:
                this.onRotate(180);
                break;
            case buffer.indexOf('rotate-angle=-90') > -1:
            case buffer.indexOf('rotate-angle=270') > -1:
                this.onRotate(270);
                break;
        }
    } else {
        this.destination.write(buffer);
    }
};

return Rotate;

})();


