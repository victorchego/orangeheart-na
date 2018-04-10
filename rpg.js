var CY_CHANNEL_ID = '401660510816436224';
var OWNER_ID = '235263356397813762';

var JSON_DATA = null;
var JSON_URL = 'https://api.myjson.com/bins/qqp3b';

var HOURLY_TIMEOUT = null;

var request = require('request');

var new_item = {
	"name": "",
	"value": 0,
	"cost": 0,
	"type": "",
	"count": 0
}	

var new_merc = {
	"name": "",
	"value": 0,
	"cost": 0,
	"type": "",
	"count": 0,
	"turns": 0,
	"effect": ""
}

function newItem(fields) {
	var item = Object.assign({}, new_item, fields);
	return item;
}

function newMerc(fields) {
	var merc = Object.assign({}, new_merc, fields);
	return merc;
}

var item_list = [
	newItem({"name":"shuriken", "value":1, "cost":10, "type":"atk"}),
	newItem({"name":"knife", "value":5, "cost":45, "type":"atk"}),
	newItem({"name":"dagger", "value":20, "cost":100, "type":"atk"}),
	newItem({"name":"glove", "value":1, "cost":10, "type":"def"}),
	newItem({"name":"armguard", "value":3, "cost":25, "type":"def"}),
	newItem({"name":"shield", "value":7, "cost":40, "type":"def"}),
	newItem({"name":"pocket", "value":1, "cost":25, "type":"steal"}),
	newItem({"name":"cutter", "value":4, "cost":80, "type":"steal"}),
	newItem({"name":"lockpick", "value":20, "cost":200, "type":"steal"})
];

var merc_list = [
	newMerc({"name":"owner", "value":100, "cost":5000, "type":"cookies", "effect":"Hiring the owner gives you periodic gold income"}),
	newMerc({"name":"father", "value":10, "cost":5000, "type":"item", "effect":"Hiring the father gives you periodic shuriken income"})
];

function showItemList(msg) {
	var str = '';
	for (i in item_list) {
		str += '\n'+stringItem(item_list[i]);
	}
	msg.channel.send('```'+str+'```');
}

function showMercList(msg) {
	var str = '';
	for (i in merc_list) {
		str += '\n'+stringMerc(merc_list[i]);
	}
	msg.channel.send('```'+str+'```');
}

function randomCookies(msg) {
	if (!checkPlayer(msg)) {
		msg.channel.send("You are not a RPG participant");
		return;
	}
	var val = Math.floor((Math.random() * 10) + 1);
	JSON_DATA[msg.author.id]["cookies"]+=val;
	msg.channel.send(`${msg.author} You have gained ${val} cookies`);
}

function checkPlayer(msg) {
	return msg.author.id in JSON_DATA;
}

function viewPlayers(msg) {
	if (!checkPlayer(msg)) {
		msg.channel.send("You are not a RPG participant");
		return;
	}
	var str = 'Current Players:';
	for (id in JSON_DATA) {
		var user = msg.client.users.find(val => val.id === id);
		var name = user.username;
		str += '\n'+user.username;
	}
	msg.channel.send('```'+str+'```');
}

function joinRPG(msg) { //{<id>:{"cookies":0,"turns":0,"atk":0,"def":0,"steal":0,"item":[<item1>,...],"merc":[<merc1>:0,<merc2>:3,...], "waifu": ""}}
	if (checkPlayer(msg)) {
		msg.channel.send("You have already a RPG participant");
		return;
	}
	var elem = {};
	elem["cookies"] = 50;
	elem["maxturns"] = 5;
	elem["turns"] = elem["maxturns"];
	elem["atk"] = 0;
	elem["def"] = 0;
	elem["steal"] = 0;
	elem["item"] = [];
	elem["merc"] = [];
	elem["waifu"] = "";
	JSON_DATA[msg.author.id] = elem;
	msg.channel.send("You have joined the RPG");
}

function leaveRPG(msg) {
	if (!checkPlayer(msg)) {
		msg.channel.send("You are not a RPG participant");
		return;
	}
	delete JSON_DATA[msg.author.id];
	msg.channel.send("You have left the RPG");
}

