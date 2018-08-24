const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require('./auth.json');
var fs = require('fs');
var request = require('request');
var moment = require('moment');

var Quickstart = require('./quickstart.js');
var CALL_REQUEST = Quickstart.callRequestFromServer; //function (callback,args,msg) {Quickstart.callRequestFromServer(callback,args,msg);}; // .callRequestFromServer or .callRequestFromClient
var YT = require('./yt.js');

var URL_JSON = 'https://api.myjson.com/bins/663th';
var TIMER_JSON = 'https://api.myjson.com/bins/z65jl'; // [{"id":"X", "time":"X", "type":"steal/donate"}]
var TIMER_TIMEOUT = null;

/* LIST OF SERVERS
264145505452425227 - MNG 
*/

/* LIST OF CHANNELS
401660510816436224 - cy-playground /MNG
382741253353242626 - general / asdf
401702876398878722 - bot-palace / MNG
380045950879793153 - nsfw / MNG
264149249103495169 - off-topic / MNG
348328808975302658 - radio / MNG
264149019524071424 - anime / MNG
384028008375123978 - fanfiction / MNG
264149324831784960 - creative-corner / MNG
264149176974049282 - gameplayvideos / MNG
324224381054353411 - gacha-salt / MNG
319871113045737472 - spoilers / MNG
264145505452425227 - general / MNG
*/

// Initialize Discord client

client.login(auth.token);

client.on('ready', () => {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(client.user.username + ' - ' + client.user.id);
	client.user.setGame('!help');
	//executeScript(client);
	//client.channels.find(val => val.id === CY_CHANNEL_ID).send('I AM ALIVEEEEE!');
});

client.on('error', (err) => {
	console.log('Error: '+err.message+' at line '+err.lineNumber+' of '+err.fileName);
});

client.on('reconnecting', () => {
	var time = new Date();
	console.log('Attempting to reconnect at '+time);
});

/*
client.on('guildMemberAdd', (guildmember) => {
	var server = client.guilds.find(val => val.id == GENERAL_ID);
	if (server == null || server.id != '264145505452425227') return;
	var time = moment().isDST() ? moment().utcOffset("-07:00") : moment().utcOffset("-08:00");
	client.channels.find(val => val.id == BOT_LOG_ID).send(guildmember.user+' (ID '+guildmember.id+' / username '+guildmember.user.username+' / nickname '+guildmember.nickname+') has joined the server at '+time.format('LLL')+' Pacific');
	if (guildmember.id == OWNER_ID) {
		var guild = client.guilds.find(val => val.id  == GENERAL_ID);
		var role = guild.roles.find("name", "Ninja Apprentice");
		guildmember.addRole(role).then(console.log(guildmember.user+' modded')).catch(console.error);
	}
});

client.on('guildMemberRemove', (guildmember) => {
	var server = client.guilds.find(val => val.id == GENERAL_ID);
	if (server == null || server.id != '264145505452425227') return;
	var time = moment().isDST() ? moment().utcOffset("-07:00") : moment().utcOffset("-08:00");
	client.channels.find(val => val.id == BOT_LOG_ID).send(guildmember.user+' (ID '+guildmember.id+' / username '+guildmember.user.username+' / nickname '+guildmember.nickname+') has left the server at '+time.format('LLL')+' Pacific');
});
*/

