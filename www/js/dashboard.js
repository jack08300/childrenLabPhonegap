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

	this.dashboardPage = $('div.dashboardPage');
	this.dashboardButtons = $('div.dashboardButtons');
	this.container = $('div.container', this.dashboardPage);
	this.menu = $('div.menu');


	var width = this.dashboardPage.width();

	var centerWidth = (width / 2) - (this.dashboardButtons.width() / 2);
	this.dashboardButtons.css('left', centerWidth);

	this.content = $('div.content', this.dashboardPage);
	var height = this.container.height();

	var centerHeight = ((height - (this.menu.height()+80)) / 2) - (this.content.height() / 2);
	centerWidth = (width/2) - (this.content.width() / 2);
	this.content.css({
		left: centerWidth,
		top: centerHeight
	});
};

Dashboard.prototype.attachEvent = function() {
	var self = this;

	$('div.weatherButton').on('click', this.dashboardButtons, function(){
		window.location = window.rootPath + "pages/temperature.html";
	});

	$('div.uvButton').on('click', this.dashboardButtons, function(){
		window.location = window.rootPath + "pages/uv.html";
	});

	$('div.activityButton').on('click', this.dashboardButtons, function(){
		window.location = window.rootPath + "pages/activity.html";
	});
};


new Dashboard().init();