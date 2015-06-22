var Bluetooth = function () {
};

Bluetooth.prototype.init = function (oArgs) {
	oArgs = oArgs || {};

	this.uploadTimer = 5000;

	this.deviceId = "1B85999A-A964-F738-79CE-49DBD019C503";
	this.serviceUuid = "91C10EDC-8616-4CBF-BC79-0BF54ED2FA17";

	this.storageDeviceName = "ConnectedDevice";
	this.storageDataName = "ConnectedData";

	this.$eachDevice = oArgs.$template;
	this.$deviceList = oArgs.$deviceList;
	this.sensorData = {macId: ''};

	this.characteristicList = [{
		name: "Light",
		uuid: "09A44002-CD70-4B7A-B46F-CC4CDBAB1BB4"
	}, {
		name: "Audio",
		uuid: "1D1AD056-5B5F-4652-B1B6-82F5E9504D5C"
	}, {
		name: "Activity",
		uuid: "AA6000C3-468A-4F4D-94C3-648424301EF6"
	}, {
		name: "ID",
		uuid: "9D498751-D8F6-4CA0-80A2-DD1550325BFA"
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

	$('#sendData').on('click', function(){
		self.uploadData();
	});

	this.$deviceList.delegate('#reloadBluetooth', 'click', function(){
		self.bleIsEnabled();
	});

	$( "select" ).bind( "change", function(event, ui) {
		if($("select option:selected").text() == "On"){
			self.uploadInterval = setInterval(function(){
				if(self.sensorData.macId){
					self.uploadData();
				}else{
					app.notification("Fail", "Fail to load MAC ID");
					clearInterval(self.uploadInterval);
				}

			}, self.uploadTimer);
		}else{
			if(self.uploadInterval){
				clearInterval(self.uploadInterval);
			}
		}
	});

	this.bleIsEnabled();

};

Bluetooth.prototype.bleIsEnabled = function () {
	var self = this;

	ble.isEnabled(
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
			self.$deviceList.html("Please enable your bluetooth. <button id='reloadBluetooth'>Reload</button>");
			self.enableBluetooth();
		}
	);
};

Bluetooth.prototype.enableBluetooth = function () {
	var self = this;

		ble.enable(
			function () {
				self.$deviceList.html("Searching for Swing Watch....");
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
	this.deviceList = [];
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
	var $device;
	if (!exist) {
		this.$eachDevice.attr('id', data.id);
		this.$eachDevice.find('div.name').html(data.name);
		this.$eachDevice.find('div.status').html("Connecting...");

		$device = this.$eachDevice.clone(true).appendTo(this.$deviceList);
		$device.attr("address", data.address).show();


		this.deviceList.push({
			data: data,
			$device: $device
		});

		this.isConnected(data, $device);

	}else{
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
		var serviceName = "";
		//$eachData.find('span.deviceId').html(data.id);
		$eachData.attr("id", "eachData_" + i);
		$eachData.find('span.characterUuid').html(data.characteristics[i].characteristic);

		$.each(this.characteristicList, function(j, item) {
			if(self.characteristicList[j].uuid == data.characteristics[i].characteristic){
				$eachData.find('span.name').html(self.characteristicList[j].name);
				serviceName = self.characteristicList[j].name;
			}
		});

		$eachData.clone(true).appendTo(oArgs.appendTo).show();

		$eachData.find('span.name').html("Unknow");
		$eachData.find('span.characterUuid').html("");
		$eachData.find('div.devicedata').find('span').html("0");
		$eachData.removeAttr("id");

		if(serviceName == "ID"){
			var $each = $('#eachData_' + i);
			$each.find('div.receiver').empty();
			self.read({
				type: "MAC_ID",
				deviceId: data.id,
				serviceId: data.characteristics[i].service,
				characterId: data.characteristics[i].characteristic,
				dataReceive: $each
			});
		}else{
			self.notify({
				type: serviceName,
				deviceId: data.id,
				serviceId: data.characteristics[i].service,
				characterId: data.characteristics[i].characteristic,
				dataReceive: $('#eachData_' + i).find('div.devicedata')
			});
		}



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
				//oArgs.dataReceive.append("<br/>" + "Read: " + int[i]);

				if(oArgs.type == "MAC_ID"){
					self.sensorData.macId += int[i].toString();
				}

			}

			if(oArgs.type == "MAC_ID" && self.sensorData.macId.length > 12){
				self.sensorData.macId = self.sensorData.macId.substring(0, 12);
				oArgs.dataReceive.append("Mac ID: " + self.sensorData.macId);
			}

		},
		function(error){
			app.notification("Fail to Read", JSON.stringify(error));
		}
	)
};

Bluetooth.prototype.notify = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};

	ble.startNotification(oArgs.deviceId, oArgs.serviceId, oArgs.characterId,
		function(data){
			var int = new Uint8Array(data);

			var value = int.length == 1 ? "" : {};

			for(var i=0;i<int.length;i++){
				$(oArgs.dataReceive[i]).show().find('span').html(int[i]);
				$(oArgs.dataReceive[i]).css("border-color", "rgba(" + int[i] + ", 0, 0, 0.7)");
				if(int.length == 1){
					value = int[i];
				}else{
					value[i] = int[i];
				}

			}

			self.storeValue(oArgs.type, value);
		},
		function(error){
			alert("Fail to Notifying. " + JSON.stringify(error));
		}
	)
};
Bluetooth.prototype.storeValue = function (type, value) {
	if(type == "Light"){
		this.sensorData.light = value;
	}else if(type == "Audio"){
		this.sensorData.audio = value;
	}else if(type == "Activity"){
		this.sensorData.activityX = value[0];
		this.sensorData.activityY = value[1];
		this.sensorData.activityZ = value[2];
	}
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

Bluetooth.prototype.uploadData = function(){
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadData,
		context: this,
		data: this.sensorData,
		callback: this.uploadData_load
	});
};

Bluetooth.prototype.uploadData_load = function(result){
	//alert(result + " uploaded");
};

