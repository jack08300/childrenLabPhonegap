var Dashboard = function(){};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Dashboard.prototype.init = function() {
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

Dashboard.prototype.deviceReady = function() {



	app.addHeaderBar({title: 'Dashboard'});
	app.addMenuBar();

	this.dashboardPage = $('div.dashboardPage');
	this.dashboardButtons = $('div.dashboardButtons');
	this.$container = $('div.container', this.dashboardPage);
	this.$dashboardTemplate = $('div.dashboardTemplate');
	this.$syncTemplate = $('div.syncTemplate');
	this.$searchTemplate = $('div.searchTemplate');
	this.menu = $('div.menu');


	this.attachEvent();
	if(window.localStorage.getItem("processSync") === 'no'){
		this.switchTemplate(this.$dashboardTemplate);
		window.localStorage.setItem("processSync", true);
	}else{
		app.tool.showLoading();
		this.switchTemplate(this.$syncTemplate);
		this.$profileImage = $('div.profileImage',this.$container);
		this.$name = $('div.name', this.$container);
		this.retrieveData();
	}
};

Dashboard.prototype.pushNotification = function(){
	var push = PushNotification.init({
		"ios": {
			"sound": true,
			"vibration": true,
			"badge": true
		}
	});

	PushNotification.hasPermission(function(data) {
		if (data.isEnabled) {
			console.log("Push notification is enabled");
		}
	});

	push.on('registration', function(data) {
		console.log(data.registrationId);

		app.tool.ajax({
			url: app.setting.serverBase + "/user/updateRegistration",
			context: this,
			data: {
				registrationId: data.registrationId
			}
		});
	});

	push.on('notification', function(data) {
		app.notification(data.title, data.message);

		push.finish(function() {
			console.log("processing of push data is finished");
		});
	});

	push.on('error', function(e) {
		console.log(e.message);
	});
};

Dashboard.prototype.retrieveData = function(){
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.getKidsInfo,
		type: 'post',
		context: this,
		data: {},
		callback: this.retrieveData_load
	});
};

Dashboard.prototype.retrieveData_load = function(data){
	console.error(data);

	if(data.success){
		var kids = data.kids[0];

		if(kids.profile){
			this.$profileImage.find('img').attr('src', 'http://avatar.childrenlab.com/' + kids.profile);
		}

		this.$name.html(kids.nickName || kids.firstName);
	}
	app.tool.hideLoading();
	//this.pushNotification();
};

Dashboard.prototype.attachEvent = function() {
	var self = this;

	$('div.weatherButton').on('click', this.dashboardButtons, function(){
		window.location = window.rootPath + "pages/temperature.html";
	});

	$('div.uvButton').on('click', this.dashboardButtons, function(){
		window.location = window.rootPath + "pages/uv.html";
	});

	$('div.activityButton').on('click', this.dashboardButtons, function(){
		window.location = window.rootPath + "pages/activity.html";
	});

	$('div.noSync').on('click', this.$syncTemplate, function() {
		self.switchTemplate(self.$dashboardTemplate);
	});

	$('div.sync').on('click', this.$syncTemplate, function() {
		self.switchTemplate(self.$searchTemplate);
		self.initBluetooth();
	});
};

Dashboard.prototype.positionDashboard = function(){
	var width = this.dashboardPage.width();

	var centerWidth = (width / 2) - (this.dashboardButtons.width() / 2);
	//this.dashboardButtons.css('left', centerWidth);

	this.content = $('div.content', this.dashboardPage);
	var height = this.$container.height();

	var centerHeight = ((height - (this.menu.height()+80)) / 2) - (this.content.height() / 2);
	centerWidth = (width/2) - (this.content.width() / 2);
	this.content.css({
		left: centerWidth,
		top: centerHeight
	});
};

