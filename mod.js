var request = require('request');

// BITWISE FLAGS
SPAM_PING = 001;
SPAM_PASTE = 010;
SPAM_MINUTE = 100;

var USER_JSON = 'https://api.myjson.com/bins/hrybi'; // {id:1234, monitor:true}

var MOD_ROLES = ["Mod"]; //nepu
var WATCH_ROLES = ["Tourist", "Newcomer"]; //nepu
var IGNORED_ROLES = ["Mod"]; //nepu
var IGNORED_CID = ['408470727113703434', '456963780480335893']; //nepu bot, nep
var MSG_LOG_ID = '465616817679761409'; //nepu


var MUTED_ROLE = 'Muted'; //nepu


function msgHistoryPings(msg, limit = 50, ratio = 0.5, repeat = 5, count = 20) {
	// Get messages and filter by user ID
	var guild = msg.guild;
	var channel = msg.channel;
	var userID = msg.author.id;
	var member = guild.members.find(val => val.id === userID);
	
	if (msg.author.bot) return;
	if (IGNORED_CID.includes(channel.id)) return;
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
					result = spamPings(user_msg) && user_msg.keyArray().length >= 20;
					if (result) {
						spam = true;
						reason += "Ping spam. ";
					}
				}
				if (flags & SPAM_PASTE) {
					result = spamPaste(user_msg);
					if (result) {
						spam = true;
						reason += "Paste spam. ";
					}
				}
				if (flags & SPAM_MINUTE) {
					result = spamMinute(user_msg);
					if (result) {
						spam = true;
						reason += "Minute spam. ";
					}
				}
				if (spam) {
					if (reason == "") {
						console.log("Unknown flag reason");
						return;
					}
					console.log(`${msg.author} has been flagged in #${channel.name}. Reason(s): ${reason}`);
					msg.client.channels.find(val => val.id == MSG_LOG_ID).send(`${msg.author} has been flagged in #${channel.name}. Reason(s): ${reason}`);
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
	count = 0;
	phrase = "";
	time = 0;
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.content != phrase || m.content == "" || m.content == undefined) {
			phrase = m.content;
			count = 0;
			time = m.createdTimestamp;
		}
		else {
			if (Math.abs(m.createdTimestamp-time) <= 300000) {
				count++;
			}
			else {
				count = 0;
				time = m.createdTimestamp;
			}
			if (count >= repeat) {
				return true;
			}
		}
		total++;
	}
	return count >= repeat;
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

function monitorUsersOn(msg, uidList) {
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

function monitorUsersOff(msg, uidList) {
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

function monitorRolesOn(msg, ridList) {
	if (ridList.length == 0) {
		return;
	}
	request(USER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading user file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);
		ridList.forEach((rid) => {
			var uidList = guild.roles.get(rid).members.keyArray();
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
		});
		objToWeb(obj, USER_JSON);
		msg.channel.send("Role(s) are being monitored");
	});		
}

function monitorRolesOff(msg, ridList) {
	if (ridList.length == 0) {
		return;
	}
	request(USER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading user file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		ridList.forEach((rid) => {
		var uidList = guild.roles.get(rid).members.keyArray();
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
		});
		objToWeb(obj, USER_JSON);
		msg.channel.send("Role(s) are NOT being monitored");
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

module.exports = {msgHistoryPings, monitorUsersOff, monitorUsersOn, monitorRolesOff, monitorRolesOn, monitorCache};