/**
 * Created by yen-chieh on 6/10/15.
 */
var gapReady = $.Deferred();
var jqmReady = $.Deferred();

var CroppingImage = function () {
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

CroppingImage.prototype.init = function () {
	this.imageFile = window.localStorage.getItem('cropImage');
	this.cropButton = $('div.cropButton');
	this.cropped = $('img.cropped');
	this.originalImage = $('img.loadImage');
	this.crop = new CROP();

	this.attachEvent();
	app.addHeader({
		mainMenu: true,
		appendTo: "croppingImagePage"
	});

	this.fileSelector();
};



CroppingImage.prototype.attachEvent = function () {
	var self = this;

	this.cropButton.on('click', function(){
		self.cropImage();
	});
};

CroppingImage.prototype.cropImage = function(){
	var croppedImage = this.crop.data(600, 600, 'png');
	this.uploadImage(croppedImage);
};


CroppingImage.prototype.fileSelector = function () {
	var self = this;

	var options = {
		maximumImagesCount: 1,
		quality: 100
	};

	window.imagePicker.getPictures(
		function (results) {
			console.error(results[0]);
			window.resolveLocalFileSystemURL(results[0], function(evt){self.gotFile(evt)}, self.fail);


		}, function (error) {
			alert("Error Occurred " + error);
		},
		options
	);
};

CroppingImage.prototype.fail = function(error){
	console.error(error);
};


CroppingImage.prototype.gotFile = function(fileEntry){
	var self = this;
	fileEntry.file(function(file){

		var reader = new FileReader();
		reader.onloadend = function(evt) {
			//$('img.loadImage').attr("src", evt.target.result);


			self.crop.init({
				container: '.previewImage',
				image: evt.target.result,
				width: 600,
				height: 600,
				mask: true,
				zoom: {
					steps: 0.01,
					min: 1,
					max: 5
				}
			});

			$('div.zoom').on('click', function () {
				console.error("this");
				self.crop.zoom(2.5);
			});


		};
		reader.readAsDataURL(file);
	});

};

CroppingImage.prototype.uploadImage = function(imageObject){

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

CroppingImage.prototype.uploadImage_load = function(result){
	console.error(result);
};

new CroppingImage();