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
		//serverBase: "http://111.185.13.44:8070/childrenLab",

		home: "pages/home.html",
		nearby: "pages/nearby.html",
		dashboard: "pages/dashboard.html",
		ruleMenu: "loginOption.html",
		tokenName: "x-auth-token",

		api: {
			connectAPI: "/connect/device",
			validateTokenAPI: "/test/token",
			signUp: "/user/register",
			emailRegistered: "/user/isEmailRegistered",
			signIn: "/api/login",
			submitKidInfo: "/kids/add",
			searchSchedule: "/schedule/search",
			scheduleCreateAPI: "/schedule/create",
			retrieveScheduleMessage: "/schedule/retrieveMessage",
			submitScheduleMessage: "/schedule/leaveMessage",
			uploadData: "/device/uploadData",
			uploadRawData: '/device/uploadRawData',
			feedback: "/user/leaveFeedback",
			updateProfile: "/user/updateProfile",
			uploadAvatar: "/avatar/uploadProfileImage",
			retrieveUserProfile: "/user/retrieveUserProfile",
			updateRole: "/user/updateUserRole",
			createEvent: "/calendarEvent/addEvent",
			getCalendarEvent: "/calendarEvent/getEventsByUser"
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

	addMenuBar: function(oArgs){
		oArgs = oArgs || {};

		this.$menu = $("<div class='menu bottom'></div>");
		this.$watch = $("<div class='watchPageIcon icon'></div>");
		this.$calendar = $("<div class='calendarPageIcon icon'></div>");
		this.$dashboard = $("<div class='dashboardPageIcon icon'></div>");
		this.$mail = $("<div class='mailPageIcon icon'></div>");
		this.$profile = $("<div class='profilePageIcon icon'></div>");


		this.$menu.append(this.$watch).append(this.$calendar).append(this.$dashboard).append(this.$mail).append(this.$profile);

		var currentPageClass = $.mobile.activePage.attr('class').split(' ')[0];
		this.$menu.find('div.' + currentPageClass + 'Icon').addClass('active');


		oArgs.appendTo = oArgs.appendTo || 'body';
		$(oArgs.appendTo).append(this.$menu);

		this.attachMenuClickEvent();
	},

	attachMenuClickEvent: function(){
		var self = this;
		var currentPageClass = $.mobile.activePage.attr('class');

		this.$watch.on('click', function(){
			if(currentPageClass.indexOf('watchPage') != -1){
				return;
			}
			window.location = window.rootPath + "pages/watch.html";
		});

		this.$calendar.on('click', function(){
			if(currentPageClass.indexOf('calendarPage') != -1){
				return;
			}
			window.location = window.rootPath + "pages/calendar.html";
		});

		this.$dashboard.on('click', function(){
			if(currentPageClass.indexOf('dashboardPage') != -1){
				return;
			}
			window.location = window.rootPath + "pages/dashboard.html";
		});

		this.$mail.on('click', function(){

		});

		this.$profile.on('click', function(){
			if(currentPageClass.indexOf('updateProfilePage') != -1){
				return;
			}
			window.location = window.rootPath + "pages/updateProfile.html";
		});

	},

	addHeaderBar: function(oArgs) {
		oArgs = oArgs || {};

		var $header = $("<div class='headerBar' id='headerBar'>" + oArgs.title + "</div>");

		if(oArgs.backButton){
			var $backButton = $('<div class="backButton ' + oArgs.backButton.name + '"> <div> < </div> </div>');

			$header.append($backButton);
		}

		if(oArgs.addButton){

			var $addButton = $('<div class="addButton ' + oArgs.addButton.name + '"> <div class="line"></div> <div class="pipe"></div> </div>').on('click', function(){
				oArgs.addButton.callback.call(oArgs.context);
			});

			$header.append($addButton);
		}

		$('body > div').prepend($header);
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

		$options.on('click', 'div.Setting', function(){
			if(currentPageClass.indexOf('settingPage') != -1){
				$menuPanel.panel("close");
				return;
			}
			window.location =  window.rootPath + "pages/setting.html";
		});

	},

	loadTemplate: function(oArgs){
		oArgs = oArgs || {};

		//Path = 'pages/mainMenu.html'
		$.get(window.rootPath + oArgs.path).success(function(html) {
			var $html = $(html);
			if(oArgs.cleanPage){
				$(oArgs.appendTo).empty().html($html).trigger('create');
			}else{
				$(oArgs.appendTo).append($html).trigger('create');
			}


			oArgs.context = oArgs.context || this;
			oArgs.callback.call(oArgs.context, oArgs.data);
		});
	},

	pageSwitch: function(oArgs){
		oArgs = oArgs || {};

		$(oArgs.pageOut).animate({
			left: '-150%'
		});
		$(oArgs.pageIn).animate({
			left: '0'
		});


	},


	animateBackground: function(oArgs){
		var self = this;

		oArgs = oArgs || {};
		if(oArgs.background){
			var backgroundDev = $(oArgs.background);
			backgroundDev.transition({
				'backgroundPosition-x': ((backgroundDev.css('backgroundPosition-x') ? parseInt(backgroundDev.css('backgroundPosition-x').replace('px', '')) : 0) - 2000) + 'px'
			}, 350000, 'linear', function(){
				self.animateBackground(oArgs)
			});
		}
	}

};

app.initialize();
