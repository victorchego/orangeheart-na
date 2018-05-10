var RADIO_VOICE_ID = '348328771797123073';
var ANIME_CHANNEL_ID = '335150939029766144';
var CY_CHANNEL_ID = '401660510816436224';
var RADIO_TEXT_ID = '348328808975302658';

var SELECTED_SERVER = null;
var SELECTED_CHANNEL = null;
var SELECTED_VOICE = null;

var SELECTED_VOICE = RADIO_VOICE_ID;

var BANNED_CHANNELS = [];

var YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

var opts = {
	maxResults: 10,
	type: 'video',
	key: YOUTUBE_API_KEY
};

const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };
const search = require('youtube-search');

var stream = null;
var dispatcher = null;

var searchTimeout = null;
var loop = false;

var queue = [];
var titles = [];

var result_data = null;

const voiceCallback = (oldMember, newMember) => {
	var newUserChannel = newMember.voiceChannel;
	var oldUserChannel = oldMember.voiceChannel;
	var radio_channel = newMember? newMember.client.channels.find(val => val.id == SELECTED_VOICE) : oldMember.client.channels.find(val => val.id == SELECTED_VOICE);
	if (!radio_channel) return;
	//var cy_channel = radio_channel.connection.client.channels.find(val => val.id == SELECTED_CHANNEL);
	if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User Joins a voice channel
		return;
	} 
	else if(newUserChannel === undefined){
    // User leaves a voice channel
		if (radio_channel.members.size == 1) {
			dispatcher.end();
			dispatcher = null;
			radio_channel.leave();
			queue = [];
			titles = [];
			radio_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
			return;
		}
	}
}

const messageCallback = (msg) => {
	if (msg.content.toLowerCase().startsWith('!sel')) {
		var num = msg.content.substring(4).trim();
		if (outOfBounds(num)) {
			msg.channel.send('You must specify a number (0-9)');
			return;
		}
		var radio_channel = msg.client.channels.find(val => val.id == SELECTED_VOICE);
		addLink(radio_channel, msg, msg.client, result_data[num]["link"]);
		msg.client.removeListener('message', messageCallback);
		clearTimeout(searchTimeout);
		searchTimeout = null;
		result_data = null;
	}
}

function outOfBounds(num) {
	return isNaN(num) || num < 0 || num > 9;
}

function handleMessage(msg, client) {
	selectChannel(msg);
	if (isBannedChannel(msg.client.id)) return;
	if (dispatcher && dispatcher.player.voiceConnection.channel.id != SELECTED_VOICE) {
		msg.channel.send("Cy's radio is being used elsewhere");
		return;
	}
	var radio_channel = client.channels.find(val => val.id == SELECTED_VOICE);
	
	if (!radio_channel) {
		msg.channel.send('Designated voice channel not found.');
		return;
	}
	if (radio_channel.members.size == 0) {
		msg.channel.send('Please join the <#'+radio_channel.id+'> voice channel before executing commands.');
		return;
	}
	if (!radio_channel.members.find(val => val.id == msg.author.id)) {
		msg.channel.send('Please join the <#'+radio_channel.id+'> voice channel before executing commands.');
		return;
	}
	
	var args = msg.content.substring(4).split(' ');
    var cmd = args[0];
    args = args.splice(1);
	
	if (cmd == "disconnect" || cmd == "dc" || cmd == "stop") {
		queue = [];
		titles = [];
		if (dispatcher) {
			dispatcher.end();
			dispatcher = null;
		}
		radio_channel.leave();
		return;
	}
	else if (cmd == "commands") {
		msg.channel.send("```!yt commands/queue/q/next/n/disconnect/dc/stop/loop/l\n!yt play/p/search/s youtube_url/search_words```");
		return;
	}
	else if (cmd == "search" || cmd == "s") {
		processSearch(client, msg, args);
	}
	else if (cmd == "queue" || cmd == "q") {
		var str = 'Queued videos: ```\n';
		for (t in titles) {
			str += titles[t]+'\n';
		}
		str += '```';
		msg.channel.send(str);
		return;
	}
	else if (cmd == "remove" || cmd == "r") {
		removeResult(msg, args);
	}
	else if (cmd == "loop" || cmd == "l") {
		loop = !loop;
		var str = loop ? "Loop enabled for queue" : "Loop disabled for queue";
		msg.channel.send(str);
	}
	else if (cmd == "next" || cmd == "n") {
		if (queue.length == 0) {
			msg.channel.send('Queue is empty');
			return;
		}
		if (dispatcher) {
			dispatcher.end();
			return;
		}
		else {
			msg.channel.send('Video stream is empty');
			return;
		}
	}
	else if (cmd == "play" || cmd == "p") {
		if (args.length == 0) {
			msg.channel.send('Invalid parameters.');
			return;
		}
		if (!ytdl.validateURL(args[0])) {
			firstResult(client,msg,args);
			return;
		}
		addLink(radio_channel, msg, client, args[0]);
		return;
	}
	else {
		msg.channel.send('Undefined command. Type !yt commands');
		return;
	}
}

