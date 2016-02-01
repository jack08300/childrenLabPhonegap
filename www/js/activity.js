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
	this.isUploadingData = false;
	this.isReceivingData = false;

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

	this.bluetooth.startScan({
		callback: this.findDevice_load,
		context: this
	});
};


Activity.prototype.findDevice_load = function () {
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
		callback: this.checkToLoadData,
		context: this
	});


};

Activity.prototype.checkToLoadData = function (oArgs, data) {
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
		this.receivedTime = this.byteArrayToLong(byteArray);
	}

	this.bluetooth.read({
		serviceId: 'FFA0',
		characterId: 'FFA5',
		callback: this.getSizeOfData_load,
		context: this
	});
};
/*

 Activity.prototype.isDeviceConnectedForReceiveData = function () {
 this.bluetooth.isConnected({
 callback: this.isDeviceConnected_load,
 context: this
 });
 };
 */

Activity.prototype.isDeviceConnected_load = function () {
	var self = this;


	setTimeout(function () {
		self.getDataFromDevice();
	}, 100);

};

Activity.prototype.getSizeOfData_load = function (oArgs, data) {
	this.sizeOfData = parseInt(data);

	this.getDataFromDevice();
};

Activity.prototype.getDataFromDevice = function () {

	this.bluetooth.read({
		serviceId: 'FFA0',
		characterId: 'FFA4',
		callback: this.getDataFromDevice_load,
		context: this
	});

};

Activity.prototype.getDataFromDevice_load = function (oArgs, data) {
	//this.sizeOfData = this.sizeOfData || 0;
	//this.sizeOfData -= 1;
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

	var localData = window.localStorage.getItem(this.localDataName) || '';

	this.receivedTime += 0.5;
	localData += "|" + window.localStorage.getItem("MAC_ID") + "," + data + "," + Math.floor(this.receivedTime);

	window.localStorage.setItem(this.localDataName, localData);

	this.getDataFromDevice();

};

Activity.prototype.disconnectDevice = function(){
	if(window.localStorage.getItem("MAC_ID")){
		window.localStorage.setItem(this.initialName, window.localStorage.getItem("MAC_ID"));
	}
	this.isReceivingData = false;
	this.uploadLocalData();
};

Activity.prototype.uploadLocalData = function () {
	var localData = window.localStorage.getItem(this.localDataName) || '';


	if(!localData || localData == '') {
		this.bluetooth.debugger("----------- No Local Data --------");
		this.isUploadingData = false;
		return false;
	}

	window.localStorage.setItem(this.localDataName, "");
	this.isUploadingData = true;

	/*

		var dataArray = localData.split("|");

			if(dataArray[0] == '') {
				dataArray.splice(0, 1);
			}


		if(dataArray[0]){
			var uploadedData = dataArray[0];
			dataArray.splice(0, 1);
			var array = '';
			for(var i =0;i<dataArray.length;i++){
				array += "|" +  dataArray[i];
			}
			window.localStorage.setItem(this.localDataName, array);

			this.uploadData(uploadedData);
		}
	*/

	this.uploadData(localData); //Upload raw data

};

Activity.prototype.uploadData = function (data) {

	this.bluetooth.debugger("Uploading Raw Data....");
/*
	var activity = data.split(",");
	this.bluetooth.debugger("Uploading....");
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadData,
		type: 'post',
		context: this,
		data: {
			macId: activity[0],
			x: activity[1],
			y: activity[2],
			z: activity[3],
			u: activity[4],
			v: activity[5]
		},
		callback: this.uploadData_load
	});
*/

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadRawData,
		type: 'post',
		context: this,
		data: {
			activityRawData: data
		},
		callback: this.uploadData_load
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