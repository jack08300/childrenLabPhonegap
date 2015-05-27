/**
 * Created by yen-chieh on 5/20/15.
 */

var NearbySearchResult = function(){};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

NearbySearchResult.prototype.init = function(){
	var self = this;
	document.addEventListener('deviceready', function () {
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.deviceReady();
	});

};

NearbySearchResult.prototype.deviceReady = function(){
	this.$eachResult = $('div.eachNearby');
	this.$resultList = $('div.resultList');
	this.$userDetail = $('#userDetail');
	this.$chatBox = $('div.chatBox', this.$userDetail);
	this.tool = new Tools();

	var searchResult = window.localStorage.getItem('scheduleSearchResult');

	if(searchResult){
		this.displayResult(JSON.parse(searchResult));
	}
	app.addHeader({
		mainMenu: true,
		appendTo: "div.scheduleSearchResult"
	});

	this.attachEvent();
};

NearbySearchResult.prototype.attachEvent = function(){
	var self = this;

	this.$resultList.delegate("div.eachNearby" ,'click', function(){
		var index = $(this).attr('data-id');
		self.$chatBox.html("");
		self.clickedScheduleId = $(this).attr('data-schedule');
		self.retrieveMessage(self.clickedScheduleId);

		self.$userDetail.find('div.price span').html('$' + self.nannyList[index].price);
		self.$userDetail.find('div.name').html(self.nannyList[index].user.name);
		self.$userDetail.find('div.sex').html(self.nannyList[index].user.gender);
		self.$userDetail.find('div.zipcode').html(self.nannyList[index].user.zipcode);
		self.$userDetail.find('div.note').html(self.nannyList[index].note);

		self.$userDetail.panel( "open" );
	});

	$('div.submit').on('click', this.$userDetail, function(){
		var messageBar = self.$userDetail.find('input.chatText');
		if(messageBar.val().length == 0){
			app.notification("Message", "Please enter your message.", null);
			return false;
		}

		self.submitMessage(messageBar.val(), self.clickedScheduleId);
		messageBar.val("");
	});
};

NearbySearchResult.prototype.submitMessage = function(message, scheduleId){
	this.tool.ajax({
		url: app.setting.serverBase + app.setting.api.submitScheduleMessage,
		context: this,
		data: {
			scheduleId: scheduleId,
			message: message
		},
		oArgs: {
			message: message
		},
		callback: this.submitMessage_load
	});
};

NearbySearchResult.prototype.submitMessage_load = function(result, oArgs){
	result = result || {};
	oArgs = oArgs || {};

	if(result.success){
		this.$chatBox.append($('<div class="alignRight"><span>' + oArgs.message + '</span></div>'));
		this.$chatBox.animate({ scrollTop: this.$chatBox[0].scrollHeight}, 400);
	}else{
		app.notification("Message", "Error on submitting message.", null);
	}
};

NearbySearchResult.prototype.retrieveMessage = function(scheduleId){
	this.tool.ajax({
		url: app.setting.serverBase + app.setting.api.retrieveScheduleMessage,
		context: this,
		data: {
			scheduleId: scheduleId
		},
		callback: this.retrieveMessage_loaded
	});
};

NearbySearchResult.prototype.retrieveMessage_loaded = function(result){
	result = result || {};


	if(result.success){
		var message = result.scheduleMessage || [];
		var email = window.localStorage.getItem('email');


		for(var i=0;i<message.length;i++){
			var $template = $('<div><span></span></div>');

			if(message[i].user.email == email){
				$template.addClass("alignRight");
			}else{
				$template.addClass("alignLeft");
			}

			$template.find('span').html(message[i].message);
			this.$chatBox.append($template);
			this.$chatBox.scrollTop(this.$chatBox.prop("scrollHeight"));
		}

	}else{
		app.notification("Message", "Error on retrieve chat message.", null);
	}
};


NearbySearchResult.prototype.displayResult = function(oArgs){
	oArgs = oArgs || {};

	var list = oArgs.scheduleList;
	this.nannyList = list;
	var total = oArgs.totalSize;
	console.error(JSON.stringify(list));
	console.error(list.length);

	for(var i = 0; i < list.length;i++){
		this.$eachResult.attr('data-id', i).attr('data-schedule', list[i].id);
		this.$eachResult.find('div.name').text(list[i].user.name);
		this.$eachResult.find('div.sex').text(list[i].user.gender);
		//this.$eachResult.find('div.zipcode').text(list[i].user.zipcode);
		this.$eachResult.find('div.price span').text("$" + list[i].price);

		var startDate = moment(list[i].startDate).format("YYYY-MM-DD hh:mm");
		var endDate = moment(list[i].endDate).format("YYYY-MM-DD hh:mm");
		this.$eachResult.find('div.startDate').text(startDate);
		this.$eachResult.find('div.endDate').text(endDate);

		this.$eachResult.clone(true).appendTo(this.$resultList).show();
	}
};

new NearbySearchResult().init();