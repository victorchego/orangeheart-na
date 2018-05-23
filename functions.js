var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SPREADSHEET_ID = '19HMhClbxcCvSDSa_rSArND2KWOPli8fEsRcoIUEPOQY';

var ROUTE_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy route 9 Nanao`";
var SEASON_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy season 1`\n`!Cy season 1 2`\n`!Cy season days 1 2`\n`!Cy season days 1 2 tickets 30`";
var CHECKPOINT_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy checkpoint 1`\n`!Cy checkpoint 1 2`\n`!Cy checkpoint tool 2 3`\n`!Cy checkpoint soul 2 4`";
var FINISH_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy finishontime args` (arguments: tickets, hearts, niney, hours left, total parts, parts completed, total soul, current soul, class default = D3)";
var COOKIE_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy cc 20000`\n`!Cy cc 20000 10000` (arguments: cookie goal, current cookies, niney, hearts, tickets, days, class default = D3)";
var TIME_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy timer flag(s)` (flags: cc - cookie collection, sale, oo - opening offer, seb - super early bird, " +
								"eb - early bird, potluck, giveaway, 2x, 3x, gacha, nf, fm";
var SOUL_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy soul` (arguments: soul goal, current soul, class rank default = D3, [OPT] total parts, [OPT] completed parts)";

/*
 spreadsheetId: 19HMhClbxcCvSDSa_rSArND2KWOPli8fEsRcoIUEPOQY
 */
 
 function routeAnswer(auth, args, msg) {
	var result = '';
	var sheets = google.sheets('v4');
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Route',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
	// here is the function
	if (args.length!=0) {
		var rows = response.values;
		for (var col = 1; col < rows[0].length; col++) {
			if (rows[0][col].toLowerCase()!=args[0].toLowerCase()) continue;
			if (rows[1][col].toLowerCase()!=args[1].toLowerCase()) continue;
			for (var answer = 2; answer < rows.length; answer++) {
				result += "\n"+rows[answer][col];
			}
			result = '```'+result+'```';
			break;
		}
	}
	if (result=='') result = ROUTE_ERR;
	msg.author.send(result);
	// end of function
	});
 };
 
 function seasonTotal(auth, seasons, msg) {
	var result = '';
	var sheets = google.sheets('v4');
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Season!B1:C',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
	// here is the function
	var rows = response.values;
	for (var i = 0; i < seasons.length; i++) {
		for (var row = 0; row < rows.length; row = row + 19) { // 19 is the rows between each season
			if (rows[row][0]==seasons[i]) {
				result += "\nSeason "+seasons[i]+" total parts: {"+rows[row+14][0]+": "+rows[row+14][1]+", "+rows[row+15][0]+": "+rows[row+15][1]+", "+rows[row+16][0]+": "+rows[row+16][1]+"}";
				break;
			}
		}
	}
	if (result == '') result = SEASON_ERR;
	msg.channel.send(result);
	// end of function
	});
 }
 
 function seasonDays(auth, seasons, msg) {
	var result = '';
	var sheets = google.sheets('v4');
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Season!B1:D',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
	// here is the function
	var rows = response.values;
	if (seasons[seasons.length-2]=='tickets') result += "With "+seasons[seasons.length-1]+" story tickets,";
	for (var i = 0; i < seasons.length; i++) {
		if (result[0]!='W') {
			for (var row = 0; row < rows.length; row = row + 19) { // 19 is the rows between each season
				if (rows[row][0]==seasons[i]) {
					result += "\nSeason "+seasons[i]+" will take "+rows[row+14][2]+" days with free tickets.";
					break;
				}
			}
		}
		else {
			if (seasons[i]=='tickets') break;
			for (var row = 0; row < rows.length; row = row + 19) { // 19 is the rows between each season
				if (rows[row][0]==seasons[i]) {
					var days = (rows[row+14][1]-seasons[seasons.length-1])/6;
					days = days < 0 ? 0 : days;
					result += "\nSeason "+seasons[i]+" will take "+days+" days.";
					break;
				}
			}
		}
	}
	if (result == '') result = SEASON_ERR;
	msg.channel.send(result);
	// end of function
	});
 }
 
 function checkpointList(auth, args, msg) {
	var result = '';
	var mode = null;
	var sheets = google.sheets('v4');
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Checkpoints',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
	// here is the function
	var rows = response.values;
	if (args[0] == 'tool' || args[0] == 'soul') {
		mode = args[0];
		args.splice(0,1);
	}
	for (var i = 0; i < args.length; i++) {
		for (var row = 0; row < rows.length; row++) {
			if (args[i]==rows[row][0]) {
				result += toolOrSoul(rows[row], mode);
			}
		}
	}
	if (result == '') result = CHECKPOINT_ERR;
	msg.channel.send(result);
	// end of function
	});
 }
 
 function finishOnTime(auth, args, msg) {
	var result = '';
	var tickets = args[0] == undefined ? 0: args[0];
	var hearts = args[1] == undefined ? 0: args[1];
	var niney = args[2] == undefined ? 0: args[2];
	var hoursLeft = args[3] == undefined ? 0: args[3]; 
	var totalParts = args[4] == undefined ? 0: args[4];
	var partsComplete = args[5] == undefined ? 0: args[5];
	var totalSoul = args[6] == undefined ? 0: args[6];
	var currentSoul = args[7] == undefined ? 0: args[7];
	var rank = args[8] == undefined ? "D3": args[8];
	var sheets = google.sheets('v4');
	// update and write
	sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Season Calculator!B1:B9',
	valueInputOption: "USER_ENTERED",
	resource: {
		majorDimension: "COLUMNS",
		values: [[tickets, hearts, niney, hoursLeft, totalParts, partsComplete, totalSoul, currentSoul, rank]]
	}
  }, function(err_update, response_update) {
    if (err_update) {
      console.log('The API returned an UPDATE error: ' + err);
      return;
    }
	// here is the get
	//var rows = response.values;
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Season Calculator!D10:J14'
  }, function(err_get, response_get) {
    if (err_get) {
      console.log('The API returned a GET error: ' + err);
      return;
	}
	// do something with get
	if (args.length == 0) result = FINISH_ERR;
	else {
		var rows = response_get.values;
		result = "To finish your current season, you will need "+rows[0][0]+" tickets." +
				"\nIf you win every fight you will need "+rows[4][4]+" hearts." +
				"\nIf you lose every fight you will need "+rows[4][2]+" hearts." +
				"\nAt a 50% winrate you will need "+rows[4][6]+" hearts.";
	}
	msg.channel.send(result);
	});	
	// end of function
	});
 }
 
 function cookieGoal(auth, args, msg) {
	var result = '';
	var goal = args[0] == undefined ? 0: args[0];
	var cookies = args[1] == undefined ? 0: args[1];
	var niney = args[2] == undefined ? 0: args[2];
	var hearts = args[3] == undefined ? 0: args[3]; 
	var tickets = args[4] == undefined ? 0: args[4];
	var days = args[5] == undefined ? 0: args[5];
	var rank = args[6] == undefined ? "D3": args[6];
	var sheets = google.sheets('v4');
	// update and write
	sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cookie Calculator!B4:B13',
	valueInputOption: "USER_ENTERED",
	resource: {
		majorDimension: "COLUMNS",
		values: [[rank,null,null,niney,hearts,tickets,cookies,null,days,goal]]
	}
  }, function(err_update, response_update) {
    if (err_update) {
      console.log('The API returned an UPDATE error: ' + err_update);
      return;
    }
	// here is the get
	//var rows = response.values;
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Cookie Calculator!A15:J28'
  }, function(err_get, response_get) {
    if (err_get) {
      console.log('The API returned a GET error: ' + err_get);
      return;
	}
	// do something with get
	if (args.length == 0) result = COOKIE_ERR;
	else {
		var rows = response_get.values;
		result = "With your current resources and stats, you will need "+rows[0][1]+" cookies."+
					"\nThis can be achieved with "+rows[0][3]+" tickets or "+rows[0][9]+" hearts on single cookies."+
					"\nThis will cost US$"+rows[5][3]+" for tickets and US$"+rows[5][9]+" for hearts\n($US99.99 for 14500 gems @ 36 tickets/4500 gems OR 800 hearts/500 gems)."+
					"\n\nDuring 2x, you will need "+rows[7][3]+" tickets or "+rows[7][9]+" hearts."+
					"\nThis will cost US$"+rows[12][3]+" for tickets and US$"+rows[12][9]+" for hearts\n($US99.99 for 14500 gems @ 36 tickets/4500 gems OR 800 hearts/500 gems)."+
					"\n"+rows[13][1]+" will be your cheapest option.";
	}
	msg.channel.send(result);
	});	
	// end of function
	});
 }
 
 function timer(auth, args, msg){
	var result = '';
	var sheets = google.sheets('v4');
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Dates',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
	// here is the function
	var rows = response.values;
	for (var i = 0; i < args.length; i++) {
		for (var row = 0; row < rows.length; row++) {
			if (args[i]==rows[row][0]) {
				result += timeLeft(rows[row]);
			}
		}
	}
	if (result == '') result = TIME_ERR;
	msg.channel.send(result);
	// end of function
	});
 }
 
 function calculateSoul(auth, args, msg){
	var result = '';
	var goal = args[0] == undefined ? 0: args[0];
	var soul = args[1] == undefined ? 0: args[1];
	var rank = args[2] == undefined ? "D3": args[2];
	var totalParts = args[3] == undefined ? 0: args[3]; 
	var completedParts = args[4] == undefined ? 0: args[4];
	var sheets = google.sheets('v4');
	// update and write
	sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Soul Calculator!B1:B5',
	valueInputOption: "USER_ENTERED",
	resource: {
		majorDimension: "COLUMNS",
		values: [[goal, soul, rank, totalParts, completedParts]]
	}
  }, function(err_update, response_update) {
    if (err_update) {
      console.log('The API returned an UPDATE error: ' + err_update);
      return;
    }
	// here is the get
	//var rows = response.values;
	sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Soul Calculator'
  }, function(err_get, response_get) {
    if (err_get) {
      console.log('The API returned a GET error: ' + err_get);
      return;
	}
	// do something with get
	if (args.length == 0) result = SOUL_ERR;
	else {
		var rows = response_get.values;
		result = "\nYou will need "+rows[6][1]+" soul, which will take "+rows[6][5]+" wins or "+rows[6][3]+" losses." +
				"\nThis will require "+rows[7][5]+" min hearts or "+rows[7][3]+" max hearts, translating to "+rows[8][5]+" min hours or "+rows[8][3]+" max hours." +
				"\nThis is around "+rows[8][5]+" min tickets or "+rows[8][3]+" max tickets." +
				"\nAt your current story progress, you will waste "+rows[10][5]+ " min tickets or "+rows[10][3]+ " max tickets, equivalent to "+rows[11][5]+" min hours or "+rows[11][3]+" max hours.";
	}
	msg.channel.send(result);
	});	
	// end of function
	});
 }
 
 function timeLeft(line){
	result = '';
	var str = (function(line) {
		switch(line[0]) {
			case 'cc':
				return line[3]+' cookie collection';
			case 'sale':
				return line[3]+' sale';
			case 'oo':
				return line[3]+' opening offer';
			case 'seb':
				return line[3]+' super early bird';
			case 'eb':
				return line[3]+' early bird';
			case 'potluck':
				return line[3]+' potluck';
			case 'giveaway':
				return line[3]+' giveaway';
			case '2x':
				return line[3]+' double boost';
			case '3x':
				return line[3]+' triple boost';
			case 'gacha':
				return line[3]+' gacha';
			case 'ht':
				return line[3]+' heart troops';
			case 'nf':
				return 'NF delight';
			case 'fm':
				return 'Fight Master';
			default:
				return '';
		}	
	})(line);
	var current_time = new Date();
	var deadline = new Date(line[2]);
	if (line[4]=='') deadline.setHours(8);
	else deadline.setHours(line[4]);
	var time_diff = deadline.getTime()-current_time.getTime();
	if (time_diff <= 0) return result;
	var minutes = Math.ceil(time_diff/(1000*60))%60;
	var hours = Math.floor(time_diff/(1000*3600))%24;
	var days = Math.floor(time_diff/(1000*86400));
	var hours_only = time_diff/(1000*3600);
	result += "\nTime left until the "+str+" ends is "+days+" days, "+hours+" hours, and "+minutes+" minutes ("+parseFloat(hours_only).toFixed(2)+" hours).";
	return result;
 }
 
 function toolOrSoul(line, mode) {
	var result = '';
	if (mode!=null && line[4]!=mode) return result;
	if (line[4]=='soul' && !isNaN(parseFloat(line[1]))) result+="\nS"+line[0]+" ch. "+line[1]+" P"+line[2]+"/"+line[3]+" requires "+line[5]+" soul";
	else if (line[4]=='tool' && !isNaN(parseFloat(line[1]))) result+="\nS"+line[0]+" ch. "+line[1]+" P"+line[2]+"/"+line[3]+" requires (Premium/Normal/Niney) "+line[7]+"/"+line[8]+"/"+line[9];
	else {
		if (line[1]=="POT") result+="\nS"+line[0]+" potluck requires (Premium/Normal) "+line[7]+"/"+line[8]+" gems.";
		else if (line[1]=="TOTAL") result+="\nS"+line[0]+" requires a total of (Premium/Normal/Niney) "+line[7]+"/"+line[8]+"/"+line[9]+".";
		else if (line[1]=="ALL END" && line[4]=='tool') result+="\nS"+line[0]+" all endings P"+line[2]+"/"+line[3]+" require (Premium/Normal/Niney) "+line[7]+"/"+line[8]+"/"+line[9];
		else if (line[1]=="ALL END" && line[4]=='soul') result+="\nS"+line[0]+" all endings P"+line[2]+"/"+line[3]+" require "+line[5]+" soul";
		else if (line[1]=="BOTH END" && line[4]=='tool') result+="\nS"+line[0]+" both endings P"+line[2]+"/"+line[3]+" require (Premium/Normal/Niney) "+line[7]+"/"+line[8]+"/"+line[9];
		else if (line[1]=="BOTH END" && line[4]=='soul') result+="\nS"+line[0]+" both endings P"+line[2]+"/"+line[3]+" require "+line[5]+" soul";
		else result+="\nS"+line[0]+" "+line[1]+" ending P"+line[2]+"/"+line[3]+" requires "+line[5];
	}	
	return result;
 }

module.exports = {routeAnswer, seasonTotal, seasonDays, checkpointList, finishOnTime, cookieGoal, timer, calculateSoul}
								