client.on('message', (msg) => {
	
	if (msg.content.toLowerCase().startsWith('!eval') && msg.author.id == OWNER_ID) {
		try {
			eval(msg.content.substring(6));
		}
		catch (error) {
			console.log('Error parsing: '+error);
			msg.channel.send("Error with evaluating string");
		};
	}
	
	else if (msg.content.toLowerCase().startsWith('!yt')) {
		YT.handleMessage(msg, client);
	}
	
	else if (msg.author.id == OWNER_ID && msg.content.toLowerCase().startsWith('!del')) {
		msg.channel.fetchMessage(msg.content.substring(5)).then(message => message.delete().catch(console.error)).catch(console.error);
	}
	
    else if (msg.content.startsWith('!') {
		// if user warned of cooldown, ignore
		/*
		if (inList(msg.author, cooldownMessageList) && msg.channel.type=='text') {
			msg.delete().catch(console.error);
			return;
		}
		// if user on cooldown, warn	
		if (inList(msg.author, cooldownList) && msg.channel.type=='text') {
			timeout(msg);
			if (!inList(msg.author, cooldownMessageList)) cooldownMessageList.push(msg.author);
			msg.delete().catch(console.error);
			return;
		}
		
		if (inList(msg.channel.id,BANNED_CHANNELS) && msg.channel.type=='text' && msg.author.id != OWNER_ID) {
			msg.channel.send('This channel does not support commands');
			msg.delete().catch(console.error);
			return;
		}
		*/
        var args = msg.content.substring(4).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd.toLowerCase()) {
			case 'commands':
                msg.author.send('```!commands \n!help \n!yt```').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
            break;
			case 'help':
				msg.author.send(```Type !commands to see a list of commands```).then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
			break;
			case 'talk':
				try {
					talkCy(client, msg, args);
				}
				catch (err) {
					console.log(msg.author+"'s message failed: "+err.message);
				}
			break;
			case 'purge':
				if (msg.author.id==OWNER_ID) {
					purgeDelete(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			
			case 'mute':
				if (msg.author.id==OWNER_ID) {
					muteUser(msg, client, args);
				}
				else msg.channel.send('Cannot obey command');				
			break;
			case 'unmute':
				if (msg.author.id==OWNER_ID) {
					unmuteUser(msg, client, args);
				}
				else msg.channel.send('Cannot obey command');				
			break;
			default:
				msg.channel.send('Refer to `!commands`');
            break;
            // Just add any case commands if you want to..
         }
		/*
		cooldownList.push(msg.author);
		setTimeout(function(){
			removeFromList(msg.author, cooldownList);
			removeFromList(msg.author, cooldownMessageList);
			},3000);
		*/
     }
	else {
		filterMessage(msg);
	}
});

function inList(item, list) {
	return list.indexOf(item) > -1;
};

function removeFromList(item, list) {
	var i = list.indexOf(item);
	if (i >-1);
	list.splice(i,1);
};

function timeout(msg) {
	msg.channel.send(msg.author+', please wait 3 seconds before issuing another command').then(message=>message.delete(3000)).catch(console.error);
};

function talkCy(client, msg, args) {
	if (msg.author.id!=OWNER_ID) throw 'Not owner';
	if (args[0]!=null) {
		var channel = client.channels.find(val => val.id === args[0]);
		var str = '';
		for (var i = 1; i < args.length; i++) {
			str += ' ';
			str += args[i];
		}
		if (channel!=undefined) channel.send(str);
		else throw 'Undefined channel';
	}
	else throw 'Undefined argument';
}

function clearLists(args) {
	for (x in args) {
		x = [];
	}
}

function clearAllTimeouts(args) {
	for (x in args) {
		if (x != null) clearTimeout(x);
		if (x != null) clearInterval(x);
	}
}

function purgeDelete(client, msg, args) {
	if (!args || isNaN(args[0])) args = [50];
	msg.channel.fetchMessages({limit: args[0]}).then(messages => msg.channel.bulkDelete(messages));
}

function filterMessage(msg) {
	var str = msg.content.toLowerCase().split(" ").join("");
	if (str.includes('muddaasshoe') ||
	str.includes('knuckleswey') ||
	str.includes('knucklesway') || str.includes('knuckleswei') ||
	str.includes('knuckleswae') || str.includes('deway') ||
	str.includes('daway') || str.includes('dewei') ||
	str.includes('dawei') || str.includes('deway') ||
	str.includes('dawae') || str.includes('dewae') ||
	str.includes('dawey') || str.includes('dewey') ||
	str.includes('dawhei') || str.includes('dewhei') ||
	str.includes('dawhey') || str.includes('dewhey')
	) {
		msg.delete().catch(console.error);
		msg.channel.send('A poor lost soul has been ~~censored~~ guided to heaven');
	}
}

function objToWeb(obj,url) {
	request({url: url, method: 'PUT', json: obj}, function (error, response, body) {
		if (error) console.log("Error has occurred: "+error);
	});     
}	

function addToTimer(msg,num,type_str) {
	request(TIMER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}	
	var obj = JSON.parse(data);
	var elem = {};
	elem["id"] = msg.id;
	elem["author"] = msg.author.id;
	elem["time"] = moment(msg.createdAt).add(num, 'minutes').startOf('minute');
	elem["type"] = type_str;
	obj.push(elem);
	objToWeb(obj,TIMER_JSON);
	});
	updateTimer(client);
}

