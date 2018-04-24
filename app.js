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


/** Footer **/

function sendStats(){
  var allUsers = 0;
  var players = 0;
  var rooms = 0;
  for (var key in currentConnections){
    allUsers++;
    if (currentConnections[key].inPlay) {players++;}
  }
  // Leere Räume entfernen
  for (var key in playrooms) {
    if (playrooms[key].users.length == 0) {
      delete playrooms[key];
    }
  }
  for (var key in playrooms) {rooms++;}
  for (var key in currentConnections){currentConnections[key].socket.emit('refreshStats', {guests: allUsers - players, rooms: rooms, players: players});}
  console.log('!! Neue Stats verteilt');
}


/** Wordset **/

function loadWordsets () {
  var jsonData = fs.readFileSync("data/wordsets.json");
  wordsets = JSON.parse(jsonData);
}

function saveWordsets () {
  var jsonData = JSON.stringify(wordsets);
  fs.writeFile("data/wordsets.json", jsonData, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

function addSet(set) {
  if (wordsets[set] == null) {
    wordsets[set] = {words: []};
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


/** Raum erstellen und beitreten **/

function getLobbyStats() {
  var stats = {};
  for (var key in playrooms) {
    //stats[key].wordset = playrooms[key].wordset;
    //stats[key].count = playrooms[key].users.length;
    stats[key] = {wordset: playrooms[key].wordset, count: playrooms[key].users.length};
  }
  return stats;
}

function getCreateStats() {
  var stats = [];
  for (var key in wordsets) {
    var temp;
    if (wordsets[key].words == null) {
      if (temp == null) {temp = 0;}
    } else {
      var temp = wordsets[key].words.length;
    }
    stats.push({name: key, count: temp});
  }
  return stats;
}


/** Logik für Spielraum **/

function playerJoin(clientId, roomname, playername, chosenSet) {
  var user = currentConnections[clientId];
  user.name = playername;
  user.inPlay = true;
  if (chosenSet == null) {
    playrooms[roomname].users.push(clientId);
    chosenSet = playrooms[roomname].wordset;
  } else {
    playrooms[roomname] = {wordset: chosenSet, users: []};
    playrooms[roomname].users.push(clientId);
  }
  generatePlay(clientId, chosenSet);
  currentConnections[clientId].socket.emit('gameStart', {words: wordsets[chosenSet].words, playfield: user.playfield});
  sendStats();
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePlay(clientId, chosenSet) {
  var user = currentConnections[clientId];
  user.playfield = [];
  if (wordsets[chosenSet].words.length >= 36) {
    for (var i = 0; i < wordsets[chosenSet].words.length; i++) {
      user.playfield[i] = i;
    }
    shuffle(user.playfield);
    if (user.playfield.length > 36) {
      user.playfield = user.playfield.slice(0, 36);
    }
  } else {
    while (user.playfield.length < 36) {
      var temp = [];
      for (var i = 0; i < wordsets[chosenSet].words.length; i++) {
        temp[i] = i;
      }
      shuffle(temp);
      user.playfield = user.playfield.concat(temp);
    }
    if (user.playfield.length > 36) {
      user.playfield.slice(0, 36);
    }
  }
}

function playerLeftRoom(clientId) {
  if (currentConnections[clientId].inPlay) {
    currentConnections[clientId].inPlay = false;
    for (var key in playrooms) {
      for (var i = 0; i < playrooms[key].users.length; i++) {
        if (playrooms[key].users[i] == clientId) {playrooms[key].users.splice(i, 1);}
      }
    }
  }
}

function playerClicked(clicked, clientId) {
  for (var key in playrooms) {
    if (playrooms[key].users.indexOf(clientId) >= 0) {
      for (var i = 0; i < playrooms[key].users.length; i++) {
        if (playrooms[key].users[i] != clientId) {
          currentConnections[playrooms[key].users[i]].socket.emit('clicked', {name: currentConnections[clientId].name, clicked: clicked});
        }
      }
    }
  }
}

function gameFin(clientId) {
  for (var key in playrooms) {
    if (playrooms[key].users.indexOf(clientId) >= 0) {
      for (var i = 0; i < playrooms[key].users.length; i++) {
        if (playrooms[key].users[i] != clientId) {currentConnections[playrooms[key].users[i]].socket.emit('gameLost');}
      }
    }
  }
}




/** MAGIE AB HIER **/

var wordsets = {};
var playrooms = {};
var currentConnections = {};
loadWordsets();

io.on('connection', client => {
  currentConnections[client.id] = {socket: client};
  currentConnections[client.id].inPlay = false;
  console.log('UserId: ' + client.id + ', UserName: ' + currentConnections[client.id].name + ' | Verbindung mit Server hergestellt');
  sendStats();

  client.on('disconnect', () => {
    playerLeftRoom(client.id);
    delete currentConnections[client.id];
    sendStats();
  });


  client.on('askWordsetNames', () => {client.emit('giveWordsetNames', {sets: getWordsets()});});
  client.on('askWordsetWords', set => {client.emit('giveWordsetWords', {words: getWords(set)});});
  client.on('addWordset', set => {addSet(set); client.emit('giveWordsetNames', {sets: getWordsets()});});
  client.on('addWord', data => {addWord(data.set, data.word); client.emit('giveWordsetWords', {words: getWords(data.set)});});
  client.on('removeWord', data => {removeWord(data.set, data.word); client.emit('giveWordsetWords', {words: getWords(data.set)});});
  client.on('askLobby', () => {client.emit('giveLobby', {stats: getLobbyStats()})});
  client.on('askCreate', () => {client.emit('giveCreate', {stats: getCreateStats()})});
  client.on('join', data => {playerJoin(client.id, data.roomname, data.playername, data.chosenSet)});
  client.on('playerLeftRoom', () => {playerLeftRoom(client.id), sendStats()});
  client.on('clicked', data => {playerClicked(data.clicked, client.id)});
  client.on('gameWon', () => {gameFin(client.id)});
});

http.listen(3000, "0.0.0.0");
