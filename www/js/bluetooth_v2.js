var Bluetooth = function () {
};

Bluetooth.prototype.init = function (oArgs) {
	oArgs = oArgs || {};

	this.uploadTimer = 5000;

	this.deviceId = "8D804989-EED6-B482-8367-6B1E074C0FF5";
	this.serviceUuid = ['1803', '1802', '1804'];

	this.storageDeviceName = "ConnectedDevice";
	this.storageDataName = "ConnectedData";

	this.connectionCounter = 0 ;

	this.callback = oArgs.callback;
	this.context = oArgs.context;

	this.sensorData = {macId: ''};

	if(oArgs.$debug){ this.debug = true; }

	this.$debug = oArgs.$debug;

	this.bleEnabled = false;

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

	window.localStorage.removeItem(this.storageDeviceName);
	window.localStorage.removeItem(this.storageDataName);

	this.bleIsEnabled();
};

Bluetooth.prototype.enableBluetooth = function () {
	var self = this;

	ble.enable(
		function () {
			if(self.debug) self.$debug.html("Searching for Swing Watch....");
			self.bleIsEnabled();
		},
		function () {
			app.notification("Bluetooth Device", "Please enbale your bluetooth first", null);
		}
	);

};


Bluetooth.prototype.bleIsEnabled = function () {
	var self = this;

	ble.isEnabled(
		function(){
			if(true){//if(!window.localStorage.getItem(self.storageDeviceName) || !window.localStorage.getItem(self.storageDataName)){
				self.searchDevice();
			}else{
				self.$debug.append("<div>" + window.localStorage.getItem(self.storageDataName)  + "</div>");
				self.isConnected(JSON.parse(window.localStorage.getItem(self.storageDataName)));
			}

			self.bleEnabled = true;
		},
		function(){
			self.bleEnabled = false;
			self.enableBluetooth();

			if(self.debug){
				self.$debug.html("Please enable your bluetooth. <button id='reloadBluetooth'>Reload</button>");
			}

		}
	);
};

Bluetooth.prototype.searchDevice = function () {
	if(this.debug) this.$debug.append("<div>Searching Device....</div>");

	var self = this;
	self.runningOnSearch = true;
	this.deviceList = [];

	ble.startScan(this.serviceUuid,
		function (device) {
			if(self.debug) self.$debug.append("<div>Finished Scan....</div>");
			if(self.debug) self.$debug.append("<div style='position:relative; width:100%;'>" + JSON.stringify(device) + "</div>");
			self.foundDevice(device);
		},
		function (error) {
			if(self.debug) self.$debug.html(JSON.stringify(error));
		});
};

Bluetooth.prototype.foundDevice = function (data) {
	this.deviceList = this.deviceList || [];
	this.stopScan();

	var exist = false;
	for (var i = 0; i < this.deviceList.length; i++) {
		if (this.deviceList[i].id == data.id) {
			exist = true;
			break;
		}
	}

	if (!exist) {
		this.deviceList.push(data);

		this.isConnected(data);

	}else{
	}

};

Bluetooth.prototype.isConnected = function (device) {
	var self = this;

	if(!device || !device.id){
		window.localStorage.removeItem(self.storageDeviceName);
		window.localStorage.removeItem(self.storageDataName);
		this.bleIsEnabled();
	}

	ble.isConnected(device.id,
		function (data) {
			if(self.debug) self.$debug.append("<div>Connected: " + device.name + "</div>");

			ble.stopScan();
			self.updateConnectedDevice(device);

			if(self.callback){
				self.callback.call(self.context, device, {});
			}
		},
		function(){
			self.connectionCounter++;
			self.connect(device);
		}
	)
};


Bluetooth.prototype.connect = function (device) {
	var self = this;
	if(this.debug) this.$debug.append("<div>Connecting to " + device.name + "</div>");

	ble.connect(device.id,
		function (data) {
			//TODO It's for debug
			//app.notification("Fail to Data", JSON.stringify(data));
			//success
			self.storeDeviceData(device, data);
			if(self.debug) self.$debug.append("<div>Connected</div>");
			self.isConnected(device);

		},
		function () {
			//fail
			if(self.debug) self.$debug.append("<div>Fail to connect</div>");
			//self.searchDevice();
		}
	)
};

Bluetooth.prototype.disconnect = function (device) {
	ble.disconnect(this.deviceId,
		function(){
			//oArgs.dataReceive.find('span').html("Disconnect to " + deviceId);
		},
		function(){
			//oArgs.dataReceive.find('span').html("Failed disconnect to " + deviceId);
		}
	)
};

Bluetooth.prototype.getConnectedDevice = function () {
	var connectedDevice = [];

	if(!this.deviceList){
		return [];
	}

	for(var i=0;i<this.deviceList.length;i++){
		if(this.deviceList[i].connected){
			connectedDevice.push(this.deviceList[i]);
		}
	}

	return connectedDevice;
};

