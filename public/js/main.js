var msgsContainer = jQ('.messages-content'),
	userInputField = jQ('#userInputText');

function get_browser() {
	var ua = navigator.userAgent,
		tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return {
			name: 'IE',
			version: (tem[1] || '')
		};
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\bOPR|Edge\/(\d+)/)
		if (tem != null) {
			return {
				name: 'Opera',
				version: tem[1]
			};
		}
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) {
		M.splice(1, 1, tem[1]);
	}
	return {
		name: M[0],
		version: M[1]
	};
}

function updateScrollbar() {
	msgsContainer.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
		scrollInertia: 10,
		timeout: 0
	});
}

function playSound(filename) {
	jQ('<audio autoplay="autoplay"><source src="/public/' + filename + '.mp3" type="audio/mpeg" /><source src="/public/' + filename + '.ogg" type="audio/ogg" /><embed hidden="true" autostart="true" loop="false" src="/public/' + filename + '.mp3" /></audio>').appendTo(jQ('#sound'));
}

function setTimeStamp(customTimeStamp) {
	if (jQ.trim(customTimeStamp) === '') {
		jQ('<div class="timestamp">' + formatAMPM(new Date()) + '</div>').appendTo(jQ('.message:last'));
		return false;
	}
	jQ('<div class="timestamp">' + customTimeStamp + '</div>').appendTo(jQ('.message:last'));
}

function setTyping() {
	var correctElement = msgsContainer.find('.mCSB_container');
	if (!correctElement.length) {
		console.log('No element found with .mCSB_container');
		return false;
	}
	jQ('<div class="message loading new"><figure class="avatar"><img src="/public/icon.png" /></figure><span></span></div>').appendTo(correctElement);
	jQ('<div class="timestamp">Typing...</div>').appendTo(jQ('.message:last'));
	updateScrollbar();
}

function disableUserInput(placeholderText) {
	placeholderText = placeholderText || "Please Wait..."; //Default text
	userInputField.blur(); //Remove the focus from the user input field
	userInputField.val(''); //Remove the text from the user input field
	userInputField.attr("disabled", "true"); //Disable the user input field
	userInputField.attr("placeholder", placeholderText); //Change the placeholder to ask the user to wait
	jQ('.message-box').addClass('disabledCursor');
	jQ('.message-submit').attr("disabled", "true");
	// console.log("disabled user input");
}

function enableUserInput(placeholderText) {
	placeholderText = placeholderText || "Please Type!"; //Default text
	userInputField.focus(); //Remove the focus from the user input field
	userInputField.removeAttr("disabled"); //Enable the user input field
	userInputField.attr("placeholder", placeholderText); //Change the placeholder to prompt input from the user
	jQ('.message-box').removeClass('disabledCursor');
	jQ('.message-submit').removeAttr("disabled");
	// console.log("enabled user input");
}

function insertUserMessage(msg) {
	if (jQ.trim(msg) === '') {
		console.log("The msg parameter was empty or null");
		return false;
	}
	var correctElement = msgsContainer.find(".mCSB_container");
	if (!correctElement.length) {
		console.log("No element found with .mCSB_container");
		return false;
	}
	jQ('<div class="message new message-personal">' + msg + '</div>').appendTo(correctElement);
	setTimeStamp();
	jQ('.message-input').val('');
	jQ('.message.loading').remove();
	jQ('.message.timestamp').remove();
	updateScrollbar();
}

