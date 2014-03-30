package main

import (
    "encoding/json"
)

type ActionMessage struct {
    trainer *Trainer
    Attack int `json:"move"`
    Switch int `json:"pokemon"`
}

type RoundResultMessage struct {
    SwitchPokemon bool `json:"switch"`
    Pokemon1 string `json:"pokemon1"`
    Pokemon2 string `json:"pokemon2"`
    Move string `json:"move"`
    Multiplier float64 `json:"multiplier"`
    Damage uint `json:"damage"`
    Miss bool `json:"miss"`
}

type BattleResult struct {
    Outcome string `json:"outcome"`
    DMoney int `json:"dMoney"`
}

type StateMessage struct {
    MyPokemon []PokemonMessage `json:"pokemon"`
    OtherPokemon PokemonMessage `json:"other_pokemon"`
    Results []RoundResultMessage `json:"round_result"`
}

type PokemonMessage struct {
    Id string `json:"id"`
    Name string `json:"name"`
    Level uint `json:"level"`
    Health uint `json:"hp"`
    MaxHealth uint `json:"maxhp"`
    Moves []MoveMessage `json:"moves"`
}

type MoveMessage struct {
    Name string `json:"name"`
    PP uint `json:"pp"`
    MaxPP uint `json:"maxpp"`
    Power uint `json:"power"`
    Type string `json:"type"`
}


func makeBattleResult(state uint) BattleResult {
    br := BattleResult{DMoney: 0}
    if state == 0 {
        br.Outcome = "WON"
    } else if state == 1 {
        br.Outcome = "LOST"
    } else {  // state == 2
        br.Outcome = "TIED"
    }
    return br
}

func (br BattleResult) toBytes() []byte {
    msg, _ := json.Marshal(br)
    return msg
}

func (sm StateMessage) toBytes() []byte {
    msg, _ := json.Marshal(sm)
    return msg
}

func makeStateMessage(me Trainer, opponent Trainer, roundResultMsg1, roundResultMsg2 RoundResultMessage) StateMessage {
    sm := StateMessage{MyPokemon: make([]PokemonMessage, len(me.pokemon))}
    for idx, pokemon := range me.pokemon {
        sm.MyPokemon[idx] = makePokemonMessage(pokemon, true)
    }
    sm.OtherPokemon = makePokemonMessage(opponent.pokemon[0], false)
    sm.Results = []RoundResultMessage{roundResultMsg1, roundResultMsg2}
    return sm
}

func makePokemonMessage(pokemon Pokemon, full bool) PokemonMessage {
    msg := PokemonMessage{Id: pokemon.base.id, Name: pokemon.name,
                          Level: pokemon.level, Health: pokemon.state.health,
                          MaxHealth: pokemon.maxHealth}
    if full {
        for idx, move := range pokemon.moves {
            msg.Moves = append(msg.Moves, MoveMessage{Name: move.Name,
                                                      PP: pokemon.state.pp[idx],
                                                      MaxPP: pokemon.moves[idx].MaxPP,
                                                      Power: pokemon.moves[idx].Power,
                                                      Type: pokemon.moves[idx].TypeString})
        }
    }

    return msg
}