Bluetooth.prototype.stopScan = function () {
	ble.stopScan(
		function () {
			console.log("stop scanning");
		},
		function () {
			alert("Error on stopping scanning");
		}
	);
};

Bluetooth.prototype.storeDeviceData = function (device, data) {
	window.localStorage.setItem(this.storageDeviceName, JSON.stringify(device));
	window.localStorage.setItem(this.storageDataName, JSON.stringify(data));
};

Bluetooth.prototype.updateConnectedDevice = function(device){
	for(var i=0;i<this.deviceList.length;i++){
		if(this.deviceList[i] == device){
			this.deviceList[i].connected = true;
			break;
		}
	}
};


Bluetooth.prototype.read = function (oArgs) {
	oArgs = oArgs || {};
	var self = this;
	oArgs.$debug.append("Reading...");
	ble.read(this.deviceId, oArgs.serviceId, oArgs.characterId,
		function(data){

			var int;

			if(oArgs.unit == 32){
				int = new Uint32Array(data);
			}else{
				int = new Uint8Array(data);
			}


			oArgs.$debug.append("<div>Got data: " + int + "</div>");
			if(oArgs.type == 'MAC_ID') { self.sensorData.macId = ''; }
			var received = '';
			oArgs.$debug.append("<div>" + "ReadLength: " + int.length + "</div>");
			for(var i=0;i<int.length;i++){
				oArgs.$debug.append("<br/>" + "Read: " + int[i].toString(16));
				received += int[i];

				if(oArgs.type == "MAC_ID"){
					self.sensorData.macId += int[i].toString(16);
				}

			}

			if(oArgs.type == "MAC_ID"){
				self.sensorData.macId = self.sensorData.macId.substring(0, 12);
				oArgs.$debug.append("Mac ID: " + self.sensorData.macId);
				window.localStorage.setItem("MAC_ID", self.sensorData.macId);
			}

			if(oArgs.callback){
				oArgs.callback.call(oArgs.context, oArgs, received);
			}

		},
		function(error){
			app.notification("Fail to Read", JSON.stringify(error));
		}
	)
};

Bluetooth.prototype.write = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};

	var data;
	if(oArgs.value.length > 5){
		data = new Uint32Array(1);
	}else{
		data = new Uint8Array(1);
	}
	//data = new Uint8Array(oArgs.value.length);
	//for (var i = 0, l = oArgs.value.length; i < l; i++) {
		data[0] = oArgs.value;
	//}



	oArgs.$debug.append("<div>Start to write: " + oArgs.value + "; Length: " + oArgs.value.length + "</div>");

	ble.write(this.deviceId, oArgs.serviceId, oArgs.characterId,
		data.buffer,
		function(){
			oArgs.$debug.append("Wrote to Device:- ");
			if(oArgs.callback){
				oArgs.callback.call(oArgs.context, oArgs, {});
			}
		},
		function(error){
			app.notification("Fail to Write", JSON.stringify(error));
		}
	);
};

Bluetooth.prototype.successWrite = function () {
	alert("yes");
};


Bluetooth.prototype.notify = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};

	ble.startNotification(this.deviceId, oArgs.serviceId, oArgs.characterId,
		function(data){
			var int = new Uint8Array(data);

			var value = int.length == 1 ? "" : {};

			for(var i=0;i<int.length;i++){
				if(int.length == 1){
					value = int[i];
				}else{
					value[i] = int[i];
				}

				if(oArgs.debug){
					oArgs.debug.prepend("ActivityX : " + value + "<br/>");
					oArgs.debug.prepend( "ActivityY : " + value + "<br/>");
					oArgs.debug.prepend("ActivityZ : " + value + "<br/>");
					oArgs.debug.prepend("<br/>");
				}

				//oArgs.callback.call(oArgs.context, {type: oArgs.type, value: value}, {});
			}



			//self.storeValue(oArgs.type, value);
		},
		function(error){
			alert("Fail to Notifying. " + JSON.stringify(error));
		}
	)
};

Bluetooth.prototype.storeValue = function (type, value) {
	var originalValue = parseInt(window.localStorage.getItem(type));
	if(type == "Light"){
		this.sensorData.light = value;
	}else if(type == "Audio"){
		this.sensorData.audio = value;
	}else if(type == "Activity"){
		this.sensorData.activityX = value[0];
		this.sensorData.activityY = value[1];
		this.sensorData.activityZ = value[2];
	}else if(type == "activityX"){

	}

	window.localStorage.setItem(type, (originalValue ? originalValue : 0) + parseInt(value));
};


// ASCII only
function stringToBytes(string) {
	var array = new Uint8Array(string.length);
	for (var i = 0, l = string.length; i < l; i++) {
		array[i] = string.charCodeAt(i);
	}
	return array.buffer;
}

// ASCII only
function bytesToString(buffer) {
	return String.fromCharCode.apply(null, new Uint8Array(buffer));
}