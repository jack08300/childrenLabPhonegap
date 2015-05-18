var Home = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Home.prototype.init = function () {
	console.log("test");
	var self = this;
	document.addEventListener('deviceready', function () {
		//self.deviceReady();
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		app.addHeader({
			mainMenu: true,
			appendTo: "div.mainMenu"
		});

		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.deviceReady();
	});

	//self.deviceReady();
	//this.bluetooth = new Bluetooth().init();


};

Home.prototype.deviceReady = function () {
	var self = this;
	this.$deviceTemplate = $('div.eachDevice');
	this.$deviceList = $('div.deviceList');
	this.$deviceDetail = $('#deviceDetail');

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
	this.attachEvent();

};

Home.prototype.attachEvent = function () {
	var self = this;
	this.$deviceList.delegate("div.eachDevice" ,'click', function(){
		if($(this).find('div.status').html() == "Connected"){
			$( "#deviceDetail" ).panel( "open" );
			self.$deviceDetail.html("");
			self.bluetooth.displayServices(
				JSON.parse(window.localStorage.getItem("ConnectedData")),
				{ appendTo: "#deviceDetail" }
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
	var mapOptions = {
		center: new google.maps.LatLng(oArgs.latitude || 40.7141667, oArgs.longitude || -74.0063889),
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