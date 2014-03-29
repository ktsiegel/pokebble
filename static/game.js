/* jshint esnext: true, sub: true*/

var myParty = [
    {
        "id": "4",
        "name": "Charmander",
        "level": 100,
        "hp": 0,
        "maxhp": 159,
        "moves": [
            {
                "name": "Scratch",
                "pp": 20,
                "maxpp": 20,
                "power": 40,
                "type": "normal"
            },
            {
                "name": "Ember",
                "pp": 20,
                "maxpp": 20,
                "power": 40,
                "type": "fire"
            },
            {
                "name": "Metal Claw",
                "pp": 20,
                "maxpp": 20,
                "power": 50,
                "type": "steel"
            }
        ]
    },
    {
        "id": "42",
        "name": "Golbat",
        "level": 100,
        "hp": 240,
        "maxhp": 240,
        "moves": [
            {
                "name": "Poison Fang",
                "pp": 20,
                "maxpp": 20,
                "power": 50,
                "type": "poison"
            },
            {
                "name": "Bite",
                "pp": 20,
                "maxpp": 20,
                "power": 60,
                "type": "dark"
            },
            {
                "name": "Wing Attack",
                "pp": 20,
                "maxpp": 20,
                "power": 60,
                "type": "flying"
            },
            {
                "name": "Air Cutter",
                "pp": 20,
                "maxpp": 20,
                "power": 55,
                "type": "flying"
            }
        ]
    },
    {
        "id": "88",
        "name": "Grimer",
        "level": 100,
        "hp": 180,
        "maxhp": 180,
        "moves": [
            {
                "name": "Pound",
                "pp": 20,
                "maxpp": 20,
                "power": 40,
                "type": "normal"
            },
            {
                "name": "Sludge",
                "pp": 20,
                "maxpp": 20,
                "power": 65,
                "type": "poison"
            }
        ]
    },
    {
        "id": "12",
        "name": "Psyduck",
        "level": 100,
        "hp": 180,
        "maxhp": 180,
        "moves": [
            {
                "name": "Confusion",
                "pp": 20,
                "maxpp": 20,
                "power": 50,
                "type": "psychic"
            },
            {
                "name": "Gust",
                "pp": 20,
                "maxpp": 20,
                "power": 40,
                "type": "flying"
            },
            {
                "name": "Psybeam",
                "pp": 20,
                "maxpp": 20,
                "power": 65,
                "type": "psychic"
            },
            {
                "name": "Silver Wind",
                "pp": 20,
                "maxpp": 20,
                "power": 60,
                "type": "bug"
            }
        ]
    },
    {
        "id": "55",
        "name": "Golduck",
        "level": 100,
        "hp": 264,
        "maxhp": 264,
        "moves": [
            {
                "name": "Scratch",
                "pp": 20,
                "maxpp": 20,
                "power": 40,
                "type": "normal"
            },
            {
                "name": "Confusion",
                "pp": 20,
                "maxpp": 20,
                "power": 50,
                "type": "psychic"
            },
            {
                "name": "Hydro Pump",
                "pp": 20,
                "maxpp": 20,
                "power": 120,
                "type": "water"
            }
        ]
    },
    {
        "id": "56",
        "name": "Mankey",
        "level": 100,
        "hp": 135,
        "maxhp": 135,
        "moves": [
            {
                "name": "Scratch",
                "pp": 20,
                "maxpp": 20,
                "power": 40,
                "type": "normal"
            },
            {
                "name": "Low Kick",
                "pp": 20,
                "maxpp": 20,
                "power": 50,
                "type": "fighting"
            },
            {
                "name": "Karate Chop",
                "pp": 20,
                "maxpp": 20,
                "power": 50,
                "type": "fighting"
            }
        ]
    }
];

var enemy = {"id": "5",
        "name": "Charmeleon",
        "level": 100,
        "hp": 0,
        "maxhp": 159};

// Display stats for a pokemon
// pokemon -> a standard pokemon hash
var stats = function(pokemon) {

};

// Challenge screen
var challenge = function(pokemon, enemy) {
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
  
  simply.text({body: challengeState});

  // scrolling
  var currentPointerLine = 5;
  simply.text({ body: visibleBodyText(bodyText, currentPointerLine, 1) });
  simply.on('singleClick', function(e) {
      if (e.button === 'up' && currentPointerLine > 5) {
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
    var move = bodyText.split('\n')[currentPointerLine];
    // make move via request TODO
    // ajax(opt, success = popup menu saying that you made that move, failure);
  });
};

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

// Screen depicts list of Pokemon in your party
// Scroll through list with up and down buttons, and long hold to select
// param inBattle -> if inBattle is False, then trainer is not currently
//            in a battle, and any pokemon can be selected.
//           if inBattle is True, then trainer is currently in a
//            battle, and only usable Pokemon (>0 hp) can be selected.
var party = function(inBattle = False, enemy=[]) {
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
      challenge(pokemon,enemy);
    }
    else {
      // change to stat screen of that pokemon
      stats(pokemon);
    }
  });

  simply.on('accelTap', function(e) {
    // Test if a fist bump: on x-axis
    if (e.axis === 'x') {
      // ajax(opt, success, failure); -> request challenge start TODO
      // don't forget to set enemy to a hash that includes the enemy's info
    }
  });
};


// The welcome menu
var menu = function() {
  simply.title('Welcome to Pokebble!');
  simply.subtitle('Long hold the center button to play.');
  simply.vibe('short');
  simply.on('longClick', function(e) {
    simply.vibe('long');
    // ajax(opt, success, failure); -> request game start TODO
      party();
  });
};

menu();