function viewProfile(msg) {
	if (!checkPlayer(msg)) {
		msg.channel.send("You are not a RPG participant");
		return;
	}
	updateStats(msg);
	var str = '';
	str += msg.author+"'s profile:```";
	str += "\nCookies: "+JSON_DATA[msg.author.id]["cookies"];
	str += "\nTurns: "+JSON_DATA[msg.author.id]["turns"];
	str += "\nAttack: "+JSON_DATA[msg.author.id]["atk"]
	str += "\nDefense: "+JSON_DATA[msg.author.id]["def"]
	str += "\nSteal: "+JSON_DATA[msg.author.id]["steal"]
	str += "\nItem List: "+ JSON.stringify(JSON_DATA[msg.author.id]["item"]);
	str += "\nHired Mercenaries: "+JSON.stringify(JSON_DATA[msg.author.id]["merc"]);
	str += "\nWaifu: "+JSON_DATA[msg.author.id]["waifu"];
	str += '```';
	msg.channel.send(str);
}

function updateStats(msg) {
	JSON_DATA[msg.author.id]["atk"] = calcAtk(msg);
	JSON_DATA[msg.author.id]["def"] = calcDef(msg);
	JSON_DATA[msg.author.id]["steal"] = calcSteal(msg);
}

function filterItems(msg, type, value) {
	var items = JSON_DATA[msg.author.id]["item"];
	var list = items.filter(function(item) {return item[type]==value;});
	return list;
}

function stringItem(item) {
	var str = `${capitalizeFirstLetter(item["name"])} is a ${item["type"].toUpperCase()} item that has ${item["value"]} power. Costs ${item["cost"]}`;
	return str;
}

function buyItems(msg, name, count=1) {
	if (!checkPlayer(msg)) {
		msg.channel.send("You are not a RPG participant");
		return;
	}
	if (isNaN(count)) {
		msg.channel.send(msg.author+" Invalid quantity. Only enter numbers as the second argument");
		return;	
	}
	var item = item_list.find(function(item){return item["name"]==name;});
	if (!item) {
		msg.channel.send(msg.author+" Invalid item. Please check the item list for the correct item name");
		return;
	}
	var cost = item["cost"]*count;
	if (JSON_DATA[msg.author.id]["cookies"] < cost) {
		msg.channel.send(msg.author+" You do not have enough cookies to buy this selection");
		return;
	}
	var current_item = JSON_DATA[msg.author.id]["item"].find(function(item){return item["name"]==name;});
	if (!current_item) {
		var new_item = newItem(item);
		new_item["count"] = parseInt(count);
		JSON_DATA[msg.author.id]["item"].push(new_item);
	}
	else {
		current_item["count"]+=parseInt(count);
	}
	JSON_DATA[msg.author.id]["cookies"]-=cost;
	updateStats(msg);
	msg.channel.send(`${msg.author} You have bought ${count} ${name}(s)`);
}

function stringMerc(merc) {
	var str = `${capitalizeFirstLetter(merc["name"])} costs ${merc["cost"]}. Effect: ${merc["effect"]}`;
	return str;
}

function hireMerc(msg, name) {
	if (!checkPlayer(msg)) {
		msg.channel.send("You are not a RPG participant");
		return;
	}
	var merc = merc_list.find(function(merc){return merc["name"]==name;});
	if (!merc) {
		msg.channel.send(msg.author+" Invalid mercenary. Please check the mercenary list for the correct mercenary name");
		return;
	}
	var cost = merc["cost"];
	if (JSON_DATA[msg.author.id]["cookies"] < cost) {
		msg.channel.send(msg.author+" You do not have enough cookies to hire this selection");
		return;
	}
	var current_merc = JSON_DATA[msg.author.id]["merc"].find(function(merc){return merc["name"]==name;});
	if (!current_merc) {
		var new_merc = newMerc(merc);
		new_merc["count"] = 1;
		JSON_DATA[msg.author.id]["merc"].push(new_merc);
	}
	else {
		msg.channel.send(`${msg.author} You have already hired ${name}`);
		return;
	}
	JSON_DATA[msg.author.id]["cookies"]-=cost;
	updateStats(msg);
	msg.channel.send(`${msg.author} You have hired ${name}`);
}

function calcAtk(msg) {
	var result = 0;
	var list = filterItems(msg, "type", "atk");
	for (i in list) {
		result += list[i]["value"]*list[i]["count"];
	}
	return result;
}

function calcDef(msg) {
	var result = 0;
	var list = filterItems(msg, "type", "def");
	for (i in list) {
		result += list[i]["value"]*list[i]["count"];
	}
	return result;
}

function calcSteal(msg) {
	var result = 0;
	var list = filterItems(msg, "type", "steal");
	for (i in list) {
		result += list[i]["value"]*list[i]["count"];
	}
	return result;
}

