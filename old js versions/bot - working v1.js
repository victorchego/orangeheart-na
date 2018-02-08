var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

var Quickstart = require('./quickstart.js');

var cooldownList = [];
var cooldownMessageList = [];

var targetChannel = 382741253353242626;  // channel ID specific bot

var guide_default = 'Hewe is yaw guide!\nhttp://moeninjagirls.tumblr.com/tagged/walkthrough - Credits: ?';


/* LIST OF CHANNELS
382741253353242626 - general

*/

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
	// if (channelID != targetChannel) return;
	
	// if user warned of cooldown, ignore
	if (inList(userID, cooldownMessageList)) return;
	// if user on cooldown, warn	
	if (inList(userID, cooldownList)) {
		timeout(userID, channelID);
		if (!inList(userID, cooldownMessageList)) cooldownMessageList.push(userID);
		return;
		}
	
    if (message.substring(0, 4) == '!Cy ') {
        var args = message.substring(4).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
		
        switch(cmd) {
			case 'slap':
				var str = '';
				for (var i = 0; i < args.length; i++) {
					str += ' ';
					str += args[i];
				}
				bot.sendMessage({
					to: channelID, 
					message: '*Cy slaps'+ str + '*'
				});
			break;
			case 'hug':
				bot.sendMessage({
					to: channelID,
					message: '*Cy gives <@'+ userID +'> a **big** hug!*'
				});
			break;
			case 'hello':
			case 'hi':
				//logger.info(channelID);
				bot.sendMessage({
					to: channelID,
					message: 'Hewwo <@'+ userID +'> onii-chan!'
				});
			break;
			case 'bye':
				//logger.info(channelID);
				bot.sendMessage({
					to: channelID,
					message: 'Bye bye <@'+ userID +'> onii-chan! See ya soon! <3'
				});
			break;
			case 'goodmorning':
				bot.sendMessage({
					to: channelID,
					message: 'Good morning <@'+ userID +'> onii-chan! <3'
				});
			break;
			case 'goodnight':
				bot.sendMessage({
					to: channelID,
					message: 'Good night <@'+ userID +'> onii-chan! <3'
				});
			break;
			case 'route':
				Quickstart.callRequest(Quickstart.routeAnswer, args, userID, channelID, bot);
			break;
			case 'walkthrough':
				var str = walkthrough(args);
				bot.sendMessage({
					to: channelID,
					message: str
				});
			break;
			case 'season':
				if (args[0] == 'days') Quickstart.callRequest(Quickstart.seasonDays, args.slice(1), userID, channelID, bot);
				else {
					Quickstart.callRequest(Quickstart.seasonTotal, args, userID, channelID, bot);
				}
			break;
			case 'checkpoint':
				Quickstart.callRequest(Quickstart.checkpointList, args, userID, channelID, bot);
			break;
			case 'finishontime':
				Quickstart.callRequest(Quickstart.finishOnTime, args, userID, channelID, bot);
			break;
			case 'cookies':
				Quickstart.callRequest(Quickstart.cookieGoal, args, userID, channelID, bot);
			break;
			case 'dailyreset':
				var current_time = new Date();
				var reset_time = new Date(current_time.getFullYear(),current_time.getMonth(),current_time.getDate()+1,7,0,0);
				var time_diff = reset_time.getTime()-current_time.getTime();
				if (time_diff > (86400*1000)) time_diff -= (86400 * 1000);
				var minutes = Math.ceil(time_diff/(1000*60))%60;
				var hours = Math.floor(time_diff/(1000*3600));
				bot.sendMessage({
                    to: channelID,
                    message: "Time till the next daily reset is "+hours+" hours and "+minutes+" minutes"
                });
			break;
			case 'weeklyreset':
				var current_time = new Date();
				var saturday = current_time.getDay()==6 && current_time.getHours()>=17 ? current_time.getDate()+7 : current_time.getDate();
				var reset_time = new Date(current_time.getFullYear(),current_time.getMonth(),saturday,17,0,0);
				var time_diff = reset_time.getTime()-current_time.getTime();
				var minutes = Math.ceil(time_diff/(1000*60))%60;
				var hours = Math.floor(time_diff/(1000*3600));
				bot.sendMessage({
                    to: channelID,
                    message: "Time till the next weekly ninja fight reset is "+hours+" hours and "+minutes+" minutes"
                });
			break;
			case 'timer':
				Quickstart.callRequest(Quickstart.timer, args, userID, channelID, bot);
			break;
			case 'soul':
				Quickstart.callRequest(Quickstart.calculateSoul, args, userID, channelID, bot);
			break;
			case 'docs':
				bot.sendMessage({
                    to: channelID,
                    message: 'https://docs.google.com/document/d/17iMvW_UiVOfd22sau-EsbcFZ96XSxbFVJtRT2Z-NooE/'
                });
			break;
			case 'commands':
                bot.sendMessage({
                    to: channelID,
                    message: '`!Cy commands \n!Cy slaps userIDs \n!Cy hug \n!Cy hello \n!Cy bye \n!Cy goodmorning \n!Cy goodnight'+
							'\n!Cy route 9 Nanao \n!Cy walkthrough 3.5 \n!Cy season \n!Cy checkpoint \n!Cy finishontime' +
							'\n!Cy cookies \n!Cy dailyreset \n!Cy weeklyreset \n!Cy timer \n!Cy soul \n!Cy docs`'
                });
            break;
			case 'test':
				bot.sendMessage(message.author,"test");
			break;
			default:
				bot.sendMessage({
                    to: channelID,
                    message: 'Refer to `!Cy commands`'
                });
            break;
            // Just add any case commands if you want to..
         }
		 cooldownList.push(userID);
		 setTimeout(function(){
			removeFromList(userID, cooldownList);
			removeFromList(userID, cooldownMessageList);
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

function timeout(userID, channelID) {
	bot.sendMessage({
					to: channelID,
					message: '<@'+ userID +'>, please wait 3 seconds before issuing another command'
				});
};

/* function greetings(userID, channelID, cmd) {

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
		default: str = guide_default;
		break;
	}
	return str;
}