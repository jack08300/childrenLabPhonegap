/**
 * Created by yen-chieh on 6/22/15.
 */
var gapReady = $.Deferred();
var jqmReady = $.Deferred();

var Setting = function () {
	var self = this;
	document.addEventListener('deviceready', function () {
		//self.deviceReady();
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.init();
	});

};

Setting.prototype.init = function () {

	this.$deviceTemplate = $('div.eachDevice');
	this.$deviceList = $('div.deviceList');

	this.attachEvent();

	app.addHeader({
		mainMenu: true,
		appendTo: "div.settingPage",
		body: $('body')
	});
	this.bluetooth = new Bluetooth();

	this.bluetooth.init({
		$template: this.$deviceTemplate,
		$deviceList: this.$deviceList,
		serviceOption: "macId"
	});
};

Setting.prototype.attachEvent = function () {
	var self = this;

	this.$deviceTemplate.on('click', function() {
		alert(self.bluetooth.readMacId());
	});
	console.log("test");
};

Setting.prototype.openSetupPage = function () {

};

new Setting();