function displayBotMessage(botMessage, timeout, choices) {
	if (jQ.trim(botMessage) === '') {
		return false;
	}
	var correctElement = msgsContainer.find(".mCSB_container");
	if (!correctElement.length) {
		return false;
	}
	if (timeout) {
		setTimeout(function () {
			setTyping();
		}, timeout / 2);
		setTimeout(function () {
			jQ('<div class="message new"><figure class="avatar"><img src="/public/icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement);
			setTimeStamp();
			jQ('.message.loading').remove();
			jQ('.message.timestamp').remove();
			updateScrollbar();
			playSound('bing');
		}, timeout);
	} else {
		jQ('<div class="message new"><figure class="avatar"><img src="/public/icon.png" /></figure>' + botMessage + '</div>').appendTo(correctElement);
		setTimeStamp();
		playSound('bing');
	}

	//if the choices exists and has atleast 2 choices
	if (choices !== undefined && choices.length > 1) {
		var choicesBotMessage = '<div class="chatBtnHolder new">';
		for (var i = 0; i < choices.length; i++) {
			// choicesBotMessage += '<button class="chatBtn" onclick="choiceClick(\'' + choices[i].replace(/'/g, "\\'") + '\')" value="' + choices[i] + '">' + choices[i] + '</button>';
			choicesBotMessage += '<button class="chatBtn" onclick="choiceClick(\'' + i + '\')" value="' + choices[i] + '">' + choices[i] + '</button>';
		}
		choicesBotMessage += '</div>';
		if (timeout) {
			setTimeout(function () {
				jQ(choicesBotMessage).appendTo(correctElement);
				playSound('bing');
				jQ('.message.loading').remove();
				jQ('.message.timestamp').remove();
				updateScrollbar();
			}, timeout);

		} else {
			jQ(choicesBotMessage).appendTo(correctElement);
			playSound('bing');
		}
		// jQ('<div class="timestamp">-- Please select your choice --</div>').appendTo('.chatBtnHolder:last');
		// setTimeStamp('-- Please select your choice --');
	}

	jQ('.message.loading').remove();
	jQ('.message.timestamp').remove();
	updateScrollbar();
}

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

var setTimeoutID;
jQ("#minim-chat").click(function () {
	jQ("#minim-chat").css("display", "none");
	jQ("#maxi-chat").css("display", "block");
	// var height = (j(".chat").outerHeight(true) - 46) * -1;
	// j(".chat").css("margin", "0 0 " + height + "px 0");
	jQ(".chat").css("margin", "0 0 -354px 0");
	setTimeoutID = setTimeout(function () {
		jQ("#animHelpText").css("display", "block");
	}, 1500);
	ga('mini', 'minimize', 'click', 'minimize');
});
jQ("#maxi-chat").click(function () {
	jQ("#minim-chat").css("display", "block");
	jQ("#maxi-chat").css("display", "none");
	jQ(".chat").css("margin", "0");
	jQ("#animHelpText").css("display", "none");
	clearTimeout(setTimeoutID);
	ga('max', 'maximise', 'click', 'maximise');
});

function getRandom(arrayResp) {
	var retResponse;
	if (jQ.isArray(arrayResp)) { //its an array
		retResponse = arrayResp[Math.floor((Math.random() * arrayResp.length))];
	} else { //its not an array
		retResponse = arrayResp;
	}
	return retResponse;
}

function isValidEmail(email) {
	var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
	return re.test(email);
}

function isValidString(str) {
	if (str !== undefined && str !== null && str !== "" && jQ.trim(str) !== "") {
		return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
	} else {
		return false;
	}
}

function isValidNumber(str) {
	return !isNaN(str);
}

function isValidDate(str) {
	userInputField.datepicker("destroy");
	return true;
}

function isValidCarRegNo(carRegNo) {
	if (carRegNo !== undefined && carRegNo !== null && carRegNo !== "" && jQ.trim(carRegNo) !== "") {
		var vehicleNo = carRegNo.split("-");
		if (vehicleNo.length == 4) {
			if (vehicleNo[0].length == 2 && vehicleNo[1].length == 2 && vehicleNo[2].length == 2 && vehicleNo[3].length == 4 &&
				isNaN(vehicleNo[0]) && isNaN(vehicleNo[2]) && !isNaN(vehicleNo[1]) && !isNaN(vehicleNo[3])) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function generateRandomName() {
	var randomGender = Math.floor(Math.random() * 2);
	var males = ["Sathish", "Robert", "Dhanish", "Parker", "Zeeshan", "Vinay", "Rathod", "Vijayan", "Aashish", "Bharath", "Ajith", "Nithin", "Ramesh"];
	var females = ["Aarthi", "Aswathy", "Swathy", "Trisha", "Gayathri", "Nivethitha", "Shruthi", "Yamini", "Preethi", "Dharini", "Sindhuja"];
	var randomName;
	if (randomGender == 1) {
		randomName = "Mr." + males[Math.floor(Math.random() * males.length)];
	} else {
		randomName = ((Math.random() < 0.5) ? "Mrs." : "Ms.") + females[Math.floor(Math.random() * females.length)];
	}
	return randomName;
}

var pos = {};

jQ(document).ready(function () {
	msgsContainer.mCustomScrollbar();
	displayBotMessage("Please Ask your Query!", 2000);
	getLocation();
	console.log('position is: ' + JSON.stringify(pos));
});

var socket = io();
jQ('#generalForm').submit(function () {
	socket.emit('user msg', userInputField.val());
	insertUserMessage(userInputField.val());
	disableUserInput('Please Wait...');
	return false;
});
// socket.on('user msg', function(msg){

// });
socket.on('bot msg', function (msg) {
	displayBotMessage(msg, 2000);
	enableUserInput('Please ask your query');
});

socket.on('get location', function () {
	console.log('going to send position: ' + JSON.stringify(pos));
	socket.emit('send location', pos);
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition);
    } else {
        displayBotMessage("Geolocation is not supported by this browser.", 2000);
    }
}

function getPosition(position) {
    pos.lat = position.coords.latitude;
    pos.long = position.coords.longitude;
	console.log("position: " + JSON.stringify(pos));
}
