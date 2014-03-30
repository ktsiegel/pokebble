/* jshint sub: true*/
/* global Pebble */

console.log("0 - game.js");
var requests = require('requests.js?date=' + Date.now().toString());
console.log("1 - game.js");
var trainerId = Pebble.getAccountToken();
console.log("2 - game.js");
var myParty = JSON.parse(localStorage.getItem('party'));
console.log("retrieved party " + JSON.stringify(myParty));
console.log("3 - game.js");
var enemy;
console.log("4 - game.js");

// Display stats for a pokemon
// pokemon -> a standard pokemon hash
var stats = function(pokemon) {

};

var handleResponse = function(response){
  myParty = response.pokemon;
  enemy = response.other_pokemon;

  console.log("handling response...");

  var title = "", message = "";
  var result1 = response.round_result[0];
  var result2 = response.round_result[1];
    if(result1.pokemon1 !== ""){
      if(!result1.switch){
        title = result1.pokemon1 + " used " + result1.move;

        if(result1.missed){
          message = result1.pokemon1 + "'s attack missed!";
        } else if(result1.multiplier === 0) {
          message = "It had no effect!";
        } else{
          if(result1.multiplier > 1){
            message = "It's super effective!\n";
          } else if(result1.multiplier < 1) {
            message = "It's not very effective...\n";
          }
          message += result1.pokemon2 + " lost " + result1.damage + "HP.";

          var attackTarget = (result1.trainer == trainerId) ? enemy : myParty[0];
          if(attackTarget.hp === 0){
            message += "\n" + result1.pokemon2 + " fainted!";
          }
        }
      } else {
        message = "Come back, " + result1.pokemon1 + "!\nGo " + result1.pokemon1;
      }

      Pebble.showSimpleNotificationOnPebble(title, message);

      title = "";
      message = "";

        if(!result2.switch){
          title = result2.pokemon1 + " used " + result2.move;

          if(result2.missed){
            message = result2.pokemon1 + "'s attack missed!";
          } else if(result2.multiplier === 0) {
            message = "It had no effect!";
          } else{
            if(result2.multiplier > 1){
              message = "It's super effective!\n";
            } else if(result2.multiplier < 1) {
              message = "It's not very effective...\n";
            }
            message += result2.pokemon2 + " lost " + result2.damage + "HP.";

            var attackTarget2 = (result2.trainer == trainerId) ? enemy : myParty[0];
            if(attackTarget2.hp === 0){
              message += "\n" + result2.pokemon2 + " fainted!";
            }
          }
        } else {
          message = "Come back, " + result2.pokemon1 + "!\nGo " + result2.pokemon1;
        }

        Pebble.showSimpleNotificationOnPebble(title, message);

        if(response.outcome === "WON") {
          Pebble.showSimpleNotificationOnPebble("You win!", "Congratulations! You're a Pokemon Master!");
          menu();
        } else if(response.outcome === "LOST"){
          Pebble.showSimpleNotificationOnPebble("You lost :(", "Better luck next time!");
          menu();
        }
  }

  simply.off('accelTap');
  simply.off('longClick');
  simply.off('singleClick');

  if(myParty[0].hp === 0){
    console.log("thinks i'm dead");
    party(true);
  } else {
    console.log("Challenging with active pkmn " + JSON.stringify(myParty[0]));
    challenge(myParty[0]);
  }
};

console.log("5 - game.js");

// Challenge screen
var challenge = function (fightPokemon) {

  var challengeState = "Enemy " + enemy["name"] +
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
  challengeState += "Switch Pokemon\n";


  // scrolling
  var currentPointerLine = 4;
  simply.text({ title: '', subtitle: '', body: visibleBodyText(challengeState, currentPointerLine, 1) });
  console.log("wrote display for battle");

  simply.off('singleClick');
  simply.on('singleClick', function(e) {
    if (e.button === 'up' && currentPointerLine > 4) {
      console.log("currentpointerline decreased");
      currentPointerLine -= 1;
    } else if (e.button === 'down' && currentPointerLine < 4 + moves.length) {
      console.log("currentpointerline increased");
      currentPointerLine += 1;
    }
    // Update body text
    challengeState = partyScrollUpdate(challengeState, currentPointerLine);
    simply.text({ title: '', subtitle: '', body: visibleBodyText(challengeState, currentPointerLine, 1) });
  });

  // Select move
  simply.off('longClick');
  simply.on('longClick', function(e) {
    console.log("long-click fired in battle");
    if (currentPointerLine < challengeState.split('\n').length - 1) {
      var move = challengeState.split('\n')[currentPointerLine];
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
var visibleBodyText = function(text, currLineNumber, offset) {
  var maxLine = text.split('\n').length;

  if (maxLine <= 7) {
    console.log("outputted as whole text: " + text);
    return text;
  }
  // Applicable if currLineNumber <= 3
  // i.e. line number 3 is centered
  var start = 0;
  var end = 7;

  // Applicable if the 4th to last line is centered
  if (currLineNumber >= maxLine - 4 + offset) {
    start = Math.max(maxLine - 7 - offset,0);
    end = maxLine - offset;
  } else if (currLineNumber > 3) {
    start = Math.max(currLineNumber - 3 - offset,0);
    end = currLineNumber + 4 - offset;
  }

  updatedText = text.split('\n').slice(start,end).join('\n');
  console.log("text subsection: " + updatedText);
  return updatedText;
};

console.log("6 - game.js");

// Screen depicts list of Pokemon in your party
// Scroll through list with up and down buttons, and long hold to select
// param inBattle -> if inBattle is False, then trainer is not currently
//            in a battle, and any pokemon can be selected.
//           if inBattle is True, then trainer is currently in a
//            battle, and only usable Pokemon (>0 hp) can be selected.
var party = function(inBattle) {
  console.log("14 - game.js");

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

  console.log("15 - game.js");
  for (var i=0; i<myParty.length; i++) {
    console.log("16 - game.js");
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
  console.log("17 - game.js");
  var bodyText = "Usable:\n" + liveParty + "\nFainted:\n" + deadParty;
  console.log("18 - game.js");
  // Scroll through Pokemon list
  var currentPointerLine = 1; // tracks where the pokemon selector (">") is
  simply.text({ title: '', subtitle: '', body: visibleBodyText(bodyText, currentPointerLine, 0) });
  console.log("19 - game.js");
  simply.off('singleClick');
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
      simply.text({ title: '', subtitle: '', body: visibleBodyText(bodyText, currentPointerLine, 0) });
  });

  // Select pokemon
  simply.off('longClick');
  simply.on('longClick', function(e) {
    var pokemon = 0;

    for(var i = 0; i < myParty.length; i++){
      if(myParty[i].name === bodyText.split('\n')[currentPointerLine]){
        pokemon = i;
      }
    }

    if (inBattle) {
      // change to challenge screen
      requests.postSwitch(trainerId, pokemon, handleResponse);
    }

    else {
      // change to stat screen of that pokemon
      // stats
    }
  });

  // undo switch screen (go back to battle)
  simply.on('singleClick', 'back', function(e){
    challenge(myParty[0]);
  });

  simply.off('accelTap');
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
  simply.text({title: "Welcome to Pokebble!", subtitle: "Long hold the center button to play.", body: ''});
  simply.vibe('short');
  console.log("10 - game.js");
  simply.on('longClick', function(e) {
    console.log("11 - game.js");
    simply.vibe('long');
    console.log("12 - game.js");
    requests.postBattleStart(trainerId, myParty, handleResponse, handleResponse);
    console.log("13 - game.js");
  });
};

console.log("8 - game.js");
menu();
