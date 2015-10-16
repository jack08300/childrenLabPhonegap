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
		url: "https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text='taiwan')&format=json",
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

Temperature.prototype.updateTemperature = function (data) {
	this.weatherResult = data.query.results.channel;

	this.$temperature.html(this.weatherResult.item.condition.temp + "&deg;F");
	this.$location.html(this.weatherResult.location.city);
	this.$description.html(this.weatherResult.item.condition.text);
};

Temperature.prototype.switchHumidity = function () {
	this.$weatherPage.addClass('humidity');
	this.$temperature.html(this.weatherResult.atmosphere.humidity + "%");
	this.$description.html("");
};

Temperature.prototype.switchTemperature = function () {
	this.$weatherPage.removeClass('humidity');
	this.$temperature.html(this.weatherResult.item.condition.temp + "&deg;F");
};


new Temperature().init();