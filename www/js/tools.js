var Tools = function(){};

Tools.prototype.ajax = function(params, oArgs){
    params = params || {};
    oArgs = oArgs || {};
    $.ajax({
        url: params.url,
        type: 'POST',
        crossDomain: true,
        context: params.context,
        beforeSend: function (request)
        {
            request.setRequestHeader(app.setting.tokenName, window.localStorage.getItem('token'));
        },
        data: params.data,
        success: params.callback
    });
};

