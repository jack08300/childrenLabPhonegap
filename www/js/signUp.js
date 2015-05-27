/**
 * Created by Jay on 4/2/2015.
 */
var gapReady = $.Deferred();
var jqmReady = $.Deferred();

var Signup = function () {
	var self = this;
	document.addEventListener('deviceready', function () {
		//self.deviceReady();
		gapReady.resolve();
	}, false);

	$(document).one("mobileinit", function(){
		jqmReady.resolve();
	});

	$.when(gapReady, jqmReady).then(function(){
		self.init();
	});
};

Signup.prototype.init = function () {

	this.$email = $('input[name="email"]');
	this.$password = $('input[name="password"]');
	this.$firstName = $('input[name="firstName"]');
	this.$lastName = $('input[name="lastName"]');
	this.$phoneNumber = $('input[name="phoneNumber"]');
	this.$gender = $('input[name="sex"]:checked');
	this.$errorMessage = $('div.errorMessage');
	this.$button = $('div.signUpButton');
	this.tool = new Tools();

	this.attachEvent();

	app.addHeader({
		mainMenu: false,
		noHeader: true,
		backButton: true,
		appendTo: "div.signUpPage"
	});
};

Signup.prototype.attachEvent = function () {
	var self = this;
	this.$button.on('click', function () {
		self.submitForm();
	});

};

Signup.prototype.submitForm = function () {
	this.$errorMessage.text("");

	if (!app.validateEmail(this.$email.val())) {
		this.$errorMessage.text("Please check your email format.");
		return;
	}

	if (!app.validatePassword(this.$password.val())) {
		this.$errorMessage.text("Please check your password format.");
		return;
	}

	if (!this.$firstName.val() || !this.$lastName.val()) {
		this.$errorMessage.text("Please check your name.");
		return;
	}

	if (this.$gender.val()) {
		this.$errorMessage.text("Please select your gender.");
		return;
	}

	if (this.$phoneNumber.val().length < 5) {
		this.$errorMessage.text("Please enter your phone number.");
		return;
	}
	this.tool.ajax({
		url: app.setting.serverBase + app.setting.api.signUp,
		context: this,
		data: {
			email: this.$email.val(),
			password: this.$password.val(),
			firstName: this.$firstName.val(),
			lastName: this.$lastName.val(),
			phoneNumber: this.$phoneNumber.val()
		},
		callback: this.submitForm_load
	});
};

Signup.prototype.submitForm_load = function (data) {
	if (data.success) {
		this.signin({
			email: this.$email.val(),
			password: this.$password.val()
		});
	} else {
		this.$errorMessage.text(data.message);
	}

};

Signup.prototype.signin = function (params) {
	params = params || {};

	this.tool.ajax({
		url: app.setting.serverBase + app.setting.api.signIn,
		context: app,
		data: {
			email: params.email,
			password: params.password
		},
		callback: app.signIn_load
	});
};

new Signup();