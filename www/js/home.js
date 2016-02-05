var Home = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Home.prototype.init = function () {
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

Home.prototype.deviceReady = function () {
	var self = this;

	app.addHeaderBar({title: 'My Watch'});

	app.addMenuBar();

	this.attachEvent();

};

Home.prototype.attachEvent = function () {
	var self = this;


};


new Home().init();