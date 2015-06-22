/**
 * Created by Jay on 4/2/2015.
 */
var gapReady = $.Deferred();
var jqmReady = $.Deferred();

var Signin = function () {
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

Signin.prototype.init = function () {

	this.$email = $('input[name="email"]');
	this.$password = $('input[name="password"]');
	this.$errorMessage = $('div.errorMessage');

	var token = window.localStorage.getItem('token');

	if (token && token != "") {
		app.validateToken();
	}

	if (window.localStorage.getItem('email')) {
		this.$email.val(window.localStorage.getItem('email'));
	}

	this.attachEvent();

};

Signin.prototype.attachEvent = function () {
	var self = this;

	$('.signUpText').on('click', function () {
		window.location = window.rootPath + "signUp.html";
	});

	$('div.signInButton').on('click', function(){
		self.signInForm();
	});

};

Signin.prototype.signInForm = function() {
	this.$errorMessage.text("");
	console.log('sign in');

	var email = this.$email.val();
	var password = this.$password.val();

	if (!app.tool.validateEmail(email)) {
		this.$errorMessage.text("Please check your email format.");
		return;
	}

	if (!app.tool.validatePassword(password)) {
		this.$errorMessage.text("Password length must be more than 5..");
		return;
	}

	this.signIn({
		email: email,
		password: password
	});

	console.log('email ' + email + " password: " + password);
};

Signin.prototype.signIn = function (params) {
	params = params || {};
	app.tool.showLoading();
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.signIn,
		context: app,
		data: {
			email: params.email,
			password: params.password
		},
		callback: this.signIn_load
	});
};

Signin.prototype.signIn_load = function (data) {
	data = data || {};
	app.tool.hideLoading();
	if (data.access_token) {
		window.localStorage.setItem("token", data.access_token);
		window.localStorage.setItem("email", data.email);
		window.localStorage.setItem("profile", data.profileImage);

		app.tool.ajax({
			url: app.setting.serverBase + app.setting.api.connectAPI,
			context: app,
			data: {
				model: device.model,
				cordova: device.cordova,
				platform: device.platform,
				phoneUuid: device.uuid,
				version: device.version
			}
		});

		window.location = app.setting.ruleMenu;
	} else {
		window.location = window.rootPath + "index.html";
	}

};



new Signin();