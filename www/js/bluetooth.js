var Bluetooth = function () {
};

Bluetooth.prototype.init = function (oArgs) {
	oArgs = oArgs || {};


	this.deviceId = "1B85999A-A964-F738-79CE-49DBD019C503";
	this.serviceUuid = "91C10EDC-8616-4CBF-BC79-0BF54ED2FA17";

	this.storageDeviceName = "ConnectedDevice";
	this.storageDataName = "ConnectedData";

	this.$eachDevice = oArgs.$template;
	this.$deviceList = oArgs.$deviceList;

	this.characteristicList = [{
		name: "light Sensor",
		uuid: "09A44002-CD70-4B7A-B46F-CC4CDBAB1BB4"
	}, {
		name: "Audio",
		uuid: "1D1AD056-5B5F-4652-B1B6-82F5E9504D5C"
	}];



/*	this.$searchDevice = $('div.searchDevice');
	this.$bluetoothStatus = $('span.bluetoothStatus');
	this.$status = $('span.status');
	this.$eachDevice = $('div.eachDevice');
	this.$allList = $('div.list');
	this.$unpairedList = $('div.deviceList', this.$allList);
	this.$serviceList = $('div.serviceList', this.$allList);*/

	this.attachEvent();

};

Bluetooth.prototype.attachEvent = function () {
	var self = this;


	self.searchDevice();

/*	ble.isEnabled(
		function(){
			ble.isConnected(self.deviceId,
				function(){
					if(!window.localStorage.getItem(self.storageDeviceName) || !window.localStorage.getItem(self.storageDataName)){
						self.searchDevice();
					}else{
						self.displayDeviceList(JSON.parse(window.localStorage.getItem(self.storageDeviceName)));
						self.displayServices(JSON.parse(window.localStorage.getItem(self.storageDataName)));
					}
				},
				function(){
					self.searchDevice();
				}
			);


		},
		function(){
			self.enableBluetooth();
		}
	);*/



};

Bluetooth.prototype.enableBluetooth = function () {
	var self = this;

		ble.enable(
			function () {
				self.searchDevice();
			},
			function () {
				app.notification("Bluetooth Device", "Please enbale your bluetooth first", null);
			}
		);

};

Bluetooth.prototype.searchDevice = function () {
	var self = this;
	//self.$bluetoothStatus.html("ON");
	self.runningOnSearch = true;
	this.$deviceList.empty();
	//self.$status.html("Scanning...");

	ble.startScan([self.serviceUuid],
		function (device) {
			self.displayDeviceList(device);
		},
		function (error) {
			self.$status.html(JSON.stringify(error));
		});

};

Bluetooth.prototype.disableSearch = function () {
	var self = this;
	ble.stopScan(
		function () {
			console.log("stop scanning");
			self.$status.html("Completed");
		},
		function () {
			console.error("Error on stopping scanning");
		}
	);
};

Bluetooth.prototype.displayDeviceList = function (data) {
	var self = this;
	this.deviceList = this.deviceList || [];

	var exist = false;
	for (var i = 0; i < this.deviceList.length; i++) {
		if (this.deviceList[i].data.id == data.id) {
			exist = true;
			break;
		}
	}

	if (!exist) {
		this.$eachDevice.find('div.name').html(data.name);
		this.$eachDevice.find('div.status').html("Connecting...");

		var $device = this.$eachDevice.clone(true).appendTo(this.$deviceList);
		$device.attr("address", data.address).show();


		this.deviceList.push({
			data: data,
			$device: $device
		});

		this.isConnected(data, $device);

		self.disableSearch();
	}else{
		//$('#' + data.id).find('span.deviceRssi').html(data.rssi);
	}

};

Bluetooth.prototype.isConnected = function (device, $device) {
	var self = this;
	ble.isConnected(device.id,
		function (data) {
			$device.find('div.status').html("Connected");
		},
		function(){
			self.connect(device, $device);
		}
	)
};

Bluetooth.prototype.connect = function (device, $device) {
	var self = this;
	console.log("connecting");
	$device.find('div.status').html("Connecting to " + device.name);
	ble.connect(device.id,
		function (data) {
			//success
				window.localStorage.setItem(self.storageDeviceName, JSON.stringify(device));
				window.localStorage.setItem(self.storageDataName, JSON.stringify(data));
				$device.find('div.status').html("Connected");
				//self.displayServices(data);
		},
		function () {
			//fail
			$device.find('div.status').html("Fail to connect");
			self.searchDevice();
		}
	)
};

Bluetooth.prototype.displayServices = function (data, oArgs) {
	var self = this;
	oArgs = oArgs || {};
	var $eachData = $('div.eachCharacter');
	for (var i = 0; i < data.characteristics.length; i++) {
		if(data.characteristics[i].characteristic.length < 16){
			continue;
		}

		//$eachData.find('span.deviceId').html(data.id);
		$eachData.attr("id", "eachData_" + i);
		$eachData.find('span.characterUuid').html(data.characteristics[i].characteristic);

		$.each(this.characteristicList, function(j, item) {
			if(self.characteristicList[j].uuid == data.characteristics[i].characteristic){
				$eachData.find('span.name').html(self.characteristicList[j].name);
			}
		});

		$eachData.clone(true).appendTo(oArgs.appendTo).show();

		$eachData.find('span.name').html("Unknow");
		$eachData.find('span.characterUuid').html("");
		$eachData.find('div.devicedata').find('span').html("0");
		$eachData.removeAttr("id");

		self.notify({
			deviceId: data.id,
			serviceId: data.characteristics[i].service,
			characterId: data.characteristics[i].characteristic,
			dataReceive: $('#eachData_' + i).find('div.devicedata')
		});


	}

};

Bluetooth.prototype.read = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};
	oArgs.dataReceive.show();

	ble.read(oArgs.deviceId, oArgs.serviceId, oArgs.characterId,
		function(data){
			var int = new Uint8Array(data);
			//self.$status.html(self.$status.html() + int[0]);

			for(var i=0;i<int.length;i++){
				oArgs.dataReceive.append("<br/>" + "Read: " + int[i]);
			}

		},
		function(error){
			self.$status.html("Fail to read. " + JSON.stringify(error));
		}
	)
};

Bluetooth.prototype.notify = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};
	oArgs.dataReceive.show();

	ble.startNotification(oArgs.deviceId, oArgs.serviceId, oArgs.characterId,
		function(data){
			var int = new Uint8Array(data);
			for(var i=0;i<int.length;i++){
				oArgs.dataReceive.find('span').html(int[i]);
				oArgs.dataReceive.css("border-color", "rgba(" + int[i] + ", 0, 0, 0.7)");
			}
		},
		function(error){
			alert("Fail to Notifying. " + JSON.stringify(error));
		}
	)
};

Bluetooth.prototype.stopNotify = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};

	ble.stopNotification(oArgs.deviceId, oArgs.serviceId, oArgs.characterId,
		function(){
			oArgs.$button.html("NOTIFY OFF");
		},
		function(error){
			alert.html("Fail to Stop Notify. " + JSON.stringify(error));
		}
	)
};


Bluetooth.prototype.disconnect = function (deviceId, oArgs) {
	ble.disconnect(deviceId,
		function(){
			oArgs.dataReceive.find('span').html("Disconnect to " + deviceId);
		},
		function(){
			oArgs.dataReceive.find('span').html("Failed disconnect to " + deviceId);
		}
	)
};


