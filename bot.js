const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require('./auth.json');
var fs = require('fs');
var request = require('request');
var moment = require('moment');

var Quickstart = require('./quickstart.js');
var CALL_REQUEST = Quickstart.callRequestFromServer; //function (callback,args,msg) {Quickstart.callRequestFromServer(callback,args,msg);}; // .callRequestFromServer or .callRequestFromClient
var YT = require('./yt.js');
var mod = require('./mod.js');

var URL_JSON = 'https://api.myjson.com/bins/663th';
var TIMER_JSON = 'https://api.myjson.com/bins/z65jl'; // [{"id":"X", "time":"X", "type":"steal/donate"}]
var TIMER_TIMEOUT = null;

var OWNER_ID = '235263356397813762'; //mine
var ZAP_ID = '565802469360402432'; //IF Bot zapier

var OWNER_SERVER = '491019873082671114'; //mine
var NEPU_SERVER = '358693530283016196'; //nepu

var BOT_LOG_ID = '491040470181478422'; //mine
var MSG_LOG_ID = '465616817679761409'; //nepu
var ANNOUNCEMENT_ID = '565400954392805376'; //nepu

var MUTED_ROLE = 'Muted'; //nepu
var MOD_ROLES = ["Mod"]; //nepu

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
	client.user.setGame('-help');
	//executeScript(client);
});

client.on('error', (err) => {
	console.log('Error: '+err.message+' at line '+err.lineNumber+' of '+err.fileName);
});

client.on('reconnecting', () => {
	var time = new Date();
	console.log('Attempting to reconnect at '+time);
});


client.on('guildMemberAdd', (guildmember) => {
	var server = client.guilds.find(val => val.id == NEPU_SERVER);
	if (server == null || server.id != NEPU_SERVER || guildmember.guild.available && guildmember.guild.id != NEPU_SERVER) return;
	var time = moment().isDST() ? moment().utcOffset("-07:00") : moment().utcOffset("-08:00");
	client.channels.find(val => val.id == MSG_LOG_ID).send(guildmember.user+' (ID '+guildmember.id+' / username '+guildmember.user.username+' / nickname '+guildmember.nickname+') has joined the server at '+time.format('LLL')+' Pacific');
	mod.monitorUsersOn(null,[guildmember.id]);
	//if (guildmember.id == OWNER_ID) {
	//	var guild = client.guilds.find(val => val.id  == GENERAL_ID);
	//	var role = guild.roles.find("name", "Ninja Apprentice");
	//	guildmember.addRole(role).then(console.log(guildmember.user+' modded')).catch(console.error);
	//}
});

client.on('guildMemberRemove', (guildmember) => {
	var server = client.guilds.find(val => val.id == NEPU_SERVER);
	if (server == null || server.id != NEPU_SERVER || guildmember.guild.available && guildmember.guild.id != NEPU_SERVER) return;
	var time = moment().isDST() ? moment().utcOffset("-07:00") : moment().utcOffset("-08:00");
	client.channels.find(val => val.id == MSG_LOG_ID).send(guildmember.user+' (ID '+guildmember.id+' / username '+guildmember.user.username+' / nickname '+guildmember.nickname+') has left the server at '+time.format('LLL')+' Pacific');
});

client.on('messageUpdate', (oldMessage, newMessage) => {
	var server = client.guilds.find(val => val.id == NEPU_SERVER);
	if (server == null || server.id != NEPU_SERVER || newMessage.guild.available && newMessage.guild.id != NEPU_SERVER) return;
	if (oldMessage.author.bot || newMessage.author.bot) return;
	/*
	if (oldMessage.embeds.length == 0) {
		if (newMessage.embeds.length > 0) {
			return;
		}
	}
	*/
	var UPDATE_EMBED = new Discord.RichEmbed();
	UPDATE_EMBED.setAuthor(`${newMessage.author.username} (ID: ${newMessage.author.id})`, newMessage.author.displayAvatarURL);
	UPDATE_EMBED.setDescription(`A message has been updated in ${newMessage.channel}.`);
	UPDATE_EMBED.setTimestamp();
	UPDATE_EMBED.addField("Before", oldMessage);
	UPDATE_EMBED.addField("After", newMessage);
	client.channels.find(val => val.id == MSG_LOG_ID).send(UPDATE_EMBED).catch(console.error);
});

