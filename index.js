var whatsappObj = require('whatsapp-web.js');
var qrcode = require('qrcode-terminal');
var fs = require('fs');

var some_contact = "<telno>@c.us"; // formatted like : 905553332211 
var SESSION_FILE_PATH = './session.json';
var clientOpt = {};
var sessionCfg;

if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
    clientOpt = {session: sessionCfg };
}

var client = new whatsappObj.Client(clientOpt);

client.on('qr', function(qr){
    console.log('QR RECEIVED');
    qrcode.generate(qr, {small: true});    
});

client.on('ready', async () => {
    console.log('Client is ready!');
    var cts = await client.getContacts();
    console.log("contacts: ", cts);
});

function startyFunc(){
    var timerCount =10;
    var tim = setInterval(function(){
        if(timerCount ==0){
            clearInterval(tim);
        }
        client.sendMessage(some_contact, "deneme mesaj " + timerCount);
        timerCount--;
    },2000);
}

client.on('message', msg => {
    if (msg.body == "start" && msg.from == some_contact) {
        startyFunc();
        //client.sendMessage(msg.from, 'pong');
    }else if(msg.from == some_contact){
        client.sendMessage(msg.from, msg.body);
    }
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.initialize();