var CY_CHANNEL_ID = '401660510816436224';
var OWNER_ID = '235263356397813762';

var JSON_DATA = null;
var JSON_URL = 'https://api.myjson.com/bins/qqp3b';

var request = require('request');

var item_000 = {
	"name": "",
	"value": 0,
	"cost": 0,
	"type": "",
	"count": 0
}	

function newItem(fields) {
	var item = Object.assign({}, item_000, fields);
	return item;
}

var item_001 = newItem({"name":"shuriken", "value":1, "cost":10, "type":"atk"});
var item_002 = newItem({"name":"knife", "value":5, "cost":45, "type":"atk"});
var item_003 = newItem({"name":"dagger", "value":20, "cost":100, "type":"atk"});
var item_004 = newItem({"name":"glove", "value":1, "cost":10, "type":"def"});
var item_005 = newItem({"name":"armguard", "value":3, "cost":25, "type":"def"});
var item_006 = newItem({"name":"shield", "value":7, "cost":40, "type":"def"});
var item_007 = newItem({"name":"pocket", "value":1, "cost":25, "type":"steal"});
var item_008 = newItem({"name":"cutter", "value":4, "cost":80, "type":"steal"});
var item_009 = newItem({"name":"lockpick", "value":20, "cost":200, "type":"steal"});

var item_list = [item_001,item_002,item_003,item_004,item_005,item_006,item_007,item_008,item_009];

function showItemList(msg) {
	var str = '';
	for (i in item_list) {
		str += '\n'+JSON.stringify(item_list[i]);
	}
	msg.channel.send('```'+str+'```');
}

function randomCookies(msg) {
	var val = Math.floor((Math.random() * 10) + 1);
	JSON_DATA[msg.author.id]["cookies"]+=val;
	msg.channel.send(`${msg.author} You have gained ${val} cookies`);
}

function checkPlayer(msg) {
	return msg.author.id in JSON_DATA;
}

function joinRPG(msg) { //{<id>:{"cookies":0,"turns":0,"atk":0,"def":0,"steal":0,"item":[<item1>,...],"merc":{<merc1>:0,<merc2>:3,...}, "waifu": ""}}
	if (checkPlayer(msg)) {
		msg.channel.send("You have already a RPG participant");
		return;
	}
	var elem = {};
	elem["cookies"] = 0;
	elem["turns"] = 0;
	elem["atk"] = 0;
	elem["def"] = 0;
	elem["steal"] = 0;
	elem["item"] = [];
	elem["merc"] = {};
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
	var str = '';
	str += msg.author+"'s profile:```";
	str += "\nCookies: "+JSON_DATA[msg.author.id]["cookies"];
	str += "\nAttack: "+calcAtk(msg);
	str += "\nDefense: "+calcDef(msg);
	str += "\nSteal: "+calcSteal(msg);
	str += "\nItem List: "+ JSON.stringify(JSON_DATA[msg.author.id]["item"]);
	str += "\nHired Mercenaries: "+JSON.stringify(JSON_DATA[msg.author.id]["merc"]);
	str += "\nWaifu: "+JSON_DATA[msg.author.id]["waifu"];
	str += '```';
	msg.channel.send(str);
}

function filterItems(msg, type, value) {
	var items = JSON_DATA[msg.author.id]["item"];
	var list = Object.keys(items).filter(function(item) {return item[type]==value;});
	return list;
}

function buyItems(msg, name, count=1) {
	if (isNaN(count)) {
		msg.channel.send(msg.author+" Invalid quantity. Only enter numbers as the second argument");
		return;	
	}
	var item = item_list.find(function(item){return item["name"]==name;});
	if (!item) {
		msg.channel.send(msg.author+" Invalid item. Please check the item list for the correct item name.");
		return;
	}
	var cost = item["cost"]*item["count"];
	if (JSON_DATA[msg.author.id]["cookies"] < cost) {
		msg.channel.send(msg.author+" You do not have enough cookies to buy this selection.");
		return;
	}
	JSON_DATA[msg.author.id]["cookies"]-=cost;
	var current_item = JSON_DATA[msg.author.id]["item"].find(function(item){return item["name"]==name;});
	if (!current_item) {
		var new_item = newItem(item,{"count":count});
		JSON_DATA[msg.author.id]["item"].push(new_item);
	}
	else {
		current_item["count"]+=count;
	}
	msg.channel.send(`${msg.author} You have bought ${count} ${name}(s)`);
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
Your STEAL stats determine how much you steal directly from you target`;
	msg.channel.send('```'+str+'```');
}

function commandMessage(msg) {
	var str = `The prefix is !rpg
-join/leave/profile/about/command(s)/detail(s)
-buy <item_name> <optional: quantity>`;
	msg.channel.send('```'+str+'```');
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

function startUp() {
	if (JSON_DATA==null) {
		loadDataFromWeb();
	}
}

function isOwner(msg) {
	return msg.author.id == OWNER_ID;
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
	}
	else if (cmd == "itemlist") {
		showItemList(msg);
	}
	else if (cmd == "cookies" || cmd == "cookie") {
		randomCookies(msg);
	}
	else {
		msg.channel.send(`${msg.author} Check the command list: !rpg commands`);
	}
}

module.exports = {handleMessage, startUp};