var ScheduleMenu = function () {
};

ScheduleMenu.prototype.init = function () {
	this.$myScheduleButton = $('div.myScheduleButton');
	this.$searchScheduleButton = $('div.searchScheduleButton');

	app.addTopNavigater({
		left: true,
		right: false
	});

	this.attachEvent();
};

ScheduleMenu.prototype.attachEvent = function() {
	var self = this;

	this.$myScheduleButton.on('click', function(){
		self.openCalendar();
	});

};

ScheduleMenu.prototype.openCalendar = function() {

};

new ScheduleMenu().init();