client.on('messageDelete', (Message) => {
	var server = client.guilds.find(val => val.id == NEPU_SERVER);
	if (server == null || server.id != NEPU_SERVER || Message.guild.available && Message.guild.id != NEPU_SERVER) return;
	if (Message.author.bot) return;
	if (Message.content == null || Message.content == "") {
		var content = "(Empty string)";
	}
	else {
		var content = Message.content;
	}
	var DELETE_EMBED = new Discord.RichEmbed();
	DELETE_EMBED.setAuthor(`${Message.author.username} (ID: ${Message.author.id})`, Message.author.displayAvatarURL);
	DELETE_EMBED.setDescription(`A message has been deleted from ${Message.channel}.`);
	DELETE_EMBED.setTimestamp();
	DELETE_EMBED.addField(`Message (${Message.createdAt}`, content);
	client.channels.find(val => val.id == MSG_LOG_ID).send(DELETE_EMBED).catch(console.error);
});

client.on('messageDeleteBulk', (messages) => {
	var channel = client.channels.find(val => val.id == MSG_LOG_ID);
	if (channel == undefined) {
		console.log("Undefined channel");
		return;
	}
	var BEGIN_EMBED = new Discord.RichEmbed();
	BEGIN_EMBED.setDescription("The following messages have been deleted.");
	BEGIN_EMBED.setTimestamp();
	BEGIN_EMBED.setColor("GREEN");
	channel.send(BEGIN_EMBED).catch(console.error);
	messages.keyArray().forEach((m) => {
		message = messages.get(m);
		if (message.author.bot) return;
		var DELETE_EMBED = new Discord.RichEmbed();
		DELETE_EMBED.setAuthor(`${message.author.username} (ID: ${message.author.id})`, message.author.displayAvatarURL);
		DELETE_EMBED.addField(`Message (${message.channel})`, message);
		DELETE_EMBED.setTimestamp(message.createdAt);
		channel.send(DELETE_EMBED).catch(console.error);
	});
	var END_EMBED = new Discord.RichEmbed();
	END_EMBED.setDescription("This marks the end.");
	END_EMBED.setColor("RED");
	channel.send(END_EMBED).catch(console.error);
});



