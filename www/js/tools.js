var Tools = function(){
	//enable push notification
	//this.pushNotification();
};

Tools.prototype.ajax = function(params, oArgs){
		var self = this;
    params = params || {};
    oArgs = oArgs || {};

    $.ajax({
        url: params.url,
        type: 'POST',
        crossDomain: true,
        context: params.context,
        beforeSend: function (request)
        {
					if(params.noToken){ return; }
					if(params.url.indexOf("isEmailRegistered") == -1 && params.url.indexOf("register") == -1 && params.url.indexOf("login") == -1){
						request.setRequestHeader(app.setting.tokenName, window.localStorage.getItem('token'));
					}

        },
        data: params.data,
        success: function(data, status, xhr) {
					if(params.url.indexOf("login") != -1){
						window.localStorage.setItem("token", data.access_token);
						window.localStorage.setItem("email", data.email);
					}
					if(!params.callback) { return; }

					params.context = params.context || this;
					params.callback.call(params.context,data, params.oArgs || {});
				},
				error: function(data, status, xhr){
					console.error(status);
					console.error(data);
					console.error(xhr);
					self.hideLoading();
				},
				statusCode: {
					403: function(){
						self.cleanAuthToken();
						app.notification("Error", "Please check your email and password", null);
						window.location = window.rootPath + "index.html";
						self.hideLoading();
					}
				}
    });
};

Tools.prototype.cleanAuthToken = function(oArgs){
	oArgs = oArgs || {};
	window.localStorage.removeItem("token");
	if(oArgs.cleanEmail){
		window.localStorage.removeItem("email");
	}

};

Tools.prototype.showLoading = function(oArgs){
	oArgs = oArgs || {};

	$.mobile.loading( 'show', {
		text: oArgs.text || 'Loading...',
		textVisible: true,
		theme: 'a',
		html: ""
	});

	if(!oArgs.noHideKeyboard){
		this.hideKeyboard();
	}
};

Tools.prototype.pushNotification = function(){

	var push = PushNotification.init({
		"ios": {
			"sound": true,
			"vibration": true,
			"badge": true
		}
	});

	PushNotification.hasPermission(function(data) {
		if (data.isEnabled) {
			console.log("Push notification is enabled");
		}
	});

	push.on('registration', function(data) {
		console.log(data.registrationId);
	});

	push.on('notification', function(data) {
		app.notification(data.title, data.message);

		push.finish(function() {
			console.log("processing of push data is finished");
		});
	});

	push.on('error', function(e) {
		console.log(e.message);
	});
};

Tools.prototype.hideLoading = function(){
	$.mobile.loading('hide');
};

Tools.prototype.validateEmail = function (email) {
	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	return re.test(email);
};

Tools.prototype.validatePassword = function (password) {
	return password.length > 5;
};

Tools.prototype.updateProfileImage = function () {
	var profile = window.localStorage.getItem("profile");
	$('div.profileImage').find('img').attr('src', 'http://avatar.childrenlab.com/' + profile + '?v=1');
};

Tools.prototype.hideKeyboard = function () {
	document.activeElement.blur();
	var inputs = document.querySelectorAll('input');
	for(var i=0; i < inputs.length; i++) {
		inputs[i].blur();
	}
};

Tools.prototype.center = function (page) {
	$(document).on('pageshow', page, function(e,data){
		$('#index-content').css('margin-top',($(window).height() - $('[data-role=header]').height() - $('[data-role=footer]').height() - $('#index-content').outerHeight())/2);
	});
};