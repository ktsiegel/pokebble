/* jshint esnext: true, sub: true*/
/* global Pebble */

console.log("0 - game.js");
var requests = require('requests.js');
console.log("1 - game.js");
var trainerId = Pebble.getAccountToken();
console.log("2 - game.js");
var myParty = localStorage.getItem('party');
console.log("3 - game.js");
var enemy;
console.log("4 - game.js");

// Display stats for a pokemon
// pokemon -> a standard pokemon hash
// var stats = function(pokemon) {

// }

var handleResponse = function(response){
  myParty = response.pokemon;
  enemy = response.other_pokemon;

  var title = "", message = "";

  if(!response.round_result.switch){
    title = response.round_result.pokemon + " used " + response.round_result.move;

    if(response.round_result.missed){
      message = response.round_result.pokemon + "'s attack missed!";
    } else if(response.round_result.multiplier === 0) {
      message = "It had no effect!";
    } else{
      if(response.round_result.multiplier > 1){
        message = "It's super effective!\n";
      } else if(response.round_result.multiplier < 1) {
        message = "It's not very effective...\n";
      }
      message += response.round_result.target.name + " lost " + response.round_result.damage + "HP.";

      var attackTarget = response.round_result.my_move ? myParty[0] : enemy;
      if(attackTarget.hp === 0){
        message += "\n" + attackTarget.name + "fainted!";
      }
    }
  } else {
    message = "Come back, " + response.round_result.pokemon1 + "!\nGo " + response.round_result.pokemon1;
  }

  Pebble.showSimpleNotificationOnPebble(title, message);

  if(response.my_move){
    if(myParty[0].hp === 0){
      party(true);
    } else {
      // TODO: make you do something when it's your turn
    }
  } else {
    // TODO: have some way to show that it's not your turn?
  }
};

console.log("5 - game.js");

// Challenge screen
var challenge = function(pokemon) {
  var fightPokemon = myParty.filter(function (el) {
      return el["name"] === pokemon;
  });
  challengeState = "Enemy " + enemy["name"] +
    "\n (hp:" + enemy["hp"] + "/" + enemy["maxhp"] + ")\n" +
    "My " + fightPokemon["name"] +
    "\n (hp:" + fightPokemon["hp"] + "/" + fightPokemon["maxhp"] + ")\n" ;

  var moves = fightPokemon["moves"];
  for (var i=0; i<moves.length; i++) {
    if (i === 0) {
      challengeState += "> ";
    } else {
      challengeState += "  ";
    }
    challengeState += moves[i]["name"] + "\n";
  }
  challengeState += "Switch Pokemon";

  simply.text({body: challengeState});

  // scrolling
  var currentPointerLine = 4;
  simply.text({ body: visibleBodyText(bodyText, currentPointerLine, 1) });
  simply.on('singleClick', function(e) {
    if (e.button === 'up' && currentPointerLine > 4) {
      currentPointerLine -= 1;
    } else if (e.button === 'down' && currentPointerLine < 4 + moves.length) {
        currentPointerLine += 1;
    }
    // Update body text
    bodyText = partyScrollUpdate(bodyText, currentPointerLine);
    simply.text({ body: visibleBodyText(bodyText, currentPointerLine, 1) });
  });

  // Select move
  simply.on('longClick', function(e) {
    
    if (currentPointerLine < bodyText.split('\n').length - 1) {
      var move = bodyText.split('\n')[currentPointerLine];
      requests.postAttack(trainerId, currentPointerLine - 4, handleResponse, handleResponse);
    } else { // switch pokemon
      party(true);
    }
  });
};

console.log("6 - game.js");

// Helper method that updates text to reflect scrolling
// through a list of Pokemon in a trainer's party
//
// param text -> the entirety of the Pebble text
// param currLineNumber -> the line that should be newly selected
var partyScrollUpdate = function(text, currLineNumber) {
  // Remove ">"
  var pointerChar = '>';
    var tokens = text.split(pointerChar);
    var noPointerText = tokens.join(' ');

    // Add ">" at appropriate line number
    var delimiter = '\n';
    tokens = noPointerText.split(delimiter);
    tokens[currLineNumber] = '>' + tokens[currLineNumber].substring(1);
    return tokens.join(delimiter);
};

