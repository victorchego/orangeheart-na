const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require('./auth.json');
var fs = require('fs');

var Quickstart = require('./quickstart.js');
var Func = require('./functions.js');

var cooldownList = [];
var cooldownMessageList = [];
var stealCooldownList = [];
var donateCooldownList = [];
var MNG_WAIFUS = ["akari", "enju", "myu", "ricka", "tengge", "yamabuki", "lily", "nanao"];

var TARGET_CHANNEL_ID = '382741253353242626';  // channel ID specific client
var OWNER_ID = '235263356397813762';
var BOT_CHANNEL_ID = '348324130258419715';
var CY_CHANNEL_ID = '401660510816436224';

var FILE_NAME = 'points2.json';

var GUIDE_DEFAULT = 'Hewe is yaw guide!\nhttp://moeninjagirls.tumblr.com/tagged/walkthrough - Credits: ?';

var DEFAULT_POINT = 10;
var POINT_AMOUNT = DEFAULT_POINT;
var BOOST_AMOUNT = 100;
var INIT_POINT = 1000;

var BOOST_TIMEOUT = null;
var STEAL_TIMEOUT = null;
var DONATE_TIMEOUT = null;
var LOTTERY_TIMEOUT = null;
var HOURLY_TIMEOUT = null;
var TYCOON_TIMEOUT = null;
var BOOST_DURATION = 3600000;
var TYCOON_DURATION = 300000;
var LOTTERY_DURATION = 300000;

var BANNED_CHANNELS = ['380045950879793153','348328808975302658','264149019524071424','384028008375123978','264149324831784960',
						'264149176974049282','324224381054353411','319871113045737472'];
