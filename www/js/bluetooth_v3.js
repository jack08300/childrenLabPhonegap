/**
 * Created by yen-chieh on 1/17/16.
 */
var Bluetooth = function () {
};

Bluetooth.prototype.init = function (oArgs) {
	oArgs = oArgs || {};
	var self = this;

	var deviceId = window.localStorage.getItem("deviceId");
	this.deviceId = deviceId ? deviceId : "8E2779DF-7583-074C-6D2E-DBC6EA2BF7A6";

	this.serviceUuid = ['1803', '1802', '1804'];

	this.storageDeviceName = "ConnectedDevice";
	this.storageDataName = "ConnectedData";

	this.deviceInit = false;

	this.connectionCounter = 0;

	this.callback = oArgs.callback;
	this.context = oArgs.context;
	this.scanArgs = oArgs.startScanArgs;
	this.disconnectCallback = oArgs.disconnectCallback;

	this.$debug = oArgs.$debug;
	/*
	 window.localStorage.removeItem(this.storageDeviceName);
	 window.localStorage.removeItem(this.storageDataName);*/

	this.isEnabled(oArgs);

};

Bluetooth.prototype.isEnabled = function (oArgs) {
	var self = this;
	this.debugger("Initializing bluetooth");

	ble.isEnabled(
		function () {
			self.debugger("Initialize completed");

			self.callbackMethod(oArgs);
		},
		function () {
			self.enableBluetooth(oArgs);
		}
	);
};

Bluetooth.prototype.enableBluetooth = function (oArgs) {
	var self = this;

	ble.enable(
		function () {
			self.debugger("Searching for Swing Watch....");
			self.callbackMethod(oArgs);
		},
		function () {
			app.notification("Bluetooth Device", "Please enable your bluetooth first", null);
		}
	);

};

Bluetooth.prototype.startScan = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};

	ble.startScan(this.serviceUuid,
		function (device) {
			self.stopScan();
			self.isConnected(oArgs, device);
		},
		function (error) {
			app.notification("Bluetooth Device", "Couldn't scan bluetooth devices. " + JSON.stringify(error), null);
		}
	)
};

Bluetooth.prototype.watchRange = function (oArgs) {
	var self = this;
	oArgs = oArgs || {};

	ble.startScan(this.serviceUuid,
		function (device) {
			self.stopScan();
			var rssi = device.rssi;
			self.callbackMethod(oArgs, rssi);

			setTimeout(function () {
				self.watchRange(oArgs);
			}, 500);
		},
		function (error) {
			app.notification("Bluetooth Device", "Couldn't scan bluetooth devices. " + JSON.stringify(error), null);
		}
	)
};

Bluetooth.prototype.stopScan = function () {
	var self = this;
	ble.stopScan(
		function () {
			self.debugger("Stopped scan");
		},
		function (error) {
			app.notification("Error", "Error on stopping. " + JSON.stringify(error));
		});

};

Bluetooth.prototype.isConnected = function (oArgs, device) {
	var self = this;

	device = device || {id: this.deviceId};

	ble.isConnected(device.id,
		function () {
			self.debugger("The device is connected: " + JSON.stringify(device));
			self.deviceId = device.id;
			self.callbackMethod(oArgs, true);
		},
		function () {

			self.debugger("Not connected: " + device.id);

			setTimeout(function () {
				console.error("Device init: " + self.deviceInit);
				console.error("Device on connect: " + oArgs.noConnect);
				if (self.deviceInit || oArgs.noConnect) {
					self.callbackMethod(oArgs, false);
				} else {
					self.connect(oArgs, device);
				}
			}, 1000);

		}
	);
};

Bluetooth.prototype.connect = function (oArgs, device) {
	var self = this;
	self.debugger("Connecting....");
	device = device || {id: this.deviceId};

	ble.connect(device.id,
		function () {
			console.error("connected to : " + device.id);
			self.deviceId = device.id;
			window.localStorage.setItem("deviceId", device.id);
			self.callbackMethod(oArgs);
		},
		function (error) {
			console.error("Disconnected");
			console.error(error);
			console.error(self.deviceInit);
			self.debugger("Disconnect");
			self.callbackMethod(self.disconnectCallback);
/*
			if (self.deviceInit) {
				self.debugger("Sleep for 3 minutes before reconnect again.");
				setTimeout(function () {
					self.startScan(self.scanArgs);
				}, 300000);

			} else {
				self.startScan(self.scanArgs);
			}*/

		}
	);

};

Bluetooth.prototype.read = function (oArgs) {
	var self = this;
	ble.read(this.deviceId, oArgs.serviceId, oArgs.characterId,
		function (data) {
			var bytes = new Uint8Array(data);

			var received = "";
			for (var i = 0; i < bytes.length; i++) {
				if (oArgs.type == "MAC_ID") {
					received += bytes[i].toString(16);
				} else if (oArgs.type == "TIME") {
					received += bytes[i];
				} else {
					received += "," + bytes[i];
				}

			}

			if (received != '' && received.substring(0, 1) == ",") {
				received = received.substring(1);
			}

			if (oArgs.type == "MAC_ID") {
				self.macId = received.substring(0, 12);
				window.localStorage.setItem("MAC_ID", self.macId);
				self.deviceInit = true;
				console.error("Initial Setup was success, Mac ID: " + self.macId);
			}

			self.debugger("Received From :" + oArgs.characterId + " Data: " + received);
			self.callbackMethod(oArgs, received);

		},
		function (error) {

		}
	);
};

Bluetooth.prototype.write = function (oArgs) {

	var self = this;

	var data = oArgs.data;
	console.error("Data: " + data);
	if (!(data instanceof Uint8Array)) {
		var array = new Uint8Array(data.length);
		for (var i = 0, l = data.length; i < l; i++) {
			array[i] = data[i];
		}
	} else {
		array = data;
	}


	console.error("Writing to: " + oArgs.serviceId + "  " + oArgs.characterId + " " + array.length + " " + array);

	ble.write(this.deviceId, oArgs.serviceId, oArgs.characterId, array.buffer,
		function () {
			console.error("Success wrote");
			self.callbackMethod(oArgs);
		},
		function (error) {
			app.notification("Error on write", "Error wrote: " + JSON.stringify(error));
		}
	);
};

Bluetooth.prototype.writeWithoutResponse = function (oArgs) {
	this.debugger("Writing to: " + oArgs.serviceId + "  " + oArgs.characterId);
	var self = this;

	var array = new Uint8Array(1);

	array[0] = oArgs.value.charCodeAt(0);

	ble.writeWithoutResponse(this.deviceId, oArgs.serviceId, oArgs.characterId, array.buffer,
		function (data) {
			self.debugger("Success wrote to: " + JSON.stringify(data));
			self.callbackMethod(oArgs);
		},
		function (error) {
			app.notification("Error on write", "Error wrote: " + JSON.stringify(error));
		}, params
	);
};

Bluetooth.prototype.callbackMethod = function (oArgs, data) {
	var oArgs = oArgs || {};

	if (oArgs.callback) {
		oArgs.callback.call(oArgs.context, oArgs, data);
	}
};


Bluetooth.prototype.debugger = function (message) {
	if (this.$debug) {
		this.$debug.append("<div>" + message + ".</div>");
		this.$debug.scrollTop(this.$debug.height() + this.$debug.scrollTop());
	}

};

Bluetooth.prototype.disconnect = function (oArgs) {
	var self = this;
	ble.disconnect(this.deviceId,
		function () {
			self.debugger("Disconnect success");
			self.callbackMethod(oArgs, false);
		},
		function (e) {
			self.debugger("Disconnect Error " + e);
		});
};