// Find the subsection of text that should be displayed on the
// Pebble's 7 line screen. Used when scrolling.
//
// param text -> the entirety of the Pebble text
// param currLineNumber -> the line that should be centered on the screen
var visibleBodyText = function(text, currLineNumber, offset=0) {
  var maxLine = text.split('\n').length;

  // Applicable if currLineNumber <= 3
  // i.e. line number 3 is centered
  var start = 0;
  var end = 7;

  // Applicable if the 4th to last line is centered
  if (currLineNumber >= maxLine - 4 + offset) {
    start = maxLine - 7 - offset;
    end = maxLine - offset;
  } else if (currLineNumber > 3) {
    start = currLineNumber - 3 - offset;
    end = currLineNumber + 4 - offset;
  }

  return text.split('\n').slice(start,end).join('\n');
};

console.log("6 - game.js");

// Screen depicts list of Pokemon in your party
// Scroll through list with up and down buttons, and long hold to select
// param inBattle -> if inBattle is False, then trainer is not currently
//            in a battle, and any pokemon can be selected.
//           if inBattle is True, then trainer is currently in a
//            battle, and only usable Pokemon (>0 hp) can be selected.
var party = function(inBattle = false) {
  var liveParty = "";
  var deadParty = "";
  var livePartyCount = 0;
  var deadPartyCount = 0;

  // Set up display. Display looks as follows:

  // Usable:
  // > pokemon1
  //   pokemon2
  //   pokemon3
  //   pokemon4
  //
  // Fainted:
  //   pokemon5
  //   pokemon6

  for (var i=0; i<myParty.length; i++) {
    var pokemon = myParty[i];
    if (pokemon["hp"] > 0) {
      if (livePartyCount === 0) {
        liveParty += "> ";
      } else {
        liveParty += "  ";
      }
      liveParty += pokemon["name"] + "\n";
      livePartyCount += 1;
    } else {
      deadParty += "  " + pokemon["name"] + "\n";
      deadPartyCount += 1;
    }
  }
  var bodyText = "Usable:\n" + liveParty + "\nFainted:\n" + deadParty;

  // Scroll through Pokemon list
  var currentPointerLine = 1; // tracks where the pokemon selector (">") is
  simply.text({ body: visibleBodyText(bodyText, currentPointerLine) });
  simply.on('singleClick', function(e) {
      if (e.button === 'up') {
        // Can only scroll among pokemon, so handle skipping the blank line
        // and the line that says "Fainted: "
        if (currentPointerLine === livePartyCount + 3) {
          currentPointerLine = currentPointerLine - 3;
        }
        // Can't scroll to above the first live Pokemon
        else if (currentPointerLine > 1) {
          currentPointerLine = currentPointerLine - 1;
        }
      } else if (e.button === 'down') {
        // Can only scroll among pokemon, so handle skipping the blank line
        // and the line that says "Fainted: "
        if (currentPointerLine === livePartyCount) {
          currentPointerLine = currentPointerLine + 3;
        }
        // Can't scroll to below the last fainted Pokemon
        else if (currentPointerLine < livePartyCount + deadPartyCount + 1) {
          currentPointerLine = currentPointerLine + 1;
        }
      }
      // Update body text
      bodyText = partyScrollUpdate(bodyText, currentPointerLine);
      simply.text({ body: visibleBodyText(bodyText, currentPointerLine) });
  });

  // Select pokemon
  simply.on('longClick', function(e) {
    var pokemon = bodyText.split('\n')[currentPointerLine];
    if (inBattle) {
      // change to challenge screen
      challenge(pokemon);
    }
    else {
      // change to stat screen of that pokemon
      stats(pokemon);
    }
  });

  simply.on('accelTap', function(e) {
    // Test if a fist bump: on x-axis
    if (e.axis === 'x') {
      requests.postBattleStart(trainerId, myParty, handleResponse, handleResponse);
    }
  });
};

console.log("7 - game.js");

// The welcome menu
var menu = function() {
  console.log("9 - game.js");
  simply.title('Welcome to Pokebble!');
  simply.subtitle('Long hold the center button to play.');
  simply.vibe('short');
  simply.on('longClick', function(e) {
    simply.vibe('long');
    requests.postBattleStart(trainerId, myParty, handleResponse, handleResponse);
    party();
  });
};

console.log("8 - game.js");
menu();
