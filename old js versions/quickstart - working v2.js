require('dotenv').config();
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var gAuth = require('./auth.js');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';
var SPREADSHEET_ID = '19HMhClbxcCvSDSa_rSArND2KWOPli8fEsRcoIUEPOQY';

var ROUTE_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy route 9 Nanao`";
var SEASON_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy season 1`\n`!Cy season 1 2`\n`!Cy season days 1 2`\n`!Cy season days 1 2 tickets 30`";
var CHECKPOINT_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy checkpoint 1`\n`!Cy checkpoint 1 2`\n`!Cy checkpoint tool 2 3`\n`!Cy checkpoint soul 2 4`";
var FINISH_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy finishontime args` (arguments: tickets, hearts, niney, hours left, total parts, parts completed, total soul, current soul, class default = D3)";
var COOKIE_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy cookies 20000`\n`!Cy cookies 20000 10000` (arguments: cookie goal, current cookies, niney, hearts, tickets, days, class default = D3)";
var TIME_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy timer flag(s)` (flags: cc - cookie collection, sale, oo - opening offer, seb - super early bird, " +
								"eb - early bird, potluck, giveaway, 2x, gacha, nf";
var SOUL_ERR = "No data found. Please make sure you use one of the following formats:\n" +
								"`!Cy soul` (arguments: soul goal, current soul, class rank default = D3, [OPT] total parts, [OPT] completed parts)";

// Load client secrets from a local file.

function callRequest(callback, args, msg) {
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	  if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	  }
	  // Authorize a client with the loaded credentials, then call the
	  // Google Sheets API.
	  authorize(JSON.parse(content), callback, args, msg);
	});
}

function callRequestHeroku(callback, args, msg) {
	gAuth.authorize().then((auth) => {callback(auth,args,msg);}
	)
    .catch((err) => {
        console.log('auth error', err);
    });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */	
 
function authorize(credentials, callback, args, msg) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback, args, msg);
    } else {

      oauth2Client.credentials = JSON.parse(token);
	  callback(oauth2Client,args,msg);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback, args, msg) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, args, msg);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/*
 spreadsheetId: 19HMhClbxcCvSDSa_rSArND2KWOPli8fEsRcoIUEPOQY
 */
 


module.exports = {callRequest, callRequestHeroku}
