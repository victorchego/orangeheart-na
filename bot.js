const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require('./auth.json');
var fs = require('fs');
var request = require('request');
var moment = require('moment');

var Quickstart = require('./quickstart.js');
var CALL_REQUEST = Quickstart.callRequestFromServer; //function (callback,args,msg) {Quickstart.callRequestFromServer(callback,args,msg);}; // .callRequestFromServer or .callRequestFromClient
var Func = require('./functions.js');
var Game = require('./game.js');
var RPG = require('./rpg.js');
var YT = require('./yt.js');

var cooldownList = [];
var cooldownMessageList = [];
var MNG_WAIFUS = ["akari", "enju", "myu", "ricka", "tengge", "yamabuki", "lily", "nanao", "hotaru"];
var HIRE_LIST = ["zina", "father", "kikuko", "sakurako", "tycoon", "mari", "owner"];

var TARGET_CHANNEL_ID = '382741253353242626';  // channel ID specific client
var OWNER_ID = '235263356397813762';
var BOT_CHANNEL_ID = '401702876398878722';
var CY_CHANNEL_ID = '401660510816436224';
var MOD_CHANNEL_ID = '342821185169522688';
var GENERAL_ID = '264145505452425227';
var WELCOME_ID = '342822506060709912';
var BOT_LOG_ID = '404613773832224768';

var MUTED_ROLE = "Bad Child";

var URL_JSON = 'https://api.myjson.com/bins/663th';
var TIMER_JSON = 'https://api.myjson.com/bins/z65jl'; // [{"id":"X", "time":"X", "type":"steal/donate"}]
var TIMER_TIMEOUT = null;

var RPG_JSON = 'https://api.jsonbin.io/b/5a9fb587c9bf323a2b75e8ce'; //{<id>:{"user":@user,"cookies":0,"atk":0,"def":0,"steal":0,"item":{<item1>:1,<item2>:5,...},"merc":{<merc1>:0,<merc2>:3,...}}}

var COOKIE_STATUS = true;

var COUNTER = 7;

var AFFECTION = 0;

var GUIDE_DEFAULT = 'Hewe is yaw guide!\nhttp://moeninjagirls.tumblr.com/tagged/walkthrough - Credits: ?';

var DEFAULT_POINT = 10;
var POINT_AMOUNT = DEFAULT_POINT;
var BOOST_AMOUNT = 100;
var INIT_POINT = 1000;

var BOOST_TIMEOUT = null;
var LOTTERY_TIMEOUT = null;
var HOURLY_TIMEOUT = null;
var TYCOON_TIMEOUT = null;
var TAX_TIMEOUT = null;
var MARI_TIMEOUT = null;
var BOOST_DURATION = 3600000;
var TYCOON_DURATION = 6000;
var LOTTERY_DURATION = 300000;
var TAX_DURATION = 3600000;
var MARI_DURATION = 1800000;

var BANNED_CHANNELS = ['380045950879793153','348328808975302658','264149019524071424','384028008375123978','264149324831784960',
						'264149176974049282','324224381054353411','319871113045737472'];
var TALK_ALLOWED_CHANNELS = ['264145505452425227','264149249103495169','401660510816436224','401702876398878722'];

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
	client.user.setGame('!Cy commands');
	clearAllTimeouts(BOOST_TIMEOUT, LOTTERY_TIMEOUT, HOURLY_TIMEOUT, TYCOON_TIMEOUT, TAX_TIMEOUT, MARI_TIMEOUT, TIMER_TIMEOUT);
	clearLists(cooldownList,cooldownMessageList);
	clearTimer(client);
	cookieOn(client);
	client.channels.find(val => val.id === CY_CHANNEL_ID).send('Booting up').then(msg => RPG.startUp(msg));
	//executeScript(client);
	//client.channels.find(val => val.id === CY_CHANNEL_ID).send('I AM ALIVEEEEE!');
});

client.on('error', (err) => {
	console.log('Error: '+err.message+' at line '+err.lineNumber+' of '+err.fileName);
});

client.on('reconnecting', () => {
	var time = new Date();
	console.log('Attempting to reconnect at '+time);
	if (COOKIE_STATUS) cookieOn(client);
});

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

