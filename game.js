var CY_CHANNEL_ID = '401660510816436224';

function startFuuTrap(client) {
	var channel = client.channels.find(val => val.id = CY_CHANNEL_ID);
	if (!channel) return;
	channel.send('Test success');
};

module.exports = {startFuuTrap};