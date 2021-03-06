var Calendar = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Calendar.prototype.init = function () {
	var self = this;
	this.now = moment();
	this.tempDate = moment();

	document.addEventListener('deviceready', function () {
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function () {
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function () {
		self.deviceReady();
	});
};

Calendar.prototype.deviceReady = function () {
	app.tool.showLoading();

	app.addHeaderBar({
		title: 'Calendar',
		context: this,
		addButton: {name: 'calendar', callback: this.loadAddCalendarPage},
		backButton: {name: 'calendar none'}
	});
	app.addMenuBar();

	this.$backButton = $('div.backButton');
	this.$backButton.on('click', function () {
		window.location = window.rootPath + "pages/calendar.html";
	});

	this.$body = $('body');
	this.$calendarPage = $('#calendarPage');
	this.$calendarHeader = $('div.calendarHeader');
	this.$calendarContent = $('div.calendarContent');
	this.$days = $('div.days', this.$calendarContent);
	this.$monthYear = $('div.monthYear', this.$calendarHeader);
	this.$arrowLeft = $('div.arrow-left', this.$calendarPage);
	this.$arrowRight = $('div.arrow-right', this.$calendarPage);
	this.$body.attr('data', 'month');
	this.getCalendarEvents();

};

Calendar.prototype.getCalendarEvents = function () {
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.getCalendarEvent,
		type: 'POST',
		context: this,
		data: {
			query: "month",
			month: this.tempDate.month() + 1,
			year: this.tempDate.year()
		},
		callback: this.getCalendarEvents_load
	});
};

Calendar.prototype.getCalendarEvents_load = function (data) {
	this.calendarEvents = data.events;
	this.updateCalendar(data);
};

Calendar.prototype.updateCalendar = function (oArgs) {
	var self = this;

	var endOfMonth = this.tempDate.endOf('month').date();
	var startOfDay = this.tempDate.startOf('month').day();
	var today = this.now.get('date');

	this.$monthYear.html(this.tempDate.format("MMMM") + " " + this.tempDate.year());

	var $day = $('<div class="day"></div>');

	var $tempDay;
	this.$days.html("");
	//Create blank space
	for (var i = 0; i < startOfDay; i++) {
		$tempDay = $day.clone();
		this.$days.append($tempDay);
	}

	for (i = 1; i <= endOfMonth; i++) {
		$tempDay = $day.html('<span>' + i + '</span>').attr('data', i).clone();
		if ((this.tempDate.year() == this.now.year() && this.tempDate.month() == this.now.month()) && today == i) {
			$tempDay.addClass('today');
		}

		var events = this.getCalendarEventByDay(i);
		for (var j = 0; j < events.length && j < 3; j++) {
			$tempDay.append('<span class="event ' + events[j].color + '" style="left: ' + (5 + 2 * j) + 'vw;"></span>').addClass("hasEvent");
		}

		this.$days.append($tempDay);
	}

	this.attachEvent();
	app.tool.hideLoading();
};

Calendar.prototype.getCalendarEventByDay = function (day) {
	var events = [];

	for (var i = 0; i < this.calendarEvents.length; i++) {
		var date = moment(this.calendarEvents[i].startDate, "YYYY-MM-DD HH:mm:ss");

		if (day == date.date()) {
			events.push(this.calendarEvents[i])
		}
	}

	return events
};

Calendar.prototype.attachEvent = function () {
	var self = this;

	$('div.container').on('click', function () {
		$(this).toggleClass("second");
	});

	this.$arrowLeft.on('click', this.$calendarHeader, function () {
		self.updateTempDate($(this), -1);
	});
	this.$arrowRight.on('click', this.$calendarHeader, function () {
		self.updateTempDate($(this), +1);
	});

	$('div.day.hasEvent').on('click', this.$days, function () {
		self.renderEventPage({$day: $(this)});
	});


	var mc = new Hammer(document.getElementsByClassName('calendarPage')[0]);

	mc.on("swipeleft swiperight", function (ev) {
		mc.off("swipeleft swiperight");
		if (ev.type == "swiperight") {
			self.updateTempDate($(this), -1);
		} else if (ev.type == "swipeleft") {
			self.updateTempDate($(this), +1);
		}
	});
};


Calendar.prototype.updateTempDate = function ($this, number) {
	switch (this.$body.attr('data')) {
		case 'month':
			this.tempDate = this.tempDate.month(this.tempDate.month() + number);

	}

	this.getCalendarEvents();
};

