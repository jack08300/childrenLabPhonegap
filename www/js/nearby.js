/**
 * Created by yen-chieh on 5/19/15.
 */
var Nearby = function(){};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Nearby.prototype.init = function() {
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

Nearby.prototype.deviceReady = function() {
	this.$nearbyInputs = $('div.nearbyInputs');
	this.$startDate = $('div.startDate', this.$nearbyInputs);
	this.$endDate = $('div.endDate', this.$nearbyInputs);
	this.$price = $('div.price', this.$nearbyInputs);
	this.$zipcode = $('input.zipcode', this.$nearbyInputs);
	this.$sex = $('div.sexSelection', this.$nearbyInputs);
	this.$button = $('div.submit', this.$nearbyInputs);

	this.tool = new Tools();

	this.attachEvent();

	app.addHeader({
		mainMenu: true,
		appendTo: "div.nearbyPage"
	});
};

Nearby.prototype.attachEvent = function() {
	var self = this;

	this.$startDate.on('click', function(){
		self.showDateTimePicker($(this), "start");
	});

	this.$endDate.on('click', function(){
		self.showDateTimePicker($(this), "end");
	});

	this.$button.on('click', function(){
		self.submitSearch();
	});

};

Nearby.prototype.showDateTimePicker = function($field, field) {
	var self = this;

	var options = {
		date : new Date(),
		mode: 'datetime',
		allowOldDates: false
	};

	if(field == "end"){
		options.minDate = this.startDateTime;
	}

	datePicker.show(options, function(date){
		field == "start" ? self.startDateTime = date : self.endDateTime = date;
		var dateString = moment(date).format("YYYY-MM-DD hh:mm");

		$field.html(dateString);
	});
};

Nearby.prototype.getParams = function() {
	if(!this.startDateTime || !this.endDateTime){
		app.notification("Search", "Please Select Start and End Date", null);
		return null;
	}

	var params = {};

	params.startDate = moment(this.startDateTime).format("YYYY-MM-DD hh:mm");
	params.endDate = moment(this.endDateTime).format("YYYY-MM-DD hh:mm");
	params.startPrice = this.$price.find('input#startPrice').val();
	params.endPrice = this.$price.find('input#endPrice').val();
	params.zipcode = this.$zipcode.val();
	params.gender = this.$sex.find('label.ui-radio-on').text();

	return params;
};

Nearby.prototype.submitSearch = function() {
	var params = this.getParams();

	if(params){
		this.tool.ajax({
			url: app.setting.serverBase + app.setting.api.searchSchedule,
			context: this,
			data: params,
			callback: this.submitSearch_load
		});
	}

};

Nearby.prototype.submitSearch_load = function(data) {
	if(data.success && data.scheduleList.length > 0){
		window.localStorage.setItem('scheduleSearchResult', JSON.stringify(data));
		window.location = window.rootPath + "pages/nearbySearchResult.html";
	}else{
		app.notification("Search", "No Result", null);
	}
};


new Nearby().init();