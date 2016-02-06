var Activity = function () {
	/* Face Data */
	this.indoorData = [
		{
			name: 'steps',
			value: 42
		}, {
			name: 'walking',
			value: 59
		}, {
			name: 'flights',
			value: 63
		}

	];

	this.outdoorData = [
		{
			name: 'steps',
			value: 34
		}, {
			name: 'walking',
			value: 80
		}, {
			name: 'flights',
			value: 44
		}

	];

	this.localDataName = "ActivityData";
	this.initialName = "initialDevice";
	this.deviceTimeName = "lastDeviceTime";
	this.isUploadingData = false;
	this.isReceivingData = false;
	this.receivingDataCount = 0;

	this.receivedTime = 0;

	//window.localStorage.setItem(this.localDataName, "");
};


var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Activity.prototype.init = function () {
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

Activity.prototype.deviceReady = function () {
	var self = this;

	this.$activityPage = $('div.activityPage');
	this.$steps = $('div.steps');
	this.$indoor = $('div.indoor');
	this.$outdoor = $('div.outdoor');
	this.$debug = $('div.debug');
	this.$cloudStatus = $('div#cloudStatus');
	this.$deviceStatus = $('div#deviceStatus');
	this.$debugTime = $('#timeDebug');
	this.$debugToTop = $('#debugToTop');
	this.$ffa5 = $('#ffa5');

	this.$debugToTop.on('click', function(){
		self.$debug.animate({scrollTop: 0}, '1500', 'swing');
	});


	app.addHeaderBar({title: 'Activity'});

	app.addMenuBar();

	this.attachEvent();

	this.bluetooth = new Bluetooth;

	this.bluetooth.init({
		$debug: this.$debug,
		callback: this.initialBluetooth_load,
		disconnectCallback: {
			callback: this.disconnectDevice,
			context: this
		},
		context: this,
		startScanArgs: {
			callback: this.findDevice_load,
			context: this
		}
	});

	//this.findDevice_load();

	/* Face Data */
	this.updateBar(this.indoorData);
	/* Face Data */

	this.watchStatus();
};

Activity.prototype.watchStatus = function(){
	var self = this;

	setInterval(function(){
		if(self.isReceivingData){
			self.$deviceStatus.addClass("active");

		}else{
			self.$deviceStatus.removeClass("active");
		}

		if(self.isUploadingData){
			self.$cloudStatus.addClass("active");
		}else{
			self.$cloudStatus.removeClass("active");
		}
	}, 500);
};


Activity.prototype.initialBluetooth_load = function () {
	var self = this;
	setTimeout(function(){
		self.bluetooth.isConnected({
			callback: self.initialBluetooth_isConnect,
			context: self,
			noConnect: true
		});
	}, 2000);



};


Activity.prototype.initialBluetooth_isConnect = function (oArgs, data) {
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


Activity.prototype.findDevice_load = function () {
	this.bluetooth.debugger("Writing 1 to FFA1");
	this.bluetooth.write({
		serviceId: "FFA0",
		characterId: "FFA1",
		data: '1',
		callback: this.writeTimeToDevice,
		context: this
	});

};

Activity.prototype.writeTimeToDevice = function () {
	var time = moment().unix();

	this.bluetooth.debugger("W time: " + this.longToByteArray(time));
	this.$debugTime.find("#sentTime").html(moment.unix(time).format("YYYY/MM/DD HH:mm:ss") + " | " + this.longToByteArray(time));
	this.bluetooth.write({
		serviceId: 'FFA0',
		characterId: 'FFA3',
		data: this.longToByteArray(time),
		callback: this.getMacAddress,
		context: this
	});
};

Activity.prototype.getMacAddress = function () {

	this.bluetooth.read({
		serviceId: 'FFA0',
		characterId: 'FFA6',
		type: 'MAC_ID',
		callback: this.getMacAddress_load,
		context: this
	});
};


Activity.prototype.getMacAddress_load = function () {
	this.macId = window.localStorage.getItem("MAC_ID");
	this.bluetooth.isConnected({
		callback: this.getDeviceTime,
		context: this
	});

};

Activity.prototype.getDeviceTime = function (oArgs, data) {
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



Activity.prototype.getSizeOfData = function (oArgs, data) {
	this.bluetooth.debugger("ReceivedTime: " + data);

	if(data){
		var byteArray = data.split(",");
		var receivedTime = this.byteArrayToLong(byteArray);
		if(receivedTime != 0){
			window.localStorage.setItem(this.deviceTimeName, receivedTime);
		}
		this.$debugTime.find("#receivedTime").html(moment.unix(receivedTime).format("YYYY/MM/DD HH:mm:ss") + " | " + data);
	}


		this.bluetooth.read({
			serviceId: 'FFA0',
			characterId: 'FFA5',
			callback: this.getSizeOfData_load,
			context: this
		});


};


Activity.prototype.getSizeOfData_load = function (oArgs, data) {
	this.lastReceivedDataSize = parseInt(data);
	this.$ffa5.html(this.lastReceivedDataSize);

	this.getDataFromDevice();
};

Activity.prototype.getDataFromDevice = function () {
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

Activity.prototype.getDataFromDevice_load = function (oArgs, data) {


	this.storeData(data);
};

Activity.prototype.updateBar = function (data) {
	for (var i = 0; i < data.length; i++) {
		var $bar = $('div.' + data[i].name);
		if (data[i].value > 100) data[i].value = 100;
		$bar.find('span').html(data[i].value.toFixed(2) + "%");
		$bar.css('width', data[i].value + "%");
	}

};

Activity.prototype.attachEvent = function () {
	var self = this;

	this.$steps.on('click', function () {
		window.localStorage.removeItem('activityX');
		window.localStorage.removeItem('activityY');
		window.localStorage.removeItem('activityZ');
		self.$steps.find('span').html("0.00%");
	});

	this.$indoor.on('click', function () {
		self.$outdoor.find('div').removeClass('active');
		$(this).find('div').addClass('active');
		self.updateBar(self.indoorData);
	});

	this.$outdoor.on('click', function () {
		self.$indoor.find('div').removeClass('active');
		$(this).find('div').addClass('active');
		self.updateBar(self.outdoorData);
	});
};

Activity.prototype.storeData = function (data) {
	this.isReceivingData = true;
	this.receivingDataCount += 1;
	this.bluetooth.debugger("Count: " + this.receivingDataCount);

	var localData = window.localStorage.getItem(this.localDataName) || '';

	window.localStorage.setItem(this.deviceTimeName, parseInt(window.localStorage.getItem(this.deviceTimeName)) + 0.5);
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

Activity.prototype.disconnectDevice = function(){

	if(window.localStorage.getItem("MAC_ID")){
		window.localStorage.setItem(this.initialName, window.localStorage.getItem("MAC_ID"));
	}
	this.isReceivingData = false;
	this.uploadLocalData();
};

Activity.prototype.uploadLocalData = function (oArgs) {
	oArgs = oArgs || {};

	var localData = window.localStorage.getItem(this.localDataName) || '';


	if(!localData || localData == '') {
		this.bluetooth.debugger("----------- No Local Data --------");
		this.isUploadingData = false;
		return false;
	}

	window.localStorage.setItem(this.localDataName, "");
	this.isUploadingData = true;
	this.uploadData(localData, oArgs); //Upload raw data

};

Activity.prototype.uploadData = function (data, oArgs) {

	this.bluetooth.debugger("Uploading Raw Data....");

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

Activity.prototype.uploadData_load = function () {
	var self = this;
	this.bluetooth.debugger("Complete!");
	setTimeout(function(){
		self.uploadLocalData();
	}, 500);

};

Activity.prototype.byteArrayToLong = function(byteArray) {
	var value = 0;
	for ( var i = byteArray.length - 1; i >= 0; i--) {
		value = (value * 256) + parseInt(byteArray[i]);
	}

	return value;
};


Activity.prototype.longToByteArray = function(long) {
	var byteArray = [0, 0, 0, 0];

	for ( var index = 0; index < byteArray.length; index ++ ) {
		var byte = long & 0xff;
		byteArray [ index ] = byte;
		long = (long - byte) / 256 ;
	}

	return byteArray;
};


new Activity().init();