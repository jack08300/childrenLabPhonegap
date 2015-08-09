/**
 * Created by Jay on 4/2/2015.
 */
var gapReady = $.Deferred();
var jqmReady = $.Deferred();

var SignInUp = function () {
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

SignInUp.prototype.init = function () {

	this.$signButton = $('div.signButton');
	this.isRegistered = false;

/*
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
*/

	this.attachEvent();

};

SignInUp.prototype.attachEvent = function () {
	var self = this;

	this.$signButton.on('click', function(){
		if(self.signInAssetLoaded){
			self.loadSignForm_load();
		}else{
			self.loadSignForm();
		}

	});

/*	$('.signUpText').on('click', function () {
		window.location = window.rootPath + "signUp.html";
	});

	$('div.signInButton').on('click', function(){
		self.signInForm();
	});*/

};

SignInUp.prototype.loadSignForm = function() {
	app.loadTemplate({
		path: 'template/signInUp.html',
		appendTo: 'div.indexOptions',
		context: this,
		callback: this.loadSignForm_load
	})
};

SignInUp.prototype.loadSignForm_load = function(){
	var self = this;
	this.signInAssetLoaded = true;

	app.pageSwitch({
		pageOut: 'div.signButtons',
		pageIn: 'div.signInUp'
	});

	this.$email = $('input[name="email"]');
	this.$password = $('input[name="password"]');
	this.$rePassword =$('input[name="rePassword"]');
	this.$errorMessage = $('div.errorMessage');

	this.$email.on('focusout', function(){
		if(app.tool.validateEmail(self.$email.val())){
			self.checkEmailRegistered();
		}

	});


	this.$password.keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.onSubmit();
		}
	});

	this.$rePassword.keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.onSubmit();
		}
	});
};

SignInUp.prototype.checkEmailRegistered = function(){
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.emailRegistered,
		context: this,
		data: {
			email: this.$email.val()
		},
		callback: this.checkEmailRegistered_load
	})
};

SignInUp.prototype.checkEmailRegistered_load = function(data){
	if(!data.emailRegistered){
		this.isRegistered = false;
		this.$rePassword.show();
	}else{
		this.isRegistered = true;
		this.$rePassword.hide();
	}
};

SignInUp.prototype.onSubmit = function() {
	if(!app.tool.validateEmail(this.$email.val())){
		this.$errorMessage.html("Please check your email format.");
		return false;
	}

	if(!app.tool.validatePassword(this.$password.val())){
		this.$errorMessage.html("Password length must be longer than 5.");
		return false;
	}



	if(!this.isRegistered){
		if(this.$password.val() != this.$rePassword.val()){
			this.$errorMessage.html("Your password not match.");
			return false;
		}

		app.tool.ajax({
			url: app.setting.serverBase + app.setting.api.signUp,
			context: this,
			data: {
				email: this.$email.val(),
				password: this.$password.val()
			},
			callback: this.signUp_load
		});

	}else{
		app.tool.ajax({
			url: app.setting.serverBase + app.setting.api.signIn,
			context: this,
			data: {
				email: params.email,
				password: params.password
			},
			callback: this.signIn_load
		});
	}

	app.tool.showLoading();
	return false;
};

SignInUp.prototype.signUp_load = function() {
	app.tool.hideLoading();
	app.loadTemplate({
		path: 'template/signUpInfo.html',
		appendTo: 'div.indexOptions',
		context: this,
		callback: this.signUpInfo_load
	});
};

SignInUp.prototype.signUpInfo_load = function() {
	app.pageSwitch({
		pageOut: 'div.signInUp',
		pageIn: 'div.signUp'
	});

};

SignInUp.prototype.signIn_load = function (data) {
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



new SignInUp();