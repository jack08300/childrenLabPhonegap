var ScheduleMenu = function () {
};

ScheduleMenu.prototype.init = function () {
	this.$myScheduleButton = $('div.myScheduleButton');
	this.$createScheduleButton = $('div.createScheduleButton');
	this.$searchScheduleButton = $('div.searchScheduleButton');
	this.$startDateInput = $('#startDatePicker');
	this.$endDateInput = $('#endDatePicker');
	this.startDateTime = "";
	this.endDateTime = "";
	this.drawerOpened = false;

	this.drawerOptions = {
		"origin"         : "left", // 'left|right', open the drawer from this side of the view, default 'left'
		"action"         : "open", // 'open|close', default 'open'
		"duration"       :    300, // in milliseconds (ms), default 400
		"iosdelay"       :     50, // ms to wait for the iOS webview to update before animation kicks in, default 60
		"href"					 : "#pageslide"
	};

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

	this.$startDateInput.on('click', function(){
		self.showDateTimePicker($(this), "start");
	});

	this.$endDateInput.on('click', function(){
		self.showDateTimePicker($(this), "end");
	});

	this.$createScheduleButton.on('click', function(){
		self.createSchedulePopup();
	});

};

ScheduleMenu.prototype.showDateTimePicker = function($field, field) {
	var self = this;

	var options = {
		date : new Date(),
		mode: 'datetime',
		allowOldDates: false,
		minDate: this.startDateTime
	};

	datePicker.show(options, function(date){
		field == "start" ? self.startDateTime = date : self.endDateTime = date;
		var dateString = date.getFullYear().toString() + "/" + (date.getMonth()+1).toString() + "/" +
			date.getDate().toString() + " " + date.getHours().toString() + ":" + date.getMinutes().toString();

		$field.html(dateString);
	});
};

ScheduleMenu.prototype.createSchedulePopup = function(){
	var self = this;
/*
	if(!this.startDateTime || !this.endDateTime){
		app.notification(
			"Error",
			"Please select your start date and end date first"
		);

		return false;
	}
*/
	//this.drawerAction();
	var dialog = new Dialog();
	dialog.init({
		startDate: this.startDateTime,
		endDate: this.endDateTime
	});

};

ScheduleMenu.prototype.drawerAction = function(){
	var self = this;


};

ScheduleMenu.prototype.openCalendar = function() {

};

new ScheduleMenu().init();