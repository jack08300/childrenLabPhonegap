var Dashboard = function(){};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Dashboard.prototype.init = function() {
	var self = this;
	document.addEventListener('deviceready', function () {
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.deviceReady();
	});
};

Dashboard.prototype.deviceReady = function() {
	this.attachEvent();

	app.addHeaderBar({title: 'Dashboard'});
	app.addMenuBar();
};

Dashboard.prototype.attachEvent = function() {
	var self = this;

	$('div.weatherButton').on('click', function(){
		window.location = window.rootPath + "pages/temperature.html";
	});

	$('div.uvButton').on('click', function(){
		window.location = window.rootPath + "pages/uv.html";
	});
};


new Dashboard().init();