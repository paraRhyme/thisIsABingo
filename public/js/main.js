/** GLOBAL **/

function element(id) {
  return document.getElementById(id);
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

var eingangspunkt = element('eingangspunkt');
var buttons = element('footer-buttons');


/** WELCOME **/

function welcomeInit() {
  clearElement(eingangspunkt);
  clearElement(buttons);
  footerCreateButton("Erstellen", "m3 left", "green lighten-2", spielraumInit);
  footerCreateButton("Beitreten", "m3 left", "green lighten-2");
  footerCreateButton("Konfiguration", "m3 right", "", konfigInit);


  var root = document.createElement('div');
  root.className = "container";
  var card = document.createElement('div');
  card.className = "card";
  var cardimage = document.createElement('div');
  cardimage.className = "card-image";
  var img = document.createElement('img');
  img.setAttribute("src", "img/banner.jpg");
  cardimage.appendChild(img);
  card.appendChild(cardimage);
  root.appendChild(card);
  eingangspunkt.appendChild(root);
}


/** SPIELRAUM **/

var spielerImRaum = document.createElement('ul');
spielerImRaum.id = "spielerImRaum";
spielerImRaum.className = "col m3";
var spielfeld = document.createElement('ul');
spielfeld.id = "spielfeld";
spielfeld.className = "row";

function spielraumInit(){
  clearElement(eingangspunkt);
  clearElement(buttons);
  clearElement(spielfeld);
  footerCreateButton("Spiel verlassen", "m12", "green lighten-2", welcomeInit);

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
    t2.className = "spielfeldKarte card-panel center valign-wrapper hoverable waves-effect waves-green";
    var t3 = document.createElement('span');
    t3.id = "Word" + i;
    var centerer = document.createElement('span');
    centerer.className = "centerer";
    t3.appendChild(document.createTextNode("Hund" + i));
    t2.appendChild(centerer);
    t2.appendChild(t3);
    t1.appendChild(t2);
    spielfeld.appendChild(t1);

    t2.addEventListener('click',function() {
      this.classList.add('green', 'lighten-2');
    });
  }
  spielraumDrawPlayerlist();
}

function spielraumDrawPlayerlist (){
  clearElement(spielerImRaum);

  for (var i = 0; i < 5; i++) {
    var spielerCard = document.createElement('li');
    spielerCard.id = "player" + i;
    var t1 = document.createElement('div');
    t1.className = "card scale-transition";
    var t2 = document.createElement('div');
    t2.className = "card-content";
    var t4 = document.createElement('span');
    t4.className = "card-title";
    t4.appendChild(document.createTextNode("Tom"));

    var t3 = document.createElement('ul');
    t3.className = "row";
    t3.id = "status" + i;
    for (var j = 0; j < 36; j++) {
      var tt1 = document.createElement('li');
      tt1.className = "col m2 blue-grey";
      t3.appendChild(tt1);
    }

    t2.appendChild(t4);
    t2.appendChild(t3);
    t1.appendChild(t2);
    spielerCard.appendChild(t1);
    spielerImRaum.appendChild(spielerCard);
  }
}

function spielraumRefreshPlayerlist(){}


/** KONFIG **/
var konfigInput;
var konfigCollection;
var konfigNewWord;
var konfigNewWordset;

