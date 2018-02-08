const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require('./auth.json');
var fs = require('fs');

var Quickstart = require('./quickstart.js');
var Func = require('./functions.js');

var cooldownList = [];
var cooldownMessageList = [];
var stealCooldownList = [];
var MNG_WAIFUS = ["akari", "enju", "myu", "ricka", "tengge", "yamabuki", "lily", "nanao"];

var TARGET_CHANNEL_ID = '382741253353242626';  // channel ID specific client
var OWNER_ID = '235263356397813762';

var FILE_NAME = 'points2.json';

var GUIDE_DEFAULT = 'Hewe is yaw guide!\nhttp://moeninjagirls.tumblr.com/tagged/walkthrough - Credits: ?';

var DEFAULT_POINT = 1000;
var POINT_AMOUNT = DEFAULT_POINT;
var BOOST_AMOUNT = 10000;
var INIT_POINT = 10000;

var BOOST_TIMEOUT = null;
var STEAL_TIMEOUT = null;
var LOTTERY_TIMEOUT = null;
var BOOST_DURATION = 3600000;

var LOTTERY_DURATION = 6000000;

/* LIST OF CHANNELS
382741253353242626 - general

*/

// Initialize Discord client

client.login(auth.token);

client.on('ready', () => {
    console.log('Connected');
    console.log('Logged in as: ');
    console.log(client.user.username + ' - ' + client.user.id);
	client.user.setGame('!Cy commands');
	clearAllTimeouts(BOOST_TIMEOUT, STEAL_TIMEOUT, LOTTERY_TIMEOUT);
	clearLists(cooldownList,cooldownMessageList,stealCooldownList);
	startUp();
});

client.on('error', (err) => {
	console.log('Error: '+err.message+' at line '+err.lineNumber+' of '+err.fileName);
});

client.on('message', (msg) => {
    // Our client needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	// if (channelID != TARGET_CHANNEL_ID) return;
	
    if (msg.content.startsWith('!Cy ') || msg.content.startsWith('!cy ') || msg.content.startsWith('!CY ') || msg.content.startsWith('!cY ')) {
		// if user warned of cooldown, ignore
		if (inList(msg.author, cooldownMessageList)) return;
		// if user on cooldown, warn	
		if (inList(msg.author, cooldownList)) {
			timeout(msg);
			if (!inList(msg.author, cooldownMessageList)) cooldownMessageList.push(msg.author);
			return;
		}
		
        var args = msg.content.substring(4).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd) {
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
				Quickstart.callRequest(Func.routeAnswer, args, msg);
				msg.channel.send("Details have been sent "+msg.author);
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
                msg.author.send('```!Cy commands \n!Cy slaps userIDs \n!Cy hug \n!Cy hello \n!Cy bye \n!Cy goodmorning \n!Cy goodnight'+
							'\n!Cy route 9 Nanao \n!Cy walkthrough 3.5 \n!Cy season \n!Cy checkpoint \n!Cy finishontime' +
							'\n!Cy cc \n!Cy dailyreset \n!Cy weeklyreset \n!Cy timer \n!Cy soul \n!Cy docs' +
							'\n!Cy cookies \n!Cy leaderboard \n!Cy claim \n!Cy steal userID \n!Cy donate userID```').catch(function(){console.log('Cannot send to '+msg.author.username);});
				msg.channel.send("Details have been sent "+msg.author);
            break;
			case 'boost':
				if (msg.author.id==OWNER_ID) {
					boost(client, msg);
					if(!isNaN(args[0])) {
						if (BOOST_TIMEOUT!= null) clearTimeout(BOOST_TIMEOUT);
						POINT_AMOUNT = parseInt(args[0]);
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
					str += '\n'+client.users.find(val => val.id === arr[x][0]).username+' has '+arr[x][1]+' cookies. Waifu: '+toTitleCase(arr[x][2]);
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
				donateCookies(client, msg, args);
			break;
			case 'lottery':
				if (msg.author.id==OWNER_ID) {
					setLottery(client, msg, args);
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
	msg.channel.send(msg.author+', please wait 3 seconds before issuing another command');
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
		setTimeout(hourlyPoints,time_diff, client);
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
			if (client.users.find(val => val.id === obj[x]["id"]).presence.status!='offline') {
				obj[x]["cookies"] += BOOST_AMOUNT;
			}
		}
		objToFile(obj);
	});
}

function hourlyPoints(client, msg) {
	boost(client, msg);
	console.log('Hourly cookies given!');
	setInterval(function(){
		boost(client, msg);
		console.log('Hourly cookies given!');
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
			msg.channel.send('You must specify one valid target with a tag.'+
							'\nSteal max efficiency at 80% your target. Min efficiency at 10% your target.');
			return;
		}
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){return item["id"]==msg.mentions.users.firstKey();});
		if (elem != undefined) {
			if (target != undefined) {
				if (elem["id"]==target["id"]) {
					msg.channel.send('You cannot steal from yourself');
					return;
				}
				var cookie_ratio = parseFloat(elem["cookies"])/target["cookies"];
				if (cookie_ratio < 0.1) {
					msg.channel.send("You must have at least 10% of your target's cookies");
					return;
				}
				if (cookie_ratio >= 0.8) cookie_ratio = 0.8;
				var steal_bonus = Math.ceil(0.05*(elem["cookies"]));
				var steal_amount = Math.ceil(0.05*(target["cookies"]));
				var steal_cooldown = 10+90*(0.8-cookie_ratio)/0.7;
				elem["cookies"]+=(steal_bonus+steal_amount);
				target["cookies"]-=steal_amount;
				if (target["cookies"]<0) target["cookies"]=0;
				msg.channel.send(msg.author+' has stolen '+steal_amount+' (bonus: '+steal_bonus+') cookies from '+client.users.find(val => val.id === target["id"]).username+' (cooldown '+Math.ceil(steal_cooldown)+' minutes)');
				stealCooldownList.push(msg.author);
				msg.author.send('Your steal cooldown will expire in '+Math.ceil(steal_cooldown)+' minutes').catch(function(){console.log('Cannot send to '+msg.author.username);});
				STEAL_TIMEOUT = setTimeout(function(){
					removeFromList(msg.author, stealCooldownList);
					msg.author.send('Your steal cooldown has expired').catch(function(){console.log('Cannot send to '+msg.author.username);});
				},steal_cooldown*60000);
			}
			else {
				msg.channel.send('Target must have cookies');
				return;
			}
		}
		else {
			msg.channel.send(msg.author.id+', you must have cookies to steal');
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
			msg.channel.send('You must specify one valid target with a tag.');
			return;
		}
		var obj = JSON.parse(data);
		var elem = obj.find(function(item){return item["id"]==msg.author.id;});
		var target = obj.find(function(item){return item["id"]==msg.mentions.users.firstKey();});
		if (elem != undefined) {
			if (target != undefined) {
				if (elem["id"]==target["id"]) {
					msg.channel.send('You cannot donate to yourself');
					return;
				}
				var donate_bonus = Math.ceil(0.05*(elem["cookies"]));
				var donate_amount = Math.ceil(0.05*(target["cookies"]));
				if (donate_amount >= elem["cookies"]) donate_amount = elem["cookies"];
				elem["cookies"]-=donate_amount;
				target["cookies"]+=(donate_amount+donate_bonus);
				if (elem["cookies"]<0) elem["cookies"]=0;
				msg.channel.send(msg.author+' has donated '+donate_amount+' (bonus: '+donate_bonus+') cookies to '+client.users.find(val => val.id === target["id"]).username);
			}
			else {
				msg.channel.send('Target must have cookies');
				return;
			}
		}
		else {
			msg.channel.send(msg.author.id+', you must have cookies to donate');
			return;
		}
		objToFile(obj);
	});
}

