var Activity = function () {
	/* Face Data */
	this.indoorData = [
		{
			name: 'steps',
			value: 42
		},{
			name: 'walking',
			value: 59
		}, {
			name: 'flights',
			value: 63
		}

	];

	this.outdoorData = [
		{
			name: 'steps',
			value: 34
		},{
			name: 'walking',
			value: 80
		}, {
			name: 'flights',
			value: 44
		}

	];
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
	this.$indoor = $('div.indoor');
	this.$outdoor = $('div.outdoor');


	app.addHeaderBar({title: 'Activity'});

	app.addMenuBar();

	this.attachEvent();

	this.bluetooth = new Bluetooth;
	this.bluetooth.init({
		//$debug: $('#deviceDebug'),
		callback: this.findDevice_load,
		context: this
	});


	/* Face Data */
	this.updateBar(this.indoorData);
	/* Face Data */
};

Activity.prototype.findDevice_load = function () {

	if(!this.writing || this.writing == false){
		this.writing = true;
		this.bluetooth.write({
			serviceId: 'FFA0',
			characterId: 'FFA1',
			value: '1',
			callback: this.turnSensorOn,
			context: this
		});
	}

};

Activity.prototype.turnSensorOn = function () {
	//this.writing = false;
	var self = this;

	this.bluetooth.notify({
		serviceId: 'FFA0',
		characterId: 'FFA3',
		debug: $('div.debug'),
		context: this,
		type: 'activityX',
		callback: self.uploadData
	});

	this.bluetooth.notify({
		serviceId: 'FFA0',
		characterId: 'FFA4',
		debug: $('div.debug'),
		context: this,
		type: 'activityY',
		callback: self.uploadData
	});

	this.bluetooth.notify({
		serviceId: 'FFA0',
		characterId: 'FFA5',
		debug: $('div.debug'),
		context: this,
		type: 'activityZ',
		callback: self.uploadData
	});

	/* Face Data */
/*	this.indoorData = [
		{
			name: 'steps',
			value: 42
		},{
			name: 'walking',
			value: 59
		}, {
			name: 'flights',
			value: 63
		}

	];

	this.updateBar(data);*/
	/* Face Data */

/*	setInterval(function(){
		var activityValue = parseInt(window.localStorage.getItem('activityX')) + parseInt(window.localStorage.getItem('activityY')) + parseInt(window.localStorage.getItem('activityZ'));
		activityValue = activityValue / 4000;
		if(activityValue > 100) activityValue = 100;
		self.$steps.find('span').html(activityValue.toFixed(2) + "%");
		self.$steps.css('width', activityValue + "%");
	}, 500);*/

};

Activity.prototype.updateBar = function(data) {

	for(var i = 0 ; i<data.length;i++){
		var $bar = $('div.' + data[i].name);
		if(data[i].value > 100) data[i].value = 100;
		$bar.find('span').html(data[i].value.toFixed(2) + "%");
		$bar.css('width', data[i].value + "%");
	}

};

Activity.prototype.attachEvent = function () {
	var self = this;

	this.$steps.on('click', function(){
		window.localStorage.removeItem('activityX');
		window.localStorage.removeItem('activityY');
		window.localStorage.removeItem('activityZ');
		self.$steps.find('span').html("0.00%");
	});

	this.$indoor.on('click', function(){
		self.$outdoor.find('div').removeClass('active');
		$(this).find('div').addClass('active');
		self.updateBar(self.indoorData);
	});

	this.$outdoor.on('click', function(){
		self.$indoor.find('div').removeClass('active');
		$(this).find('div').addClass('active');
		self.updateBar(self.outdoorData);
	});
};

Activity.prototype.uploadData = function (oArgs) {
	oArgs = oArgs || {};

	var data = {};
	data[oArgs.type] = oArgs.value;


	$.ajax({
		url: app.setting.serverBase + app.setting.api.uploadData,
		type: 'POST',
		crossDomain: true,
		context: this,
		data: data,
		success: function(data, status, xhr) {
			alert(data);
		}
	});

/*	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadData,
		type: 'post',
		context: this,
		data: data,
		callback: this.uploadData_load
	});*/
};

Activity.prototype.uploadData_load = function () {

};



new Activity().init();