function attackPlayer(msg) {
	var elem = JSON_DATA[msg.author.id];
	var target = JSON_DATA[msg.mentions.users.firstKey()];
	if (!elem || !target) {
		msg.channel.send(`${msg.author} Both you and your target must be participants`);
		return;
	}
	if (elem==target) {
		msg.channel.send(`${msg.author} You cannot attack yourself`);
	}
	var user = msg.client.users.find(val => val.id === msg.mentions.users.firstKey());
	if (elem["atk"] > target["def"]) {
		var gain = elem["atk"]-target["def"];
		elem["cookies"] += gain+elem["steal"];
		target["cookies"] -= elem["steal"];
		if (target["cookies"] < 0) target["cookies"] = 0;
		elem["turns"]--;
		msg.channel.send(`${msg.author} has successfully attacked ${user.username} and gained ${gain} cookies, additionally stealing ${elem["steal"]}`);
		return;
	}
	if (elem["atk"] < target["def"]) {
		var gain = target["def"]-elem["atk"];
		target["cookies"] += gain-elem["steal"];
		elem["cookies"] += elem["steal"];
		if (target["cookies"] < 0) target["cookies"] = 0;
		elem["turns"]--;
		msg.channel.send(`${user.username} has successfully defended against ${msg.author} and gained ${gain} cookies, lost ${elem["steal"]} to steal`);
		return;
	}
	else {
		elem["cookies"] += elem["steal"];
		target["cookies"] -= elem["steal"];
		if (target["cookies"] < 0) target["cookies"] = 0;
		elem["turns"]--;
		msg.channel.send(`${msg.author} has stolen ${elem["steal"]} cookies from ${user.username}`);
	}
}

function aboutMessage(msg) {
	var str = `What is this RPG system? It's a WIP game intended to improve the current cookie system.
Few key differences are:
-items you can purchase with your cookies
-mercs will be more active in the gameplay
-you have a chance to earn cookies for a successful DEFENSE
-more TBA
Please check the available commands/details: !rpg commands/details`;
	msg.channel.send('```'+str+'```');
}

function detailMessage(msg) {
	var str = `How to play:
Purchase items to increase your stats
You can earn cookies by attacking or defending. A successful action requires you to have a higher stat than your target's OPPOSING stat
A failed attempt does not earn you any profit based of ATK/DEF, but you can still get profit with STEAL
Your ATK stats determine how strong your offense is. For every point your ATK is higher than your target's DEF, you gain more cookies
Your DEF stats determine how strong your defense is. For every point your DEF is higher than your attacker's ATK, you gain more cookies
Your STEAL stats determine how much you steal directly from your target`;
	msg.channel.send('```'+str+'```');
}

function commandMessage(msg) {
	var str = `The prefix is !rpg
-join/leave/profile/players/about/command(s)/detail(s)
-buy <item_name> <optional: quantity>
-hire <merc_name>
-itemlist/merclist`;
	msg.channel.send('```'+str+'```');
}

function updateProperty(msg, key, value) {
	JSON_DATA[msg.author.id][key]=value;
}

function updatePropertyAll(msg, key, value) {
	for (id in JSON_DATA) {
		JSON_DATA[id][key] = value;	
	}
}

function loadDataFromWeb(msg) {
	request(JSON_URL, function (err, response, data) {
		if (err) {
			console.log("Error has occurred: "+error);
			return;
		}	
		if (data==null) {
			JSON_DATA = {};
			return;
		}
		JSON_DATA = JSON.parse(data);
	});
}

function objDataToWeb(msg) {
	request({url: JSON_URL, method: 'PUT', json: JSON_DATA}, function (error, response, body) {
		if (error) console.log("Error has occurred: "+error);
	});     
}	

function resetGame(msg) {
	JSON_DATA = {};
	msg.channel.send("RPG has been reset");
}

function startUp(msg) {
	if (JSON_DATA==null) {
		loadDataFromWeb();
	}
	var current_time = new Date();
	if (current_time.getMinutes()!=0 || current_time.getSeconds()!=0) {
		var next_hour = new Date(current_time.getFullYear(),current_time.getMonth(),current_time.getDate(),current_time.getHours()+1,0,0);
		var time_diff = next_hour.getTime()-current_time.getTime();
		if (HOURLY_TIMEOUT!=null) clearTimeout(HOURLY_TIMEOUT);
		HOURLY_TIMEOUT = setTimeout(hourlyUpdate,time_diff,msg);
	}
	else hourlyUpdate(msg);
}