client.on('message', (msg) => {
	
	//logMessage(msg);
	
	if (msg.channel.id == '491020961240449024' && msg.author.id == ZAP_ID) {
		var flag = "Reply?:On";
		if (msg.content.includes(flag)) {
			client.channels.find(val => val.id == ANNOUNCEMENT_ID).send(msg.content.substring(flag.length)).catch(console.error);
		}
		return;
	}
	
	if (msg.content.toLowerCase().startsWith('-eval') && msg.author.id == OWNER_ID) {
		try {
			eval(msg.content.substring(6));
		}
		catch (error) {
			console.log('Error parsing: '+error);
			msg.channel.send("Error with evaluating string");
		};
	}
	
	else if (msg.content.toLowerCase().startsWith('-yt')) {
		YT.handleMessage(msg, client);
	}
	
	else if (msg.author.id == OWNER_ID && msg.content.toLowerCase().startsWith('-del')) {
		msg.channel.fetchMessage(msg.content.substring(5)).then(message => message.delete().catch(console.error)).catch(console.error);
	}
	
	else if (msg.content.startsWith('-') && msg.guild && msg.guild.id == OWNER_SERVER) {
		var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd.toLowerCase()) {
			/*
			case 'role':
				assignNep(client, msg, args);
			break;
			*/
			case 'commands':
                msg.author.send('```-commands \n-help \n-yt```').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
            break;
			case 'help':
				msg.author.send('Type -commands to see a list of commands').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
			break;
			case 'talk':
				try {
					talkBot(client, msg, args);
				}
				catch (err) {
					console.log(msg.author+"'s message failed: "+err.message);
				}
			break;
			case 'purgechannel':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					purgeDeleteChannel(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'purgeserver':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					purgeDeleteServer(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			/*
			case 'mute':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					muteUser(msg, client, args);
				}
				else msg.channel.send('Cannot obey command');				
			break;
			case 'unmute':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					unmuteUser(msg, client, args);
				}
				else msg.channel.send('Cannot obey command');				
			break;
			*/
			case 'monitor':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					var uidList = msg.mentions.users.keyArray();
					var ridList = msg.mentions.roles.keyArray();
					if (uidList.length + ridList.length == 0) {
						msg.channel.send("Command must include user or role mention(s)");
						return;
					}
					if (args[0] == "on") {
						mod.monitorUsersOn(msg, uidList);
						mod.monitorRolesOn(msg, ridList);
					}
					else if (args[0] == "off") {
						mod.monitorUsersOff(msg, uidList);
						mod.monitorRolesOff(msg, ridList);
					}
					else if (args[0] == "cache") {
						mod.monitorCache(msg);
					}
					else {
						msg.channel.send("Usage is -monitor on/off/cache");
					}
				}
				else msg.channel.send('Cannot obey command');				
			break;
			default:
				msg.channel.send('Refer to `-commands`');
            break;
		}
		
	}
	
    else if (msg.content.startsWith('-') && !msg.content.toLowerCase().startsWith('-yt')) {
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
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd.toLowerCase()) {
			case 'commands':
                msg.author.send('```-commands \n-help \n-yt```').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
            break;
			case 'help':
				msg.author.send('Type -commands to see a list of commands').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
			break;
			case 'talk':
				try {
					talkBot(client, msg, args);
				}
				catch (err) {
					console.log(msg.author+"'s message failed: "+err.message);
				}
			break;
			case 'purgechannel':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					purgeDeleteChannel(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'purgeserver':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					purgeDeleteServer(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			/*
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
			*/
			case 'monitor':
				if (msg.author.id==OWNER_ID || hasModRole(msg)) {
					if (args[0] == "on") {
						mod.monitorUsersOn(msg, msg.mentions.users.keyArray());
					}
					else if (args[0] == "off") {
						mod.monitorUsersOff(msg, msg.mentions.users.keyArray());
					}
					else if (args[0] == "cache") {
						mod.monitorCache(msg);
					}
					else {
						msg.channel.send("Usage is -monitor on/off/cache");
					}
				}
				else msg.channel.send('Cannot obey command');				
			break;
			default:
				msg.channel.send('Refer to `-commands`');
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
		excludeMessage(msg);
	}
	
	mod.msgHistoryPings(msg);
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

function talkBot(client, msg, args) {
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

function purgeDeleteChannel(client, msg, args) {
	if (!args || isNaN(args[0])) args = [50, false];
	var mention_user = msg.mentions.users.keyArray();
	var mention_role = msg.mentions.roles.keyArray();
	msg.channel.fetchMessages({limit: args[0]})
	.then(messages => {
		if (mention_user.length == 0 && mention_role.length == 0) {
			var str = "";
			messages.keyArray().forEach((m) => {
			    message = messages.get(m);
				str += String(`${message.author.username}(ID:${message.author.id}) [${message.createdAt.toUTCString()}] in ${message.channel.name}: ` + message.cleanContent + "\n");
			});
			msg.channel.bulkDelete(messages).catch(msg.channel.send("Cannot delete messages older than 2 weeks. Try a smaller number."));
			if (args[1]) client.channels.find(val => val.id == MSG_LOG_ID).send("Purged:\n" + "```" + str.substring(0,1800) + "\nCannot display anymore due to lack of space```");
			return;
		}
		if (mention_role.length > 0 && mention_user.length > 0) {
			filter_msg = messages.filter(m => mention_role.some(rid => m.member.roles.keyArray().includes(rid)) || mention_user.includes(m.author.id));
		}
		else if (mention_user.length > 0) {
			filter_msg = messages.filter(m => mention_user.includes(m.author.id));
		}
		else if (mention_role.length > 0) {
			filter_msg = messages.filter(m => mention_role.some(rid => m.member.roles.keyArray().includes(rid)));
		}
		var str = "";
		filter_msg.keyArray().forEach((m) => {
			message = filter_msg.get(m);
			str += String(`${message.author.username}(ID:${message.author.id}) [${message.createdAt.toUTCString()}] in ${message.channel.name}: ` + message.cleanContent + "\n");
		});
		msg.channel.bulkDelete(filter_msg).catch(msg.channel.send("Cannot delete messages older than 2 weeks. Try a smaller number."));
		if (args[1]) client.channels.find(val => val.id == MSG_LOG_ID).send("Purged:\n" + "```" + str.substring(0,1800) + "\nCannot display anymore due to lack of space```");
		return;
	});
}

function purgeDeleteServer(client, msg, args){
	if (args.length == 0) {
		msg.channel.send("The arguments must be a max number of messages to delete for a user, followed by strictly either a user ping or raw ID number. Including a mix will prioritize pings over ID.");
		return;
	}
	var counter = 0;
	var max = args[0];
	if (isNaN(max)) max = 50;
	args = args.splice(1);
	var uidList = msg.mentions.users.keyArray();
	if (uidList.length == 0) uidList = args;
	var uid = uidList[0];
	msg.channel.fetchMessages({limit: 100})
	.then((messages) => {
		var mArray = messages.keyArray();
		if (mArray.length == 0) {
			msg.channel.send("There are no messages.");
			return;
		}
		var bookmark = mArray[mArray.length-1];
		var filter_msg = messages.filter((m) => {m.author.id === uid});
		
	});
}

function excludeMessage(msg) {
	var str = msg.content.toLowerCase().split(" ").join("");
	if (str.includes('muddaasshoe')
	) {
		msg.delete().catch(console.error);
		//msg.channel.send('A poor lost soul has been ~~censored~~ guided to heaven');
	}
}

function includeMessage(msg) {
	var str = msg.content.toLowerCase().split(" ").join("");
	if (!str.includes('nep')
	) {
		msg.delete().catch(console.error);
		msg.channel.send("Text containing 'nep' only allowed.");
	}
}

function objToWeb(obj,url) {
	request({url: url, 
			agentOptions: {
				rejectUnauthorized: false
			}, method: 'PUT', json: obj}, function (error, response, body) {
		if (error) console.log("Error has occurred: "+error);
	});     
}	

function addToTimer(msg,num,type_str) {
	request({url: TIMER_JSON, agentOptions: {
							rejectUnauthorized: false
		}}, function (err, response, data) {
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
	request({url: TIMER_JSON, agentOptions: {
							rejectUnauthorized: false
						}, function (err, response, data) {
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
	request({url: TIMER_JSON, agentOptions: {
							rejectUnauthorized: false
						}, function (err, response, data) {
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
	request({url: TIMER_JSON, agentOptions: {
							rejectUnauthorized: false
						}, function (err, response, data) {
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
				msg.channel.send('Refer to `-commands`');
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

function assignRole(client, msg, args) {
	var str = args.join(' ');
	var role = msg.guild.roles.find("name", str);
	if (!role) {
		msg.channel.send('Invalid role');
		return;
	}
	msg.member.addRole(role).then(msg.channel.send(msg.author+' has joined ' + role.name)).catch(console.error);
}

function assignNep(client, msg, args) {
	var role = null;
	if (args.length == 0) {
		msg.channel.send('To join a role, use -role [Nep/Nowa/Buran/Beru/Ploot], without the brackets. To reset roles, use -role reset');
		return;
	}
	var str = args[0].toLowerCase();
	switch (str) {
		case 'nep':
		case 'neptune':
			role = msg.guild.roles.find("name", 'Nep Follower');
		break;
		case 'nowa':
		case 'noire':
			role = msg.guild.roles.find("name", 'Nowa Soldier');
		break;
		case 'buran':
		case 'blanc':
			role = msg.guild.roles.find("name", 'Buran Reader');
		break;
		case 'Beru':
		case 'vert':
			role = msg.guild.roles.find("name", 'Beru Fan');	
		break;
		case 'ploot':
		case 'plutia':
			role = msg.guild.roles.find("name", 'Ploot Plushie');	
		break;
		case 'reset':
			msg.member.setRoles([]).then(msg.channel.send('Roles have been reset')).catch(console.error);
			return;
		break;
		default:
			msg.channel.send('Invalid role. Please select from: Nep, Nowa, Buran, Beru, Ploot. To reset, use -role reset');
			return;
		break;
	}
	var hasRole = msg.member.roles.find(val => val.id == role.id);
	if (!hasRole) {
		msg.member.addRole(role).then(msg.channel.send(msg.author+' has joined ' + role.name)).catch(console.error);
	}
	else {
		msg.member.removeRole(role).then(msg.channel.send(msg.author+' has left ' + role.name)).catch(console.error);
	}
}

function toTitleCase(str)
{
	if (str != null) return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function hasModRole(message) {
	// Check if they have one of many roles
	if (message.member.roles.some(r=>MOD_ROLES.includes(r.name))) {
	// has one of the roles
		return true;
	}	 	
	else {
	// has none of the roles
		return false;
	}
}

function logMessage(message) {
	if (message.author.bot) return;
	client.channels.find(val => val.id == BOT_LOG_ID).send(`${message.author.username}(ID:${message.author.id}) [${message.createdAt.toUTCString()}] in ${message.channel}: ` + "```" + message.cleanContent + "```");
}