function addLink(radio_channel, msg, client, url) {
	if (radio_channel.connection) {
		ytdl.getInfo(url,{ filter : 'audioonly' }, function (err, info) {
			if (err) msg.channel.send('Error getting video info');
			else {
				msg.channel.send('Video queued: '+info["title"]);
				queue.push(url);
				titles.push(info["title"]);
			}
		});
		return;
	}
	else {
		radio_channel.join().then(connection => {
			loop = false;
			ytdl.getInfo(url,{ filter : 'audioonly' }, function (err, info) {
			if (err) msg.channel.send('Error getting video info');
			else {
				msg.channel.send('Now playing in the <#'+SELECTED_VOICE+'> voice channel: '+info["title"]);
				}
			});
			client.on('voiceStateUpdate', voiceCallback);
			stream = ytdl(url, { filter : 'audioonly' });
			dispatcher = connection.playStream(stream, streamOptions);
			dispatcher.once("end", reason => {
				playNext(radio_channel);
			});
		}).catch(err => console.log(err));
	}
}

function playNext(radio_channel) {
	var text_channel = radio_channel.connection.client.channels.find(val => val.id == SELECTED_CHANNEL);
	if (radio_channel.members.size == 1) {
		text_channel.send('Queue terminated due to no listeners');
		dispatcher.end();
		dispatcher = null;
		radio_channel.leave();
		queue = [];
		titles = [];
		radio_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
		return;
	}
	if (queue.length == 0) {
		radio_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
		text_channel.send('Queue has terminated');
		dispatcher = null;
		radio_channel.leave();
	}
	else {
		var url = queue.shift();
		var title = titles.shift();
		if (loop) {
			queue.push(url);
			titles.push(title);
		}
		text_channel.send('Now playing: '+title);
		stream = ytdl(url, { filter : 'audioonly' });
		dispatcher = radio_channel.connection.playStream(stream, streamOptions);
		dispatcher.once("end", reason => {
			playNext(radio_channel);
		});
	}
}

function processSearch(client,msg,args) {
	if (searchTimeout) {
		msg.channel.send('There is an active search. Please wait until that search is finished');
		return;
	}
	var str = args.join(' ');
	search(str, opts, function(err, results) {
		if (err) {
			msg.channel.send('Search encountered error');
			return console.log(err);
		}
		var titles = msg.author+" Type !sel (0-9) to select your video ex. !sel 4 (30 seconds) \n```";
		for (i in results) {
			titles += i + ". " + results[i]["title"] + "\n";
		}
		result_data = results;
		if (!results.length) {
			msg.channel.send('There is no search result');
			return;
		}
		titles += "```";
		msg.channel.send(titles);
		client.on('message', messageCallback);
		searchTimeout = setTimeout(function() {
			msg.channel.send('Search timed out. Please try again.');
			client.removeListener('message', messageCallback);
			clearTimeout(searchTimeout);
			searchTimeout = null;
			result_data = null;
		},30000);
	});
}

function firstResult(client,msg,args) {
	var str = args.join(' ');
	var radio_channel = client.channels.find(val => val.id == SELECTED_VOICE);
	search(str, {maxResults: 1, type: 'video', key: YOUTUBE_API_KEY}, function(err, results) {
		if (results[0]) addLink(radio_channel,msg,client,results[0]["link"]);
		else msg.channel.send('Invalid search result. Please try again.');
	});
}

function removeResult(msg,args) {
	var str = args.join(' ');
	var i = titles.findIndex(val => val.toLowerCase().includes(str));
	if (i) {
		queue.splice(i,1);
		titles.splice(i,1);
		msg.channel.send("Removed item from queue");
	}
	else {
		msg.channel.send("Could not find item from queue. Please make sure the spelling(s) are correct");
	}
}

function selectChannel(msg) {
	SELECTED_CHANNEL = msg.channel.id;
	SELECTED_SERVER = msg.guild.id;
	switch (SELECTED_SERVER) {
		case '382741253353242624': //test server
			SELECTED_VOICE = '382741253353242628';
			break;
		case '443328437642461184': //izo server
			SELECTED_VOICE = '443328437642461188';
			break;
		default:
			SELECTED_VOICE = RADIO_VOICE_ID;
			break;
	}
}

function isBannedChannel(id) {
	return BANNED_CHANNELS.find(val => val.id == id);
}

module.exports = {handleMessage};