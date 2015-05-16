var Home = function () {
};

Home.prototype.init = function () {
	var self = this;
	document.addEventListener('deviceready', function () {
		self.deviceReady();
	}, false);
	//self.deviceReady();
	//this.bluetooth = new Bluetooth().init();


};

Home.prototype.deviceReady = function () {
	var self = this;
	this.$deviceTemplate = $('div.eachDevice');
	this.$deviceList = $('div.deviceList');

	this.bluetooth = new Bluetooth().init({
		$template: this.$deviceTemplate,
		$deviceList: this.$deviceList
	});
	this.attachEvent();
	app.addHeader();

	navigator.geolocation.getCurrentPosition(
		function(position){
			self.currentPositionGet(position);
		}, function(e){
			self.onGetPositionError(e);
		}

	);
};

Home.prototype.currentPositionGet = function (position) {

	this.initMap({
		latitude: position.coords.latitude,
		longitude: position.coords.longitude
	});
};

Home.prototype.onGetPositionError = function (e) {
	alert("Error on getting your position " + e.message);
	this.initMap();
};

Home.prototype.attachEvent = function () {


};

Home.prototype.initMap = function (oArgs) {
	oArgs = oArgs || {};
	var mapOptions = {
		center: new google.maps.LatLng(oArgs.latitude || 40.7141667, oArgs.longitude || -74.0063889),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false
	};
	this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
};

Home.prototype.setMapCenter = function(oArgs) {
	var options = {
		map: this.map,
		position: new google.maps.LatLng(oArgs.latitude, oArgs.longitude),
		content: content
	};
	this.map.setCenter(options.position);
};


new Home().init();