var ALLOWED_CHANNELS = ['264145505452425227','264149249103495169','348324130258419715','401660510816436224'];
/* LIST OF CHANNELS
382741253353242626 - general / asdf
348324130258419715 - bot-palace / MNG
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
	clearAllTimeouts(BOOST_TIMEOUT, STEAL_TIMEOUT, DONATE_TIMEOUT, LOTTERY_TIMEOUT, HOURLY_TIMEOUT, TYCOON_TIMEOUT);
	clearLists(cooldownList,cooldownMessageList,stealCooldownList);
	startUp();
	//client.channels.find(val => val.id === CY_CHANNEL_ID).send('I AM ALIVEEEEE!');
});

client.on('error', (err) => {
	console.log('Error: '+err.message+' at line '+err.lineNumber+' of '+err.fileName);
});

client.on('reconnecting', () => {
	var time = new Date();
	console.log('Attempting to reconnect at '+time);
	startUp();
});

client.on('message', (msg) => {
    // Our client needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	// if (channelID != TARGET_CHANNEL_ID) return;
	
    if (msg.content.startsWith('!Cy ') || msg.content.startsWith('!cy ') || msg.content.startsWith('!CY ') || msg.content.startsWith('!cY ')) {
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
		
		if (inList(msg.channel.id,BANNED_CHANNELS) && msg.channel.type=='text') {
			msg.channel.send('This channel does not support commands');
			msg.delete().catch(console.error);
			return;
		}
		
        var args = msg.content.substring(4).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd.toLowerCase()) {
			case 'shoot':
			case 'shoots':
				var str = '';
				for (var i = 0; i < args.length; i++) {
					str += ' ';
					str += args[i];
				}
				msg.channel.send('*At the request of '+msg.author+', Cy targets and shoots a laser blast at '+ str + '*');
			break;
			case 'slap':
			case 'slaps':
				var str = '';
				for (var i = 0; i < args.length; i++) {
					str += ' ';
					str += args[i];
				}
				msg.channel.send('*At the request of '+msg.author+', Cy slaps'+ str + '*');
			break;
			case 'hug':
			case 'hugs':
				msg.channel.send('*Cy gives '+ msg.author +' a **big** hug!*');
			break;
			case 'tickle':
			case 'tickles':
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
					Quickstart.callRequest(Func.routeAnswer, args, msg);
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
				if (args[0] == 'days') Quickstart.callRequest(Func.seasonDays, args.slice(1), msg);
				else {
					Quickstart.callRequest(Func.seasonTotal, args, msg);
				}
			break;
			case 'checkpoint':
			case 'checkpoints':
				Quickstart.callRequest(Func.checkpointList, args, msg);
			break;
			case 'finishontime':
				Quickstart.callRequest(Func.finishOnTime, args, msg);
			break;
			case 'cc':
				Quickstart.callRequest(Func.cookieGoal, args, msg);
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
				Quickstart.callRequest(Func.timer, args, msg);
			break;
			case 'soul':
				Quickstart.callRequest(Func.calculateSoul, args, msg);
			break;
			case 'docs':
				msg.channel.send('https://docs.google.com/document/d/17iMvW_UiVOfd22sau-EsbcFZ96XSxbFVJtRT2Z-NooE/');
			break;
			case 'commands':
                msg.author.send('```!Cy commands \n!Cy shoot userIDs \n!Cy slaps userIDs \n!Cy hug \n!Cy tickle \n!Cy hello \n!Cy bye \n!Cy goodmorning \n!Cy goodnight'+
							'\n!Cy route 9 Nanao \n!Cy walkthrough 3.5 \n!Cy season \n!Cy checkpoint \n!Cy finishontime' +
							'\n!Cy cc \n!Cy dailyreset \n!Cy weeklyreset \n!Cy timer \n!Cy soul \n!Cy docs' +
							'\n!Cy cookies \n!Cy leaderboard \n!Cy claim \n!Cy steal userID \n!Cy donate userID \n!Cy roll```').then(function(){
								msg.channel.send("Details have been sent "+msg.author);
								}).catch(function(){
									console.log('Cannot send to '+msg.author.username);
									msg.channel.send("Your DM has been disabled. Please enable DMs so I can send details "+msg.author);
									});
            break;
			case 'boost':
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
				fs.readFile(FILE_NAME, 'utf8', function (err, data) {
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
					obj.push(elem);
					msg.channel.send(msg.author+' has entered the cookie competition! Total: '+elem["cookies"]);
				}
				objToFile(obj);
				});
			break;
			case 'leaderboards':
			case 'leaderboard':
				fs.readFile(FILE_NAME, 'utf8', function (err, data) {
				if (err) {
					console.log('Error reading points file: '+err);
					msg.channel.send('An unexpected error has occurred');
					return;
				}	
				var str = 'Leaderboard:';
				var obj = JSON.parse(data);
				var arr = [];
				for (x in obj){
					arr.push([obj[x]["id"],obj[x]["cookies"], obj[x]["waifu"]]);
				}
				arr.sort(function(a,b){return b[1]-a[1];});
				for (x in arr) {
					var user = client.users.find(val => val.id === arr[x][0]);
					var name = user != null ? user.username : "[BOT] "+arr[x][0];
					str += '\n'+name+' has '+arr[x][1]+' cookies. Waifu: '+toTitleCase(arr[x][2]);
				}
				msg.channel.send('```'+str+'```');
				});
			break;
			case 'claim':
				if (args.length != 0 && args[0] != undefined) claimWaifu(client, msg, args[0].toLowerCase());
				else msg.channel.send('You must specify one valid target with a tag');
			break;
			case 'steal':
				if (!inList(msg.author,stealCooldownList)) {
					stealCookies(client, msg, args);
				}
				else {
					msg.author.send('You must wait until your steal cooldown expires').catch(function(){console.log('Cannot send to '+msg.author.username);});
				}
			break;
			case 'donate':
				if (!inList(msg.author,donateCooldownList)) {
					donateCookies(client, msg, args);
				}
				else {
					msg.author.send('You must wait until your donate cooldown expires').catch(function(){console.log('Cannot send to '+msg.author.username);});
				}
			break;
			case 'lottery':
				if (msg.author.id==OWNER_ID) {
					setLottery(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
			break;
			case 'tycoon':
				if (msg.channel.id==CY_CHANNEL_ID) {
					setTycoon(client, msg, args);
				}
				else msg.channel.send('This command cannot be used here');
			break;
			case 'roll':
				rollDice(client, msg, args);
			break;
			case 'reset':
				if (msg.author.id==OWNER_ID) {
					resetCookies(client, msg, args);
				}
				else msg.channel.send('Cannot obey command');
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
				if (msg.author.id==OWNER_ID && msg.channel.id==CY_CHANNEL_ID) {
					purgeDelete(client, msg, args);
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

function isUserID(obj, userID){
	return obj['id'] === userID;
}

function startUp() {
	var current_time = new Date();
	if (current_time.getMinutes()!=0 || current_time.getSeconds()!=0) {
		var next_hour = new Date(current_time.getFullYear(),current_time.getMonth(),current_time.getDate(),current_time.getHours()+1,0,0);
		var time_diff = next_hour.getTime()-current_time.getTime();
		if (HOURLY_TIMEOUT!=null) clearTimeout(HOURLY_TIMEOUT);
		HOURLY_TIMEOUT = setTimeout(hourlyPoints,time_diff, client);
	}
	else hourlyPoints(client, null);
}

function boost(client, msg) {
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
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
		objToFile(obj);
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
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
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
			return item["id"]==msg.mentions.users.firstKey();
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
				var cookie_ratio = parseFloat(elem["cookies"])/target["cookies"];
				if (cookie_ratio < 0.1) {
					msg.channel.send(msg.author+", you must have at least 10% of your target's cookies");
					return;
				}
				if (cookie_ratio >= 0.8) cookie_ratio = 0.8;
				var steal_bonus = Math.ceil(0.05*(elem["cookies"]));
				var steal_amount = Math.ceil(0.05*(target["cookies"]));
				var steal_cooldown = 10+90*(0.8-cookie_ratio)/0.7;
				elem["cookies"]+=(steal_bonus+steal_amount);
				target["cookies"]-=steal_amount;
				if (target["cookies"]<0) target["cookies"]=0;
				var user = client.users.find(val => val.id === target["id"]);
				var name = user != null ? user.username : "[BOT] "+target["id"];
				msg.channel.send(msg.author+' has stolen '+steal_amount+' (bonus: '+steal_bonus+') cookies from '+name+' (cooldown '+Math.ceil(steal_cooldown)+' minutes)');
				stealCooldownList.push(msg.author);
				msg.author.send('Your steal cooldown will expire in '+Math.ceil(steal_cooldown)+' minutes').catch(function(){console.log('Cannot send to '+msg.author.username);});
				STEAL_TIMEOUT = setTimeout(function(){
					removeFromList(msg.author, stealCooldownList);
					msg.author.send('Your steal cooldown has expired').catch(function(){console.log('Cannot send to '+msg.author.username);});
				},steal_cooldown*60000);
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
		objToFile(obj);
	});
}

function donateCookies(client, msg, args) {
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
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
				var cookie_ratio = parseFloat(elem["cookies"])/target["cookies"];
				if (cookie_ratio < 0.1) {
					msg.channel.send(msg.author+", you must have at least 10% of your target's cookies");
					return;
				}
				var donate_bonus = Math.ceil(0.05*(elem["cookies"]));
				var donate_amount = Math.ceil(0.05*(target["cookies"]));
				var donate_cooldown = 30;
				if (donate_amount >= elem["cookies"]) donate_amount = elem["cookies"];
				if (donate_bonus > donate_amount) donate_bonus = donate_amount;
				elem["cookies"]-=donate_amount;
				target["cookies"]+=(donate_amount+donate_bonus);
				if (elem["cookies"]<0) elem["cookies"]=0;
				var user = client.users.find(val => val.id === target["id"]);
				var name = user != null ? user.username : "[BOT] "+target["id"];
				msg.channel.send(msg.author+' has donated '+donate_amount+' (bonus: '+donate_bonus+') cookies to '+name+' (cooldown '+Math.ceil(donate_cooldown)+' minutes)');
				donateCooldownList.push(msg.author);
				msg.author.send('Your donate cooldown will expire in '+Math.ceil(donate_cooldown)+' minutes').catch(function(){console.log('Cannot send to '+msg.author.username);});
				DONATE_TIMEOUT = setTimeout(function(){
					removeFromList(msg.author, donateCooldownList);
					msg.author.send('Your donate cooldown has expired').catch(function(){console.log('Cannot send to '+msg.author.username);});
				},donate_cooldown*60000);
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
		objToFile(obj);
	});
}

function claimWaifu(client, msg, waifu) {
	if (!isMNGWaifu(waifu)) {
		msg.channel.send(msg.author+', you cannot claim a non MNG waifu');
		return;
	}
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){return item["waifu"]==waifu;});
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
		objToFile(obj);
	});
}

function setLottery(client, msg, args) {
	var time = LOTTERY_DURATION;
	var total = 0;
	if (args.length != 0 && !isNaN(args[0])) time = args[0] * 60000;
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
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
			fs.readFile(FILE_NAME, 'utf8', function (err_2, data_2) {
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
				objToFile(obj_2);
				msg.channel.send('<@'+random_elem["id"]+'> has won '+prize+' cookies from the lottery!');
			});
		}, time);
	});
}

function setTycoon(client, msg, args) {
	var time = TYCOON_DURATION;
	var total = 0;
	var highest = 0;
	if (args.length != 0 && !isNaN(args[0])) time = args[0] * 60000;
	if (parseFloat(time)/60000<5) time = 300000;
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		for (x in obj) {
			var amount = obj[x]["cookies"];
			total += amount;
			if (highest<amount) highest = amount;
		}
		var ratio = 0.2*highest/total;
		msg.channel.send('Tycoon will target in '+parseFloat(time)/60000+' minutes at a '+ratio+' rate');
		if (TYCOON_TIMEOUT!=null) clearTimeout(TYCOON_TIMEOUT);
		TYCOON_TIMEOUT = setTimeout(function(){
			fs.readFile(FILE_NAME, 'utf8', function (err_2, data_2) {
				if (err_2) {
				console.log('Error reading points file: '+err_2);
				msg.channel.send('An unexpected error has occurred');
				return;
				}	
				var obj_2 = JSON.parse(data_2);
				var tycoon = obj_2.find(function(item){return item["id"]=="Tycoon";});
				var random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				while (random_elem["cookies"]==0 || random_elem["id"]=="Tycoon") {
					random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				}
				var damage = Math.ceil(random_elem["cookies"]*ratio);
				var bonus = Math.ceil(0.05*tycoon["cookies"]);
				random_elem["cookies"]-=(damage+bonus);
				tycoon["cookies"]+=damage;
				if (random_elem["cookies"]<0) random_elem["cookies"]=0;
				if (random_elem["waifu"]!="") tycoon["waifu"] = random_elem["waifu"];
				random_elem["waifu"]="";
				objToFile(obj_2);
				var user = client.users.find(val => val.id === random_elem["id"]);
				if (user!=null) var name = user.username;
				else var name = "User "+random_elem["id"];
				msg.channel.send("Tycoon has attacked "+name+" and stolen "+damage+" (bonus damage: "+bonus+") cookies (captured: "+tycoon["waifu"]+")");
			});
		}, time);
	});
}

function rollDice(client, msg, args) {
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
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
		objToFile(obj);
	});
}

function resetCookies(client, msg, args) {
	fs.readFile(FILE_NAME, 'utf8', function (err, data) {
		if (err) {
			console.log('Error reading points file: '+err);
			if (msg!=null) msg.channel.send('An unexpected error has occurred');
			return;
		}	
		var obj = JSON.parse(data);
		for(x in obj) {
			obj[x]["cookies"] = INIT_POINT;
			obj[x]["waifu"] = "";
		}
		objToFile(obj);
		msg.channel.send('Cookies have been reset!');
	});
}

function talkCy(client, msg, args) {
	if (msg.author.id!=OWNER_ID) throw 'Not owner';
	if (args[0]!=null && inList(args[0],ALLOWED_CHANNELS)) {
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

function objToFile(obj) {
	var new_data = JSON.stringify(obj);
	fs.writeFile(FILE_NAME, new_data, function (err) {
		if (err) {
			console.log('Error writing points file: '+err);
			return;
		}
	});
}

function isMNGWaifu(waifu) {
	return inList(waifu,MNG_WAIFUS);
}

function clearLists(args) {
	for (x in args) {
		x = [];
	}
}

function clearAllTimeouts(args) {
	for (x in args) {
		if (x != null) clearTimeout(x);
	}
}

function backupFile(filename) {
/* 	File fileMetadata = new File();
	fileMetadata.setName(filename);
	java.io.File filePath = new java.io.File(filename);
	FileContent mediaContent = new FileContent("js/json", filePath);
	File file = driveService.files().create(fileMetadata, mediaContent)
    .setFields("id")
    .execute();
	System.out.println("File ID: " + file.getId()); */
}

function rebootFile(filename) {

}

function purgeDelete(client, msg, args) {
	if (!args || isNaN(parseInt(args[0]))) args = [51];
	msg.channel.fetchMessages({limit: args[0]+1}).then(messages => msg.channel.bulkDelete(messages));
}

function toTitleCase(str)
{
	if (str != null) return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}