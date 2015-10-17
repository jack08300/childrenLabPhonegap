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


	app.addHeaderBar({title: 'Weather'});

	app.addMenuBar();

	this.attachEvent();
	self.currentPositionGet();
/*	navigator.geolocation.getCurrentPosition(
		function(position){
			self.currentPositionGet(position);
		}, function(e){
			self.onGetPositionError(e);
		}
	);*/

};

Temperature.prototype.onGetPositionError = function(e) {
	console.error(e);
};

Temperature.prototype.currentPositionGet = function(position) {
	var self = this;

	$.ajax({
		url: "http://api.worldweatheronline.com/free/v2/weather.ashx?q=Taipei&format=json&num_of_days=1&key=29e2cef2e5823da0db09d11a307ba",
		success: function(data){
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
	this.weatherResult = result.data.current_condition[0];

	this.$temperature.html(this.weatherResult.temp_F + "&deg;F");
	this.$location.html(result.data.request[0].query);
	this.$description.html(this.weatherResult.weatherDesc[0].value);
};

Temperature.prototype.switchHumidity = function () {
	this.$weatherPage.addClass('humidity');
	this.$temperature.html(this.weatherResult.humidity + "%");
	this.$description.html("");
};

Temperature.prototype.switchTemperature = function () {
	this.$weatherPage.removeClass('humidity');
	this.$temperature.html(this.weatherResult.temp_F + "&deg;F");
};


new Temperature().init();