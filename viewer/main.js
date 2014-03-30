actions = [
    [changeTrainerPokemon, "Charmander", 135, 135, 100],
    [changeOpponentPokemon, "Venosaur", 300, 300, 100],
    [attackOpponentPokemon, 20, 300],
    [changeOpponentPokemon, "Dragonite", 325, 325, 100],
    [attackTrainerPokemon, 0, 135],
    [changeTrainerPokemon, "MewTwo", 250, 250, 100],
    [attackTrainerPokemon, 120, 250],
    [attackOpponentPokemon, 84, 325]
    [attackTrainerPokemon, 0, 250],
]

for (var idx = 0; idx < actions.length; ++idx) {
    func = actions[idx][0];
    setTimeout(function() {
        func.apply(actions[idx].slice(1, actions[idx].length));
    }, idx * 2000);
}