function claimWaifu(client, msg, waifu) {
	if (!isMNGWaifu(waifu)) {
		msg.channel.send('Cannot claim a non MNG waifu');
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
			msg.channel.send('You already have claimed this waifu');
			return;
		}
		if (elem != undefined) {
			if (target == undefined) {
				elem["waifu"] = waifu;
				msg.channel.send('<@'+msg.author.id+'> has claimed '+toTitleCase(waifu));
			}
			else {
				if (elem["cookies"]>=target["cookies"]) {
					elem["waifu"] = waifu;
					target["waifu"] = "";
					msg.channel.send('<@'+msg.author.id+'> has reclaimed '+toTitleCase(waifu));
				}
				else {
					msg.channel.send('<@'+msg.author.id+'>, you cannot claim the waifu with fewer cookies than the current waifu owner');
				}
			}
		}
		else {
			msg.channel.send('<@'+msg.author.id+'>, you must have cookies to claim a waifu');
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
		LOTTERY_TIMEOUT = setTimeout(function(){
			fs.readFile(FILE_NAME, 'utf8', function (err_2, data_2) {
				if (err_2) {
				console.log('Error reading points file: '+err_2);
				msg.channel.send('An unexpected error has occurred');
				return;
				}	
				var obj_2 = JSON.parse(data_2);
				var random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				while (client.users.find(val => val.id === random_elem["id"]).presence.status=='offline') {
					random_elem = obj_2[Math.floor(Math.random()*obj_2.length)];
				}
				random_elem["cookies"]+=prize;
				objToFile(obj_2);
				msg.channel.send('<@'+random_elem["id"]+'> has won '+prize+' cookies from the lottery!');
			});
		}, time);
	});
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
		if (x != null) x = null;
	}
}

function toTitleCase(str)
{
	if (str != null) return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}