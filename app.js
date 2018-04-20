/** Express Setup **/

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res,next) {
  res.sendFile(__dirname + '/index.html');
});


var wordsets = {};


/** Emitter **/

function sendStats(){
  for (var key in currentConnections){
    currentConnections[key].socket.emit('refreshStats', {guests: 4, rooms: 5, players: 4});
  }
  console.log('!! Neue Stats verteilt');
}


/** Receiver **/




/** Auxillary **/

function loadWordsets () {
  var jsonData = fs.readFileSync("data/wordsets.json");
  wordsets = JSON.parse(jsonData);
}

function saveWordsets () {
  var jsonData = JSON.stringify(wordsets);
  fs.writeFile("data/wordsets", jsonData, function(err) {
      if (err) {
          console.log(err);
      }
  });
}

function addSet(set) {
  if (wordsets[set] == null) {
    wordsets[set] = {};
    saveWordsets();
  }
}

/**
function removeSet(set) {
  var index = wordsets.indexOf(set);
  if (index > -1) {
      wordsets.splice(index, 1);
      saveWordsets();
  }
}
**/

function addWord(set, word) {
  if (wordsets[set].words == null) {
    var temp = [word];
    wordsets[set].words = temp;
  } else {
    if (wordsets[set].words.indexOf(word) == -1) {
      wordsets[set].words.push(word);
    }
  }
  saveWordsets();
}

function removeWord(set, word) {
  var index = wordsets[set].words.indexOf(word);
  if (index > -1) {
      wordsets[set].words.splice(index, 1);
      saveWordsets();
  }
}

function getWordsets() {
  var data = [];
  for (var name in wordsets){
    data.push(name);
  }
  return data;
}

function getWords(set) {
  return wordsets[set].words;
}



loadWordsets();
var currentConnections = {};

io.on('connection', client => {
  currentConnections[client.id] = {socket: client};
  console.log('UserId: ' + client.id + ', UserName: ' + currentConnections[client.id].name + ' | Verbindung mit Server hergestellt');
  sendStats();

  client.on('disconnect', () => {delete currentConnections[client.id];
  });


  /** WORDSET KONFIG **/
  client.on('askWordsetNames', () => {client.emit('giveWordsetNames',{sets: getWordsets()});
  });

  client.on('askWordsetWords', set => {client.emit('giveWordsetWords',getWords(set));
  });


  /**
  client.on('data', function (somedata) {
    currentConnections[client.id].data = someData;

  });
  **/
});

http.listen(3000);
