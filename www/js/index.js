/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {

	setting: {
		serverBase: "http://www.childrenLab.com",

		mainMenu: "pages/mainMenu.html",
		ruleMenu: "loginOption.html",
		tokenName: "x-auth-token",

		api: {
			connectAPI: "/connect/device",
			validateTokenAPI: "/test/token",
			signInAPI: "/api/login",
			scheduleCreateAPI: "/schedule/create"
		}
	},

	// Application Constructor
	initialize: function () {
		this.bindEvents();

	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function () {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function () {
		app.receivedEvent('deviceready');

	},
	// Update DOM on a Received Event
	receivedEvent: function (id) {
		app.tool = new Tools();
		app.$email = $('input[name="email"]');
		app.$password = $('input[name="password"]');
		app.$errorMessage = $('div.errorMessage');

		var token = window.localStorage.getItem('token');

		if (token && token != "") {
			app.validateToken();
		}

		if (window.localStorage.getItem('email')) {
			app.$email.val(window.localStorage.getItem('email'));
		}

		$('.signUpText').on('click', function () {
			window.location = "signUp.html";
		});

		$('div.signInButton').on('click', this.signInForm);

		$(document).ajaxError(function (e, el) {
			if (el.status == 403) {
				app.$errorMessage.text("Please check your email and password");
				window.localStorage.removeItem('token');
			}

		});

		if (token) {
			app.tool.ajax({
				url: app.setting.serverBase + app.setting.api.connectAPI,
				context: app,
				data: {
					model: device.model,
					cordova: device.cordova,
					platform: device.platform,
					uuid: device.uuid,
					version: device.version
				}
			});
		}


		console.log('Received Event: ' + id);
	},

	signInForm: function () {
		app.$errorMessage.text("");
		console.log('sign in');

		var email = app.$email.val();
		var password = app.$password.val();

		if (!app.validateEmail(email)) {
			app.$errorMessage.text("Please check your email format.");
			return;
		}

		if (!app.validatePassword(password)) {
			app.$errorMessage.text("Password length must be more than 5..");
			return;
		}

		app.signIn({
			email: email,
			password: password
		});

		console.log('email ' + email + " password: " + password);
	},

	signIn: function (params) {
		params = params || {};

		this.tool.ajax({
			url: app.setting.serverBase + app.setting.api.signInAPI,
			context: app,
			data: {
				email: params.email,
				password: params.password
			},
			callback: app.signIn_load
		});

	},

	signIn_load: function (data) {
		console.log(data);
		data = data || {};

		if (data.access_token) {
			window.localStorage.setItem("token", data.access_token);
			window.localStorage.setItem("email", data.username);

			window.location = app.setting.ruleMenu;
		} else {
			window.location = "index.html";
			app.receivedEvent('deviceready');
		}

	},

	validateToken: function () {
		this.tool.ajax({
			url: app.setting.serverBase + app.setting.api.validateTokenAPI,
			type: 'post',
			context: app,
			callback: app.validateToken_load
		});
	},

	validateToken_load: function (data) {
		if (data.success) {
			window.location = app.setting.ruleMenu;
		} else {
			window.localStorage.removeItem('token');
		}
	},

	validateEmail: function (email) {
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(email);
	},

	validatePassword: function (password) {
		console.error(password);
		return password.length > 5;
	},

	notification: function (title, message, callback, button) {
		if (navigator.notification) {
			navigator.notification.alert(
				message,
				callback || null,
				title,
				button || "OK"
			);
		}
	},

	addTopNavigater: function (oArgs) {
		oArgs = oArgs || {};
		this.$navigater = $('<div class="navigater"></div>');

		if (oArgs.left) {
			this.$navigater.append('<div class="left"><</div>');
		}

		if (oArgs.right) {
			this.$navigater.append('<div class="right">></div>');
		}

		this.$navigater.on('click', 'div.left', function () {
			console.log("You got left");
			history.go(-1);
		});

		$('body').prepend(this.$navigater);
	}
};

app.initialize();
