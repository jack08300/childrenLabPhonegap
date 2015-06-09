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

		home: "pages/home.html",
		nearby: "pages/nearby.html",
		ruleMenu: "loginOption.html",
		tokenName: "x-auth-token",

		api: {
			connectAPI: "/connect/device",
			validateTokenAPI: "/test/token",
			signUp: "/user/register",
			signIn: "/api/login",
			searchSchedule: "/schedule/search",
			scheduleCreateAPI: "/schedule/create",
			retrieveScheduleMessage: "/schedule/retrieveMessage",
			submitScheduleMessage: "/schedule/leaveMessage",
			uploadData: "/device/uploadData",
			feedback: "/user/leaveFeedback"
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
		var path = $.mobile.activePage[0].baseURI;
		window.rootPath = path.substring(0, path.indexOf("www") + 4);

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
			window.location = window.rootPath + "signUp.html";
		});

		$('div.signInButton').on('click', this.signInForm);


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
			url: app.setting.serverBase + app.setting.api.signIn,
			context: app,
			data: {
				email: params.email,
				password: params.password
			},
			callback: app.signIn_load
		});

	},

	signIn_load: function (data) {
		data = data || {};

		if (data.access_token) {
			window.localStorage.setItem("token", data.access_token);
			window.localStorage.setItem("email", data.username);

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
	},

	addHeader: function (oArgs) {
		oArgs = oArgs || {};
		var self = this;


		var $backButton;
		if(oArgs.backButton){
			$backButton = $('<div class="previousPage"><div class="backButton"><div class="arrowLeft"><div class="block"></div></div></div></div>');
			$backButton.on('click', 'div.backButton', function () {
				history.go(-1);
			});
			$(oArgs.appendTo).prepend($backButton);
		}



		if(!oArgs.noHeader){
			this.$navigater = $('<div class="header" data-role="header" data-theme="none" role="header"></div>');

			if(oArgs.mainMenu){
				this.$mainMenuButton = $('<div class="mainMenuButton"><div class="whiteLine"></div><div class="whiteLine"></div><div class="whiteLine"></div></div>');
				this.$navigater.append(this.$mainMenuButton);

				$.get(window.rootPath + 'pages/mainMenu.html').success(function(html) {
					var $html = $(html);
					$(oArgs.appendTo).append($html).trigger('create');
					app.attachMenuEvent($('#menuPanel'));
				});

				this.$navigater.on('click', 'div.mainMenuButton', function () {
					var $menu = $("#menuPanel");
					$menu.find('div.name').html(window.localStorage.getItem("email"));
					$menu.panel("open");
				});
			}
			$(oArgs.appendTo).prepend(this.$navigater);
		}

	},

	attachMenuEvent: function($menuPanel) {
		var self = this;
		var $options = $menuPanel.find('div.options');
		var currentPageClass = $.mobile.activePage.attr('class');

		$options.on('click', 'div.Home', function(){
			if(currentPageClass.indexOf('homePage') != -1){
				$menuPanel.panel("close");
				return;
			}
			window.location = window.rootPath + "pages/home.html";
		});

		$options.on('click', 'div.Nearby', function(){
			if(currentPageClass.indexOf('nearbyPage') != -1){
				$menuPanel.panel("close");
				return;
			}
			window.location = window.rootPath + "pages/nearby.html";
		});

		$options.on('click', 'div.Feedback', function(){
			if(currentPageClass.indexOf('feedbackPage') != -1){
				$menuPanel.panel("close");
				return;
			}
			window.location = window.rootPath + "pages/feedback.html";
		});

		$options.on('click', 'div.Logout', function(){
			app.tool.cleanAuthToken();

			window.location =  window.rootPath + "index.html";
		});

	}
};

app.initialize();