client.on('message', (msg) => {
	
	if (msg.content.toLowerCase().startsWith('!eval') && msg.author.id == OWNER_ID) {
		eval(msg.content).catch(function(){
			console.log('Error parsing');
			msg.channel.send("Error with evaluating string");
			});
	}
	
	else if (msg.content.toLowerCase().startsWith('!yt')) {
		YT.handleMessage(msg, client);
	}
	
	else if (msg.content.toLowerCase().startsWith('!rpg')) {
		RPG.handleMessage(msg);
	}
	else if (msg.author.id == OWNER_ID && msg.content.toLowerCase().startsWith('!del')) {
		msg.channel.fetchMessage(msg.content.substring(5)).then(message => message.delete().catch(console.error)).catch(console.error);
	}
	
    else if (msg.content.startsWith('!Cy ') || msg.content.startsWith('!cy ') || msg.content.startsWith('!CY ') || msg.content.startsWith('!cY ')) {
		// if user warned of cooldown, ignore
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
		
        var args = msg.content.substring(4).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd.toLowerCase()) {
			case 'huntfuugame':
				if (msg.channel.id == CY_CHANNEL_ID) {
					Game.startFuuTrap(client,msg);
				}
				else msg.channel.send('Cannot use command here');		
			break;
			case 'shoot':
			case 'shoots':
				var str = '';
				for (var i = 0; i < args.length; i++) {
					str += ' ';
					str += args[i];
				}
				if (COOKIE_STATUS) lowerAffection(client, msg);
				msg.channel.send('*At the request of '+msg.author+', Cy targets and shoots a laser blast at '+ str + '*');
			break;
			case 'slap':
			case 'slaps':
				var str = '';
				for (var i = 0; i < args.length; i++) {
					str += ' ';
					str += args[i];
				}
				if (COOKIE_STATUS) lowerAffection(client, msg);
				msg.channel.send('*At the request of '+msg.author+', Cy slaps'+ str + '*');
			break;
			case 'hug':
			case 'hugs':
				if (COOKIE_STATUS) raiseAffection(client, msg);
				msg.channel.send('*Cy gives '+ msg.author +' a **big** hug!*');
			break;
			case 'tickle':
			case 'tickles':
				if (COOKIE_STATUS) raiseAffection(client, msg);
				msg.channel.send('*Cy tickles '+ msg.author +'*');
			break;
			case 'hello':
			case 'hi':
				msg.channel.send('Hewwo '+ msg.author +' onii-chan!');
			break;
			case 'bye':
				msg.channel.send('Bye bye '+ msg.author +' onii-chan! See ya soon! <3');
			break;
			case 'goodmorning':
				msg.channel.send('Good morning '+ msg.author +' onii-chan! <3');
			break;
			case 'goodnight':
				msg.channel.send('Good night '+ msg.author +' onii-chan! <3');
			break;
			case 'route':
				if (args.length >= 2) {
					CALL_REQUEST(Func.routeAnswer, args, msg);
					msg.channel.send("Details have been sent "+msg.author);
				}
				else msg.channel.send('You must specify the season number and the girl name (eg. 9 Nanao, 3.5 Yamabuki)');
			break;
			case 'walkthrough':
				var str = walkthrough(args);
				msg.channel.send(str);
			break;
			case 'season':
			case 'seasons':
				if (args[0] == 'days') CALL_REQUEST(Func.seasonDays, args.slice(1), msg);
				else {
					CALL_REQUEST(Func.seasonTotal, args, msg);
				}
			break;
			case 'checkpoint':
			case 'checkpoints':
				CALL_REQUEST(Func.checkpointList, args, msg);
			break;
			case 'finishontime':
				CALL_REQUEST(Func.finishOnTime, args, msg);
			break;
			case 'cc':
				CALL_REQUEST(Func.cookieGoal, args, msg);
			break;
			case 'dailyreset':
				var current_time = new Date();
				var reset_time = new Date(current_time.getFullYear(),current_time.getMonth(),current_time.getDate()+1,7,0,0);
				var time_diff = reset_time.getTime()-current_time.getTime();
				if (time_diff > (86400*1000)) time_diff -= (86400 * 1000);
				var minutes = Math.ceil(time_diff/(1000*60))%60;
				var hours = Math.floor(time_diff/(1000*3600));
				msg.channel.send("Time till the next daily reset is "+hours+" hours and "+minutes+" minutes");
			break;
			case 'weeklyreset':
				var current_time = new Date();
				var saturday = current_time.getDay()==6 && current_time.getHours()>=17 ? current_time.getDate()+7 : current_time.getDate();
				var reset_time = new Date(current_time.getFullYear(),current_time.getMonth(),saturday,17,0,0);
				var time_diff = reset_time.getTime()-current_time.getTime();
				var minutes = Math.ceil(time_diff/(1000*60))%60;
				var hours = Math.floor(time_diff/(1000*3600));
				msg.channel.send("Time till the next weekly ninja fight reset is "+hours+" hours and "+minutes+" minutes");
			break;
			case 'timer':
				CALL_REQUEST(Func.timer, args, msg);
			break;
			case 'soul':
				CALL_REQUEST(Func.calculateSoul, args, msg);
			break;
			case 'docs':
				msg.channel.send('https://docs.google.com/document/d/17iMvW_UiVOfd22sau-EsbcFZ96XSxbFVJtRT2Z-NooE/');
			break;
			case 'commands':
                msg.author.send('```!Cy commands \n!Cy shoot userIDs \n!Cy slaps userIDs \n!Cy hug \n!Cy tickle \n!Cy hello \n!Cy bye \n!Cy goodmorning \n!Cy goodnight'+
							'\n!Cy route 9 Nanao \n!Cy walkthrough 3.5 \n!Cy season \n!Cy checkpoint \n!Cy finishontime' +
							'\n!Cy cc \n!Cy dailyreset \n!Cy weeklyreset \n!Cy timer \n!Cy soul \n!Cy docs' +
							'\n!Cy cookies \n!Cy leaderboard \n!Cy claim \n!Cy steal userID \n!Cy donate userID \n!Cy hire zina/tycoon' +
							'\n!Cy roll \n!Cy optout```').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
            break;
			case 'boost':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					boost(client, msg);
					if(!isNaN(args[0])) {
						if (BOOST_TIMEOUT!= null) clearTimeout(BOOST_TIMEOUT);
						POINT_AMOUNT = parseInt(args[0]);
						if (BOOST_TIMEOUT!=null) clearTimeout(BOOST_TIMEOUT);
						BOOST_TIMEOUT = setTimeout(function(){POINT_AMOUNT = DEFAULT_POINT; return;}, BOOST_DURATION);
					}
					msg.channel.send('Everyone online has been boosted!');
					return;
				}
				msg.channel.send('Cannot obey command');
			break;
			case 'cookie':
			case 'cookies':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				request(URL_JSON, function (err, response, data) {
					if (err) {
						console.log('Error reading points file: '+err);
						msg.channel.send('An unexpected error has occurred');
						return;
					}	
					var obj = JSON.parse(data);
					var elem = obj.find(function(item){return item["id"]==msg.author.id;});
					if (elem != undefined) {
						elem["cookies"] += POINT_AMOUNT;
						msg.channel.send('You have earned '+POINT_AMOUNT+' cookie(s) '+msg.author+'. Total: '+elem["cookies"]);
					}
					else {
						elem = {};
						elem["id"] = msg.author.id;
						elem["cookies"] = INIT_POINT;
						elem["waifu"] = "";
						elem["zina"] = 0;
						elem["rank"] = 0;
						elem["status"] = "";
						elem["king"] = 0;
						elem["owner"] = 0;
						elem["tycoon"] = 0;
						elem["father"] = 0;
						elem["mari"] = 0;
						obj.push(elem);
						msg.channel.send(msg.author+' has entered the cookie competition! Total: '+elem["cookies"]);
					}
					objToWeb(obj,URL_JSON);
				});
			break;
			case 'lb':
			case 'leaderboards':
			case 'leaderboard':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				request(URL_JSON, function (err, response, data) {
					if (err) {
						console.log('Error reading points file: '+err);
						msg.channel.send('An unexpected error has occurred');
						return;
					}	
					var str = 'Leaderboard:';
					var str2 = '';
					var obj = JSON.parse(data);
					obj = assignKings(obj);
					var arr = [];
					for (x in obj){
						arr.push([obj[x]["id"],obj[x]["cookies"],obj[x]["waifu"],obj[x]["king"],obj[x]["tycoon"]]);
					}
					arr.sort(function(a,b){return b[1]-a[1];});
					for (x in arr) {
						var user = client.users.find(val => val.id === arr[x][0]);
						var name = user != null ? user.username : "[NPC] "+arr[x][0];
						if (arr[x][3]==1) name = "[KING] "+name;
						if (arr[x][4]>0) name = "[TYCOON IS DADDY <3] "+name;
						str += '\n'+name+' has '+arr[x][1]+' cookies. Waifu: '+toTitleCase(arr[x][2]);
						//else str2+= '\n'+name+' has '+arr[x][1]+' cookies. Waifu: '+toTitleCase(arr[x][2]);
					}
					msg.channel.send('```'+str+'```');
					//if (str2) msg.channel.send('```'+str2+'```');
				});
			break;
			case 'claim':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (args.length != 0 && args[0] != undefined) claimWaifu(client, msg, args[0].toLowerCase());
				else msg.channel.send('You must specify one valid target with a tag');
			break;
			case 'steal':
			case 'donate':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				checkTimer(client,msg,args,cmd.toLowerCase());
			break;
			case 'hire':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				hireNPC(client, msg, args);
			break;
			case 'lottery':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					setLottery(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'tycoon':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID && msg.channel.id==CY_CHANNEL_ID) {
					setTycoon(client, msg, args);
				}
				else msg.channel.send('This command cannot be used here');
			break;
			case 'roll':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				rollDice(client, msg, args);
			break;
			case 'aff':
			case 'affection':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				showAffection(client, msg);
			break;
			case 'reset':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					resetCookies(client, msg, args);
					clearTimer(client);
				}
				else {
					if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
					}
					request(URL_JSON, function (err, response, data) {
					if (err) {
						console.log('Error reading points file: '+err);
						msg.channel.send('An unexpected error has occurred');
						return;
					}	

					var obj = JSON.parse(data);
					obj = assignKings(obj);
					var arr = [];
					for (x in obj){
						arr.push([obj[x]["id"],obj[x]["cookies"],obj[x]["waifu"],obj[x]["king"],obj[x]["tycoon"]]);
					}
					arr.sort(function(a,b){return b[1]-a[1];});
					if (arr.length >= 3) {
						if (msg.author.id == arr[0][0] || msg.author.id == arr[1][0] || msg.author.id == arr[2][0]) {
							resetCookies(client, msg, args);
							clearTimer(client);
						}
						else msg.channel.send('You must be in the top 3 to reset the game');
					}
					else msg.channel.send('An unexpected error has occurred');
					});
				}
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
			case 'optout':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				optOut(client, msg, args);
			break;
			case 'remove':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					removeCookies(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'addpropstring':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					addPropertyString(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'addpropnum':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					addPropertyNumber(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'removeprop':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					removeProperty(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'addnpc':
				if (!COOKIE_STATUS) {
					msg.channel.send('Cookie commands are disabled currently');
					return;
				}
				if (msg.author.id==OWNER_ID) {
					request(URL_JSON, function (err, response, data) {
						if (err) {
							console.log('Error reading points file: '+err);
							msg.channel.send('An unexpected error has occurred');
							return;
						}	
						var obj = JSON.parse(data);
						addNPC(obj, args);
						objToWeb(obj,URL_JSON);
						msg.channel.send('NPC has been added');
					});
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'on':
				if (msg.author.id==OWNER_ID) {
					cookieOn(client);
					msg.channel.send('Cookie status ON');
				}
				else msg.channel.send('Cannot obey command');				
			break;
			case 'off':
				if (msg.author.id==OWNER_ID) {
					cookieOff();
					msg.channel.send('Cookie status OFF');
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
				msg.channel.send('Refer to `!Cy commands`');
            break;
            // Just add any case commands if you want to..
         }
		 cooldownList.push(msg.author);
		 setTimeout(function(){
			removeFromList(msg.author, cooldownList);
			removeFromList(msg.author, cooldownMessageList);
			},3000);
			
		// placeholder	
		if (COUNTER <= 0) {
			if (msg.channel.id==CY_CHANNEL_ID) {
				setTycoon(client, msg, 0.1);
				COUNTER = 7;
			}
		}
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

/* function greetings(msg.author, channelID, cmd) {

} */

function walkthrough(args) {
	var str = 'Hewe is yaw guide!\nhttp://moeninjagirls.tumblr.com/post/';
	switch(args[0]) {
		case '1': str+= '155073178394';
		break;
		case '2': str+= '155257851619';
		break;
		case '3': str+= '155893948374';
		break;
		case '4': str+= '157550088819';
		break;
		case '5': str+= '159446425259';
		break;
		case '6': str+= '161274774624';
		break;
		case '7': str+= '162921645274';
		break;
		case '8': str+= '164822889504';
		break;
		case '3.5': str+= '166484082124';
		break;
		case '9': str+= '168028544959';
		break;
		default: str = GUIDE_DEFAULT;
		break;
	}
	return str;
}

function startUp(client) {
	var current_time = new Date();
	if (current_time.getMinutes()!=0 || current_time.getSeconds()!=0) {
		var next_hour = new Date(current_time.getFullYear(),current_time.getMonth(),current_time.getDate(),current_time.getHours()+1,0,0);
		var time_diff = next_hour.getTime()-current_time.getTime();
		if (HOURLY_TIMEOUT!=null) clearTimeout(HOURLY_TIMEOUT);
		HOURLY_TIMEOUT = setTimeout(hourlyPoints,time_diff, client);
	}
	else hourlyPoints(client, null);
	setTax(client);
	updateTimer(client);
}

function boost(client, msg) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		for(x in obj) {
			var user = client.users.find(val => val.id === obj[x]["id"]);
			if (user!=null && user.presence.status!='offline') {
				obj[x]["cookies"] += BOOST_AMOUNT;
			}
		}
		objToWeb(obj,URL_JSON);
	});
}

function hourlyPoints(client, msg) {
	boost(client, msg);
	var hour = (new Date()).getHours();
	console.log('Hourly cookies given! '+hour);
	if (HOURLY_TIMEOUT!=null) clearTimeout(HOURLY_TIMEOUT);
	HOURLY_TIMEOUT = setInterval(function(){
		boost(client, msg);
		hour = (new Date()).getHours();
		console.log('Hourly cookies given! '+hour);
	},3600000);
}

function stealCookies(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		if (args.length != 1) {
			msg.channel.send(msg.author+', you must specify one valid target with a tag.'+
							'\nSteal max efficiency at 80% your target. Min efficiency at 10% your target.');
			return;
		}
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){
			if (args[0]!=null && args[0].toLowerCase()=="tycoon") return item["id"]=="Tycoon";
			else if (args[0]!=null && args[0].toLowerCase()=="mari") return item["id"]=="Mari";
			else if (args[0]!=null && args[0].toLowerCase()=="zina") return item["id"]=="Zina";
			else if (args[0]!=null && args[0].toLowerCase()=="owner") return item["id"]=="Owner";
			else if (args[0]!=null && args[0].toLowerCase()=="kashin") return item["id"]=="Kashin";
			else return item["id"]==msg.mentions.users.firstKey();
			});
		if (elem != undefined) {
			if (target != undefined) {
				if (elem["id"]==target["id"]) {
					msg.channel.send(msg.author+', you cannot steal from yourself');
					return;
				}
				if (target["cookies"]==0) {
					msg.channel.send(msg.author+', target must have cookies');
					return;
				}
				if (elem["tycoon"]>0 && target["id"]=="Tycoon") {
					msg.channel.send(msg.author+', you hired Tycoon and cannot steal from him');
					return;
				}
				if (target["zina"]>0) {
					target["zina"]--;
					var steal_cooldown = 5;
					msg.author.send('Your steal cooldown will expire in '+Math.ceil(steal_cooldown)+' minutes').catch(function(){console.log('Cannot send to '+msg.author.username);});
					addToTimer(msg,steal_cooldown,"steal");
					msg.channel.send(msg.author+', Zina has intercepted your attack (cooldown: '+steal_cooldown+' minutes)');
					objToWeb(obj,URL_JSON);
					COUNTER--;
					return;
				}
				var total = 0;
				var higher = 0;
				for (x in obj) {
					total += obj[x]["cookies"];
					if (target["cookies"]>obj[x]["cookies"]) {
						higher++;
					}
				}
				var cookie_ratio = parseFloat(elem["cookies"])/target["cookies"];
				if (cookie_ratio <= 0.1) cookie_ratio = 0.1;
				if (cookie_ratio >= 0.8) cookie_ratio = 0.8;
				var self_percent = Math.ceil(0.01*(elem["cookies"]));
				var target_percent = Math.ceil(0.01*(target["cookies"]));
				var total_percent = Math.ceil(self_percent/(Math.pow(total, 1/10)));
				var steal_bonus = Math.ceil(higher*target_percent);
				var steal_amount = total_percent+self_percent;
				var steal_cooldown = 10+20*((0.8-cookie_ratio)/0.7);
				if (target["mari"]>0) {
					elem["cookies"]+=Math.ceil((steal_bonus+steal_amount)/2);
					target["cookies"]-=Math.ceil(steal_amount/2);
					target["mari"]++;
				}
				else {
					elem["cookies"]+=(steal_bonus+steal_amount);
					target["cookies"]-=steal_amount;
				}
				if (target["cookies"]<0) target["cookies"]=0;
				var user = client.users.find(val => val.id === target["id"]);
				var name = user != null ? user.username : "[NPC] "+target["id"];
				msg.channel.send(msg.author+' has stolen '+steal_amount+' (bonus: '+steal_bonus+') cookies from '+name+' (cooldown '+Math.ceil(steal_cooldown)+' minutes)');
				addToTimer(msg,steal_cooldown,"steal");
				msg.author.send('Your steal cooldown will expire in '+Math.ceil(steal_cooldown)+' minutes').catch(function(){console.log('Cannot send to '+msg.author.username);});
			}
			else {
				msg.channel.send(msg.author+', target must have cookies');
				return;
			}
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to steal');
			return;
		}
		objToWeb(obj,URL_JSON);
		COUNTER--;
	});
}

