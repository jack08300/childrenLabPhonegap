var MainMenu = function () {
};

MainMenu.prototype.init = function () {
	this.$scheduleButton = $('div.scheduleButton');
	this.$kidsButton = $('div.kidsButton');
	this.$deviceButton = $('div.deviceButton');
	this.$profileImage = $('div.profileImage');

	this.attachEvent();
};

MainMenu.prototype.attachEvent = function () {

	this.$deviceButton.on('click', this.deviceMenu);
	this.$scheduleButton.on('click', this.scheduleMenu);
	this.$profileImage.on('click', this.imagePicker);


};

MainMenu.prototype.deviceMenu = function () {
	console.log("click on device button");
	window.location = "bluetooth.html"
};

MainMenu.prototype.scheduleMenu = function () {
	console.log("click on device button");
	window.location = "schedulePage.html"
};

MainMenu.prototype.imagePicker = function () {
	var options = {
		maximumImagesCount: 1,
		quality: 100
	};
	window.imagePicker.getPictures(
		function(results){
			console.log(results);
			console.log("Image URI: " + results[0]);
		}, function(error){
			alert("Error Occurred " + error);
		},
		options
	);
};

new MainMenu().init();