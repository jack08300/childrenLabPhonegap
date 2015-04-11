var Bluetooth = function(){};

Bluetooth.prototype.init = function(){
    var self = this;
    document.addEventListener('deviceready', function(){self.deviceReady();}, false);
};

Bluetooth.prototype.deviceReady = function(){
    this.$searchDevice = $('div.searchDevice');
    this.$bluetoothStatus = $('span.bluetoothStatus');
    this.$status = $('span.status');
    this.$eachDevice = $('div.eachDevice');
    this.$deviceList = $('div.deviceList');
    this.$unpairedList = $('div.list', this.$deviceList);
    this.$paredDevice = $('div.pairedDevice');
    this.$pairedList = $('div.list', this.$paredDevice);

    this.attachEvent();
};

Bluetooth.prototype.attachEvent = function(){
    var self = this;

    this.isEnabled();

    this.$searchDevice.on('click', function(){
        self.isEnabled();

        if(!self.runningOnSearch){
            if(self.bluetoothEnabled){
                self.searchDevice();
            }else{
                self.enableBluetooth();
            }
        }

    });

};

Bluetooth.prototype.enableBluetooth = function(){
    var self = this;

    bluetoothSerial.enable(
        function(){
            self.searchDevice();
        },
        function(){
            if(navigator.notification){
                window.alert = function(){
                    navigator.notification.alert(
                        "Please enable your bluetooth first.",
                        null,
                        "Bluetooth Device",
                        "ok"
                    )
                }
            }
        }
    );
};

Bluetooth.prototype.searchDevice = function(){
    this.runningOnSearch = true;
    var self = this;

    this.$unpairedList.empty();
    this.$status.html("Searching device...");
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

    this.$unpairedList.find("div.pairButton").on("click", function(){
        var uuid = $(this).attr("uuid");
        console.log("connecting to: " + uuid);
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
    });
};

Bluetooth.prototype.isEnabled = function(){
    var self = this;
    bluetoothSerial.isEnabled(
        function(){
            self.bluetoothEnabled = true;
            self.$bluetoothStatus.html("ON");
        },
        function(){
            self.bluetoothEnabled = false;
            self.$bluetoothStatus.html("OFF");
        }
    );
};

new Bluetooth().init();