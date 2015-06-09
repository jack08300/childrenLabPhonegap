/**
 * Created by yen-chieh on 5/19/15.
 */
var Feedback = function(){};

var gapReady = $.Deferred();
var jqmReady = $.Deferred();

Feedback.prototype.init = function() {
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

Feedback.prototype.deviceReady = function() {
	this.$feedbackPage = $('div.feedbackPage');
	this.$selectType = $('#feedbackType');
	this.$feedbackText = $('div.feedbackText');
	this.$feedbackTextArea = $('#feedbackTextArea');

	this.tool = new Tools();

	this.attachEvent();

	app.addHeader({
		mainMenu: true,
		appendTo: "div.feedbackPage"
	});
};

Feedback.prototype.attachEvent = function() {
	var self = this;

	var $feedbackLabel = this.$feedbackText.find('label.feedbackLabel');
	this.$selectType.bind( "change", function(event, ui) {
		if($(this).val() == "suggestion"){
			$feedbackLabel.text("Leave your suggestion: ");
		}else{
			$feedbackLabel.text("What is the issue: ");
		}
	});

	this.$feedbackPage.on('click', 'div.mainButton', function() {
		self.submitFeedback();
	});

};

Feedback.prototype.submitFeedback = function() {
	this.tool.showLoading({
		text: 'Submitting...'
	});

	var type = this.$selectType.val().toUpperCase();
	var text = this.$feedbackTextArea.val().toUpperCase();

	this.tool.ajax({
		url: app.setting.serverBase + app.setting.api.feedback,
		context: this,
		data: {
			type: type,
			text: text
		},
		callback: this.submitFeedback_load
	});
};

Feedback.prototype.submitFeedback_load = function(data) {
	this.tool.hideLoading();
	app.notification("Feedback", "Thanks for your feedback.");
	window.location = window.rootPath + "pages/feedback.html";
};


new Feedback().init();