function donateCookies(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		if (args.length != 1) {
			msg.channel.send(msg.author+', you must specify one valid target with a tag');
			return;
		}
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){
			if (args[0]!=null && args[0].toLowerCase()=="tycoon") return item["id"]=="Tycoon";
			return item["id"]==msg.mentions.users.firstKey();
			});
		if (elem != undefined) {
			if (target != undefined) {
				if (elem["id"]==target["id"]) {
					msg.channel.send(msg.author+', you cannot donate to yourself');
					return;
				}
				if (target["cookies"]==0) {
					msg.channel.send(msg.author+', target must have cookies');
					return;
				}
				var total = 0;
				var higher = 0;
				for (x in obj) {
					total += obj[x]["cookies"];
					if (target["cookies"]>obj[x]["cookies"]) {
						higher++;
					}
				}
				var cookie_ratio = parseFloat(elem["cookies"])/target["cookies"];
				var self_percent = Math.ceil(0.01*(elem["cookies"]));
				var target_percent = Math.ceil(0.01*(target["cookies"]));
				var total_percent = Math.ceil(self_percent/total);
				var donate_bonus = Math.ceil(higher*target_percent);
				var donate_amount = total_percent+self_percent;
				var donate_cooldown = 30;
				if (donate_amount >= elem["cookies"]) donate_amount = elem["cookies"];
				elem["cookies"]-=donate_amount;
				target["cookies"]+=(donate_amount+donate_bonus);
				if (elem["cookies"]<0) elem["cookies"]=0;
				var user = client.users.find(val => val.id === target["id"]);
				var name = user != null ? user.username : "[BOT] "+target["id"];
				msg.channel.send(msg.author+' has donated '+donate_amount+' (bonus: '+donate_bonus+') cookies to '+name+' (cooldown '+Math.ceil(donate_cooldown)+' minutes)');
				addToTimer(msg,donate_cooldown,"donate");
				msg.author.send('Your donate cooldown will expire in '+Math.ceil(donate_cooldown)+' minutes').catch(function(){console.log('Cannot send to '+msg.author.username);});
			}
			else {
				msg.channel.send(msg.author+', target must have cookies');
				return;
			}
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to donate');
			return;
		}
		objToWeb(obj,URL_JSON);
		COUNTER--;
	});
}