Calendar.prototype.loadAddCalendarPage = function () {
	app.loadTemplate({
		path: 'template/addCalendar.html',
		appendTo: 'div.container',
		cleanPage: true,
		context: this,
		callback: this.renderAddCalendar
	});
};

Calendar.prototype.renderAddCalendar = function () {
	var self = this;

	this.$container = $('div.container');
	this.$startDate = $('div.startDate', this.$container);
	this.$endDate = $('div.endDate', this.$container);
	this.$colorSelection = $('div.colorSelection', this.$container);
	this.$colorOption = $('div.selection', this.$colorSelection);
	this.$option = $('span', this.$colorOption);
	this.$submit = $('div.submit', this.$container);

	//var temp = moment().set({'year': this.tempDate.year(), 'month': this.tempDate.month(), 'date': this.selectedDay});
	//this.$startDate.html(temp.format("YYYY/MM/DD hh:mm:ss"));

	this.$startDate.on('click', function (e) {
		e.preventDefault();
		self.showDateTimePicker($(this), "start");

		return false;
	});

	this.$endDate.on('click', function (e) {
		e.preventDefault();
		self.showDateTimePicker($(this), "start");

		return false;
	});

	this.$colorSelection.on('click', function () {
		$(this).toggleClass("open");
	});

	this.$option.on('click', function () {
		self.$colorSelection.find('>span').attr('class', $(this).attr('class'));
		self.$colorSelection.attr('data', $(this).attr('class'));
	});

	this.$submit.on('click', function () {
		self.submitEvent();
	});

	this.$backButton.show();

};

Calendar.prototype.showDateTimePicker = function ($field, field) {
	var self = this;

	var options = {
		date: new Date(),
		mode: 'datetime',
		allowOldDates: false,
		minDate: this.startDateTime ? this.startDateTime.toDate() : new Date()
	};

	datePicker.show(options, function (date) {
		var selectedDate = moment(date);
		field == "start" ? self.startDateTime = selectedDate : self.endDateTime = selectedDate;

		if ((self.startDateTime && self.endDateTime) && self.startDateTime.isAfter(self.endDateTime)) {
			app.notification("Error", "The start date need to be before end date.");
			return;
		}

		var dateString = selectedDate.format("YYYY/MM/DD HH:mm:ss");
		$field.text(dateString);
		$field.css('color', 'black');
	});
};

Calendar.prototype.submitEvent = function () {
	var eventName = this.$container.find('input[name="eventName"]');
	var colorLabel = this.$colorSelection.attr('data');
	var description = this.$container.find('textarea[name="description"]');
	var alert = this.$container.find('select[name="alert"]');

	var message;
	if (!eventName.val()) {
		message = "Please enter Event Name"
	} else if (!this.$startDate.text() || !this.$endDate.text()) {
		message = "Please enter the event start date and end date."
	} else if (!colorLabel) {
		message = "Please select one of color for the event label."
	}

	if (message) {
		app.notification("Require information", message);
		return false;
	}

	app.tool.showLoading();
	var data = {
		eventName: eventName.val(),
		startDate: this.$startDate.text(),
		endDate: this.$endDate.text(),
		color: colorLabel,
		description: description.val(),
		alert: alert.val()
	};

	if(data.alert != '0'){
		var time = moment(data.startDate).unix() + moment().utcOffset()*60;
		console.error(time);
		var pendingAlerts = window.localStorage.getItem("PendingAlert");
		console.error(pendingAlerts);
		if(!pendingAlerts){
			pendingAlerts = [];
		}else{
			pendingAlerts = JSON.parse(pendingAlerts);
		}

		var alertData = {
			date: time,
			alert: data.alert
		};

		pendingAlerts.push(alertData);
		window.localStorage.setItem("PendingAlert", JSON.stringify(pendingAlerts));
	}

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.createEvent,
		type: 'post',
		context: this,
		data: data,
		callback: this.submitEvent_load
	});
};

Calendar.prototype.submitEvent_load = function (data) {

	if (data.success) {
		window.location = window.rootPath + "pages/calendar.html";

	} else {
		app.notification("Error", "Error on creating event, please try again later.");
	}

	app.tool.hideLoading();
};

