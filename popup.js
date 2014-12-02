var sets, optsWin;	
var smsLeft, pNo = "", msg = "";
   
   
$(function() {
	$("#saveBtn").bind("click", saveSet);		  
	$("#sendBtn").bind("click", sendSms);	  
	$("#logout").bind("click", logoff);
	$("#phone").bind("keyup", checkPNo);
	$("#message").bind("keyup", checkSMS);
	$(".login").bind("click", showLogin);

	initSetWin();   
	init();
	$("span[rel]").overlay();

});

function init(){
	loadSet();
	login();
}

function initSetWin(){
	optsWin = $("span[rel]").overlay({
		onBeforeLoad:  function() {	
			if(sets){
				$("#user").val(sets.user);
				$("#passwd").val(sets.passwd);
			}
			$("#overlay").show();
		},
		onClose: function(){
			$("#overlay").hide();
		},
		top: '5px',
		left: '15px',
	});
}

function loadSet(){
	if(localStorage.hasOwnProperty('MFunSet')){
		var jsonOpts = localStorage['MFunSet'];
		sets = JSON.parse(jsonOpts);
	} 
}

function showLogin() {
	$(".simple_overlay").css({
		'display': 'table-cell'
	});
	$("#overlay").show();
}

function login(){
	if(sets){
		var loginUrl ="http://www.magtifun.ge/index.php?page=11&lang=ge";
		var logData = {};
		logData.act = 1;
		logData.user = sets.user;
		logData.password = sets.passwd;		
		req(logData, loginUrl, beforeLogin, succLogin, failFn);	   
	} else {
		$("#login").show();
	}
	
}

function logoff(){
	var offData = {act:2};
	var loginUrl ="http://www.magtifun.ge/index.php?page=11&lang=ge";

	req(offData, loginUrl, beforeLogin, succOff, failFn);
}

function succLogin(data, textStatus, xhr){	
	if(textStatus == 'success'){
		var html = $.parseHTML(data);
		var curElm;
		$.each(html, function(id, elm){	
			var aElm = $(elm).find(".main_div");
			if(aElm[0]){
				curElm = aElm;
			}
		});
		var curUser = $(curElm).find("p.center_text.dark.english").text();
		if(curUser){
			log("Login success!");
			$("#curUser").text(curUser);
			var curSMS = $(curElm).find("span.xxlarge.dark.english").text();
			smsLeft = parseInt(curSMS);
			$("#smsNo").text("დარჩენილია: "+smsLeft);
			$("#login").hide();
			$("#loader").hide();
			$("#logout").show();
		} else {
			log("Error in login!");
			$("#curUser").text("Wrong User/Password!");
			$("#loader").hide();
			$("#logout").hide();
			$("#login").show();
		}
		
	}
	
}

function succOff(data, textStatus, xhr){	
	if(textStatus == 'success'){
		log("Success Logoff!");		
		$("#curUser").html("&nbsp;");
		$("#smsNo").text("");
		$("#loader").hide();
		$("#logout").hide();
		$("#login").show();
		localStorage.removeItem("MFunSet");
	}
	
}

function saveSet(){	
	var csets = {};
	csets.user = $("#user").val();
	csets.passwd = $("#passwd").val();
	saveToLocalStorage("MFunSet", JSON.stringify(csets));
	//optsWin.eq(0).overlay().close();
	$(".simple_overlay").hide();
	$("#overlay").hide();
	$("#user").val('');
	$("#passwd").val('');
	init();
}


function checkPNo(e){
	//console.log(e.which);
	if (e.which == 107 || e.which == 187 || (48 <= e.which && e.which <= 57)){
		//console.log(e.which);
	}
	
	pNo = $("#phone").val();
	$("#phone").removeClass("wrongPhone");
	checkSMSBtn();
}

function is_numeric (input) {
	return (input - 0) == input && input.length > 0;
}

function checkSMS(){
	msg = $("#message").val();
	log(msg.length+"/146");
	checkSMSBtn();
}

function checkSMSBtn(){
	if((pNo.length > 4) && (msg.length>0)){
		$("#sendBtn").removeClass("disBtn");
		$("#sendBtn").addClass("redBtn");
		$("#sendBtn").removeAttr('disabled');
	} else {
		$("#sendBtn").removeClass("redBtn");
		$("#sendBtn").addClass("disBtn");
		$("#sendBtn").attr('disabled','disabled');
		
	}
}



function sendSms(){
	var smsData = {
		'recipients': pNo,
		'message_body': msg
	};
	var smsUrl = "http://www.magtifun.ge/scripts/sms_send.php";
	req(smsData, smsUrl, beforeSMS, succSMS, failFn);
	
}

function beforeSMS(){
		log("Sending...");
		$("#sendBtn").removeClass("redBtn");
		$("#sendBtn").addClass("disBtn");
		$("#sendBtn").attr('disabled','disabled');
		
}

function succSMS(data, textStatus, xhr){	
	if(textStatus == 'success'){	
		console.log(data);
		if(data == 'success'){
			log("SMS Sent!");
			smsLeft --;
			msg = $("#message").val("");
			$("#smsNo").text("დარჩენილია: "+smsLeft);
		} else if(data == 'incorrect_mobile'){
			log("Incorrect Mobile number!");
			$("#phone").addClass("wrongPhone");
		
		}else {
			log("SMS NOT Sent!");
		}
		
		
	
	}

}

function req(cData, cUrl, cBefore, succ, fail){
	console.log("send");
	log("Conecting...");
	$.ajax({
		type: 'POST',
		data: cData,
		url: cUrl,
		timeout: 20000,
		beforeSend: cBefore,
		success: succ,
		error: fail
	});
}

function beforeLogin(){
		$("#login").hide();
		$("#logout").hide();		
		$("#loader").show();
}

function failFn(XMLHttpRequest, status, errorRsn){
	$("#loader").hide();
	$("#logout").hide();
	$("#login").show();
	var err = "Error: " + status +" - " + errorRsn; 
	if (XMLHttpRequest.responseText == "") err = "Unknown failFn() error.";
	console.error("Fail ajax request \"" + status + "\": " + err); 	
	log("Fail ajax request \"" + status + "\": " + err); 	
}	

function saveToLocalStorage(key, data) {
	try {
		if(localStorage.hasOwnProperty(key)) localStorage.removeItem(key);
		localStorage[key] = data;
	} catch(e) { 
		console.error("Local storage update failed for \"" + key + "\": " + e); 
	}
}

function log(text){
	$("#log").text(text);
}