var CY_CHANNEL_ID = '401660510816436224';
var map = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];

var first_player = null;
var second_player = null;
var third_player = null;
var fourth_player = null;
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

function resetMap() {
	for (col in map) {
		for (row in map[col]) {
			map[col][row] = 0;
		}
	}
}

function randomizeFuu() {
	var num = Math.floor((Math.random() * 4) + 1);
	switch (num) {
		case 1:
			map[4][4] = -1;
		break;
		case 2:
			map[4][5] = -1;
		break;
		case 3:
			map[5][4] = -1;
		break;
		case 4:
			map[5][5] = -1;
		break;
		default:
			return;
		break;
	}
}

function moveFuu(msg) {
	var seconds = 0;
	while (seconds < 60) {
		randomizeFuu();
		//msg.edit(stringMap()).catch(error => channel.send("Error with Fuu game: "+error));
		seconds++;
	}
}

function startFuuTrap(client) {
	var channel = client.channels.find(val => val.id = CY_CHANNEL_ID);
	if (!channel) return;
	resetMap();
	randomizeFuu();
	channel.send(stringMap()).then(message => moveFuu(message)).catch(error => channel.send("Error with Fuu game: "+error));
};

function stringMap() {
	var str = "```\n   1 2 3 4 5 6 7 8 9 10\n";
	for (col in map) {
		var num = Number(col) + 1;
		if (col != 9) str += " " + num;
		else str += num;
		for (row in map[col]) {
			if (map[col][row] == 0) str += " ·";
			else if (map[col][row] == -1) str += " &";
			else if (map[col][row] == 1) str += " 1";
			else if (map[col][row] == 2) str += " 2";
			else if (map[col][row] == 3) str += " 3";
			else if (map[col][row] == 4) str += " 4";
		}
		str += "\n";
	}
	str += "```";
	return str;
}

module.exports = {startFuuTrap};