Calendar.prototype.renderEventPage = function (oArgs) {
	oArgs = oArgs || {};
	app.tool.showLoading();

	if (oArgs.$day) {
		this.selectedDay = oArgs.$day.attr('data')
	}

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.getCalendarEvent,
		type: 'POST',
		context: this,
		data: {
			query: "day",
			month: this.tempDate.month() + 1,
			year: this.tempDate.year(),
			day: this.selectedDay
		},
		callback: this.events_loaded
	});

	app.loadTemplate({
		path: 'template/dayEachEvent.html',
		appendTo: 'div.container',
		cleanPage: true,
		context: this,
		callback: this.events_assets_loaded
	});
};

Calendar.prototype.events_loaded = function (data) {
	this.eventLoaded = true;

	if (!data.success) {
		app.notification("Error", "Please try again later.");
		return false;
	}
	this.eventList = data.events;

	this.renderEventPage_loaded();
};

Calendar.prototype.events_assets_loaded = function () {
	this.loadedEventsAssets = true;
	this.renderEventPage_loaded();
};


Calendar.prototype.renderEventPage_loaded = function () {
	if (!this.eventLoaded || !this.loadedEventsAssets) {
		return false;
	}
	this.renderEventPage_load();
};

Calendar.prototype.renderEventPage_load = function () {
	var self = this;
	var temp = moment().set({'year': this.tempDate.year(), 'month': this.tempDate.month(), 'date': this.selectedDay});

	this.$week = $('div.week');
	this.$mainEvent = $('div.mainEvent');
	this.$dayMonth = $('div.dayMonth');
	this.$eventTime = $('div.eventTime');
	this.$eventName = $('div.eventName');
	this.$fullSchedule = $('div.seeFullButton');
	this.$arrowLeft = $('div.arrow-left');
	this.$arrowRight = $('div.arrow-right');
	this.$backButton.show();

	this.$dayMonth.html(temp.format("dddd") + " / " + temp.format("DD"));

	var weekday = this.$week.find('[data-day="' + temp.day() + '"]');

	weekday.find('div').addClass('active');

	if (this.eventList.length > 0) {
		var nextEvent = this.findNextEvent(this.eventList);
		var firstEventTime;
		if (!nextEvent) {
			firstEventTime = moment(this.eventList[0].startDate, "YYYY-MM-DD HH:mm:ss");
		} else {
			firstEventTime = moment(nextEvent.startDate, "YYYY-MM-DD HH:mm:ss");
		}


		this.$eventTime.html(firstEventTime.format("HH:mm"));
		this.$eventName.html(this.eventList[0].eventName);
		this.$fullSchedule.show();
	} else {
		this.$eventTime.html("No Event");
		this.$eventName.html("");
		this.$fullSchedule.hide();
	}

	this.$arrowLeft.off("click");
	this.$arrowLeft.on('click', function () {
		temp.set({date: parseInt(self.selectedDay) - 1});
		self.selectedDay = temp.date();
		self.renderEventPage();
	});

	this.$arrowRight.off("click");
	this.$arrowRight.on('click', function () {
		temp.set({date: parseInt(self.selectedDay) + 1});
		self.selectedDay = temp.date();
		self.renderEventPage();
	});


	this.$fullSchedule.off('click');
	this.$fullSchedule.on('click', function () {
		self.showEventList();
	});

	app.tool.hideLoading();
};

Calendar.prototype.findNextEvent = function (data) {
	var nextEvent;
	for (var i = 0; i < data.length; i++) {
		if (moment().isBefore(data.startDate)) {
			nextEvent = data;
			break;
		}

	}
	return nextEvent;

};

Calendar.prototype.showEventList = function () {
	var self = this;
	this.$mainEvent.addClass("none");

	this.$eventList = $('div.eventList');
	this.$eventList.empty();

	for (var i = 0; i < this.eventList.length; i++) {
		var event = this.eventList[i];
		var startTime = moment(event.startDate, "YYYY-MM-DD HH:mm:ss");
		var endTime = moment(event.endDate, "YYYY-MM-DD HH:mm:ss");


		var eachEvent = $('<div data_id="' + i + '" class="eachEvent ' + event.color + '"> <span class="eventTime">' + startTime.format("HH:mm") + ' - ' + endTime.format("HH:mm") + '</span> <span class="eventName">' + event.eventName + '</span> <div class="description"></div> </div>');

		eachEvent.on('click', function () {
			var des = $(this).find('div.description');
			if (des.text() != '') {
				des.html("");
			} else {
				des.html(self.eventList[$(this).attr('data_id')].description);
			}

		});

		this.$eventList.append(eachEvent);
	}

	this.$eventList.show();

};

new Calendar().init();