var Bluetooth = function(){};

Bluetooth.prototype.init = function(){
    var self = this;
    this.serviceUuid = "91c10edc-8616-4cbf-bc79-0bf54ed2fa17";
    this.notificationUuid = "09a44002-cd70-4b7a-b46f-cc4cdbab1bb4";
    document.addEventListener('deviceready', function(){self.deviceReady();}, false);
};

Bluetooth.prototype.deviceReady = function(){
    var self = this;
    this.$searchDevice = $('div.searchDevice');
    this.$bluetoothStatus = $('span.bluetoothStatus');
    this.$status = $('span.status');
    this.$eachDevice = $('div.eachDevice');
    this.$deviceList = $('div.deviceList');
    this.$unpairedList = $('div.list', this.$deviceList);
    this.$paredDevice = $('div.pairedDevice');
		this.$receivedData = $('div.receivedData');
    this.$pairedList = $('div.list', this.$paredDevice);

		app.addTopNavigater({
			left: true,
			right: false
		});

    if(!bluetoothle.isInitialized()){
        bluetoothle.initialize(
            function(){
                console.log("Bluetooth initialized");
								self.$status.html("initialize blutoothle Success");
                self.attachEvent();
            },
            function(){
								self.$status.html("Bluetooth initialized fail");
                console.error("Bluetooth initialized fail");
            },{
                request: true,
                statusReceiver: true
            }
        );
    }



};

Bluetooth.prototype.attachEvent = function(){
    var self = this;

    this.enableAndSearch();

    this.$searchDevice.on('click', function(){
        self.enableAndSearch();
    });



};

Bluetooth.prototype.enableBluetooth = function(){
    var self = this;

    if(device.platform == "Android"){
        bluetoothle.enable(
            function(){
                self.searchDevice();
            },
            function(){
                app.notification("Bluetooth Device", "Please enbale your bluetooth first", null);
            }
        );
    }

};

Bluetooth.prototype.searchDevice = function(){
    var self = this;
		self.$bluetoothStatus.html("ON");
		self.runningOnSearch = true;
		self.$unpairedList.empty();

        bluetoothle.startScan(
            function(data){
                if(data.status == "scanStarted"){
                    self.$status.html("Searching device...");
                }else if(data.status == "scanResult"){
                    self.displayDeviceList(data);
                }
            },
            function(error){
                console.error(error);
            }, {
                serviceUuids: [self.serviceUuid]
            }
        );

};

Bluetooth.prototype.disableSearch = function(){
    var self = this;
    bluetoothle.stopScan(
        function(){
            console.log("stop scanning");
            self.$status.html("Completed");
        },
        function(){
            console.error("Error on stopping scanning");
        }
    );
};

Bluetooth.prototype.enableAndSearch = function(){
    var self = this;

    if(!this.runningOnSearch){

        bluetoothle.isEnabled(function(result){
            if(!result.isEnabled){
                if(device.platform == "Android"){
                    bluetoothle.enable(
                        function(){
                            //success
                            console.log("Bluetooth enabled");
                            self.searchDevice();
                        },
                        function(){
                            //fail
                            app.notification("Bluetooth Device", "Something wrong with your device.", null);

                        }
                    );
                }
							self.$bluetoothStatus.html("OFF");
            }else{
								self.$status.html("Bluetooth is On");
                self.searchDevice();
            }
        });

    }

};

Bluetooth.prototype.displayDeviceList = function(data){
    var self = this;
    this.deviceList = this.deviceList || [];

    var exist = false;
    for(var i=0;i<this.deviceList.length;i++){
        if(this.deviceList[i].address == data.address){
            exist = true;
            break;
        }
    }

    if(!exist){
        this.$eachDevice.find('span.deviceAddress').html(data.address);
        this.$eachDevice.find('span.deviceName').html(data.name);
        this.$eachDevice.find('span.advertisement').html(data.advertisement);

        this.$eachDevice.clone().appendTo(this.$unpairedList).attr("address", data.address).show();

			this.$unpairedList.on("click", "div.pairButton", function(){
				self.isConnected(data);

			});

			this.$eachDevice.find('span.deviceAddress').html("");
        this.$eachDevice.find('span.deviceClass').html("");
        this.$eachDevice.find('span.deviceId').html("");
        this.$eachDevice.find('span.deviceName').html("");

        this.deviceList.push(data);
        self.disableSearch();
    }

};