function claimWaifu(client, msg, waifu) {
	if (!isMNGWaifu(waifu)) {
		msg.channel.send(msg.author+', you cannot claim a non MNG waifu');
		return;
	}
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){return item["waifu"]==waifu;});
		if (elem==undefined) {
			msg.channel.send(msg.author+', you must have cookies to claim a waifu');
			return;
		}
		if (elem["waifu"]==waifu) {
			msg.channel.send(msg.author+', you already have claimed this waifu');
			return;
		}
		if (elem != undefined) {
			if (target == undefined) {
				elem["waifu"] = waifu;
				msg.channel.send(msg.author+' has claimed '+toTitleCase(waifu));
			}
			else {
				if (elem["cookies"]>=target["cookies"]) {
					elem["waifu"] = waifu;
					target["waifu"] = "";
					msg.channel.send(msg.author+' has reclaimed '+toTitleCase(waifu));
				}
				else {
					msg.channel.send(msg.author+', you cannot claim the waifu with fewer cookies than the current waifu owner');
				}
			}
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to claim a waifu');
			return;
		}
		objToWeb(obj,URL_JSON);
		COUNTER--;
	});
}

function hireZina(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var zina = obj.find(function(item){return item["id"]=="Zina";});
		if (elem != undefined) {
			if (elem["zina"]>0) {
				msg.channel.send(msg.author+', you have already hired Zina. Turns: '+elem["zina"]);
				return;
			}
			var pay = Math.ceil(0.1*elem["cookies"]);
			elem["cookies"] -= pay;
			zina["cookies"] += pay;
			elem["zina"] = 3;
			msg.channel.send(msg.author+', you have hired Zina for '+pay+' cookies. Turns: '+elem["zina"]);
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to hire');
			return;
		}
		objToWeb(obj,URL_JSON);
	});
}