function isOwner(msg) {
	return msg.author.id == OWNER_ID;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function hourlyUpdate(msg) {
	mercUpdate(msg);
	turnUpdate(msg);
	updateStats(msg);
	objDataToWeb(msg);
}

function mercUpdate(msg) {
	for (id in JSON_DATA) {
		for (hire in JSON_DATA[id]["merc"]) {
			if (hire["name"] == "owner") {
				JSON_DATA[id]["cookies"]+=hire["value"];
			}
			else if (hire["name"] == "father") {
				var current_item = JSON_DATA[msg.author.id]["item"].find(function(item){return item["name"]=="shuriken";});
				var item = item_list.find(function(item){return item["name"]=="shuriken";});
				if (!current_item) {
					var new_item = newItem(item);
					new_item["count"] = hire["value"];
					JSON_DATA[msg.author.id]["item"].push(new_item);
				}
				else {
					current_item["count"]+=hire["value"];
				}
			}
		}
	}
}

function turnUpdate(msg) {
	for (id in JSON_DATA) {
		JSON_DATA[id]["turns"] = JSON_DATA[id]["maxturns"];
	}
}

function gift(msg, name, count) {
	var users = msg.mentions.users.keyArray();
	if (name == "cookies") {
		for (user in users) {
			JSON_DATA[users[user]]["cookies"]+=parseInt(count);
		}
	}
	else {
		for (user in users) {
			var current_item = JSON_DATA[users[user]]["item"].find(function(item){return item["name"]==name;});
			var item = item_list.find(function(item){return item["name"]==name;});
			if (!item) {
				msg.channel.send("Invalid option");
				return;
			}
			if (!current_item) {
				var new_item = newItem(item);
				new_item["count"] = parseInt(count);
				JSON_DATA[users[user]]["item"].push(new_item);
			}
			else {
				current_item["count"]+=parseInt(count);
			}
		}
	}
	msg.channel.send('Gift has been sent');
}

function handleMessage(msg) {
	if (msg.channel.id != CY_CHANNEL_ID) {
		msg.channel.send("This command must be used in #cy-playground");
		return;
	}
	var args = msg.content.substring(5).split(' ');
    var cmd = args[0];
    args = args.splice(1);
	
	if (cmd == "test") {
		msg.channel.send("Test succeeded");
	}
	else if (cmd == "join") {
		joinRPG(msg);
		objDataToWeb(msg);
	}
	else if (cmd == "leave") {
		leaveRPG(msg);
		objDataToWeb(msg);
	}
	else if (cmd == "save") {
		if (!isOwner(msg)) {
			msg.channel.send("You aren't authorized to use this command");
			return;
		}
		objDataToWeb(msg);
		msg.channel.send("Saved state to server");
	}
	else if (cmd == "load") {
		if (!isOwner(msg)) {
			msg.channel.send("You aren't authorized to use this command");
			return;
		}
		loadDataFromWeb(msg);
		msg.channel.send("Loaded state from server");
	}
	else if (cmd == "reset") {
		if (!isOwner(msg)) {
			msg.channel.send("You aren't authorized to use this command");
			return;
		}
		resetGame(msg);
	}
	else if (cmd == "profile") {
		viewProfile(msg);
	}
	else if (cmd == "players") {
		viewPlayers(msg);
	}
	else if (cmd == "about") {
		aboutMessage(msg);
	}
	else if (cmd == "commands" || cmd == "command") {
		commandMessage(msg);
	}
	else if (cmd == "details" || cmd == "detail") {
		detailMessage(msg);
	}
	else if (cmd == "buy") {
		if (args.length==0) {
			msg.channel.send(msg.author+" You must specify the item name");
			return;
		}
		buyItems(msg, args[0].toLowerCase(), args[1]);
		objDataToWeb(msg);
	}
	else if (cmd == "hire") {
		if (args.length==0) {
			msg.channel.send(msg.author+" You must specify the mercenary name");
			return;
		}
		hireMerc(msg, args[0].toLowerCase());
		objDataToWeb(msg);
	}
	else if (cmd == "itemlist") {
		showItemList(msg);
	}
	else if (cmd == "merclist") {
		showMercList(msg);
	}
	else if (cmd == "cookies" || cmd == "cookie") {
		randomCookies(msg);
		msg.delete().catch(console.error);
	}
	else if (cmd == "attack") {
		attackPlayer(msg);
	}
	else if (cmd == "gift") {
		if (args.length<2) {
			msg.channel.send(msg.author+" You must specify the name, count, and user tags");
			return;
		}
		if (!isOwner(msg)) {
			msg.channel.send("You aren't authorized to use this command");
			return;
		}
		gift(msg,args[0],args[1]);
	}
	else if (cmd == "admin") {
		if (!isOwner(msg)) {
			msg.channel.send("You aren't authorized to use this command");
			return;
		}
		updatePropertyAll(msg,"merc",[]);
	}
	else {
		msg.channel.send(`${msg.author} Check the command list: !rpg commands`);
	}
}

module.exports = {handleMessage, startUp};