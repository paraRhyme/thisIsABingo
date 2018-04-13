

function spielrnit(eingangspunkt){
  var root = document.createElement('div');
  var temp = document.createElement('div');
  temp.className("col m9");
  root.className = "row valign-wrapper";
  temp.appendChild(spielfeld);function
  root.appendChild(temp);
  root.appendChild(spielerImRaum);
  }
}

 exports.spielerlisteNeubau = function(){
  for (var i = 0; i < 36; i++) {
    var spielerCard = document.createElement('li');
    spielerCard.id = "player" + i;
    spielerCard.createElement('div').className = "card";
    spielerCard.firstElementChild().createElement('div').className = "card-content";
    spielerCard.lastElementChild().document.createTextNode("Hello World");
  }
}

function spielerlisteAktualisieren(){}

/*
<div class="row valign-wrapper">
  <div class="col m9">
    <ul id ="spielfeld" class="row">
  <ul id="spielerImRaum" class="col m3">
*/

/*
<li id>
  <div class="card">
    <div class="card-content">
      <p>
        Test
*/
model.export.
