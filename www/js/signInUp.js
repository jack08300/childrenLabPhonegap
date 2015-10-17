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
	this.$facebookButton = $('div.facebookButton');
	this.isRegistered = true;


	//app.animateBackground({ background: 'div.indexPage' });

	this.attachEvent();
};

SignInUp.prototype.testFacebook = function() {
	var permission = ["public_profile", "email", "user_birthday"];
	facebookConnectPlugin.login(permission, this.testFacebook_success, this.testFacebook_error)

};

SignInUp.prototype.testFacebook_success = function(data) {
	console.error(data);

	var auth = data.authResponse;

	this.facebookData = data;

	app.tool.ajax({
		url: app.setting.serverBase + "/user/socialLogin",
		context: this,
		data: {
			facebook: data
		},
		callback: this.facebookLogin_load,
		noToken: true
	});
};

SignInUp.prototype.testFacebook_me = function(error) {
	facebookConnectPlugin.api("me?fields=id,first_name,last_name,gender,birthday,email", ["public_profile","user_birthday","email"],
		function(meData){
			console.error(meData)
		}
		,
		function(meError){
			console.error(meError);
		}
	);
};

SignInUp.prototype.testFacebook_error = function(error) {
	alert(error);
};

SignInUp.prototype.facebookLogin_load = function(data) {
	alert(data);
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

	this.$facebookButton.on('click', function(){
		self.testFacebook();
	});
};

SignInUp.prototype.loadSignForm = function() {
	app.loadTemplate({
		path: 'template/signInUp.html',
		appendTo: 'div.indexOptions',
		context: this,
		callback: this.loadSignForm_load
	});

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
	this.$rePassword = $('input[name="rePassword"]');
	this.$errorMessage = $('div.errorMessage');

	var emailCache = window.localStorage.getItem("email");

	if(emailCache) this.$email.val(emailCache);

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

	data = data || {};

	if(!data.registered){
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
				email: this.$email.val(),
				password: this.$password.val()
			},
			callback: this.signIn_load
		});
	}

	app.tool.showLoading();
	return false;
};

SignInUp.prototype.signUp_load = function() {

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.signIn,
		context: this,
		data: {
			email: this.$email.val(),
			password: this.$password.val()
		},
		callback: this.userInfoAsset
	});
};

SignInUp.prototype.userInfoAsset = function() {
	app.loadTemplate({
		path: 'template/signUpInfo.html',
		appendTo: 'div.indexOptions',
		context: this,
		callback: this.userInfoAsset_load
	});
};

SignInUp.prototype.userInfoAsset_load = function() {
	app.tool.hideLoading();
	app.pageSwitch({
		pageOut: 'div.signInUp',
		pageIn: 'div.signUp'
	});

	var self = this;
	this.$firstName = $('input[name="firstName"]');
	this.$lastName = $('input[name="lastName"]');
	this.$phoneNumber = $('input[name="phoneNumber"]');
	this.$zipCode = $('input[name="zipCode"]');

	this.$firstName.keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.onSubmitInfo();
		}
	});

	this.$lastName.keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.onSubmitInfo();
		}
	});

	this.$phoneNumber.keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.onSubmitInfo();
		}
	});

	this.$zipCode.keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.onSubmitInfo();
		}
	});
};

SignInUp.prototype.onSubmitInfo = function () {

	if(this.$firstName.val().length < 1 || this.$lastName.val().length < 1){
		this.$errorMessage.html("Please enter your name.");
		return false;
	}

/*	if(this.$phoneNumber.val().length < 1){
		this.$errorMessage.html("Please enter your phone number.");
		return false;
	}*/

	if(this.$zipCode.val().length < 1){
		this.$errorMessage.html("Please enter your zip code.");
		return false;
	}

	app.tool.showLoading();
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.updateProfile,
		context: this,
		data: {
			firstName: this.$firstName.val(),
			lastName: this.$lastName.val(),
			phoneNumber: this.$phoneNumber.val(),
			zipCode: this.$zipCode.val()
		},
		callback: this.onSubmitInfo_load
	});
};

SignInUp.prototype.onSubmitInfo_load = function(data){
	app.tool.hideLoading();
	if(data.success){
		app.loadTemplate({
			path: 'template/chooseRole.html',
			appendTo: 'div.indexOptions',
			context: this,
			callback: this.rolePageAssets_load
		});

	}else{
		return;
	}

	//update device information
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.connectAPI,
		context: this,
		data: {
			model: device.model,
			cordova: device.cordova,
			platform: device.platform,
			phoneUuid: device.uuid,
			version: device.version
		}
	});
};