function removeFromTimer(client) {
	request(TIMER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var now = moment();
		for (i in obj) {
			if (now.diff(obj[i]["time"])>=0) {
				var user = client.users.find(val => val.id == obj[i]["author"]);
				if (user) user.send("Your "+obj[i]["type"]+" cooldown has expired").catch(function(){
					client.channels.find(val => val.id == BOT_LOG_ID).send('Cannot send to '+msg.author.username);
					});
				removeFromList(obj[i],obj);
			}
			else continue;
		}
		objToWeb(obj,TIMER_JSON);
	});
}

function updateTimer(client) {
	request(TIMER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);
		if (TIMER_TIMEOUT==null && obj != []) {
			TIMER_TIMEOUT = setInterval(function(){removeFromTimer(client);},60000);
		}
		else if (TIMER_TIMEOUT!=null && obj == []) {
			clearInterval(TIMER_TIMEOUT);
		}
	});
}

function checkTimer(client, msg, args, type_str) {
	request(TIMER_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			//msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["author"]==msg.author.id && item["type"]==type_str;});
		if (elem != null) {
			msg.author.send('You must wait until your '+type_str+' cooldown expires').catch(function(){console.log('Cannot send to '+msg.author.username);});
			return;
		}
		switch(type_str) {
			case 'steal':
				stealCookies(client,msg,args);
			break;
			case 'donate':
				donateCookies(client,msg,args);
			break;
			default:
				msg.channel.send('Refer to `!Cy commands`');
			break;
		}
	});
}

function clearTimer(client) {
	var obj = [];
	objToWeb(obj,TIMER_JSON);
}

function executeScript(client) { //change whatever script you need to run just once
	var guild = client.guilds.find(val => val.id  == GENERAL_ID);
	guild.createRole({
		name: "Muted",
		color: "BLACK",
	}).then(role => {role.remove(["SEND_MESSAGES"]); console.log(role.name);});
	var role = guild.roles.get("name", "Muted");
	console.log(role.permissions);
}

function muteUser(msg, client, args) {
	if (!args) {
		msg.channel.send('Invalid user');
		return;
	}
	var guild = client.guilds.find(val => val.id  == GENERAL_ID);
	if (!guild) {
		msg.channel.send('Invalid guild');
		return;
	}
	var role = guild.roles.find("name", MUTED_ROLE);
	if (!role) {
		msg.channel.send('Invalid role');
		return;
	}
	var user = guild.members.find(val => val.id === args[0]);
	if (!user) {
		msg.channel.send('Invalid user');
		return;
	}
	user.addRole(role).then(msg.channel.send('<@'+user.id+'> has been muted')).catch(console.error);
}

function unmuteUser(msg, client, args) {
	if (!args) {
		msg.channel.send('Invalid user');
		return;
	}
	var guild = client.guilds.find(val => val.id  == GENERAL_ID);
	if (!guild) {
		msg.channel.send('Invalid guild');
		return;
	}
	var role = guild.roles.find("name", MUTED_ROLE);
	if (!role) {
		msg.channel.send('Invalid role');
		return;
	}
	var user = guild.members.find(val => val.id === args[0]);
	if (!user) {
		msg.channel.send('Invalid user');
		return;
	}
	user.removeRole(role).then(msg.channel.send('<@'+user.id+'> has been unmuted')).catch(console.error);
}

function toTitleCase(str)
{
	if (str != null) return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}