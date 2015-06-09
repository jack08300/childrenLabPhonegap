var Tools = function(){};

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
					if(params.url.indexOf("register") == -1 && params.url.indexOf("login") == -1){
						request.setRequestHeader(app.setting.tokenName, window.localStorage.getItem('token'));
					}

        },
        data: params.data,
        success: function(data, status, xhr) {
					if(!params.callback) { return; }

					params.context = params.context || this;
					params.callback.call(params.context,data, params.oArgs || {});
				},
				error: function(data, status, xhr){
					console.error(status);
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
};

Tools.prototype.hideLoading = function(){
	$.mobile.loading('hide');
};