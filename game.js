var CY_CHANNEL_ID = '401660510816436224';
var map = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
var turns = 30;
var interval = null;

var position_fuu = [5,4]; // [col,row]
var position_1 = [[3,3],[0,1],[7,8]];
var position_2 = [[6,6],[4,3],[7,1]];
var position_3 = [[3,7],[0,6],[2,3]];
var position_4 = [[4,6],[5,5],[1,8]];
//var position_list = [position_1,position_2,position_3,position_4];

var player_1 = 'a';
var player_2 = 'b';
var player_3 = 'c';
var player_4 = 'd';
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

function resetMap() {
	for (col in map) {
		for (row in map[col]) {
			map[col][row] = 0;
		}
	}
	setTraps();
}
function randomizePosition() {
	var col = Math.floor(Math.random() * 10);
	var row = Math.floor(Math.random() * 10);
	return [col,row];
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
				clearInterval(interval);
				interval = null;
			}
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
	resetMap();
	position_fuu = randomizePosition();
	if (!interval) msg.channel.send(stringMap()).then(message => moveFuu(message));
	else msg.channel.send("Cannot have multiple games running at once");
};

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
	var str = "```Turns (invincible until 20): "+turns+"\n   1 2 3 4 5 6 7 8 9 10\n";
	for (col in map) {
		var num = Number(col) + 1;
		if (col != 9) str += " " + num;
		else str += num;
		for (row in map[col]) {
			if (map[col][row] == 0) str += " ·";
			else if (map[col][row] == -1 && turns <= 20) str += " &"; //ready
			else if (map[col][row] == -1 && turns > 20) str += " O"; //ready
			else if (map[col][row] == -2) str += " O"; //not ready
			else if (map[col][row] == -3) str += " X"; //caught
			else if (map[col][row] == 1) str += " 1";
			else if (map[col][row] == 2) str += " 2";
			else if (map[col][row] == 3) str += " 3";
			else if (map[col][row] == 4) str += " 4";
		}
		str += "\n";
	}
	str += "Winner: "+(winner ? winner : "none")+"\n```";
	return str;
}

module.exports = {startFuuTrap};