function hireTycoon(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var tycoon = obj.find(function(item){return item["id"]=="Tycoon";});
		if (elem != undefined) {
			if (elem["tycoon"]>0) {
				msg.channel.send(msg.author+', you have already hired Tycoon. Turns: '+elem["tycoon"]);
				return;
			}
			if (elem["cookies"]==0) {
				msg.channel.send(msg.author+", you don't have enough cookies to hire Tycoon");
				return;
			}
			var hires = 1;
			for (x in obj) {
				hires += obj[x]["tycoon"];
			}
			var pay = Math.ceil(0.01*hires*(tycoon["cookies"]+elem["cookies"]));
			if (pay > elem["cookies"]) {
				msg.channel.send(msg.author+", you don't have enough cookies to hire Tycoon");
				return;
			}
			for (x in obj) {
				obj[x]["tycoon"] = 0;
			}
			elem["cookies"] -= pay;
			tycoon["cookies"] += pay;
			elem["tycoon"] = 3;
			msg.channel.send(msg.author+', you have hired Tycoon for '+pay+' cookies. Turns: '+elem["tycoon"]);
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to hire');
			return;
		}
		objToWeb(obj,URL_JSON);
	});
}

function hireFather(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		if (elem != undefined) {
			if (elem["father"]>0) {
				msg.channel.send(msg.author+', you have already hired Father. Turns: '+elem["father"]);
				return;
			}
			if (elem["cookies"]==0) {
				msg.channel.send(msg.author+", you don't have enough cookies to hire Father");
				return;
			}
			var pay = Math.ceil(0.5*(elem["cookies"]));
			if (pay > elem["cookies"]) {
				msg.channel.send(msg.author+", you don't have enough cookies to hire Father");
				return;
			}
			elem["cookies"] -= pay;
			elem["father"] = 3;
			msg.channel.send(msg.author+', you have hired Father for '+pay+' cookies. Turns: '+elem["father"]);
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to hire');
			return;
		}
		objToWeb(obj,URL_JSON);
	});
}

