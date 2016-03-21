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

	$(document).one("mobileinit", function () {
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function () {
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


	app.addHeaderBar({title: 'UVI', context: this, backButton: {name: 'dashboard none'}});

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

UvIndex.prototype.onGetPositionError = function (e) {
	console.error(e);
};

UvIndex.prototype.currentPositionGet = function (position) {
	var self = this;
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;

	//http://www.wunderground.com/weather/api
	$.ajax({
		url: "http://api.wunderground.com/api/4e52e4fac905f5f7/geolookup/q/" + lat + "," + lon + ".json",
		success: function (data) {
			self.getLocation(data);
		}
	});
};

UvIndex.prototype.attachEvent = function () {
	var self = this;

};

UvIndex.prototype.getLocation = function (data) {
	console.error(data);
	var self = this;

	var city = data.location.city;
	var state = data.location.state;

	//http://www.wunderground.com/weather/api
	$.ajax({
		url: "http://api.wunderground.com/api/4e52e4fac905f5f7/conditions/q/" + state + "/" + city + ".json",
		success: function (data) {
			self.updateUvIndex(data);
		}
	});
};

UvIndex.prototype.updateUvIndex = function (result) {
	console.error(result);
	this.weather = result.current_observation;

	var uvIndex = parseInt(this.weather.UV);

	var color, text;
	switch (uvIndex) {
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
			color = "#4eb400";
			text = "You can safely enjoy being outside!";
			break;
		case 5:
		case 6:
		case 7:
			color = "#f88700";
			text = "Seek shade during midday hours! Slip on a shirt, slop on sunscreen and slap on hat!";
			break;
		default:
			color = "#d8001d";
			text = "Avoid being outside during midday hours! Make sure you seek shade! Shirt, sunscreen and hat are a must!";
			break;
	}

	this.$uvIndex.html(uvIndex);
	this.$text.html(text).css('color', color);
	this.$circle.css({
		'color': color,
		'border-color': color
	});
	this.$location.html(this.weather.observation_location.city);

	app.tool.hideLoading();
};


new UvIndex().init();