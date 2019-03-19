var request = require('request');

// BITWISE FLAGS
SPAM_PING = 001;
SPAM_PASTE = 010;
SPAM_MINUTE = 100;

var USER_JSON = 'https://api.myjson.com/bins/hrybi'; // {id:1234, monitor:true}

var MOD_ROLES = ["Mod"]; //nepu
var WATCH_ROLES = ["Tourist"]; //nepu
var IGNORED_ROLES = ["Mod"]; //nepu
var IGNORED_CID = []; //nepu

var MUTED_ROLE = 'Muted'; //nepu


function msgHistoryPings(msg, limit = 50, ratio = 0.5, repeat = 5, count = 20) {
	// Get messages and filter by user ID
	guild = msg.guild;
	channel = msg.channel;
	userID = msg.author.id;
	member = msg.member;
	
	if (msg.author.bot) return;
	if (IGNORED_CID.includes(channel)) return;
	if (member.roles.some(r=>IGNORED_ROLES.includes(r.name))) return;
	
	// add to database if doesn't exist
	request(USER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading user file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);
		var user = obj.find(function(item){return item["id"]==userID;});
		if (user == undefined) {
			user = {};
			user["id"] = userID;
			if (member.roles.some(r=>WATCH_ROLES.includes(r.name))) {
				user["monitor"] = true;
			}
			else {
				user["monitor"] = false;
			}
			obj.push(user);
			objToWeb(obj, USER_JSON);
		}
		if (!user["monitor"]) return; // return if monitor is false
		else {
			channel.fetchMessages({limit: limit})
			.then(messages => {
				user_msg = messages.filter(m => m.author.id === userID);
				flags = 0 | SPAM_PING | SPAM_PASTE | SPAM_MINUTE;
				spam = false;
				reason = "";
				if (flags & SPAM_PING) {
					result = spamPings(user_msg) && messages.keyArray().length >= 10;
					spam = result || spam;
					if (result) reason += "Ping spam. ";
				}
				if (flags & SPAM_PASTE) {
					result = spamPaste(user_msg);
					spam = result || spam;
					if (result) reason += "Paste spam. ";
				}
				if (flags & SPAM_MINUTE) {
					result = spamMinute(user_msg);
					spam = result || spam;
					if (result) reason += "Minute spam. ";
				}
				if (spam) {
					console.log(`${msg.author} has been flagged. Reason(s): ${reason}`);
					channel.send(`${msg.author} has been flagged. Reason(s): ${reason}`);
					role = msg.guild.roles.find(val => val.name === 'Flagged');
					if (!role) role = msg.guild.roles.find(val => val.name === MUTED_ROLE);
					if (role) msg.member.addRole(role);
				}
				})
			.catch(console.error);
		}
	});
}

function spamPings(messages, limit = 50, ratio = 0.5) {
	total = 0;
	ping = 0;
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.mentions.everyone ||
		m.mentions.roles.size > 0 ||
		m.mentions.users.size > 0) {
			ping++;
		}
		total++;
	}
	return ping/total >= ratio;
}

function spamPaste(messages, repeat = 5) {
	total = 0;
	spam = 0;
	phrase = "";
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.content != phrase) {
			phrase = m.content;
			spam = 0;
		}
		else {
			spam++;
			if (spam >= repeat) {
				return true;
			}
		}
		total++;
	}
	return spam >= repeat;
}

function spamMinute(messages, count = 20) {
	total = 0;
	time = 0;
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.createdTimestamp >= time) {
			time = m.createdTimestamp;
		}
		if (Math.abs(m.createdTimestamp-time) <= 60000) {
			total++;
			if (total >= count) {
				return true;
			}
		}
		else {
			total = 0;
		}
		
	}
	return total >= count;
}

function monitorOn(msg, uidList) {
	if (uidList.length == 0) {
		msg.channel.send("Command must contain user mentions");
		return;
	}
	request(USER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading user file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);
		uidList.forEach((uid) => {
			var user = obj.find(function(item){return item["id"]==uid;});
			if (user == undefined) {
				user = {};
				user["id"] = uid;
				user["monitor"] = true;
				obj.push(user);
			}
			else {
				user["monitor"] = true;
			}
		});
		objToWeb(obj, USER_JSON);
		msg.channel.send("User(s) are being monitored");
	});		
}

function monitorOff(msg, uidList) {
	if (uidList.length == 0) {
		msg.channel.send("Command must contain user mentions");
		return;
	}
	request(USER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading user file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);
		uidList.forEach((uid) => {
			var user = obj.find(function(item){return item["id"]==uid;});
			if (user == undefined) {
				user = {};
				user["id"] = uid;
				user["monitor"] = false;
				obj.push(user);
			}
			else {
				user["monitor"] = false;
			}
		});
		objToWeb(obj, USER_JSON);
		msg.channel.send("User(s) are NOT being monitored");
	});	
}

function monitorCache(msg) {
	request(USER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading user file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);
		uidList = msg.guild.members.keyArray();
		uidList.forEach((uid) => {
			member = msg.guild.members.get(uid);
			var user = obj.find(function(item){return item["id"]==uid;});
			if (user == undefined) {
				user = {};
				user["id"] = uid;
				if (member.roles.some(r=>WATCH_ROLES.includes(r.name))) {
					user["monitor"] = true;
				}
				else {
					user["monitor"] = false;
				}
				obj.push(user);
			}
		});
		objToWeb(obj, USER_JSON);
		msg.channel.send("User(s) have been cached");
	});	
}

function objToWeb(obj,url) {
	request({url: url, method: 'PUT', json: obj}, function (error, response, body) {
		if (error) console.log("Error has occurred: "+error);
	});     
}

function clearObj(obj) {
	obj = [];
}	

module.exports = {msgHistoryPings, monitorOff, monitorOn, monitorCache};