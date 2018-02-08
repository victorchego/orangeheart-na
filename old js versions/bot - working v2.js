const Discord = require("discord.js");
const client = new Discord.Client();
const auth = require('./auth.json');
var fs = require('fs');

var Quickstart = require('./quickstart.js');
var Func = require('./functions.js');

var cooldownList = [];
var cooldownMessageList = [];

var targetChannel = '382741253353242626';  // channel ID specific client

var guide_default = 'Hewe is yaw guide!\nhttp://moeninjagirls.tumblr.com/tagged/walkthrough - Credits: ?';

var OWNER_ID = '235263356397813762';
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
	startUp();
});

client.on('message', (msg) => {
    // Our client needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	// if (channelID != targetChannel) return;
	
	// if user warned of cooldown, ignore
	if (inList(msg.author, cooldownMessageList)) return;
	// if user on cooldown, warn	
	if (inList(msg.author, cooldownList)) {
		timeout(msg);
		if (!inList(msg.author, cooldownMessageList)) cooldownMessageList.push(msg.author);
		return;
		}
	
    if (msg.content.startsWith('!Cy ')) {
        var args = msg.content.substring(4).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd) {
			case 'slap':
				var str = '';
				for (var i = 0; i < args.length; i++) {
					str += ' ';
					str += args[i];
				}
				msg.channel.send('*At the request of '+msg.author+', Cy slaps'+ str + '*');
			break;
			case 'hug':
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
				if (args[0] == 'days') Quickstart.callRequest(Func.seasonDays, args.slice(1), msg);
				else {
					Quickstart.callRequest(Func.seasonTotal, args, msg);
				}
			break;
			case 'checkpoint':
				Quickstart.callRequest(Func.checkpointList, args, msg);
			break;
			case 'finishontime':
				Quickstart.callRequest(Func.finishOnTime, args, msg);
			break;
			case 'cookies':
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
							'\n!Cy cookies \n!Cy dailyreset \n!Cy weeklyreset \n!Cy timer \n!Cy soul \n!Cy docs' +
							'\n!Cy point \n!Cy leaderboard```');
				msg.channel.send("Details have been sent "+msg.author);
            break;
			case 'off':
				if (msg.author.id==OWNER_ID) {
					msg.channel.send('Operation suspended');
					
				};
				msg.channel.send('Cannot obey command');
			break;
			case 'point':
				fs.readFile('points.json', 'utf8', function (err, data) {
				if (err) {
					console.log('Error reading points file: '+err);
					msg.channel.send('An unexpected error has occurred');
					return;
				}	
				var obj = JSON.parse(data);
				if (obj.hasOwnProperty(msg.author.id)) obj[msg.author.id] += 1;
				else obj[msg.author.id] = 1;
				var new_data = JSON.stringify(obj);
				fs.writeFile('points.json', new_data, function (err_2) {
				if (err_2) {
					console.log('Error writing points file: '+err_2);
					return;
				}
				msg.channel.send('You have earned one point '+msg.author+'. Total: '+obj[msg.author.id]);
				});
				});
			break;
			case 'leaderboard':
				fs.readFile('points.json', 'utf8', function (err, data) {
				if (err) {
					console.log('Error reading points file: '+err);
					msg.channel.send('An unexpected error has occurred');
					return;
				}	
				var str = '';
				var obj = JSON.parse(data);
				var arr = [];
				for (x in obj){
					arr.push([x,obj[x]]);
				}
				arr.sort(function(a,b){return b[1]-a[1];});
				for (x in arr) {
					str += '\n'+client.users.find(val => val.id === arr[x][0]).username+' has '+arr[x][1]+' points.';
				}
				msg.channel.send('```'+str+'```');
				});
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
		default: str = guide_default;
		break;
	}
	return str;
}

function startUp() {
	var current_time = new Date();
	if (current_time.getMinutes()!=0 && current_time.getSeconds()!=0) {
		var next_hour = new Date(current_time.getFullYear(),current_time.getMonth(),current_time.getDate(),current_time.getHours+1,0,0);
		var time_diff = next_hour.getTime()-current_time.getTime();
		setTimeout(hourlyPoints,time_diff);
	}
	else hourlyPoints();
}

function hourlyPoints() {
	setInterval(function(){
		fs.readFile('points.json', 'utf8', function (err, data) {
			if (err) {
				console.log('Error reading points file: '+err);
				msg.channel.send('An unexpected error has occurred');
				return;
			}	
			var obj = JSON.parse(data);
			for(x in obj) {
				if (client.users.find(val => val.id === x).presence.status!='offline') {
					obj[x] += 100;
				}
			}
			var new_data = JSON.stringify(obj);
			fs.writeFile('points.json', new_data, function (err_2) {
				if (err_2) {
					console.log('Error writing points file: '+err_2);
					return;
				}
			});
		});
		console.log('Hourly points given!');
	},3600000);
}