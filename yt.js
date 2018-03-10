var RADIO_CHANNEL_ID = '348328771797123073';
var ANIME_CHANNEL_ID = '335150939029766144';
var CY_CHANNEL_ID = '401660510816436224';

var TARGET_CHANNEL_ID = RADIO_CHANNEL_ID;

const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };

var stream = null;
var dispatcher = null;

var queue = [];
var titles = [];

const voiceCallback = (oldMember, newMember) => {
	var newUserChannel = newMember.voiceChannel;
	var oldUserChannel = oldMember.voiceChannel;
	var radio_channel = newMember? newMember.client.channels.find(val => val.id == TARGET_CHANNEL_ID) : oldMember.client.channels.find(val => val.id == TARGET_CHANNEL_ID);
	var cy_channel = radio_channel.connection.client.channels.find(val => val.id == CY_CHANNEL_ID);
	if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User Joins a voice channel
		return;
	} 
	else if(newUserChannel === undefined){
    // User leaves a voice channel
		if (!radio_channel) return;
		if (radio_channel.members.size == 1) {
			dispatcher.end();
			dispatcher = null;
			radio_channel.leave();
			queue = [];
			titles = [];
			cy_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
			return;
		}
	}
}

function handleMessage(msg, client) {
	if (msg.channel.id != CY_CHANNEL_ID) return;
	var radio_channel = client.channels.find(val => val.id == TARGET_CHANNEL_ID);
	
	if (!radio_channel) {
		msg.channel.send('Designated voice channel not found.');
		return;
	}
	if (radio_channel.members.size == 0) {
		msg.channel.send('Please join the designated voice channel before executing commands.');
		return;
	}
	if (!radio_channel.members.find(val => val.id == msg.author.id)) {
		msg.channel.send('Please join the designated voice channel before executing commands.');
		return;
	}
	
	var args = msg.content.substring(4).split(' ');
    var cmd = args[0];
    args = args.splice(1);
	
	if (cmd == "disconnect" || cmd == "dc" || cmd == "stop") {
		if (dispatcher) {
			dispatcher.end();
			dispatcher = null;
		}
		radio_channel.leave();
		queue = [];
		titles = [];
		return;
	}
	else if (cmd == "commands") {
		msg.channel.send("```!yt commands/queue/q/next/n/disconnect/dc/stop\n!yt play/p youtube_url```");
		return;
	}
	else if (cmd == "search" || cmd == "s") {
		
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
	else if (cmd == "next" || cmd == "n") {
		if (queue.length == 0) {
			msg.channel.send('Queue is empty');
			return;
		}
		if (dispatcher) {
			dispatcher.end();
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
			msg.channel.send('Command format is !yt play [youtube_url]');
			return;
		}
		if (radio_channel.connection) {
			ytdl.getInfo(args[0],{ filter : 'audioonly' }, function (err, info) {
				if (err) msg.channel.send('Error getting video info');
				else {
					msg.channel.send('Video queued: '+info["title"]);
					queue.push(args[0]);
					titles.push(info["title"]);
				}
			});
			return;
		}
		else {
			radio_channel.join().then(connection => {
				ytdl.getInfo(args[0],{ filter : 'audioonly' }, function (err, info) {
				if (err) msg.channel.send('Error getting video info');
				else {
					msg.channel.send('Now playing in the <#'+TARGET_CHANNEL_ID+'> voice channel: '+info["title"]);
					}
				});
				client.on('voiceStateUpdate', voiceCallback);
				stream = ytdl(args[0], { filter : 'audioonly' });
				dispatcher = connection.playStream(stream, streamOptions);
				dispatcher.once("end", reason => {
					playNext(radio_channel);
				});
			}).catch(err => console.log(err));
		}
	}
}

function playNext(radio_channel) {
	var cy_channel = radio_channel.connection.client.channels.find(val => val.id == CY_CHANNEL_ID);
	if (radio_channel.members.size == 1) {
		cy_channel.send('Queue terminated due to no listeners');
		dispatcher.end();
		dispatcher = null;
		radio_channel.leave();
		queue = [];
		titles = [];
		cy_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
		return;
	}
	if (queue.length == 0) {
		cy_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
		cy_channel.send('Queue has terminated');
		dispatcher = null;
		radio_channel.leave();
	}
	else {
		var url = queue.shift();
		var title = titles.shift();
		cy_channel.send('Skipping to: '+title);
		stream = ytdl(url, { filter : 'audioonly' });
		dispatcher = radio_channel.connection.playStream(stream, streamOptions);
		dispatcher.once("end", reason => {
			console.log('next2');
			playNext(radio_channel);
		});
	}
}

module.exports = {handleMessage};