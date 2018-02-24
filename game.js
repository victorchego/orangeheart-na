var CY_CHANNEL_ID = '401660510816436224';
var map = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
/*
   1 2 3 4 5 6 7 8 9 10 
 1 · · · · · · · · · ·
 2 · · · · · · · · · ·
 3 · · · · · · · · · ·
 4 · · · · · · · · · ·
 5 · · · · · · · · · ·
 6 · · · · · · · · · ·
 7 · · · · · · · · · ·
 8 · · · · · · · · · ·
 9 · · · · · · · · · ·
10 · · · · · · · · · ·
*/

function startFuuTrap(client) {
	var channel = client.channels.find(val => val.id = CY_CHANNEL_ID);
	if (!channel) return;
	var str = stringMap();
	channel.send(str);
	channel.send('done');
};

function stringMap() {
	var str = "```\n   1 2 3 4 5 6 7 8 9 10\n";
	for (col in map) {
		if (col != 9) str += " " ++ parseInt(col+1);
		else str += "10";
		for (row in map[col]) {
			str += " ·";
		}
		str += "\n";
	}
	str += "```";
	return str;
}

module.exports = {startFuuTrap};