var CY_CHANNEL_ID = '401660510816436224';
var map = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
var turns = 30;
var map_id = null;
var interval = null;
var playTimeout = null;

var player_tags = [];
var player_list = [];
var position_fuu = []; // [row,col]
var position_1 = [];
var position_2 = [];
var position_3 = [];
var position_4 = [];

var taken_coords = [];
//var position_list = [position_1,position_2,position_3,position_4];

var player_1 = null;
var player_2 = null;
var player_3 = null;
var player_4 = null;
var winner = null;

var status_str = null;
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

const message_callback = (msg) => {
	if (msg.content.toLowerCase().startsWith('!fuu')) {
		var coords = msg.content.split(' ').splice(1);
		coords = coords.map(function (num) {return num-1;});
		if (coords == "") {
			msg.channel.send(msg.author+' Please enter up to 5 pairs of coordinates only. Make sure there are no extra spaces');
			return;
		}
		if (coords.length > 10) {
			msg.channel.send(msg.author+' Please enter up to 5 pairs of coordinates only. Make sure there are no extra spaces');
			return;
		}
		if (coords.length % 2 != 0) {
			msg.channel.send(msg.author+' One of your coordinates is missing. Make sure you have an even set of numbers');
			return;
		}
		if (player_list.indexOf(msg.author.id)>-1) {
			msg.channel.send(msg.author+' You have already placed your coordinates');
			return;
		}
		if (player_list.length>=4) {
			msg.channel.send(msg.author+' Current game is full. Please wait till the next round');
			return;
		}
		if (coords.some(outOfBounds)) {
			msg.channel.send(msg.author+' Invalid coordinates. Please enter your coordinates like: !fuu 1 10 2 9 4 5');
			return;
		}
		for (var i = 0; i < coords.length/2; i++) {
			if (coordTaken(coords.slice(2*i,2*i+2))) {
				msg.channel.send('One of your pairs of coordinates has been taken. Please check and make sure every pair of coordinates are free');
				return;
			}
		}
		nextPlayer(msg,coords);
		msg.channel.fetchMessage(msg_id).then(message => message.edit(stringMap())).catch(error => {msg.channel.send("Error with Fuu game: "+error);});
	}
}

function resetMap() {
	for (row in map) {
		for (col in map[row]) {
			map[row][col] = 0;
		}
	}
	if(player_list.length) setTraps();
}
function randomizePosition() {
	var col = Math.floor(Math.random() * 10);
	var row = Math.floor(Math.random() * 10);
	return [row,col];
}

function randomizeValidPosition() {
	
}

function randomizeFuu() {
	var num = Math.floor((Math.random() * 4) + 1);
	switch (num) {
		case 1:
			map[4][4] = -1;
			position_fuu = [4,4];
		break;
		case 2:
			map[4][5] = -1;			
			position_fuu = [4,5];
		break;
		case 3:
			map[5][4] = -1;
			position_fuu = [5,4];
		break;
		case 4:
			map[5][5] = -1;
			position_fuu = [5,5];
		break;
		default:
			return;
		break;
	}
}

function moveFuu(msg) {
	var err = false;
	status_str = "Game in session";
	turns = 30;
	interval = setInterval(function() {
		resetMap();
		positionFuu();
		msg.edit(stringMap()).then(function () {
			if (winner) {
				msg.channel.send(winner+' has trapped Fuu and wins!');
				clearInterval(interval);
				interval = null;
				map_id = null;
				winner = null;
				return;
			}
			turns-=1;
		}).catch(error => {
			if (!err) {
				msg.channel.send("Error with Fuu game: "+error); 	
			}
			clearInterval(interval);
			interval = null;
			map_id = null;
			err = true;
			return;
		});

		if (turns<=0) {
			msg.channel.send('Fuu has successfully avoided all traps');
			clearInterval(interval);
			interval = null;
			map_id = null;
			return;
		}
	}, 2000);
}

function positionFuu() {
	var num = Math.random();
	if (num < 0.25) {
		if (position_fuu[0]<9) position_fuu[0]+=1;
		else position_fuu[0] = 0;
	}
	else if (num < 0.5) {
		if (position_fuu[0]>0) position_fuu[0]-=1;
		else position_fuu[0] = 9;
	}
	else if (num < 0.75) {
		if (position_fuu[1]<9) position_fuu[1]+=1;		
		else position_fuu[1] = 0;
	}
	else {
		if (position_fuu[1]>0) position_fuu[1]-=1;
		else position_fuu[1] = 9;
	}
	checkFuu();
}

function checkFuu() {
	if (map[position_fuu[0]][position_fuu[1]]==0) {
		map[position_fuu[0]][position_fuu[1]] = -1;
		if (turns<=0) {
			status_str = "Game over";
		}
	}
	else if (map[position_fuu[0]][position_fuu[1]]>0) {
		if (turns > 20) {
			map[position_fuu[0]][position_fuu[1]] = -2;
		}
		else {
			map[position_fuu[0]][position_fuu[1]] = -3;
			getWinner();
			status_str = "Game over";
		}
	}
}

