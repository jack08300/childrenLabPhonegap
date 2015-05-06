var MainMenu = function () {
};

MainMenu.prototype.init = function () {
	this.$scheduleButton = $('div.scheduleButton');
	this.$kidsButton = $('div.kidsButton');
	this.$deviceButton = $('div.deviceButton');

	this.attachEvent();
};

MainMenu.prototype.attachEvent = function () {

	this.$deviceButton.on('click', this.deviceMenu);
	this.$scheduleButton.on('click', this.scheduleMenu);

};

MainMenu.prototype.deviceMenu = function () {
	console.log("click on device button");
	window.location = "bluetooth.html"
};

MainMenu.prototype.scheduleMenu = function () {
	console.log("click on device button");
	window.location = "schedulePage.html"
};

new MainMenu().init();