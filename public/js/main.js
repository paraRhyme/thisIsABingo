
var element = function(id) {
  return document.getElementById(id);
}

var eingangspunkt = element('eingangspunkt');
var spielerImRaum = document.createElement('ul');
var spielfeld = document.createElement('ul');

spielerImRaum.id = "spielerImRaum";
spielerImRaum.className = "col m3";
spielfeld.id = "spielfeld";
spielfeld.className = "row";

function spielraumInit(eingangspunkt){
  var root = document.createElement('div');
  var temp = document.createElement('div');
  temp.className = "col m9";
  root.className = "row valign-wrapper";
  temp.appendChild(spielfeld);
  root.appendChild(temp);
  root.appendChild(spielerImRaum);
  eingangspunkt.appendChild(root);
  for (var i = 0; i < 36; i++) {
    var t1 = document.createElement('li');
    t1.className = "col m2";
    var t2 = document.createElement('div');
    t2.className = "card-panel center valign-wrapper";
    var t3 = document.createElement('span');
    t3.id = "Word" + i;
    t3.appendChild(document.createTextNode("Word" + i));
    t2.appendChild(t3);
    t1.appendChild(t2);
    spielfeld.appendChild(t1);
  }
}

function spielerlisteNeubau (spielerImRaum){
  for (var i = 0; i < 36; i++) {
    var spielerCard = document.createElement('li');
    spielerCard.id = "player" + i;
    var t1 = document.createElement('div');
    t1.className = "card";
    var t2 = document.createElement('div');
    t2.className = "card-content";
    var t3 = document.createElement('p');
    t3.appendChild(document.createTextNode("Hello World"));
    t2.appendChild(t3);
    t1.appendChild(t2);
    spielerCard.appendChild(t1);
    spielerImRaum.appendChild(spielerCard);
  }
}

function spielerlisteAktualisieren(){}


function actualiseStats(guests, rooms, players){
  if (!guests || !rooms || !players) {
    guests = 0;
    rooms = 0;
    players = 0;
  }
  if(guests < 2){
    element('numberOfGuests').textContent='| 1 Gast |';
  } else {
    element('numberOfGuests').textContent='| ' + guests + ' Gäste |';
  }
  element('numberOfRooms').textContent='| ' + rooms + ' Räume |';
  element('numberOfPlayers').textContent='| ' + players + ' Spieler |';
}

var socket = io.connect('http://localhost:3000');

if(socket !== undefined){
    console.log('Connected to socket...');
    // Handle Output
    actualiseStats();
    spielraumInit(eingangspunkt);
    spielerlisteNeubau(spielerImRaum);
    socket.on('output', function(data){});
    // Get Status From Server
    socket.on('status', function(data){});
    // Handle Input
    socket.on('cleared', function(){});
}
