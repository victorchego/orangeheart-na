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
		var radio_channel = client.channels.find(val => val.id == TARGET_CHANNEL_ID);
		if (radio_channel == oldUserChannel) {
			if (radio_channel.members.length == 0) {
				dispatcher.end();
			}
		}
	}
}

function handleMessage(msg, client) {
	if (msg.channel.id != CY_CHANNEL_ID) return;
	
	var args = msg.content.substring(4).split(' ');
    var cmd = args[0];
    args = args.splice(1);
	
	if (args.length == 0) {
		msg.channel.send('Invalid parameters.');
		return;
	}
	if (cmd == "stop") {
		try {
			radio_channel.leave();
		}
		catch (err) {
			console.log(error);
		}
	}
	else if (cmd == "search") {
		
	}
	else if (cmd == "play") {
		var radio_channel = client.channels.find(val => val.id == TARGET_CHANNEL_ID);
		if (!radio_channel) {
			msg.channel.send('Designated voice channel not found.');
			return;
		}
		if (radio_channel.members.size == 0) {
			msg.channel.send('Please join the designated voice channel before executing commands.');
			return;
		}
		if (!ytdl.validateURL(args[0])) {
			msg.channel.send('Command format is !yt play [youtube_url]');
			return;
		}
		else {
			radio_channel.join()
			  .then(connection => {
				const stream = ytdl(args[0], { filter : 'audioonly' });
				const dispatcher = connection.playStream(stream, streamOptions);
				msg.channel.send('Playing in the radio voice channel');
				/*client.on('voiceStatusUpdate', voiceCallback);
				dispatcher.once('end', reason => {
					connection.disconnect();
					radio_channel.leave();
					client.removeListener('voiceStatusUpdate', voiceCallback);
					return;
				})
				connection.once('disconnect', () => {
					dispatcher.end();
					radio_channel.leave();
					client.removeListener('voiceStatusUpdate', voiceCallback);
					return;
				});*/
			  })
			  .catch(console.error);
		}
	}
}

module.exports = {handleMessage};