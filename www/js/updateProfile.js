/**
 * Created by yen-chieh on 6/10/15.
 */
var gapReady = $.Deferred();
var jqmReady = $.Deferred();

var UpdateProfile = function () {
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

UpdateProfile.prototype.init = function () {

	this.$email = $('input[name="email"]');
	this.$firstName = $('input[name="firstName"]');
	this.$lastName = $('input[name="lastName"]');
	this.$phoneNumber = $('input[name="phoneNumber"]');
	this.$gender = $('input[name="sex"]');
	this.$errorMessage = $('div.errorMessage');
	this.$button = $('div.updateButton');
	this.$profileImage = $('div.profileImage');

	//Cropping tool
	this.$cropPanel = $('#cropPanel');
	this.$cropButton = $('div.cropButton');
	this.crop = new CROP();

	var profileImage = window.localStorage.getItem("profile");
	if(profileImage){
		this.$profileImage.find('img').attr('src', 'http://avatar.childrenlab.com/' + profileImage);
	}

/*	app.addHeader({
		mainMenu: true,
		appendTo: "div.updateProfilePage"
	});*/

	app.addHeaderBar({title: 'Profile'});

	app.addMenuBar();

	this.retrieveUserProfile();
};

UpdateProfile.prototype.retrieveUserProfile = function () {
	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.retrieveUserProfile,
		context: this,
		data: {},
		callback: this.retrieveUserProfile_load
	});

};

UpdateProfile.prototype.retrieveUserProfile_load = function (data) {
	if(data.success){
		this.$email.val(data.user.email);
		this.$firstName.val(data.user.firstName);
		this.$lastName.val(data.user.lastName);
		this.$phoneNumber.val(data.user.phoneNumber);
		this.$gender.each(function(){
			if($(this).val() == data.user.sex){
				$(this).prop("checked", true);
			}
		});

		this.attachEvent();
	}else{
		app.notification("Error", "Error on getting your information from server.");
	}
};

UpdateProfile.prototype.attachEvent = function () {
	var self = this;
	this.$button.on('click', function () {
		self.submitForm();
	});

	this.$profileImage.on('click', function(){
		//window.location = "croppingImage.html";
		self.fileSelector();
	});

	this.$cropButton.on('click', function(){
		self.cropImage();
	});

	this.$cropPanel.on('gesturechange', function(e){
		if(e.originalEvent.scale < 1.0){
			self.crop.zoom(parseFloat(self.crop.getZoomValue()) - 0.01);

		}

		if(e.originalEvent.scale > 1.0){
			self.crop.zoom(parseFloat(self.crop.getZoomValue()) + 0.01);
		}

	});

};

UpdateProfile.prototype.submitForm = function () {
	this.$errorMessage.text("");

	if (!app.tool.validateEmail(this.$email.val())) {
		this.$errorMessage.text("Please check your email format.");
		return;
	}

	if (!this.$firstName.val() || !this.$lastName.val()) {
		this.$errorMessage.text("Please check your name.");
		return;
	}

	if (this.$gender.find(':checked').val()) {
		this.$errorMessage.text("Please select your gender.");
		return;
	}

	if (this.$phoneNumber.val().length < 5) {
		this.$errorMessage.text("Please enter your phone number.");
		return;
	}

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.updateProfile,
		context: this,
		data: {
			email: this.$email.val(),
			firstName: this.$firstName.val(),
			lastName: this.$lastName.val(),
			phoneNumber: this.$phoneNumber.val()
		},
		callback: this.submitForm_load
	});
};

UpdateProfile.prototype.submitForm_load = function (data) {

	if (data.success) {
		app.notification("Success", "Success update");
	} else {
		this.$errorMessage.text(data.message);
	}

};

UpdateProfile.prototype.fileSelector = function () {
	var self = this;

	var options = {
		maximumImagesCount: 1,
		quality: 100
	};

	window.imagePicker.getPictures(
		function (results) {
			app.tool.showLoading();
			window.resolveLocalFileSystemURL(results[0], function(evt){self.gotFile(evt)}, self.fail);


		}, function (error) {
			alert("Error Occurred " + error);
		},
		options
	);
};

UpdateProfile.prototype.fail = function(error){
	console.error(error);
};


UpdateProfile.prototype.gotFile = function(fileEntry){
	var self = this;
	fileEntry.file(function(file){

		var reader = new FileReader();
		reader.onloadend = function(evt) {
			//$('img.loadImage').attr("src", evt.target.result);
			$('.previewImage').html("");

			self.crop.init({
				container: 'div.previewImage',
				image: evt.target.result,
				width: 250,
				height: 250,
				mask: true,
				zoom: {
					steps: 0.01,
					min: 1.02,
					max: 5
				}
			});

			self.$cropPanel.panel( "open" );
			app.tool.hideLoading();
		};
		reader.readAsDataURL(file);
	});

};

UpdateProfile.prototype.cropImage = function(){
	app.tool.showLoading();
	var croppedImage = this.crop.data(300, 300, 'png');
	this.uploadImage(croppedImage);
};

UpdateProfile.prototype.uploadImage = function(imageObject){

	app.tool.ajax({
		url: app.setting.serverBase + app.setting.api.uploadAvatar,
		context: this,
		dataType: 'json',
		data: {
			encodedImage: imageObject.image,
			width: imageObject.width,
			height: imageObject.height
		},
		callback: this.uploadImage_load
	});
};

UpdateProfile.prototype.uploadImage_load = function(result){
	if(result.success){
		window.localStorage.setItem("profile", result.profileImage);
		app.tool.updateProfileImage();
		this.$cropPanel.panel( "close" );
		app.tool.hideLoading();
		app.notification("Success", "Success update your profile photo.");

	}
};


new UpdateProfile();