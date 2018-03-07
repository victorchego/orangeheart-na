var CY_CHANNEL_ID = '401660510816436224';

function checkPlayer(msg,obj) {
	return msg.author.id in obj;
}

function addPlayer(msg,obj) { //{<id>:{"user":@user,"cookies":0,"atk":0,"def":0,"steal":0,"item":{<item1>:1,<item2>:5,...},"merc":{<merc1>:0,<merc2>:3,...}}}
	if (checkPlayer(msg,obj)) return;
	var elem = {};
	elem["user"] = msg.author;
	elem["cookies"] = 0;
	elem["atk"] = 0;
	elem["def"] = 0;
	elem["steal"] = 0;
	elem["item"] = {};
	elem["merc"] = {};
	obj.push(elem);
}

function removePlayer(msg,obj) {
	if (!checkPlayer(msg,obj)) return;
	delete obj[msg.author.id];
}

function viewProfile(msg,obj) {
	if (!checkPlayer(msg,obj)) return;
	var str = '';
	str += msg.author+"'s profile:```";
	str += "\nCookies: "+obj[msg.author.id]["cookies"];
	str += "\nAttack: "+calcAtk(msg,obj);
	str += "\nDefense: "+calcDef(msg,obj);
	str += "\nSteal: "+calcSteal(msg,obj);
	str += "\nItem List: "+obj[msg.author.id]["item"];
	str += "\nHired Mercenaries: "+obj[msg.author.id]["merc"];
	str += '```';
	msg.channel.send(str);
}

function calcAtk(msg, obj) {
	
}

function calcDef(msg, obj) {
	
}

function calcSteal(msg, obj) {
	
}

function handleMessage(msg) {
	if (msg.channel.id != CY_CHANNEL_ID) return;
	
}

module.exports = {handleMessage};