function hireMari(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}
		var obj = JSON.parse(data);	
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){return item["mari"]>0;});
		var mari = obj.find(function(item){return item["id"]=="Mari";});
		if (elem != undefined) {
			if (elem["mari"]>0) {
				msg.channel.send(msg.author+', you have already hired Mari.');
				return;
			}
			if (elem["cookies"]==0) {
				msg.channel.send(msg.author+", you don't have enough cookies to hire Mari");
				return;
			}
			if (target!=undefined) {
				msg.channel.send(msg.author+", Mari has been hired by another player. Please wait until her hire duration expires");
			}
			var pay = Math.ceil(0.1*(elem["cookies"]));
			if (pay > elem["cookies"]) {
				msg.channel.send(msg.author+", you don't have enough cookies to hire Mari");
				return;
			}
			for (x in obj) {
				obj[x]["mari"] = 0;
			}
			var time = 30;
			elem["cookies"] -= pay;
			mari["cookies"] += pay;
			elem["mari"] = 1;
			if (MARI_TIMEOUT!=null) clearTimeout(MARI_TIMEOUT);
			MARI_TIMEOUT = setTimeout(function(){
				request(URL_JSON, function (err_2, response, data_2) {
					if (err_2) {
					console.log('Error reading points file: '+err_2);
					msg.channel.send('An unexpected error has occurred');
					return;
				}	
				var obj_2 = JSON.parse(data_2);
				var elem_2 = obj_2.find(function(item){return item["id"]==msg.author.id;});
				elem_2["zina"] += elem_2["mari"];
				elem_2["mari"] = 0;
				msg.channel.send('Mari is free to hire');
				objToWeb(obj_2,URL_JSON);
				});
			},MARI_DURATION);
			msg.channel.send(msg.author+', you have hired Mari for '+pay+' cookies. Duration: '+time+' minutes');
			objToWeb(obj,URL_JSON);
		}
		else {
			msg.channel.send(msg.author+', you must have cookies to hire');
			return;
		}
	});
}

function setLottery(client, msg, args) {
	var time = LOTTERY_DURATION;
	var total = 0;
	if (args.length != 0 && !isNaN(args[0])) time = args[0] * 60000;
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		for (x in obj) {
			total += obj[x]["cookies"];
		}
		var prize = Math.ceil(total*0.1);
		msg.channel.send('Lottery will commence in '+parseFloat(time)/60000+' minutes. Prize: '+prize);
		if (LOTTERY_TIMEOUT!=null) clearTimeout(LOTTERY_TIMEOUT);
		LOTTERY_TIMEOUT = setTimeout(function(){
			request(URL_JSON, function (err_2, response, data_2) {
				if (err_2) {
				console.log('Error reading points file: '+err_2);
				msg.channel.send('An unexpected error has occurred');
				return;
				}	
				var obj_2 = JSON.parse(data_2);
				var random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				var user = client.users.find(val => val.id === random_elem["id"]);
				while (random_elem["id"]=="Tycoon" || user==null || user.presence.status=='offline') {
					random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
					user = client.users.find(val => val.id === random_elem["id"]);
				}
				random_elem["cookies"]+=prize;
				objToWeb(obj_2,URL_JSON);
				msg.channel.send('<@'+random_elem["id"]+'> has won '+prize+' cookies from the lottery!');
			});
		}, time);
	});
}

