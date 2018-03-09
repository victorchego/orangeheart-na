var RADIO_CHANNEL_ID = '348328771797123073';
var ANIME_CHANNEL_ID = '335150939029766144';
var CY_CHANNEL_ID = '401660510816436224';

var TARGET_CHANNEL_ID = ANIME_CHANNEL_ID;

const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };

var stream = null;
var dispatcher = null;

var queue = [];

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
	
	if (cmd == "disconnect" || cmd == "dc") {
		if (dispatcher) {
			dispatcher.end();
			dispatcher = null;
		}
		radio_channel.leave();
		queue = [];
		return;
	}
	else if (cmd == "search" || cmd == "s") {
		
	}
	else if (cmd == "queue" || cmd == "q") {
		msg.channel.send('Queued videos: ```\n'+queue+'```');
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
			queue.push(args[0]);
			msg.channel.send('Video queued');
		}
		else {
			radio_channel.join().then(connection => {
				client.on('voiceStateUpdate', voiceCallback);
				stream = ytdl(args[0], { filter : 'audioonly' });
				dispatcher = connection.playStream(stream, streamOptions);
				dispatcher.on("end", reason => {
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
		cy_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
		return;
	}
	if (queue.length == 0) {
		dispatcher = null;
		radio_channel.leave();
		cy_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
	}
	if (queue.length == 1) {
		var url = queue.shift();
		stream = ytdl(url, { filter : 'audioonly' });
		dispatcher = radio_channel.connection.playStream(stream, streamOptions);
		dispatcher.on("end", reason => {
			dispatcher = null;
			radio_channel.leave();
			cy_channel.guild.client.removeListener('voiceStateUpdate',voiceCallback);
		});
	}
	else {
		var url = queue.shift();
		stream = ytdl(url, { filter : 'audioonly' });
		dispatcher = radio_channel.connection.playStream(stream, streamOptions);
		dispatcher.on("end", reason => {
			playNext(radio_channel);
		});
	}
}

module.exports = {handleMessage};