Dashboard.prototype.initBluetooth = function(){
	this.localDataName = "ActivityData";
	this.initialName = "initialDevice";
	this.deviceTimeName = "lastDeviceTime";
	this.isUploadingData = false;
	this.isReceivingData = false;
	this.receivingDataCount = 0;
	this.$searchInfo = $('div.searchInfo');
	this.monsterDegree = 0;

	this.receivedTime = 0;

	this.bluetooth = new Bluetooth;

	this.bluetooth.init({
		callback: this.initialBluetooth_load,
		disconnectCallback: {
			callback: this.disconnectDevice,
			context: this
		},
		context: this
	});

	this.watchStatus();
};

Dashboard.prototype.initialBluetooth_load = function(){
	var self = this;
	setTimeout(function(){
		self.bluetooth.isConnected({
			callback: self.initialBluetooth_isConnect,
			context: self,
			noConnect: true
		});
	}, 2000);

};

Dashboard.prototype.initialBluetooth_isConnect = function (oArgs, data) {
	if(data){
		this.bluetooth.disconnect({
			callback: this.initialBluetooth_isConnect,
			context: this
		});
	}else{
		this.bluetooth.startScan({
			callback: this.findDevice_load,
			context: this
		});
	}
};

Dashboard.prototype.findDevice_load = function(){
	this.$searchInfo.html("Found your device!");
	this.bluetooth.write({
		serviceId: "FFA0",
		characterId: "FFA1",
		data: '1',
		callback: this.writeTimeToDevice,
		context: this
	});
};

Dashboard.prototype.writeTimeToDevice = function () {
	var time = moment().unix() + moment().utcOffset()*60;
	this.bluetooth.write({
		serviceId: 'FFA0',
		characterId: 'FFA3',
		data: this.longToByteArray(time),
		callback: this.getMacAddress,
		context: this
	});
};

Dashboard.prototype.getMacAddress = function () {

	this.bluetooth.read({
		serviceId: 'FFA0',
		characterId: 'FFA6',
		type: 'MAC_ID',
		callback: this.getMacAddress_load,
		context: this
	});
};

Dashboard.prototype.getMacAddress_load = function () {
	this.macId = window.localStorage.getItem("MAC_ID");
	this.bluetooth.isConnected({
		callback: this.getDeviceTime,
		context: this
	});

};

Dashboard.prototype.getDeviceTime = function (oArgs, data) {
	var self = this;

	if (data) {
		this.bluetooth.read({
			serviceId: 'FFA0',
			characterId: 'FFA3',
			callback: this.getSizeOfData,
			context: this
		});

	} else {
		setTimeout(function () {
			self.initialBluetooth_load();
		}, 30000);
	}
};

Dashboard.prototype.getSizeOfData = function (oArgs, data) {
	if(data){
		var byteArray = data.split(",");
		var receivedTime = this.byteArrayToLong(byteArray) - moment().utcOffset()*60;

		console.error("Received long: " + receivedTime);
		console.error("Received time: " + moment.unix(receivedTime).format("YYYY MM DD HH:mm:ss Z"));

		if(receivedTime != 0){
			window.localStorage.setItem(this.deviceTimeName, receivedTime);
		}
	}

	this.bluetooth.read({
		serviceId: 'FFA0',
		characterId: 'FFA5',
		callback: this.getSizeOfData_load,
		context: this
	});
};

Dashboard.prototype.getSizeOfData_load = function (oArgs, data) {
	this.$searchInfo.html("Syncing");
	var background = $('div.background');
	background.css("background", "url(../img/dashboard/monster-yellow.png) 10vw 0vw no-repeat");
	background.css("background-size", "40vw");
	this.lastReceivedDataSize = parseInt(data);
	this.sendAlertTimeToDevice();

};

Dashboard.prototype.sendAlertTimeToDevice = function () {
	var alertData = window.localStorage.getItem("PendingAlert") ? JSON.parse(window.localStorage.getItem("PendingAlert")) : null;
	if(alertData) {
		for(var i = 0;i < alertData; i++){
			this.bluetooth.write({
				serviceId: 'FFA0',
				characterId: 'FFA7',
				data: this.longToByteArray(alertData[i].date),
				context: this
			});



			this.bluetooth.write({
				serviceId: 'FFA0',
				characterId: 'FFA8',
				data: alertData[i].alert,
				context: this
			});
		}
	}

	this.getDataFromDevice();
};


