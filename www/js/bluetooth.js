var Bluetooth = function () {
};

Bluetooth.prototype.init = function () {
	var self = this;
	this.deviceId = "1B85999A-A964-F738-79CE-49DBD019C503";
	this.serviceUuid = "91C10EDC-8616-4CBF-BC79-0BF54ED2FA17";
	this.notificationUuid = "09A44002-CD70-4B7A-B46F-CC4CDBAB1BB4";
	document.addEventListener('deviceready', function () {
		self.deviceReady();
	}, false);
};

Bluetooth.prototype.deviceReady = function () {
	var self = this;
	this.$searchDevice = $('div.searchDevice');
	this.$bluetoothStatus = $('span.bluetoothStatus');
	this.$status = $('span.status');
	this.$eachDevice = $('div.eachDevice');
	this.$allList = $('div.list');
	this.$unpairedList = $('div.deviceList', this.$allList);
	this.$serviceList = $('div.serviceList', this.$allList);

	app.addTopNavigater({
		left: true,
		right: false
	});

	this.attachEvent();

};

Bluetooth.prototype.attachEvent = function () {
	var self = this;

	ble.isEnabled(
		function(){
			self.searchDevice();
		},
		function(){
			self.enableBluetooth();
		}
	);


	this.$searchDevice.on('click', function () {
		self.searchDevice();
	});


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
	self.$bluetoothStatus.html("ON");
	self.runningOnSearch = true;
	self.$unpairedList.empty();
	self.$status.html("Scanning...");

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
		if (this.deviceList[i].id == data.id) {
			exist = true;
			break;
		}
	}

	if (!exist) {
		this.$eachDevice.attr("id", data.id);
		this.$eachDevice.find('span.deviceAddress').html(data.id);
		this.$eachDevice.find('span.deviceName').html(data.name);
		this.$eachDevice.find('span.advertisement').html(data.advertising);
		this.$eachDevice.find('span.deviceRssi').html(data.rssi);
		this.$eachDevice.on("click", "div.pairButton", function () {
			self.isConnected(data);
		});
		this.$eachDevice.on("click", "div.disconnectButton", function () {
			self.disconnect(data.id);
		});

		this.$eachDevice.clone(true).appendTo(this.$unpairedList).attr("address", data.address).show();



		this.$eachDevice.find('span.deviceAddress').html("");
		this.$eachDevice.find('span.deviceClass').html("");
		this.$eachDevice.find('span.deviceId').html("");
		this.$eachDevice.find('span.deviceName').html("");

		this.deviceList.push(data);

		self.disableSearch();
	}else{
		$('#' + data.id).find('span.deviceRssi').html(data.rssi);
	}

};

Bluetooth.prototype.isConnected = function (device) {
	var self = this;
	ble.isConnected(device.id,
		function (data) {
				self.$status.html("Connected to: " + JSON.stringify(data));
		},
		function(){
			self.connect(device);
		}
	)
};

Bluetooth.prototype.connect = function (device) {
	var self = this;
	console.log("connecting");
	self.$status.html("Connecting to " + device.name);
	ble.connect(device.id,
		function (data) {
			//success
				self.$status.html("Connected to " + device.name);
				self.displayServices(data);
		},
		function () {
			//fail
			self.$status.html("Fail Connected to " + device.name);
		}
	)
};

Bluetooth.prototype.displayServices = function (data) {
	var self = this;
	var $eachData = $('div.eachCharacter');
	for (var i = 0; i < data.characteristics.length; i++) {
		if(data.characteristics[i].service == "180A"){
			continue;
		}
		var $readButton = $eachData.find('div.readData');
		var $notifyButton = $eachData.find('div.notifyData');

		$readButton.attr("id", data.characteristics[i].characteristic).attr("deviceId", data.id).attr("serviceId", data.characteristics[i].service).attr("characterId", data.characteristics[i].characteristic);
		$notifyButton.attr("id", data.characteristics[i].characteristic).attr("deviceId", data.id).attr("serviceId", data.characteristics[i].service).attr("characterId", data.characteristics[i].characteristic);

		$eachData.find('span.deviceId').html(data.id);
		$eachData.find('span.characterUuid').html(data.characteristics[i].characteristic);
		$eachData.find('span.characterProperties').html(JSON.stringify(data.characteristics[i].properties));
		$eachData.find('span.characterServices').html(data.characteristics[i].service);
		$eachData.find('span.descriptors').html(JSON.stringify(data.characteristics[i].descriptors));


		$readButton.on('click', function () {
			self.$status.html("Reading... " + $(this).attr("id"), $(this).attr("serviceId"), $(this).attr("characterId"));
			self.read({
				deviceId: $(this).attr("deviceId"),
				serviceId: $(this).attr("serviceId"),
				characterId: $(this).attr("characterId"),
				dataReceive: $(this).parent().parent().find('span.devicedata')
			});
		});

		$notifyButton.on('click', function () {
			if($(this).html() == "NOTIFY OFF"){
				self.$status.html("Notifying... " + $(this).attr("id"), $(this).attr("serviceId"), $(this).attr("characterId"));
				$(this).html("NOTIFY ON");
				self.notify({
					deviceId: $(this).attr("deviceId"),
					serviceId: $(this).attr("serviceId"),
					characterId: $(this).attr("characterId"),
					dataReceive: $(this).parent().parent().find('span.devicedata')
				});
			}else{
				self.$status.html("Stop Notifying..." + $(this).attr("id"), $(this).attr("serviceId"), $(this).attr("characterId"));
				self.stopNotify({
					deviceId: $(this).attr("deviceId"),
					serviceId: $(this).attr("serviceId"),
					characterId: $(this).attr("characterId"),
					dataReceive: $(this).parent().parent().find('span.devicedata'),
					$button: $(this)
				});
			}

		});

		$eachData.clone(true).appendTo(this.$serviceList).show();


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
			//self.$status.html(self.$status.html() + int[0]);

			for(var i=0;i<int.length;i++){
				oArgs.dataReceive.append("<br/>Notified: " + int[i]);
			}
		},
		function(error){
			self.$status.html("Fail to Notifying. " + JSON.stringify(error));
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
			self.$status.html("Fail to Stop Notify. " + JSON.stringify(error));
		}
	)
};


Bluetooth.prototype.disconnect = function (deviceId) {
	var self = this;
	ble.disconnect(deviceId,
		function(){
			self.$status.html("Disconnect to " + deviceId);
		},
		function(){
			self.$status.html("Failed disconnect to " + deviceId);
		}
	)
};



new Bluetooth().init();