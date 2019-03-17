// BITWISE FLAGS
SPAM_PING = 001;
SPAM_PASTE = 010;
SPAM_MINUTE = 100;

function msgHistoryPings(msg, limit = 50, ratio = 0.5, repeat = 5, count = 20) {
	// Get messages and filter by user ID
	guild = msg.guild;
	channel = msg.channel;
	userID = msg.author.id;
	
	if (msg.author.bot) return;
	
	channel.fetchMessages({limit: limit})
	.then(messages => {
		user_msg = messages.filter(m => m.author.id === userID);
		flags = 0 | SPAM_PING | SPAM_PASTE | SPAM_MINUTE;
		spam = false;
		reason = "";
		if (flags & SPAM_PING) {
			result = spamPings(user_msg) && messages.keyArray().length >= 10;
			spam = result || spam;
			if (result) reason += "Ping spam. ";
		}
		if (flags & SPAM_PASTE) {
			result = spamPaste(user_msg);
			spam = result || spam;
			if (result) reason += "Paste spam. ";
		}
		if (flags & SPAM_MINUTE) {
			result = spamMinute(user_msg);
			spam = result || spam;
			if (result) reason += "Minute spam. ";
		}
		if (spam) {
			console.log(`${msg.author} has been flagged. Reason(s): ${reason}`);
			msg.channel.send(`${msg.author} has been flagged. Reason(s): ${reason}`);
			role = msg.guild.roles.find(val => val.name === 'Flagged');
			if (role) msg.member.addRole(role);
		}
		//console.log(spamPings(user_msg));
		//console.log(spamPaste(user_msg));
		//console.log(spamMinute(user_msg));
		})
	.catch(console.error);
}

function spamPings(messages, limit = 50, ratio = 0.5) {
	total = 0;
	ping = 0;
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.mentions.everyone ||
		m.mentions.roles.size > 0 ||
		m.mentions.users.size > 0) {
			ping++;
		}
		total++;
	}
	return ping/total >= ratio;
}

function spamPaste(messages, repeat = 5) {
	total = 0;
	spam = 0;
	phrase = "";
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.content != phrase) {
			phrase = m.content;
			spam = 0;
		}
		else {
			spam++;
			if (spam >= repeat) {
				return true;
			}
		}
		total++;
	}
	return spam >= repeat;
}

function spamMinute(messages, count = 20) {
	total = 0;
	time = 0;
	mids = messages.keyArray();
	if (mids.length == 0) {
		return false;
	}
	for (var mix in mids) {
		m = messages.get(mids[mix]);
		if (m.createdTimestamp >= time) {
			time = m.createdTimestamp;
		}
		if (Math.abs(m.createdTimestamp-time) <= 60000) {
			total++;
			if (total >= count) {
				return true;
			}
		}
		else {
			total = 0;
		}
		
	}
	return total >= count;
}

module.exports = {msgHistoryPings};