$(document).on("ready", function(){

	changeTrainerPokemon = function(name, hpmin, hpmax, level){
		$("div.user.pokemon").html("<img src='http://img.pokemondb.net/sprites/black-white/anim/back-normal/"+name.toLowerCase()+".gif'/>");
		$(".user div.meter span").width(hpmin/hpmax*100+"%");
		$(".user span.health").html(hpmin+"/"+hpmax);
		$(".user span.level").html(level);
		$(".user span.name").html(name);
	}

	changeOpponentPokemon = function(name, hpmin, hpmax, level){
		$(".opponent.pokemon img").addClass("animated fadeOutRight");
		$("div.opponent.pokemon").delay(300).html("<img src='http://img.pokemondb.net/sprites/black-white/anim/normal/"+name.toLowerCase()+".gif'/>");
		$(".opponent div.meter span").width(hpmin/hpmax*100+"%");
		$(".opponent span.health").html(hpmin+"/"+hpmax);
		$(".opponent span.level").html(level);
		$(".opponent span.name").html(name);
	}

	attackOpponentPokemon = function(hpmin, hpmax){
		$(".opponent.pokemon img").removeClass();
		$("div.user.pokemon img").addClass('animated shake').delay(400).queue(function(){
			$("div.opponent.pokemon img").addClass('animated flash');
			$(".user.pokemon img").removeClass().dequeue();
		});
		if(hpmin==0){
			returnOpponentPokemon();
		}

			$(".opponent div.meter span").animate({"width":hpmin/hpmax*100+"%"}, 500);
			$(".opponent span.health").html(hpmin+"/"+hpmax);

	}

	attackTrainerPokemon = function(hpmin, hpmax){
		$(".user.pokemon img").removeClass();
		$("div.opponent.pokemon img").addClass('animated shake').delay(400).queue(function(){
			$("div.user.pokemon img").addClass('animated flash');
			$(".opponent.pokemon img").removeClass().dequeue();
		});
		if(hpmin==0){
			returnTrainerPokemon();
		}

			$(".user div.meter span").animate({"width":hpmin/hpmax*100+"%"}, 500);
			$(".user span.health").html(hpmin+"/"+hpmax);

	}

	returnOpponentPokemon = function(){
		$("div.opponent.pokemon").html("");
	}

	returnTrainerPokemon = function(){
		$("div.user.pokemon").html("");
	}

    var conn = new WebSocket("ws:jinpan.mit.edu:10915/battle");
    var hash = window.location.hash;
    var trainer = hash.substring(1, hash.length);
    var msg = {
        "trainer": trainer,
        "spectator": true
    };
    
    var audio;
    conn.onopen = function(e) {
        conn.send(JSON.stringify(msg));
        audio = document.createElement("audio")
        audio.setAttribute("src", "http://mean2u.rfshq.com/downloads/music/battletheme.mp3");
        audio.load()
    }
    
    conn.onmessage = function(e) {
        console.log(e.data);
        data = JSON.parse(e.data);
        var result1 = data.round_result[0];
        var result2 = data.round_result[1];
        if (result1.pokemon1 === "") { // draw pokemon as they are
            audio.play()
            var my_pokemon = data.pokemon[0];
            var opp_pokemon = data.other_pokemon;
            changeTrainerPokemon(my_pokemon.name, my_pokemon.hp, my_pokemon.maxhp, my_pokemon.level);
            changeOpponentPokemon(opp_pokemon.name, opp_pokemon.hp, opp_pokemon.maxhp, opp_pokemon.level);
        } else {  // something happens in the first result
            if (result1.switch) { // switch
                if (result1.trainer == trainer) { // my turn
                    var my_pokemon = data.pokemon[0]; // new pokemon
                    if (!result2.switch && result2.pokemon1 != ""){
                        // I switched but they didn't switch
                        var hp = my_pokemon.hp + result2.dmg;
                        changeTrainerPokemon(my_pokemon.name, hp, my_pokemon.maxhp, my_pokemon.level);
                        $('#activity-feed').prepend("<p><b>You:</b> Go " + result1.pokemon2 + "!</p>");
                    } else {
                        changeTrainerPokemon(my_pokemon.name, my_pokemon.hp, my_pokemon.maxhp, my_pokemon.level);
                        $('#activity-feed').prepend("<p><b>You:</b> Go " + result1.pokemon2 + "!</p>");
                    }
                } else { // their turn
                    var opp_pokemon = data.other_pokemon;
                    if (!result2.switch && result2.pokemon != ""){
                        var hp = opp_pokemon.hp + result2.dmg
                        changeOpponentPokemon(opp_pokemon.name, hp, opp_pokemon.maxhp, opp_pokemon.level);
                        $('#activity-feed').prepend("<p><b>Enemy:</b> Go"+result1.pokemon2+"!</p>");
                    } else {
                        changeOpponentPokemon(opp_pokemon.name, opp_pokemon.hp, opp_pokemon.maxhp, opp_pokemon.level);
                        $('#activity-feed').prepend("<p><b>Enemy:</b> Go "+result1.pokemon2+"!</p>");
                    }
                }
            } else { // attack
                if (result1.trainer == trainer) { // my turn
                    var opp_pokemon = data.other_pokemon;
                    attackOpponentPokemon(opp_pokemon.hp, opp_pokemon.maxhp);

                    $('#activity-feed').prepend("<p><b>You:</b> " + result1.pokemon1 + ", use " + result1.move + "!</p>");


                } else { // their turn
                    var my_pokemon = data.pokemon[0];
                    attackTrainerPokemon(my_pokemon.hp, my_pokemon.maxhp);
                    $('#activity-feed').prepend("<p><b>Enemy:</b> " + result1.pokemon1 + ", use " + result1.move + "!</p>");
                }

                var message = "";
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
                    var attackTarget = (result1.trainer == trainer) ? data.other_pokemon : data.pokemon[0];
                    if(attackTarget.hp === 0){
                        message += "\n" + result1.pokemon2 + " fainted!";
                    }
                    $('#activity-feed').prepend("<p>" + message + "</p>");
                }
            }
        }
        setTimeout(function(){
            if (result2.pokemon2 != "") {
                if (result2.switch) { // switch
                    if (result2.trainer == trainer) { // my turn
                        var my_pokemon = data.pokemon[0];
                        changeTrainerPokemon(my_pokemon.name, my_pokemon.hp, my_pokemon.maxhp, my_pokemon.level);
                        $('#activity-feed').prepend("<p><b>You:</b> Go " + result2.pokemon2 + "!</p>");
                    } else { // their turn
                        var opp_pokemon = data.other_pokemon;
                        changeOpponentPokemon(opp_pokemon.name, opp_pokemon.hp, opp_pokemon.maxhp, opp_pokemon.level);
                        $('#activity-feed').prepend("<p><b>Enemy:</b> Go " + result2.pokemon2 + "!</p>");
                    }
                } else { // attack
                    if (result2.trainer == trainer) { // my turn
                        var opp_pokemon = data.other_pokemon;
                        attackOpponentPokemon(opp_pokemon.hp, opp_pokemon.maxhp);
                        $('#activity-feed').prepend("<p><b>You:</b> " + result2.pokemon1 + ", use " + result2.move + "!</p>");

                    } else { // their turn
                        var my_pokemon = data.pokemon[0];
                        attackTrainerPokemon(my_pokemon.hp, my_pokemon.maxhp);
                        $('#activity-feed').prepend("<p><b>Enemy:</b> " + result2.pokemon1 + ", use " + result2.move + "!</p>");

                    }

                    var message = "";
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
                        var attackTarget = (result2.trainer == trainer) ? data.other_pokemon : data.pokemon[0];
                        if(attackTarget.hp === 0){
                            message += "\n" + result2.pokemon2 + " fainted!";
                        }
                        $('#activity-feed').prepend("<p>" + message + "</p>");
                    }
                }
            }
        }, 2000);

				setTimeout(function() {
					if(data.outcome !== "Pending"){
						$('#activity-feed').prepend("<p>Game over! You " + data.outcome.toLowerCase() + "!</p>");
					}
				}, 4000);
    };
});
