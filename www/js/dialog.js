/**
 * Created by yen-chieh on 5/9/15.
 */
var Dialog = function(){};

Dialog.prototype.init = function(oArgs){
	oArgs = oArgs || {};

	this.$dialog = $.load('/page/dialog.html');

	this.generateScheduleForm(oArgs);

};

Dialog.prototype.generateScheduleForm = function(oArgs){
	var self = this;
	oArgs = oArgs || {};

	this.$form = $('form', this.$dialog);

	this.$form.find('#startDate').val(oArgs.startDate);
	this.$form.find('#endDate').val(oArgs.endDate);

	this.$form.on('click', 'div.mainButton', function(){
		self.submitForm();
	});

	this.show();
};

Dialog.prototype.submitForm = function(){
	var self = this;
	var data = this.$form.serializeArray();

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.scheduleCreateAPI,
		context: self,
		data: data,
		success: self.submit_load
	});
};

Dialog.prototype.submit_load = function(){
	alert("submitted");
};

Dialog.prototype.show = function(){
	this.$dialog.show();
};