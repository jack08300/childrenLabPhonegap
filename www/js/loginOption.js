/**
 * Created by yen-chieh on 5/5/15.
 */
var LoginOptions = function () {
};

LoginOptions.prototype.init = function () {
	this.$parentButton = $('div.parent');
	this.$nannyButton = $('div.nanny');

	var $background = $('img');

	$background.css('height', document.documentElement.clientHeight);

	this.attachEvent();
};

LoginOptions.prototype.attachEvent = function() {
	var self = this;

	this.$parentButton.on('click', function(){
		app.rule = "Parent";
		self.moveToMenuPage();
	});

	this.$nannyButton.on('click', function(){
		app.rule = "Nanny";
		self.moveToMenuPage();
	});

};

LoginOptions.prototype.moveToMenuPage = function(){
	window.location = app.setting.home;
};

new LoginOptions().init();