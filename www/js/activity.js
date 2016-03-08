var Activity = function () {
	/* Face Data */
	this.indoorData = [
		{
			name: 'steps',
			value: 68
		}, {
			name: 'walking',
			value: 50
		}, {
			name: 'flights',
			value: 30
		}

	];

	this.outdoorData = [
		{
			name: 'steps',
			value: 71
		}, {
			name: 'walking',
			value: 65
		}, {
			name: 'flights',
			value: 60
		}

	];

	this.localDataName = "ActivityData";
	this.initialName = "initialDevice";
	this.deviceTimeName = "lastDeviceTime";
	this.isUploadingData = false;
	this.isReceivingData = false;
	this.receivingDataCount = 0;

	this.receivedTime = 0;

	//window.localStorage.setItem(this.localDataName, "");
};


var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Activity.prototype.init = function () {
	var self = this;
	document.addEventListener('deviceready', function () {
		//self.deviceReady();
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function () {
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function () {
		self.deviceReady();
	});

};

Activity.prototype.deviceReady = function () {
	var self = this;

	this.$activityPage = $('div.activityPage');
	this.$steps = $('div.steps');
	this.$indoor = $('div.indoor');
	this.$outdoor = $('div.outdoor');
	this.$debug = $('div.debug');
	this.$cloudStatus = $('div#cloudStatus');
	this.$deviceStatus = $('div#deviceStatus');
	this.$debugTime = $('#timeDebug');
	this.$debugToTop = $('#debugToTop');
	this.$ffa5 = $('#ffa5');

	this.$debugToTop.on('click', function(){
		self.$debug.animate({scrollTop: 0}, '1500', 'swing');
	});


	app.addHeaderBar({title: 'Activity'});

	app.addMenuBar();

	this.attachEvent();

	//this.findDevice_load();

	/* Face Data */
	this.updateBar(this.indoorData);
	/* Face Data */

};


Activity.prototype.updateBar = function (data) {
	for (var i = 0; i < data.length; i++) {
		var $bar = $('div.' + data[i].name);
		if (data[i].value > 100) data[i].value = 100;
		$bar.find('span').html(data[i].value.toFixed(2) + "%");
		$bar.css('width', data[i].value + "%");
	}

};

Activity.prototype.attachEvent = function () {
	var self = this;

	this.$steps.on('click', function () {
		window.localStorage.removeItem('activityX');
		window.localStorage.removeItem('activityY');
		window.localStorage.removeItem('activityZ');
		self.$steps.find('span').html("0.00%");
	});

	this.$indoor.on('click', function () {
		self.$outdoor.find('div').removeClass('active');
		$(this).find('div').addClass('active');
		self.updateBar(self.indoorData);
	});

	this.$outdoor.on('click', function () {
		self.$indoor.find('div').removeClass('active');
		$(this).find('div').addClass('active');
		self.updateBar(self.outdoorData);
	});
};

new Activity().init();