Dashboard.prototype.getDataFromDevice = function () {
	if(this.lastReceivedDataSize && this.lastReceivedDataSize != 0){
		this.receivingDataCount = this.lastReceivedDataSize;
		window.localStorage.setItem(this.deviceTimeName, parseInt(window.localStorage.getItem(this.deviceTimeName)) + (this.lastReceivedDataSize/2));
		this.lastReceivedDataSize = 0;
	}

	if(this.receivingDataCount == 52){
		this.receivingDataCount = 0;
		this.getDeviceTime({}, true);

	}else{

		this.bluetooth.read({
			serviceId: 'FFA0',
			characterId: 'FFA4',
			callback: this.getDataFromDevice_load,
			context: this
		});
	}
};

Dashboard.prototype.getDataFromDevice_load = function (oArgs, data) {

	this.storeData(data);
};

Dashboard.prototype.storeData = function (data) {
	this.isReceivingData = true;
	this.receivingDataCount += 1;

	var localData = window.localStorage.getItem(this.localDataName) || '';

	window.localStorage.setItem(this.deviceTimeName, parseFloat(window.localStorage.getItem(this.deviceTimeName)) + 0.5);
	localData += "|" + window.localStorage.getItem("MAC_ID") + "," + data + "," + Math.floor(window.localStorage.getItem(this.deviceTimeName));

	window.localStorage.setItem(this.localDataName, localData);

	if(localData.length > 8000){
		this.uploadLocalData({
			callback: this.getDataFromDevice,
			context: this
		})
	}else{
		this.getDataFromDevice();
	}
};

Dashboard.prototype.uploadLocalData = function (oArgs) {
	oArgs = oArgs || {};

	var localData = window.localStorage.getItem(this.localDataName) || '';


	if(!localData || localData == '') {
		this.isUploadingData = false;
		return false;
	}

	window.localStorage.setItem(this.localDataName, "");
	this.isUploadingData = true;
	this.uploadData(localData, oArgs); //Upload raw data

};

Dashboard.prototype.uploadData = function (data, oArgs) {

	var callback = oArgs.callback || this.uploadData_load;

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadRawData,
		type: 'post',
		context: this,
		data: {
			activityRawData: data
		},
		callback: callback
	});

};

Dashboard.prototype.uploadData_load = function () {
	var self = this;
	setTimeout(function(){
		self.uploadLocalData();
	}, 500);

};


Dashboard.prototype.disconnectDevice = function(){
	if(window.localStorage.getItem("MAC_ID")){
		window.localStorage.setItem(this.initialName, window.localStorage.getItem("MAC_ID"));
	}
	this.isReceivingData = false;
	this.uploadLocalData();
	this.$searchInfo.html("Sync Completed");
	$('div.background').hide();
	var self = this;
	$('div.gotoDashboard').show().on('click', function(){
		self.switchTemplate(self.$dashboardTemplate);
	});

};

Dashboard.prototype.watchStatus = function(){
	var self = this;
	var monster = $('div.background');
	this.monsterDegree = 30;
	monster.css("transform", "rotate(" + this.monsterDegree + "deg)");
	setInterval(function(){
		if(self.isReceivingData || self.isUploadingData){
			self.monsterDegree = -self.monsterDegree;
			monster.css("transform", "rotate(" + self.monsterDegree + "deg)");

		}else{
			//
		}
	}, 1000);
};


Dashboard.prototype.switchTemplate = function($template){
	this.$container.html($template.clone(true).removeClass("template"));
	this.positionDashboard();
};



Dashboard.prototype.byteArrayToLong = function(byteArray) {
	var value = 0;
	for ( var i = byteArray.length - 1; i >= 0; i--) {
		value = (value * 256) + parseInt(byteArray[i]);
	}

	return value;
};


Dashboard.prototype.longToByteArray = function(long) {
	var byteArray = [0, 0, 0, 0];

	for ( var index = 0; index < byteArray.length; index ++ ) {
		var byte = long & 0xff;
		byteArray [ index ] = byte;
		long = (long - byte) / 256 ;
	}

	return byteArray;
};


new Dashboard().init();