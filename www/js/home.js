var Home = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Home.prototype.init = function () {
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

Home.prototype.deviceReady = function () {
	var self = this;

	navigator.geolocation.getCurrentPosition(
		function(position){
			self.currentPositionGet(position);
		}, function(e){
			self.onGetPositionError(e);
		}
	);

/*	app.addHeader({
		mainMenu: true,
		appendTo: "div.homePage",
		body: $('body')
	});*/

	app.addHeaderBar({title: 'Nearby'});

	app.addMenuBar();

	this.attachEvent();

};

Home.prototype.attachEvent = function () {
	var self = this;

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

Home.prototype.initMap = function (oArgs) {
	oArgs = oArgs || {};
	var mapCenter = new google.maps.LatLng(oArgs.latitude || 40.7141667, oArgs.longitude || -74.0063889);
	var mapOptions = {
		center: mapCenter,
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		panControl: false,
		zoomControl: false,
		mapTypeControl: false,
		scaleControl: false,
		streetViewControl: false,
		overviewMapControl: false
	};
	this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
	this.setMapMarker(mapCenter);
};

Home.prototype.setMapCenter = function(oArgs) {
	var options = {
		map: this.map,
		position: new google.maps.LatLng(oArgs.latitude, oArgs.longitude),
		content: content
	};
	this.map.setCenter(options.position);
};

Home.prototype.setMapMarker = function(pointer) {

	var marker=new google.maps.Marker({
		position: pointer
	});

	marker.setMap(this.map);
};

new Home().init();