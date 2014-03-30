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

    conn.onopen = function(e) {
        conn.send(JSON.stringify(msg));
    }
    
    conn.onmessage = function(e) {
        console.log(e.data);
        data = JSON.parse(e.data)
        var result1 = data.round_result[0];
        var result2 = data.round_result[1];
        if (result1.pokemon1 == "") { // draw pokemon as they are
            var my_pokemon = data.pokemon[0];
            var opp_pokemon = data.other_pokemon;
            changeTrainerPokemon(my_pokemon.name, my_pokemon.hp, my_pokemon.maxhp, my_pokemon.level);
            changeOpponentPokemon(opp_pokemon.name, opp_pokemon.hp, opp_pokemon.maxhp, opp_pokemon.level);
        } else {  // something happens in the first result
            if (result1.switch) { // switch
                if (result1.trainer == trainer) { // my turn
                    var my_pokemon = data.pokemon[0];
                    if (!result2.switch && result2.pokemon != ""){
                        var hp = my_pokemon.hp + result2.dmg
                        changeTrainerPokemon(my_pokemon.name, hp, my_pokemon.maxhp, my_pokemon.level);
                    } else {
                        changeTrainerPokemon(my_pokemon.name, my_pokemon.hp, my_pokemon.maxhp, my_pokemon.level);
                    }
                } else { // their turn
                    var opp_pokemon = data.other_pokemon;
                    if (!result2.switch && result2.pokemon != ""){
                        var hp = opp_pokemon.hp + result2.dmg
                        changeOpponentPokemon(opp_pokemon.name, hp, opp_pokemon.maxhp, opp_pokemon.level);
                    } else {
                        changeOpponentPokemon(opp_pokemon.name, opp_pokemon.hp, opp_pokemon.maxhp, opp_pokemon.level);
                    }
                }
            } else { // attack
                if (result1.trainer == trainer) { // my turn
                    var opp_pokemon = data.other_pokemon;
                    attackOpponentPokemon(opp_pokemon.hp, opp_pokemon.maxhp);
                } else { // their turn
                    var my_pokemon = data.pokemon[0];
                    attackTrainerPokemon(my_pokemon.hp, my_pokemon.maxhp)
                }
            }
        }
        setTimeout(function(){
            if (result2.pokemon2 != "") {
                if (result2.switch) { // switch
                    if (result2.trainer == trainer) { // my turn
                        var my_pokemon = data.pokemon[0];
                        changeTrainerPokemon(my_pokemon.name, my_pokemon.hp, my_pokemon.maxhp, my_pokemon.level);
                    } else { // their turn
                        var opp_pokemon = data.other_pokemon;
                        changeOpponentPokemon(opp_pokemon.name, opp_pokemon.hp, opp_pokemon.maxhp, opp_pokemon.level);
                    }
                } else { // attack
                    if (result2.trainer == trainer) { // my turn
                        var opp_pokemon = data.other_pokemon;
                        attackOpponentPokemon(opp_pokemon.hp, opp_pokemon.maxhp);
                    } else { // their turn
                        var my_pokemon = data.pokemon[0];
                        attackTrainerPokemon(my_pokemon.hp, my_pokemon.maxhp)
                    }
                }
            }
        }, 2000);
    }
});
