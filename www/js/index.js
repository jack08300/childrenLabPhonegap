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
			feedback: "/user/leaveFeedback",
			updateProfile: "/user/updateProfile",
			uploadAvatar: "/avatar/uploadProfileImage",
			retrieveUserProfile: "/user/retrieveUserProfile"
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
		var gapReady = $.Deferred();
		var jqmReady = $.Deferred();
		document.addEventListener('deviceready', function () {
			//self.deviceReady();
			gapReady.resolve();
		}, false);

		$(document).one("mobileinit", function(){
			jqmReady.resolve();
		});

		$.when(gapReady, jqmReady).then(function(){
			app.onDeviceReady();
		});

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
		this.tool = new Tools();
		console.log('Received Event: ' + id);
	},

	validateToken: function () {
		app.tool.showLoading();
		this.tool.ajax({
			url: app.setting.serverBase + app.setting.api.validateTokenAPI,
			type: 'post',
			context: app,
			callback: app.validateToken_load
		});
	},

	validateToken_load: function (data) {
		app.tool.hideLoading();
		if (data.success) {
			window.location = app.setting.ruleMenu;
		} else {
			window.localStorage.removeItem('token');
		}
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
					var profileImage = window.localStorage.getItem("profile");
					if(profileImage){
						$html.find('img').attr('src', 'http://avatar.childrenlab.com/' + profileImage);
					}

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
		var $photo = $menuPanel.find('div.menuHeader');
		var $inputFile = $menuPanel.find('input[type=file]');
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

		$photo.on('click', function(){
			if(currentPageClass.indexOf('updateProfilePage') != -1){
				$menuPanel.panel("close");
				return;
			}
			window.location = window.rootPath + "pages/updateProfile.html";

		});

	}
};

app.initialize();
