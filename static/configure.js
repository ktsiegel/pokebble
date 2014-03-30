// var pokeslots = [];

// var allPokemon = ["Bulbasaur",
//         "Ivysaur",
//         "Venusaur",
//         "Charmander",
//         "Charmeleon",
//         "Charizard",
//         "Squirtle",
//         "Wartortle",
//         "Blastoise",
//         "Caterpie",
//         "Metapod",
//         "Butterfree",
//         "Weedle",
//         "Kakuna",
//         "Beedrill",
//         "Pidgey",
//         "Pidgeotto",
//         "Pidgeot",
//         "Rattata",
//         "Raticate",
//         "Spearow",
//         "Fearow",
//         "Ekans",
//         "Arbok",
//         "Pikachu",
//         "Raichu",
//         "Sandshrew",
//         "Sandslash",
//         "Nidoran (f)",
//         "Nidorina",
//         "Nidoqueen",
//         "Nidoran (m)",
//         "Nidorino",
//         "Nidoking",
//         "Clefairy",
//         "Clefable",
//         "Vulpix",
//         "Ninetales",
//         "Jigglypuff",
//         "Wigglytuff",
//         "Zubat",
//         "Golbat",
//         "Oddish",
//         "Gloom",
//         "Vileplume",
//         "Paras",
//         "Parasect",
//         "Venonat",
//         "Venomoth",
//         "Diglett",
//         "Dugtrio",
//         "Meowth",
//         "Persian",
//         "Psyduck",
//         "Golduck",
//         "Mankey",
//         "Primeape",
//         "Growlith",
//         "Arcanine",
//         "Poliwag",
//         "Poliwhirl",
//         "Poliwrath",
//         "Abra",
//         "Kadabra",
//         "Alakazam",
//         "Machop",
//         "Machoke",
//         "Machamp",
//         "Bellsprout",
//         "Weepinbell",
//         "Victreebell",
//         "Tentacool",
//         "Tentacruel",
//         "Geodude",
//         "Graveler",
//         "Golem",
//         "Ponyta",
//         "Rapidash",
//         "Slowpoke",
//         "Slowbro",
//         "Magnemite",
//         "Magneton",
//         "Farfetch'd",
//         "Doduo",
//         "Dodrio",
//         "Seel",
//         "Dewgong",
//         "Grimer",
//         "Muk",
//         "Shellder",
//         "Cloyster",
//         "Gastly",
//         "Haunter",
//         "Gengar",
//         "Onix",
//         "Drowsee",
//         "Hypno",
//         "Krabby",
//         "Kingler",
//         "Voltorb",
//         "Electrode",
//         "Exeggute",
//         "Exeggutor",
//         "Cubone",
//         "Marowak",
//         "Hitmonlee",
//         "Hitmonchan",
//         "Lickitung",
//         "Koffing",
//         "Weezing",
//         "Rhyhorn",
//         "Rhydon",
//         "Chansey",
//         "Tangela",
//         "Kangaskhan",
//         "Horsea",
//         "Seadra",
//         "Goldeen",
//         "Seaking",
//         "Staryu",
//         "Starmie",
//         "Mr. Mime",
//         "Scyther",
//         "Jynx",
//         "Electabuzz",
//         "Magmar",
//         "Pinsir",
//         "Tauros",
//         "Magikarp",
//         "Gyarados",
//         "Lapras",
//         "Ditto",
//         "Eevee",
//         "Vaporeon",
//         "Jolteon",
//         "Flareon",
//         "Porygon",
//         "Omanyte",
//         "Omastar",
//         "Kabuto",
//         "Kabutops",
//         "Aerodactyl",
//         "Snorlax",
//         "Articuno",
//         "Zapdos",
//         "Moltres",
//         "Dratini",
//         "Dragonair",
//         "Dragonite",
//         "Mewtwo",
//         "Mew"];

// $(document).ready($(function() {
//     $("#pokemonSearch").autocomplete({
//         source: allPokemon
//     });

//     $("#pokemonSubmit").click(function( ) {
//         if (pokeslots.length < 6) {
//             var pokemon = $('#pokemonSearch').val();
//             if ($.inArray(pokemon, allPokemon)) {
//                 pokeslots.push(pokemon);
//                 var pokeslot = "#pokeslot-" + pokeslots.length.toString();
//                 $(pokeslot).text(pokemon);
//             }
//         }
//         $('#pokemonSearch').val("");
//     });

//     $("#partySubmit").click(function() {
//         var pokehash = [];
//         for (var i=0; i<pokeslots.length; i++) {
//             var id = allPokemon.indexOf(pokeslots[i]) + 1;
//             var level = parseInt(Math.random()*30+70);
//             pokehash.push({'id':id, 'level':level});
//         }

//         var options = {
//             "scriptUrl": "https://github.com/kathrynsiegel/pokebble/raw/master/static/game.js",
//             "party": pokehash
//         };

//         console.log("setting options " + options);

//         document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(options));
//     });
// }));
