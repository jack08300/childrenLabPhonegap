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
	this.$deviceTemplate = $('div.eachDevice');
	this.$deviceList = $('div.deviceList');
	this.$deviceDetail = $('#deviceDetail');
	this.$deviceCharacterList = $('div.characterList', this.$deviceDetail);

	this.bluetooth = new Bluetooth();

	this.bluetooth.init({
		$template: this.$deviceTemplate,
		$deviceList: this.$deviceList
	});

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

	app.addHeaderBar({title: 'Map'});

	app.addMenuBar();

	this.attachEvent();

};

Home.prototype.attachEvent = function () {
	var self = this;
	this.$deviceList.delegate("div.eachDevice" ,'click', function(){
		if($(this).find('div.status').html() == "Connected"){
			$( "#deviceDetail" ).panel( "open" );
			self.$deviceCharacterList.html("");
			self.bluetooth.displayServices(
				JSON.parse(window.localStorage.getItem("ConnectedData")),
				{ appendTo: "div.characterList" }
			);
		}else{
			alert("Connecting...");
		}


	});
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