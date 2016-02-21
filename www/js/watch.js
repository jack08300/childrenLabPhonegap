/**
 * Created by yen-chieh on 2/1/16.
 */
var Watch = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Watch.prototype.init = function () {
	var self = this;
	document.addEventListener('deviceready', function () {
		//self.deviceReady();
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.deviceReady();
	});

	this.searchOn = false;
};

Watch.prototype.deviceReady = function () {
	var self = this;

	this.$container = $('div.container');

	this.$findNowTemplate = $('div.template.findNowTemplate');
	this.$batteryTemplate = $('div.template.batteryTemplate');
	this.$findNow = $('div.findNow', this.$findNowTemplate);
	this.$findNowButton = $('div.button', this.$findNow);
	this.switchTemplate(this.$findNowTemplate, 'findNow');
	this.$pageDot = $('div.pageDot');
	this.$debugRssi = $('div.debugRssi');

	app.addHeaderBar({title: 'My Watch'});

	app.addMenuBar();

	this.bluetooth = new Bluetooth;

	this.bluetooth.init({
		callback: this.initialBluetooth_load,
		//$debug: $('div.debug'),
		context: this
	});


};

Watch.prototype.switchTemplate = function($template, name){
	$('div', this.$pageDot).each(function(){
		if($(this).hasClass('dot_' + name)){
			$(this).addClass('active');
		}else{
			$(this).removeClass('active');
		}

	});
	this.$container.html($template.clone(true).removeClass("template"));
};

Watch.prototype.attachEvent = function(){
	var self = this;

	var mc = new Hammer(document.getElementsByClassName('watchPage')[0]);

	mc.on("swipeleft swiperight", function(ev){

		if(ev.type == "swiperight"){
			self.switchTemplate(self.$findNowTemplate, 'findNow');
		} else if(ev.type == "swipeleft") {
			self.switchTemplate(self.$batteryTemplate, 'battery');
		}
	});

	$('div').on('click', this.$pageDot, function(){
		console.error("test");
		if($(this).hasClass('dot_findNow')){
			self.switchTemplate(self.$findNowTemplate, 'findNow');
		}else{
			self.switchTemplate(self.$batteryTemplate, 'battery');
		}
	});

	this.$findNowButton.on('click', function(){
		if(!self.searchOn){
			self.searchOn = true;
			self.bluetooth.watchRange({
				callback: self.updateRange,
				context: self
			});
		}
	});
};

Watch.prototype.initialBluetooth_load = function(){

	this.attachEvent();

	this.scan();
};

Watch.prototype.scan = function(){
	this.bluetooth.startScan({
		callback: this.getBatteryLife,
		context: this
	});
};

Watch.prototype.getBatteryLife = function(oArgs, data){
	this.bluetooth.read({
		serviceId: '180F',
		characterId: '2A19',
		callback: this.getBatteryLife_load,
		context: this
	});
};

Watch.prototype.getBatteryLife_load = function(oArgs, data){
	this.bluetooth.disconnect();

	$('div.batteryTitle').html(data.toString() + "%")
};

Watch.prototype.updateRange = function(oArgs, rssi){
	//set -70 to -100
	this.$debugRssi.html(rssi);
	var min = 37;
	var max = 90;

	var percent = Math.abs((Math.abs(rssi) - min) / (max - min) - 1).toFixed(2);

	var circles = (percent / 0.25);

	var rgba;
	switch(true){
		case (circles > 0):
			rgba = 'rgba(255, 114, 49, ' + circles + ')';
			$('div.one').css('border-color', rgba);
		case (circles > 1):
			rgba = 'rgba(255, 114, 49, ' + (circles - 1) + ')';
			$('div.two').css('border-color', rgba);
		case (circles > 2):
			rgba = 'rgba(255, 114, 49, ' + (circles - 2) + ')';
			$('div.three').css('border-color', rgba);
		case (circles > 3):
			rgba = 'rgba(255, 114, 49, ' + (circles - 3) + ')';
			$('div.four').css('border-color', rgba);
	}

};

new Watch().init();