var Temperature = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Temperature.prototype.init = function () {
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

Temperature.prototype.deviceReady = function () {
	var self = this;

	this.$weatherPage = $('div.weatherPage');
	this.$temperature = $('div.temperature');
	this.$location = $('div.location');
	this.$circle = $('div.circle');
	this.$description = $('div.description');


	app.addHeaderBar({title: 'Weather', context: this, backButton: {name: 'dashboard none'}});

	app.addMenuBar();

	this.$backButton = $('div.backButton');
	this.$backButton.on('click', function(){
		window.localStorage.setItem("processSync", 'no');
		window.location = window.rootPath + "pages/dashboard.html";
	});
	this.$backButton.show();

	this.attachEvent();
	//self.currentPositionGet();
	navigator.geolocation.getCurrentPosition(
		function (position) {
			self.currentPositionGet(position);
		}, function (e) {
			self.onGetPositionError(e);
		}
	);

	app.tool.showLoading();
};

Temperature.prototype.onGetPositionError = function(e) {
	console.error(e);
};

Temperature.prototype.currentPositionGet = function(position) {
	var self = this;

	var lat = position.coords.latitude;
	var lon = position.coords.longitude;

	$.ajax({
		url: "http://api.wunderground.com/api/4e52e4fac905f5f7/geolookup/q/" + lat + "," + lon + ".json",
		success: function(data){
			self.getLocation(data);
		}
	});
};

Temperature.prototype.getLocation = function (data) {
	var self = this;

	var city = data.location.city;
	var state = data.location.state;

	//http://www.wunderground.com/weather/api
	$.ajax({
		url: "http://api.wunderground.com/api/4e52e4fac905f5f7/conditions/q/" + state + "/" + city + ".json",
		success: function (data) {
			self.updateTemperature(data);
		}
	});
};

Temperature.prototype.attachEvent = function () {
	var self = this;

	this.$circle.on('click', function(){
		if(self.$weatherPage.hasClass('humidity')){
			self.switchTemperature();
		}else{
			self.switchHumidity();
		}
	});
};

Temperature.prototype.updateTemperature = function (result) {
	this.weatherResult = result.current_observation;

	this.$temperature.html(parseInt(this.weatherResult.temp_c) + "&deg;C");
	this.$location.html(this.weatherResult.observation_location.city);
	this.$description.html(this.weatherResult.weather);

	app.tool.hideLoading()
};

Temperature.prototype.switchHumidity = function () {
	this.$weatherPage.addClass('humidity');
	this.$temperature.html(this.weatherResult.relative_humidity);
	this.$description.html("");
};

Temperature.prototype.switchTemperature = function () {
	this.$weatherPage.removeClass('humidity');
	this.$temperature.html(parseInt(this.weatherResult.temp_c) + "&deg;C");
	this.$description.html(this.weatherResult.weather);
};


new Temperature().init();