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


	app.addHeaderBar({title: 'Activity'});

	app.addMenuBar();

	this.attachEvent();

	this.bluetooth = new Bluetooth;

	this.bluetooth.init({
		$debug: this.$debug,
		callback: this.initialBluetooth_load,
		disconnectCallback: {
			callback: this.uploadLocalData,
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
	var time = moment().unix().toString();
	$('div.debug').append("<div>writing time: " + time + "</div>");
	this.bluetooth.write({
		serviceId: 'FFA0',
		characterId: 'FFA3',
		data: time.substring(0, 4),
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

Activity.prototype.getSizeOfData = function () {

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
	this.sizeOfData = this.sizeOfData || 0;
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
	var localData = window.localStorage.getItem(this.localDataName) || '';
	data = data.substring(1);

	localData += "|" + data;

	window.localStorage.setItem(this.localDataName, localData);
};

Activity.prototype.uploadLocalData = function () {
	var localData = window.localStorage.getItem(this.localDataName) || '';

	if(!localData || localData == '') { return false; }

	var dataArray = localData.split("|");

		if(dataArray[0] == '') {
			dataArray.splice(0);
		}


	if(dataArray[0]){
		var uploadedData = dataArray[0];
		dataArray.splice(0);

		var array = '';
		for(var i =0;i<dataArray.length;i++){
			array += "|" +  dataArray[i];
		}
		window.localStorage.setItem(this.localDataName, array);

		this.uploadData(uploadedData);
	}

};

Activity.prototype.uploadData = function (data) {

	var activity = data.split(",");
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadData,
		type: 'post',
		context: this,
		data: {
			macId: this.macId,
			x: activity[0],
			y: activity[1],
			z: activity[2],
			u: activity[3],
			v: activity[4]
		},
		callback: this.uploadData_load
	});


};

Activity.prototype.uploadData_load = function () {
	this.uploadLocalData();
};


new Activity().init();