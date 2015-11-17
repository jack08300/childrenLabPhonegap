var Calendar = function(){};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Calendar.prototype.init = function() {
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

Calendar.prototype.deviceReady = function() {
	this.attachEvent();

	app.addHeaderBar({title: 'Calendar'});
	app.addMenuBar();

};

Calendar.prototype.attachEvent = function() {
	var self = this;

	$('div.container').on('click', function() {
		$(this).toggleClass("second");
	});
};


new Calendar().init();