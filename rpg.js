var CY_CHANNEL_ID = '401660510816436224';

var item_steal = {
	"steal_1":"",
	"steal_2":"",
	"steal_3":""
};

var item_atk = {
	"atk_1":"",
	"atk_2":"",
	"atk_3":""
};

var item_def = {
	"def_1":"",
	"def_2":"",
	"def_3":""
};

function checkPlayer(msg,obj) {
	return msg.author.id in obj;
}

function addPlayer(msg,obj) { //{<id>:{"user":@user,"cookies":0,"atk":0,"def":0,"steal":0,"item":{"item_atk":{},"item_def":{},"item_steal":{}},"merc":{<merc1>:0,<merc2>:3,...}, "waifu": ""}}
	if (checkPlayer(msg,obj)) return;
	var elem = {};
	elem["user"] = msg.author;
	elem["cookies"] = 0;
	elem["atk"] = 0;
	elem["def"] = 0;
	elem["steal"] = 0;
	elem["item"] = {"item_atk":{},"item_def":{},"item_steal":{}};
	elem["merc"] = {};
	elem["waifu"] = "";
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
	str += "\nItem List: "+obj[msg.author.id]["item"]["item_atk"]+obj[msg.author.id]["item"]["item_def"]+obj[msg.author.id]["item"]["item_steal"];
	str += "\nHired Mercenaries: "+obj[msg.author.id]["merc"];
	str += "\Waifu: "+obj[msg.author.id]["waifu"];
	str += '```';
	msg.channel.send(str);
}

function calcAtk(msg, obj) {
	var items = obj[msg.author.id]["item"];
	
}

function calcDef(msg, obj) {
	
}

function calcSteal(msg, obj) {
	
}

function handleMessage(msg) {
	if (msg.channel.id != CY_CHANNEL_ID) return;
	
}

module.exports = {handleMessage};