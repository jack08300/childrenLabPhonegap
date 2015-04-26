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
    this.$pairedList = $('div.list', this.$paredDevice);

    if(!bluetoothle.isInitialized()){
        bluetoothle.initialize(
            function(){
                console.log("Bluetooth initialized");
                self.attachEvent();
            },
            function(){
                console.error("Bluetooth initialized fail");
            },{
                request: true,
                statusReceiver: false
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
                app.notification("Bluetooth Device", "Please enbale your bluetooth first");
            }
        );
    }

};

Bluetooth.prototype.searchDevice = function(){
    var self = this;
    this.runningOnSearch = true;
    this.$unpairedList.empty();
    console.log("searching device");

    if(device.platform == "Android"){
        //this.androidDescover();
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
    }else if(device.platform == "iOS"){
        this.iosDescover();
    }
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
                            app.notification("Bluetooth Device", "Something wrong with your device.");

                        }
                    );
                }
            }else{
                self.searchDevice();
            }
        });

    }

};

Bluetooth.prototype.androidPair = function(uuid){
    bluetoothSerial.connect(uuid,
        function(data){
            console.log("success connect. ");
            console.log(data);
        },
        function(data){
            console.error("Fail to connect to device");
            alert("Failed");
        }
    )
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

        this.$eachDevice.on("click", "div.pairButton", function(){
            var uuid = $(this).parent().attr("uuid");
            console.log("connecting to: " + uuid);
            self.androidPair(uuid);
        });

        this.$eachDevice.find('span.deviceAddress').html("");
        this.$eachDevice.find('span.deviceClass').html("");
        this.$eachDevice.find('span.deviceId').html("");
        this.$eachDevice.find('span.deviceName').html("");

        this.deviceList.push(data);
        self.disableSearch();
    }



};

Bluetooth.prototype.androidDescover = function(){
    var self = this;
    bluetoothSerial.discoverUnpaired(
        function(deviceList){
            console.log(deviceList);
            for(var i=0; i<deviceList.length; i++){
                self.$eachDevice.find('span.deviceAddress').html(deviceList[i].address);
                self.$eachDevice.find('span.deviceClass').html(deviceList[i]["class"]);
                self.$eachDevice.find('span.deviceId').html(deviceList[i]["id"]);
                self.$eachDevice.find('span.deviceName').html(deviceList[i]["name"]);

                self.$eachDevice.clone().appendTo(self.$unpairedList).attr("uuid", deviceList[i].address).show();

                self.$eachDevice.find('span.deviceAddress').html("");
                self.$eachDevice.find('span.deviceClass').html("");
                self.$eachDevice.find('span.deviceId').html("");
                self.$eachDevice.find('span.deviceName').html("");


            }
            self.$status.html("Searching Complete");
            self.runningOnSearch = false;
        },
        function(){
            console.error("Search Device fail");
        }
    );
};

Bluetooth.prototype.iosDescover = function(){
    var self = this;
    bluetoothSerial.list(
        function(deviceList){
            console.log("List");
            console.log(deviceList);
            for(var i=0; i<deviceList.length; i++){
                self.$eachDevice.find('span.deviceAddress').html(deviceList[i].address);
                self.$eachDevice.find('span.deviceClass').html(deviceList[i]["class"]);
                self.$eachDevice.find('span.deviceId').html(deviceList[i]["id"]);
                self.$eachDevice.find('span.deviceName').html(deviceList[i]["name"]);

                self.$eachDevice.clone().appendTo(self.$pairedList).show();

                self.$eachDevice.find('span.deviceAddress').html("");
                self.$eachDevice.find('span.deviceClass').html("");
                self.$eachDevice.find('span.deviceId').html("");
                self.$eachDevice.find('span.deviceName').html("");
            }
            self.$status.html("Searching Complete");
            self.runningOnSearch = false;
        },
        function(){
            console.error("Search Device fail");
        }
    );
};

Bluetooth.prototype.isConnected = function(){
    var self = this;

    bluetoothSerial.isConnected(
        function(data){
            console.log("Device is connected");
            console.log(data);
            self.$status.html("Connected!");
            self.receiveData();
        },
        function(){

        }
    )
};

Bluetooth.prototype.receiveData = function(){
// the success callback is called whenever data is received
    bluetoothSerial.subscribe('\n', function (data) {
        console.log(data);
    }, failure);
};

new Bluetooth().init();