var Activity = function () {
};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Activity.prototype.init = function () {
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

};

Activity.prototype.deviceReady = function () {
	var self = this;

	this.$activityPage = $('div.activityPage');
	this.$steps = $('div.steps');


	app.addHeaderBar({title: 'Activity'});

	app.addMenuBar();

	this.attachEvent();

	this.bluetooth = new Bluetooth;
	this.bluetooth.init({
		//$debug: $('#deviceDebug'),
		callback: this.findDevice_load,
		context: this
	});

};

Activity.prototype.findDevice_load = function () {

	if(!this.writing || this.writing == false){
		this.writing = true;
		this.bluetooth.write({
			serviceId: 'FFA0',
			characterId: 'FFA1',
			value: 1,
			callback: this.turnSensorOn,
			context: this
		});
	}

};

Activity.prototype.turnSensorOn = function () {
	this.writing = false;
	var self = this;

	this.bluetooth.notify({
		serviceId: 'FFA0',
		characterId: 'FFA3',
		debug: $('div.debug'),
		type: 'activityX'
	});

	this.bluetooth.notify({
		serviceId: 'FFA0',
		characterId: 'FFA4',
		debug: $('div.debug2'),
		type: 'activityY'
	});

	this.bluetooth.notify({
		serviceId: 'FFA0',
		characterId: 'FFA5',
		debug: $('div.debug3'),
		type: 'activityZ'
	});

	setInterval(function(){
		var activityValue = parseInt(window.localStorage.getItem('activityX')) + parseInt(window.localStorage.getItem('activityY')) + parseInt(window.localStorage.getItem('activityZ'));
		activityValue = activityValue / 4000;
		if(activityValue > 100) activityValue = 100;
		self.$steps.find('span').html(activityValue.toFixed(2) + "%");
		self.$steps.css('width', activityValue + "%");
	}, 1000);

};

Activity.prototype.attachEvent = function () {
	var self = this;

	this.$steps.on('click', function(){
		window.localStorage.removeItem('activityX');
		window.localStorage.removeItem('activityY');
		window.localStorage.removeItem('activityZ');
		self.$steps.find('span').html("0.00%");
	});
};


new Activity().init();