function getWinner() {
	if (position_1.some(coord => coord[0]==position_fuu[0] && coord[1]==position_fuu[1])) winner = player_1;
	else if (position_2.some(coord => coord[0]==position_fuu[0] && coord[1]==position_fuu[1])) winner = player_2;
	else if (position_3.some(coord => coord[0]==position_fuu[0] && coord[1]==position_fuu[1])) winner = player_3;
	else if (position_4.some(coord => coord[0]==position_fuu[0] && coord[1]==position_fuu[1])) winner = player_4;
	else winner = null;
}

function botPlayer() {
	
}

function startFuuTrap(client,msg) {
	//var channel = client.channels.find(val => val.id = CY_CHANNEL_ID);
	if (!msg.channel) return;
	if (interval) {
		msg.channel.send("Cannot have multiple games running at once");
		return;
	}
	clearPlayers();
	getCoordinates(client,msg);
};

function getCoordinates(client,msg) {
	if (playTimeout) {
		msg.channel.send('Opt in the current game now!');
		return;
	}
	msg.channel.send('Please opt in within the next 30 seconds by typing: !fuu row#1 col#1 row#2 col#2 row#3 col#3 row#4 col#4 row#5 col#5 (just the numbers)');
	msg.channel.send(stringMap()).then(message => {msg_id = message.id;}).catch(error => {msg.channel.send("Error with Fuu game: "+error);});
	client.on('message', message_callback);
	playTimeout = setTimeout(function() {
		client.removeListener('message',message_callback);
		resetMap();
		position_fuu = randomizePosition();
		if (player_list.length) msg.channel.fetchMessage(msg_id).then(message => moveFuu(message)).catch(error => {msg.channel.send("Error with Fuu game: "+error);});
		else msg.channel.send('Game has disbanded due to no players');
		clearTimeout(playTimeout);
		playTimeout = null;
	},30000);
}

function nextPlayer(msg,coords) {
	player_list.push(msg.author.id);
	player_tags.push(msg.author);
	if (!player_1) {
		player_1 = msg.author;
		for (var i = 0; i < coords.length/2 && position_1.length < 5; i++) {
			position_1.push(coords.slice(2*i,2*i+2));
			taken_coords.push(coords.slice(2*i,2*i+2));
		}
	}
	else if (!player_2) {
		player_2 = msg.author;
		for (var i = 0; i < coords.length/2 && position_2.length < 5; i++) {
			position_2.push(coords.slice(2*i,2*i+2));
			taken_coords.push(coords.slice(2*i,2*i+2));
		}
	}
	else if (!player_3) {
		player_3 = msg.author;
		for (var i = 0; i < coords.length/2 && position_3.length < 5; i++) {
			position_3.push(coords.slice(2*i,2*i+2));
			taken_coords.push(coords.slice(2*i,2*i+2));
		}
	}
	else {
		player_4 = msg.author;
		for (var i = 0; i < coords.length/2 && position_4.length < 5; i++) {
			position_4.push(coords.slice(2*i,2*i+2));
			taken_coords.push(coords.slice(2*i,2*i+2));
		}
	}
	resetMap();
}

function clearPlayers() {
	player_list = [];
	player_tags = [];
	taken_coords = [];
	position_1 = [];
	position_2 = [];
	position_3 = [];
	position_4 = [];
	player_1 = null;
	player_2 = null;
	player_3 = null;
	player_4 = null;
	status_str = "Waiting for players...";
}

function coordTaken(coord) {
	return taken_coords.some(function (item) {return item[0]==coord[0] && item[1]==coord[1];});
}

function outOfBounds(num) {
	return isNaN(num) || num < 0 || num > 9;
}

function setTraps() {
	for (i in position_1) {
		map[position_1[i][0]][position_1[i][1]] = 1;
	}
	for (i in position_2) {
		map[position_2[i][0]][position_2[i][1]] = 2;
	}
	for (i in position_3) {
		map[position_3[i][0]][position_3[i][1]] = 3;
	}
	for (i in position_4) {
		map[position_4[i][0]][position_4[i][1]] = 4;
	}
}

function stringMap() {
	var str = "Status: "+status_str+"\nPlayers: "+player_tags+"\nTurns (invincible until 20): "+turns+"```\n   1 2 3 4 5 6 7 8 9 10\n";
	for (row in map) {
		var num = Number(row) + 1;
		if (row != 9) str += " " + num;
		else str += num;
		for (col in map[row]) {
			if (map[row][col] == 0) str += " ·";
			else if (map[row][col] == -1 && turns <= 20) str += " &"; //ready
			else if (map[row][col] == -1 && turns > 20) str += " O"; //ready
			else if (map[row][col] == -2) str += " O"; //not ready
			else if (map[row][col] == -3) str += " X"; //caught
			else if (map[row][col] == 1) str += " 1";
			else if (map[row][col] == 2) str += " 2";
			else if (map[row][col] == 3) str += " 3";
			else if (map[row][col] == 4) str += " 4";
		}
		str += "\n";
	}
	str += "```Winner: "+(winner ? winner : "none");
	return str;
}

module.exports = {startFuuTrap};