function konfigInit() {
  clearElement(eingangspunkt);
  clearElement(buttons);
  eingangspunkt.innerHTML = `
  <div class="container">
  <div class="card-panel">
  <div class="section">
  <div class="input-field">
  <select id="konfigInput"></select>
  <label id="konfigWordcount"></label>
  </div>
  <div id="konfigCollection" class="collection"></div>
  <a id="buttonDeleteWord" class="waves-effect waves-light btn red">Ausgewähltes Wort löschen</a>
  </div>
  <div class="divider"></div>
  <div class="section">
  <div class="row">
  <div class="input-field col m8">
  <input id="konfigNewWord" type="text" class="validate">
  <label for="konfigNewWord">Neues Wort</label>
  </div>
  <a id="buttonAddWord" class="waves-effect waves-light btn green lighten-2 col m4 left">Wort hinzufügen</a>
  <div class="input-field col m8">
  <input id="konfigNewWordset" type="text" class="validate">
  <label for="konfigNewWordset">Neuer Wortsatz</label>
  </div>
  <a id="buttonAddWordset" class="waves-effect waves-light btn green lighten-2 col m4">Wortsatz erstellen</a>
  </div>
  </div>
  </div>
  </div>
  `;
  konfigInput = element("konfigInput");
  konfigCollection = element("konfigCollection");
  footerCreateButton("Hauptmenü", "m12", "green lighten-2", welcomeInit);
  socket.emit('askWordsetNames');

  var buttonDeleteWord = element('buttonDeleteWord');
  var buttonAddWord = element('buttonAddWord');
  var buttonAddWordset = element('buttonAddWordset');

  buttonDeleteWord.addEventListener('click', () => {
    var instance = M.FormSelect.getInstance(konfigInput);
    var selectedWord;
    var selectedSet = instance.getSelectedValues();
    var children = konfigCollection.children;
    for (var i = 0; i < children.length; i++) {
      var tableChild = children[i];
      if (tableChild.classList.contains('active')) {
        selectedWord = tableChild;
      }
    }
    if (selectedWord == null) {return;}
    socket.emit('removeWord', {set: selectedSet[0], word: selectedWord.text});
  });

  buttonAddWord.addEventListener('click', () => {
    var input = element("konfigNewWord");
    if (input.value == null || input.value == "") {return;}
    var instance = M.FormSelect.getInstance(konfigInput);
    var selectedSet = instance.getSelectedValues();
    socket.emit('addWord', {set: selectedSet[0], word: input.value});
  });

  buttonAddWordset.addEventListener('click', () => {
    var input = element("konfigNewWordset");
    if (input.value == null || input.value == "") {return;}
    socket.emit('addWordset', input.value);
  });
}

function konfigDrawWordsets(sets) {
  clearElement(konfigInput);
  for (var i = 0; i < sets.length; i++) {
    var option = document.createElement("option");
    option.setAttribute('value', sets[i]);
    option.appendChild(document.createTextNode(sets[i]));
    konfigInput.appendChild(option);
  }
  var instance = M.FormSelect.init(konfigInput, "input-field");
  var temp = instance.getSelectedValues();
  socket.emit('askWordsetWords' ,temp[0]);

  konfigInput.addEventListener('change', () => {
    instance = M.FormSelect.init(konfigInput, "input-field");
    temp = instance.getSelectedValues();
    socket.emit('askWordsetWords' ,temp[0]);
  });
}

function konfigDrawWords(words) {
  clearElement(konfigCollection);
  if (words == null) {return;}
  var konfigWordcount = element("konfigWordcount");
  if (words.length == 1) {
    konfigWordcount.innerHTML = "| 1 Wort im Set |";
  } else {
    konfigWordcount.innerHTML = "| " + words.length + " Wörter im Set |";
  }
  for (var i = 0; i < words.length; i++) {
    var option = document.createElement("a");
    option.className = "collection-item";
    option.id = "word_" + i;
    option.setAttribute('href', "#!");
    option.addEventListener('click', function() {
      var children = konfigCollection.children;
      for (var i = 0; i < children.length; i++) {
        var tableChild = children[i];
        if (tableChild.classList.contains('active')) {
          tableChild.classList.toggle('active');
        }
      }
      this.classList.toggle('active');
    });
    option.appendChild(document.createTextNode(words[i]));
    konfigCollection.appendChild(option);
  }
}


/** FOOTER **/

function footerDrawStats(data){
  var guests = 0;
  var rooms = 0;
  var players = 0;
  if (data) {
    guests = data.guests;
    rooms = data.rooms;
    players = data.players;
  }
  if(guests < 2){
    element('numberOfGuests').textContent='| 1 Gast |';
  } else {
    element('numberOfGuests').textContent='| ' + guests + ' Gäste |';
  }
  element('numberOfRooms').textContent='| ' + rooms + ' Räume |';
  element('numberOfPlayers').textContent='| ' + players + ' Spieler |';
}

function footerCreateButton(text, alignement, buttonColor, callback) {
  var root = document.createElement('span');
  root.className = "col " + alignement;
  var btn = document.createElement('a');
  btn.className = "waves-effect waves-light btn " + buttonColor;
  btn.appendChild(document.createTextNode(text));
  root.appendChild(btn);
  buttons.appendChild(root);

  if (typeof callback === "function") {
    btn.addEventListener('click', callback);
  }
}




/** MAGIE AB HIER **/

var socket = io.connect('http://localhost:3000');

if(socket !== undefined){
  welcomeInit();

  socket.on('refreshStats', data => {footerDrawStats(data);});
  socket.on('giveWordsetNames', data => {konfigDrawWordsets(data.sets);});
  socket.on('giveWordsetWords', data => {konfigDrawWords(data.words);});
}
