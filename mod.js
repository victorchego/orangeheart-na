function msgHistoryPings(channel, userID, ratio = 0.5) {
	// Get messages and filter by user ID
	channel.fetchMessages()
	.then(messages => {
		user_msg = messages.filter(m => m.author.id === userID);
		return spamPings(user_msg, ratio);})
	.catch(console.error);
}

function spamPings(messages, ratio = 0.5) {
	total = 0;
	ping = 0;
	if (messages.length == 0) {
		return false;
	}
	for (var i = 0; i < messages.length; i++) {
		if (messages[i].mentions.everyone ||
		messages[i].mentions.members ||
		messages[i].mentions.roles ||
		messages[i].mentions.users) {
			ping++;
		}
		total++;
	}
	return ping/total > ratio;
}

module.exports = {msgHistoryPings};