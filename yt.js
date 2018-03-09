var RADIO_CHANNEL_ID = '348328771797123073';
var ANIME_CHANNEL_ID = '335150939029766144';
var CY_CHANNEL_ID = '401660510816436224';

var TARGET_CHANNEL_ID = ANIME_CHANNEL_ID;

const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1 };

//var stream = null;
//var dispatcher = null;

var queue = [];

const voiceCallback = (oldMember, newMember) => {
	let newUserChannel = newMember.voiceChannel;
	let oldUserChannel = oldMember.voiceChannel;
	if (oldUserChannel === undefined && newUserChannel !== undefined) {
    // User Joins a voice channel
		return;
	} 
	else if(newUserChannel === undefined){
    // User leaves a voice channel
		if (radio_channel.members.length == 1) {
			radio_channel.leave();
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
		radio_channel.leave();
		queue = [];
	}
	else if (cmd == "search") {
		
	}
	else if (cmd == "queue") {
		msg.channel.send('Queued videos: '+queue);
		return;
	}
	else if (cmd == "play") {
		if (args.length == 0) {
			msg.channel.send('Invalid parameters.');
			return;
		}
		if (!ytdl.validateURL(args[0])) {
			msg.channel.send('Command format is !yt play [youtube_url]');
			return;
		}
		if (radio_channel.members.find(val => val.id == client.user.id) || queue.length != 0) {
			queue.push(args[0]);
			msg.channel.send('Added to queue');
			return;
		}
		else {
			radio_channel.join()
			  .then(connection => {
				var stream = ytdl(args[0], { filter : 'audioonly' });
				var dispatcher = connection.playStream(stream, streamOptions);
				msg.channel.send('Playing in the designated voice channel');
				//client.on('voiceStatusUpdate', voiceCallback);
				dispatcher.on('end',reason=> {
					if (queue.length == 0) radio_channel.leave();
					else {
						var url = queue.shift();
						stream = ytdl(url, { filter : 'audioonly' });
						dispatcher = connection.playStream(stream, streamOptions);
					}
				});
			  })
			  .catch(console.error);
		}
	}
}

module.exports = {handleMessage};