function setTax(client) {
	var time = TAX_DURATION;
	var total = 0;
	var channel = client.channels.find(val => val.id === CY_CHANNEL_ID);	
	if (TAX_TIMEOUT!=null) clearTimeout(TAX_TIMEOUT);
	TAX_TIMEOUT = setInterval(function(){
		request(URL_JSON, function (err, response, data) {
			if (err) {
			console.log('Error reading points file: '+err);
			channel.send('An unexpected error has occurred');
			return;
			}	
			var obj = JSON.parse(data);
			obj = assignKings(obj);
			var total = 0;
			var kings = [];
			var higher = [];
			var lower = [];
			var kashin = obj.find(function(item){return item["id"]=="Kashin";});
			var owner = obj.find(function(item){return item["id"]=="Owner";});
			for (x in obj) {
				if (kashin && obj[x]["cookies"] > 0 && obj[x]["cookies"] >= kashin["cookies"] && obj[x]["id"] != "Kashin") {
					higher.push(obj[x]);
				}
				if (owner && obj[x]["cookies"] > 0 && obj[x]["cookies"] <= owner["cookies"] && obj[x]["id"] != "Owner") {
					lower.push(obj[x]);
				}
				if (obj[x]["king"]==1) {
					kings.push(obj[x]);
					continue;
				}
				total += Math.ceil(0.2*obj[x]["cookies"]);
				obj[x]["cookies"] = Math.floor(0.8*obj[x]["cookies"]);
			}
			if (higher.length != 0) {
				higher.sort(function(a,b){return a["cookies"]-b["cookies"];});
				kashin["cookies"] += Math.ceil(0.5*higher[0]["cookies"]);
				higher[0]["cookies"] = Math.floor(higher[0]["cookies"]/2);
			}
			if (lower.length != 0) {
				for (l in lower) {
					owner["cookies"] += Math.ceil(0.1*lower[l]["cookies"]);
					lower[l]["cookies"] = Math.floor(0.9*lower[l]["cookies"]);
				}
			}
			owner["cookies"] += Math.ceil(total/100);
			for (k in kings) {
				var king = obj.find(function(item){return item["id"]==kings[k]["id"]});
				king["cookies"]+=total;
			}
			objToWeb(obj,URL_JSON);
			channel.send("It's tax time! Pay your taxes to the tax king(s)");
		});
	}, time);
}

function setTycoon(client, msg, args) {
	var time = TYCOON_DURATION;
	var total = 0;
	var highest = 0;
	if (args.length != 0 && !isNaN(args[0])) time = args[0] * 60000;
	//if (parseFloat(time)/60000<5) time = 300000;
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]=="Tycoon";});
		for (x in obj) {
			var amount = obj[x]["cookies"];
			total += amount;
			//if (highest<amount) highest = amount;
		}
		var ratio = 0.3*(1-elem["cookies"]/total);
		msg.channel.send('Tycoon will target in '+parseFloat(time)/60000+' minutes at a '+ratio+' rate');
		if (TYCOON_TIMEOUT!=null) clearTimeout(TYCOON_TIMEOUT);
		TYCOON_TIMEOUT = setTimeout(function(){
			request(URL_JSON, function (err_2, response, data_2) {
				if (err_2) {
				console.log('Error reading points file: '+err_2);
				msg.channel.send('An unexpected error has occurred');
				return;
				}	
				var obj_2 = JSON.parse(data_2);
				var tycoon = obj_2.find(function(item){return item["id"]=="Tycoon";});
				var random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				while (random_elem["cookies"]==0 || random_elem["id"]=="Tycoon" || random_elem["tycoon"]>0) {
					random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				}
				var user = client.users.find(val => val.id === random_elem["id"]);
				if (user!=null) var name = user.username;
				else var name = "[NPC] "+random_elem["id"];
				if (random_elem["zina"]>0) {
					random_elem["zina"]--;
					msg.channel.send('Zina has protected '+name+' from the Tycoon');
					objToWeb(obj_2,URL_JSON);
					return;
				}
				var damage = Math.ceil(random_elem["cookies"]*ratio);
				var bonus = Math.ceil(0.05*tycoon["cookies"]);
				var hirer = obj_2.find(function(item){return item["tycoon"]>0});
				var target = hirer!=null ? hirer : tycoon;
				random_elem["cookies"]-=(damage+bonus);
				target["cookies"]+=(damage+bonus);
				if (hirer!=null) hirer["tycoon"]--;
				if (random_elem["cookies"]<0) random_elem["cookies"]=0;
				if (random_elem["waifu"]!="") tycoon["waifu"] = random_elem["waifu"];
				random_elem["waifu"]="";
				objToWeb(obj_2,URL_JSON);
				msg.channel.send("Tycoon has attacked "+name+" and stolen "+damage+" (bonus damage: "+bonus+") cookies (captured: "+tycoon["waifu"]+")");
			});
		}, time);
	});
}

function rollDice(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var bet = args[0];
		var dice = args[1];
		if (isNaN(bet)||isNaN(dice)||dice<1||dice>6) {
			msg.channel.send('Invalid format, use this format `!Cy roll 1000 3` (amount, number 1-6)');
			return;
		}
		var obj = JSON.parse(data);
		var num = Math.floor(Math.random()*6+1);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		if (elem==undefined) {
			msg.channel.send(msg.author+', you must have cookies to bet');
			return;
		};
		if (bet>elem["cookies"]) {
			msg.channel.send('You cannot bet more than you own');
			return;
		}
		if (num==dice) {
			elem["cookies"]+=bet*6;
			msg.channel.send(msg.author+', you guessed correctly! You win '+6*bet+' cookies!');
		}
		else {
			elem["cookies"]-=bet;
			msg.channel.send(msg.author+', you guessed incorrectly! The number was '+num+'. You lose '+bet+' cookies!');
		}
		objToWeb(obj,URL_JSON);
	});
}

function resetCookies(client, msg, args) {
	var obj = [];
	addNPC(obj,["Tycoon"]);
	addNPC(obj,["Zina"]);
	addNPC(obj,["Owner"]);
	addNPC(obj,["Mari"]);
	addNPC(obj,["Kashin"]);
	objToWeb(obj,URL_JSON);
	msg.channel.send('Cookies have been reset!');
}

