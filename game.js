var CY_CHANNEL_ID = '401660510816436224';
var map = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
var turns = 30;
var interval = null;

var player_list = [];
var position_fuu = [5,4]; // [row,col]
var position_1 = [[3,3],[0,1],[7,8]];
var position_2 = [[6,6],[4,3],[7,1]];
var position_3 = [[3,7],[0,6],[2,3]];
var position_4 = [[4,6],[5,5],[1,8]];

var taken_coords = [];
//var position_list = [position_1,position_2,position_3,position_4];

var player_1 = null;
var player_2 = null;
var player_3 = null;
var player_4 = null;
var winner = null;
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
	if (msg.content.startsWith('!fuugame')) {
		var coords = msg.content.split(' ').splice(1);
		if (coords == "") {
			msg.channel.send('Invalid coordinates. Please enter your coordinates like: !fuugame 1 10 2 9 4 5');
			return;
		}
		if (player_list.indexOf(msg.author.id)>-1) {
			msg.channel.send('You have already placed your coordinates');
			return;
		}
		if (player_list.length>=4) {
			msg.channel.send('Current game is full. Please wait till the next round');
			return;
		}
		if (coords.some(outOfBounds)) {
			msg.channel.send('Invalid coordinates. Please enter your coordinates like: !fuugame 1 10 2 9 4 5');
			return;
		}
		if (coordTaken(coords.slice(0,2)) || coordTaken(coords.slice(2,4)) || coordTaken(coords.slice(4,6))) {
			msg.channel.send('One of your pairs of coordinates has been taken. Please check and make sure every pair of coordinates are free');
			return;
		}
		coords = coords.map(function (num) {num-=1;});
		nextPlayer(msg,coords);
		taken_coords.push(coords.slice(0,2));
		taken_coords.push(coords.slice(2,4));
		taken_coords.push(coords.slice(4,6));
		msg.channel.send(msg.author+' has opted in as player '+player_list.length);
	}
}

function resetMap() {
	for (row in map) {
		for (col in map[row]) {
			map[row][col] = 0;
		}
	}
	setTraps();
}
function randomizePosition() {
	var col = Math.floor(Math.random() * 10);
	var row = Math.floor(Math.random() * 10);
	return [row,col];
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
	turns = 30;
	interval = setInterval(function() {
		resetMap();
		positionFuu();
		msg.edit(stringMap()).then(function () {
			if (winner) {
				msg.channel.send(winner+' has trapped Fuu and wins!');
				clearInterval(interval);
				interval = null;
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
			err = true;
			return;
		});

		if (turns<=0) {
			msg.channel.send('Fuu has successfully avoided all traps');
			clearInterval(interval);
			interval = null;
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
	}
	else if (map[position_fuu[0]][position_fuu[1]]>0) {
		if (turns > 20) {
			map[position_fuu[0]][position_fuu[1]] = -2;
		}
		else {
			map[position_fuu[0]][position_fuu[1]] = -3;
			getWinner();
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
	msg.channel.send('Please opt in within the next 15 seconds by typing: !fuugame col#1 row#1 col#2 row#2 col#3 row#3 (just the numbers)');
	client.on('message', message_callback);
	var playTimeout = setTimeout(function() {
		client.removeListener('message',message_callback);
		resetMap();
		position_fuu = randomizePosition();
		if (player_list.length) msg.channel.send(stringMap()).then(message => moveFuu(message));
		else msg.channel.send('Game has disbanded due to no players');
	},15000);
}

function nextPlayer(msg,coords) {
	player_list.push(msg.author.id);
	if (!player_1) {
		player_1 = msg.author;
		position_1.push(coords.slice(0,2));
		position_1.push(coords.slice(2,4));
		position_1.push(coords.slice(4,6));
	}
	else if (!player_2) {
		player_2 = msg.author;
		position_2.push(coords.slice(0,2));
		position_2.push(coords.slice(2,4));
		position_2.push(coords.slice(4,6));
	}
	else if (!player_3) {
		player_3 = msg.author;
		position_3.push(coords.slice(0,2));
		position_3.push(coords.slice(2,4));
		position_3.push(coords.slice(4,6));
	}
	else {
		player_4 = msg.author;
		position_4.push(coords.slice(0,2));
		position_4.push(coords.slice(2,4));
		position_4.push(coords.slice(4,6));
	}
}

function clearPlayers() {
	player_list = [];
	taken_coords = [];
	position_1 = [];
	position_2 = [];
	position_3 = [];
	position_4 = [];
	player_1 = null;
	player_2 = null;
	player_3 = null;
	player_4 = null;
}

function coordTaken(coord) {
	return taken_coords.some(function (item) {return item[0]==coord[0] && item[1]==coord[1];});
}

function outOfBounds(num) {
	return isNaN(num) || num < 1 || num > 10;
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
	var str = "Turns (invincible until 20): ```"+turns+"\n   1 2 3 4 5 6 7 8 9 10\n";
	for (row in map) {
		var num = Number(col) + 1;
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