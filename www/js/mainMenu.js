var MainMenu = function() {};

MainMenu.prototype.init = function(){
    this.$scheduleButton = $('div.scheduleButton');
    this.$kidsButton = $('div.kidsButton');
    this.$deviceButton = $('div.deviceButton');

    this.attachEvent();
};

MainMenu.prototype.attachEvent = function(){

    this.$deviceButton.on('click', this.deviceMenu);

};

MainMenu.prototype.deviceMenu = function(){
    console.log("click on device button");
    window.location = "bluetooth.html"
};

new MainMenu().init();