var UvIndex = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

UvIndex.prototype.init = function () {
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

UvIndex.prototype.deviceReady = function () {
	var self = this;

	this.$uvPage = $('div.uvPage');
	this.$uvIndex = $('div.uvIndex');
	this.$location = $('div.location');
	this.$circle = $('div.circle');
	this.$text = $('div.text');


	app.addHeaderBar({title: 'UVI'});

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

UvIndex.prototype.onGetPositionError = function(e) {
	console.error(e);
};

UvIndex.prototype.currentPositionGet = function(position) {
	var self = this;

	$.ajax({
		url: "http://api.worldweatheronline.com/free/v2/weather.ashx?q=Taipei&format=json&num_of_days=1&key=29e2cef2e5823da0db09d11a307ba",
		success: function(data){
			self.updateUvIndex(data);
		}
	});
};

UvIndex.prototype.attachEvent = function () {
	var self = this;

};

UvIndex.prototype.updateUvIndex = function(result) {
	console.error(result);
	this.weather = result.data.weather;

	var uvIndex = this.weather[0].uvIndex;
	var color, text;
	switch(uvIndex){
		case '1':
		case '2':
		case '3':
		case '4':
			color = "#4eb400";
			text = "You can safely enjoy being outside!";
			break;
		case '5':
		case '6':
		case '7':
			color = "#f88700";
			text = "Seek shade during midday hours! Slip on a shirt, slop on sunscreen and slap on hat!";
			break;
		default:
			color = "#d8001d";
			text = "Avoid being outside during midday hours! Make sure you seek shade! Shirt, sunscreen and hat are a must!";
	}

	this.$uvIndex.html(this.weather[0].uvIndex);
	this.$text.html(text).css('color', color);
	this.$circle.css({
		'color': color,
		'border-color': color
	});
	this.$location.html(result.data.request[0].query);
};


new UvIndex().init();