Bluetooth.prototype.isConnected = function(device){
	var self = this;
	bluetoothle.isConnected(
		function(data){

			if(data.isConnected){
				self.services(data);
			}else{
				self.connect(device);
			}
		},{
			address: device.address
		}
	)
};

Bluetooth.prototype.connect = function(device) {
	var self = this;
	console.log("connecting");

	bluetoothle.connect(
		function(data){
			//success
			if(data.status == "connecting"){
				self.$status.html("Connecting to " + device.name);
			}else if(data.status == "connected"){
				self.$status.html("Connected to " + device.name);
				self.services(data);
			}else if(data.status == "disconnected") {
				self.$status.html("Disconnected to " + device.name);
			}


		},
		function(){
			//fail
			self.$status.html("Fail Connected to " + device.name);
			console.error("Error on connecting to device");
		},{
			address: device.address
		}
	)
};

Bluetooth.prototype.services = function(device){
	var self = this;

	bluetoothle.services(
		function(data){
			if(data.status == "services"){
				self.$unpairedList.empty();
				self.$status.html("Discovered Services: " + device.name);
				self.services_load(data);
			}
		},
		function(){
			self.$status.html("Fail discover services " + device.name);
		}, {
			address: device.address,
			serviceUuids: [self.serviceUuid]
		}
	)
};

Bluetooth.prototype.services_load = function(data){
	var self = this;
	var $eachData = $('div.eachDescriptor');
	for(var i =0;i<data.serviceUuids.length;i++){
		$eachData.find('span.deviceUuid').html(data.serviceUuids[i]);
		$eachData.find('span.deviceName').html(data.name);
		$eachData.find('span.deviceAddress').html(data.address);
		$eachData.clone().appendTo(this.$unpairedList).show();
		this.$unpairedList.on('click', 'div.connect', function(){
			self.characteristics(data, data.serviceUuids[i]);
		});
	}

};

Bluetooth.prototype.characteristics = function(device, serviceUuid){
	var self = this;

	bluetoothle.characteristics(
		function(data){
			if(data.status == "characteristics"){
				self.$unpairedList.empty();
				self.$status.html("Discovered Characteristics: " + device.name);
				self.characteristics_load(data);
			}
		},
		function(data){
			self.$status.html("Fail discover characteristics " + JSON.stringify(data));
		}, {
			address: device.address,
			serviceUuid: serviceUuid
		}
	)
};

Bluetooth.prototype.characteristics_load = function(data){
	var $eachData = $('div.eachDescriptor');
	for(var i =0;i<data.characteristics.length;i++){
		$eachData.find('span.deviceUuid').html(data.characteristics[i].characteristicUuid);
		$eachData.find('span.deviceAddress').html(data.characteristics[i].address);
		$eachData.append("Properties<span>" + JSON.stringify(data.characteristics[i].properties) + "</span>");
		$eachData.clone().appendTo(this.$unpairedList).show();

	}

};

Bluetooth.prototype.subscribe = function(data){
	var self = this;

	bluetoothle.subscribe(
		function(result){
			if(result.status == "subscribed"){
				self.$status.html("Subscribed to " + result.name);
			}else if(result.status == "subscribedResult"){
				self.$status.html("Received subscribed result " + result.value);
				self.$receivedData.append("<div class='eachReceived'>" + result.status + ", " + result.value + " </div>");
			}

		},
		function(result){
			app.notification("Bluetooth Device", "Error on subscribe. " + result, null);

		},{
			address: data.address,
			serviceUuid: self.serviceUuid,
			characteristicUuid: self.notificationUuid,
			isNotification: true

		});
};


new Bluetooth().init();