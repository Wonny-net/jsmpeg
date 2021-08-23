JSMpeg.Source.WebSocket = (function(){ "use strict";

var WSSource = function(url, options) {
	this.url = url;
	this.urlAudio = options.urlAudio || null;
	this.options = options;
	this.socket = null;
	this.streaming = true;

	this.callbacks = {connect: [], data: []};
	this.destination = null;

	this.reconnectInterval = options.reconnectInterval !== undefined
		? options.reconnectInterval
		: 5;
	this.shouldAttemptReconnect = !!this.reconnectInterval;

	this.completed = false;
	this.established = false;
	this.progress = 0;

	this.reconnectTimeoutId = 0;

	this.onEstablishedCallback = options.onSourceEstablished;
	this.onCompletedCallback = options.onSourceCompleted; // Never used

	if (options.downloadBuffer || false) {
		this.allBuffer = new JSMpeg.BitBuffer(0, JSMpeg.BitBuffer.MODE.EXPAND);
	}
};

WSSource.prototype.connect = function(destination) {
	this.destination = destination;
};

WSSource.prototype.destroy = function() {
	clearTimeout(this.reconnectTimeoutId);
	this.shouldAttemptReconnect = false;
	this.socket.close();
};

WSSource.prototype.start = function() {
	this.shouldAttemptReconnect = !!this.reconnectInterval;
	this.progress = 0;
	this.established = false;

	this.socket = this.newSocket(this.url);
};

WSSource.prototype.newSocket = function(url) {
	var socket
	if (this.options.protocols) {
		socket = new WebSocket(url, this.options.protocols);
	} else {
		socket = new WebSocket(url);
	}
	socket.binaryType = 'arraybuffer';
	socket.onmessage = this.onMessage.bind(this);
	socket.onopen = this.onOpen.bind(this);
	socket.onerror = this.onError.bind(this);
	socket.onclose = this.onClose.bind(this);
	return socket;
};

WSSource.prototype.resume = function(secondsHeadroom) {
	// Nothing to do here
};

WSSource.prototype.onOpen = function() {
	this.progress = 1;
};

WSSource.prototype.onClose = function() {
	if (this.shouldAttemptReconnect) {
		clearTimeout(this.reconnectTimeoutId);
		this.reconnectTimeoutId = setTimeout(function(){
			this.start();	
		}.bind(this), this.reconnectInterval*1000);
	}
	if (this.options.onCloseCallback !== undefined) {
		this.options.onCloseCallback();
	}
};

WSSource.prototype.onError = function() {
	console.error('websocket error -- ' + JSON.stringify(arguments));
	this.onClose();
}

WSSource.prototype.onMessage = function(ev) {
	var isFirstChunk = !this.established;
	this.established = true;

	if (isFirstChunk && this.onEstablishedCallback) {
		this.onEstablishedCallback(this);
	}

	if (this.destination) {
		this.destination.write(ev.data);
	}

	if (this.allBuffer !== undefined) {
		this.allBuffer.write(ev.data);
	}
};

return WSSource;

})();

