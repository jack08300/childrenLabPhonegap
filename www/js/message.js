var Message = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Message.prototype.init = function () {
	var self = this;
	document.addEventListener('deviceready', function () {
		//self.deviceReady();
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.deviceReady();
	});

};

Message.prototype.deviceReady = function () {

	app.addHeaderBar({title: 'Message'});

	app.addMenuBar();
};

new Message().init();