SignInUp.prototype.rolePageAssets_load = function () {
	app.pageSwitch({
		pageOut: 'div.signUp',
		pageIn: 'div.chooseRole'
	});

	var self = this;
	this.$parentButton = $('div.parentButton');
	this.$nannyButton = $('div.nannyButton');

	this.$parentButton.on('click', function(){
		self.setUserRole("parent");
	});

	this.$nannyButton.on('click', function(){
		self.setUserRole("nanny");
	});


};

SignInUp.prototype.setUserRole = function (role) {
	app.tool.showLoading();
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.updateRole,
		context: this,
		data: {
			role: role
		},
		callback: this.setUserRole_load
	});
};

SignInUp.prototype.setUserRole_load = function (data) {
	if(data.success){
		//First Run: asking for swing watch

		app.loadTemplate({
			path: 'template/swingWatchOption.html',
			appendTo: 'div.indexOptions',
			context: this,
			callback: this.swingWatchPage
		});

	}else{
		alert("Please try again.");
	}

};

SignInUp.prototype.swingWatchPage = function () {
	app.pageSwitch({
		pageOut: 'div.chooseRole',
		pageIn: 'div.swingWatch'
	});

	var self = this;
	this.$yesButton = $('div.yes');
	this.$noButton = $('div.no');

	this.$yesButton.on('click', function(){
		self.searchDevice();
	});

	this.$noButton.on('click', function(){
		self.noDevice();
	});

	app.tool.hideLoading();
};

SignInUp.prototype.noDevice = function () {
	var self = this;

	app.pageSwitch({
		pageOut: 'div.swingWatch',
		pageIn: 'div.purchaseWatch'
	});


	this.$noPurchase = $('div.noPurchase');

	this.$noPurchase.on('click', function(){
		self.signIn_load();
	});
};

SignInUp.prototype.searchDevice = function () {
	app.loadTemplate({
		path: 'template/searching.html',
		appendTo: 'div.indexOptions',
		context: this,
		callback: this.searchDevice_load
	});
};

SignInUp.prototype.searchDevice_load = function () {
	var self = this;

	app.pageSwitch({
		pageOut: 'div.swingWatch',
		pageIn: 'div.searching'
	});


	setTimeout(function(){
		self.findDevice();
	}, 2000);

};

SignInUp.prototype.findDevice = function () {
	var self = this;
	this.bluetooth = new Bluetooth;
	this.bluetooth.init({
		//$debug: $('#deviceDebug'),
		callback: this.findDevice_load,
		context: this
	});

	//Search Timeout
	setTimeout(function(){
		if(!self.callbacked){
			self.bluetooth.stopScan();
			self.findDevice_load();
		}

	}, 5000);
};

SignInUp.prototype.findDevice_load = function () {
	this.callbacked = true;
	this.bluetooth.stopScan();
	var deviceList = this.bluetooth.getConnectedDevice();

	if(deviceList.length > 0){
		app.loadTemplate({
			path: 'template/deviceInfo.html',
			appendTo: 'div.indexOptions',
			context: this,
			callback: this.loadDeviceInfoPage
		});
	}else{
		this.noFindDevice();
	}

};

SignInUp.prototype.loadDeviceInfoPage = function () {
	var self = this;

	app.pageSwitch({
		pageOut: 'div.searching',
		pageIn: 'div.deviceInfo'
	});

	$('input', 'div.deviceInfo').keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if ( (code==13) || (code==10)){
			self.submitDeviceInfo();
		}
	});
};

SignInUp.prototype.submitDeviceInfo = function () {
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.submitKidInfo,
		context: this,
		data: {
			firstName: $('input[name="kidFirstName"]').val(),
			lastName: $('input[name="kidLastName"]').val(),
			nickName: $('input[name="kidNickName"]').val()
		},
		callback: this.submitDeviceInfo_load
	});
};

SignInUp.prototype.submitDeviceInfo_load = function (data) {
	this.signIn_load();
};

SignInUp.prototype.noFindDevice = function () {
	var self = this;

	app.pageSwitch({
		pageOut: 'div.searching',
		pageIn: 'div.noFoundDevice'
	});

	this.$loginAnyway = $('div.loginAnyway');

	this.$loginAnyway.on('click', function(){
		self.signIn_load();
	});
};




SignInUp.prototype.signIn_load = function () {
	window.location = app.setting.dashboard;
	app.tool.hideLoading();
};



new SignInUp();