function talkCy(client, msg, args) {
	if (msg.author.id!=OWNER_ID) throw 'Not owner';
	if (args[0]!=null && inList(args[0],TALK_ALLOWED_CHANNELS)) {
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

function isMNGWaifu(waifu) {
	return inList(waifu,MNG_WAIFUS);
}

function isNPC(npc) {
	return inList(npc,HIRE_LIST);
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

function optOut(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		if (elem == undefined) {
			msg.channel.send(msg.author+', you are not in the cookie competition');
			return;
		}
		removeFromList(elem,obj);
		objToWeb(obj,URL_JSON);
		msg.channel.send(msg.author+' has opted out of the cookie competition');
	});
}

function removeCookies(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		for (user in args) {
			var elem = obj.find(function(item){return item["id"]==args[user];});
			if (elem != undefined) {
				removeFromList(elem,obj);
			}	
		}
		objToWeb(obj,URL_JSON)
		msg.channel.send('Member(s) have been removed');
	});
}

function addPropertyString(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		try {
			for (user in obj) {
				obj[user][args[0]] = "";	
			}
			objToWeb(obj,URL_JSON);
			msg.channel.send('Property added');
		}
		catch (err){
			console.log(err);
			msg.channel.send('Error');
		}
	});
}

function addPropertyNumber(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		try {
			for (user in obj) {
				obj[user][args[0]] = 0;	
			}
			objToWeb(obj,URL_JSON);
			msg.channel.send('Property added');
		}
		catch (err){
			console.log(err);
			msg.channel.send('Error');
		}
	});
}

function removeProperty(client, msg, args) {
	request(URL_JSON, function (err, response, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		try {
			for (user in obj) {
				delete obj[user][args[0]];	
			}
			objToWeb(obj,URL_JSON)
			msg.channel.send('Property removed');
		}
		catch (err){
			console.log(err);
			msg.channel.send('Error');
		}
	});
}

function assignKings(obj) {
	var max = 0;
	for (x in obj) {
		obj[x]["king"] = 0;
		if (obj[x]["cookies"]>max) max = obj[x]["cookies"];
	}
	var kings = obj.filter(elem => elem["cookies"]==max);
	for (k in kings) {
		var elem = obj.find(function(item){return item["id"]==kings[k]["id"];});
		elem["king"]=1;
	}
	return obj;
}

function hireNPC(client, msg, args) {
	if (args.length == 0 || args[0] == undefined) {
		msg.channel.send(msg.author+', you must specify who to hire');
		return;
	}
	if (args[0].toLowerCase()=='zina') hireZina(client, msg, args);
	else if (args[0].toLowerCase()=='tycoon') hireTycoon(client, msg, args);
	//else if (args[0].toLowerCase()=='father') hireFather(client, msg, args);
	else if (args[0].toLowerCase()=='mari') hireMari(client, msg, args);
	else {
		msg.channel.send(msg.author+', you must specify who to hire');
		return;
	}
}

function addNPC(obj, args) {
	if (args.length == 0 || args[0] == undefined) {
		msg.channel.send(msg.author+', specify a name (Capitalized) to add a NPC');
		return obj;
	}
	elem = {};
	elem["id"] = toTitleCase(args[0]);
	elem["cookies"] = INIT_POINT;
	elem["waifu"] = "";
	elem["zina"] = 0;
	elem["rank"] = 0;
	elem["status"] = "";
	elem["king"] = 0;
	elem["owner"] = 0;
	elem["tycoon"] = 0;
	elem["father"] = 0;
	elem["mari"] = 0;
	obj.push(elem);		
	return obj;
}

function showAffection(client, msg) {
	var str = "";
	if (AFFECTION == 0) str = "|---------0---------|\n" + "          ^          ";
	else if (AFFECTION == 10) str = "|---------+---------0\n" + "                    ^";
	else if (AFFECTION == -10) str = "0---------+---------|\n" + "^                    ";
	else if (AFFECTION < 0) {
		str = "|";
		for (var i = -9; i<AFFECTION; i++) {
			str += "-";
		}
		str += "o";
		for (var i = AFFECTION+1; i<0; i++) {
			str += "-";
		}
		str += "+---------|\n";
		for (var i = 1; i < AFFECTION+11; i++) {
			str += " ";
		}
		str += "^";
		for (var i = AFFECTION+12; i < AFFECTION+22; i++) {
			str += " ";
		}
	}
	else if (AFFECTION > 0) {
		str = "|---------+";
		for (var i = 1; i<AFFECTION; i++) {
			str += "-";
		}
		str += "o";
		for (var i = AFFECTION+1; i<10; i++) {
			str += "-";
		}
		str += "|\n";
		for (var i = 1; i < AFFECTION+11; i++) {
			str += " ";
		}
		str += "^";
		for (var i = AFFECTION+12; i < AFFECTION+22; i++) {
			str += " ";
		}
	}
	msg.channel.send("```"+str+"```");
}

function raiseAffection(client, msg, amount=1) {
	AFFECTION = AFFECTION + amount;
	if (AFFECTION > 10) {
		AFFECTION = 10;
		boost(client, msg);
	}
}

function lowerAffection(client, msg, amount=1) {
	AFFECTION = AFFECTION - amount;
	if (AFFECTION < -10) AFFECTION = -10;
}

function calculateAffection(client, msg) {
	
}

function cookieOn(client) {
	COOKIE_STATUS = true;
	startUp(client);
}

function cookieOff() {
	COOKIE_STATUS = false;
	clearAllTimeouts(BOOST_TIMEOUT, LOTTERY_TIMEOUT, HOURLY_TIMEOUT, TYCOON_TIMEOUT, TAX_TIMEOUT, MARI_TIMEOUT, TIMER_TIMEOUT);
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