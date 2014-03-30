package main

import (
    "log"
    "math"
    "math/rand"
    "net/http"
    "time"

    "github.com/gorilla/websocket"
)

type PendingBattle struct {
    Trainer_id string `json:"trainer"`
    Spectator bool `json:"spectator"`
    Lat float64 `json:"lat"`
    Lng float64 `json:"lng"`
    Party []SimplePokemon `json:"pokemon"`

    trainer *Trainer
    createdTime time.Time
    conn *BattleConnection
}

type PendingBattles struct {
    data map[*PendingBattle] bool

    toAdd chan *PendingBattle
    toRemove chan *PendingBattle
}

type Battle struct {
    conn1 *BattleConnection
    conn2 *BattleConnection
}

func (pb *PendingBattle) initialize() {
    pb.trainer = makeTrainer(pb.Trainer_id, pb.Party)
}

func (battle1 *PendingBattle) CloseTo(battle2 *PendingBattle) bool {
    threshold := float64(10)

    R := float64(6367500)
    dlat := (battle2.Lat - battle1.Lat) * math.Pi / 180
    dlng := (battle2.Lng - battle1.Lng) * math.Pi / 180
    lat1 := battle1.Lat * math.Pi / 180
    lat2 := battle2.Lat * math.Pi / 180

    a := math.Sin(dlat/2) * math.Sin(dlat/2) * math.Sin(dlng/2) * math.Sin(dlng/2) * math.Cos(lat1) * math.Cos(lat2)
    c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
    d := R * c

    if d < threshold {
        return true
    } else {
        return false
    }
}

func (pb *PendingBattle) remove() {
    pb.conn.ws.Close()
}

func battleHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("New Connection")
    ws, err := websocket.Upgrade(w, r, nil, 1024, 1024)
    if err != nil {
        return
    }
    log.Println("New Successful Connection")

    bc := &BattleConnection{ws: ws}
    bc.reader()
}

func (pbs *PendingBattles) run() {
    for {
        select {
            case c := <- pbs.toAdd:
                // try to find a match
                matched := false
                for pb := range pbs.data {
                    if c.trainer.id == pb.trainer.id {
                        break
                    }
                    if c.CloseTo(pb) {
                        log.Println("matched")
                        delete(pbs.data, pb)

                        battle := Battle{conn1: pb.conn, conn2: c.conn}
                        c.trainer.battling = true
                        pb.trainer.battling = true
                        go battle.start(pb.trainer, c.trainer)

                        matched = true
                        break
                    }
                }
                if !matched {
                    pbs.data[c] = true
                }

                // remove old pending battles
                now := time.Now()
                for pb := range pbs.data {
                    if now.Sub(pb.createdTime).Seconds() > 60 {
                        delete(pbs.data, pb)
                        pb.remove()
                    }
                }

            case c := <- pbs.toRemove:
                delete(pbs.data, c)
                c.remove()
        }
    }
}

func (battle *Battle) start(trainer1 *Trainer, trainer2 *Trainer) {
    log.Println("Battle starting between", trainer1, "and", trainer2)

    var roundResultMsg1 RoundResultMessage
    var roundResultMsg2 RoundResultMessage
    finished := false

    roundNum := 0
    for {
        log.Println("Round", roundNum)
        roundNum += 1

        state1, state2 := battle.getStates(roundResultMsg1, roundResultMsg2)

        // check if the match is over
        if battle.conn2.trainer.isWiped() {
            log.Println("Winner:", trainer1.name)
            state1.Outcome = "Won"
            state2.Outcome = "Lost"
            finished = true
        } else if battle.conn1.trainer.isWiped() {
            log.Println("Winner:", trainer2.name)
            state1.Outcome = "Lost"
            state2.Outcome = "Won"
            finished = true
        } else {
            state1.Outcome = "Pending"
            state2.Outcome = "Pending"
        }

        log.Println("Sending states")
        trainer1.outbox <- state1.toBytes()
        trainer2.outbox <- state2.toBytes()
        if finished {
            break
        }

        roundResultMsg1 = RoundResultMessage{}
        roundResultMsg2 = RoundResultMessage{}

        // check if one of the pokemon is fainted
        if trainer1.pokemon[0].state.health == 0 {
            for {
                action := <-trainer1.action
                if action.Switch != -1 {
                    battle.process(action)
                    break
                }
            }
            continue
        }
        if trainer2.pokemon[0].state.health == 0 {
            for {
                action := <-trainer2.action
                if action.Switch != -1 {
                    battle.process(action)
                    break
                }
            }
            continue
        }

        // get moves, execute
        log.Println("Waiting for action")
        action1 := <-trainer1.action
        action2 := <-trainer2.action
        if action1.Switch != -1 {
            roundResultMsg1 = battle.process(action1)
            roundResultMsg2 = battle.process(action2)
        } else if action2.Switch != -1 {
            roundResultMsg1 = battle.process(action2)
            roundResultMsg2 = battle.process(action1)
        } else if rand.Float64() <= 0.5 {
            // trainer 1 goes first
            roundResultMsg1 = battle.process(action1)
            if trainer2.pokemon[0].state.health > 0 {
                roundResultMsg2 = battle.process(action2)
            }
        } else {
            roundResultMsg1 = battle.process(action2)
            if trainer1.pokemon[0].state.health > 0 {
                roundResultMsg2 = battle.process(action1)
            }
        }
    }
    trainer1.battling = false
    trainer2.battling = false
    for _, pokemon := range trainer1.pokemon {
        pokemon.heal()
    }
    for _, pokemon := range trainer2.pokemon {
        pokemon.heal()
    }
}

func (battle *Battle) process(action *ActionMessage) RoundResultMessage {
    log.Println("Processing", action)

    var result RoundResultMessage
    var trainer Trainer
    var other_trainer Trainer
    if action.trainer == battle.conn1.trainer {
        trainer = *battle.conn1.trainer
        other_trainer = *battle.conn2.trainer
        result.Trainer = trainer.id
    } else {
        trainer = *battle.conn2.trainer
        other_trainer = *battle.conn1.trainer
        result.Trainer = trainer.id
    }
    log.Println("TRAINER ID", trainer.id, result.Trainer)
    activePokemon := trainer.pokemon[0]

    if activePokemon.state.health > 0 && action.Attack >= 0 && action.Attack < len(activePokemon.moves) {
        if activePokemon.state.pp[action.Attack] > 0 {
            if rand.Float64() < activePokemon.moves[action.Attack].Accuracy {
                multiplier, dmg := activePokemon.attack(other_trainer.pokemon[0], action.Attack)
                result.Multiplier = multiplier
                result.Damage = dmg
            } else {
                result.Miss = true
            }
            result.Pokemon1 = activePokemon.name
            result.Pokemon2 = other_trainer.pokemon[0].name
            result.Move = activePokemon.moves[action.Attack].Name
        }
    } else if action.Switch >= 0 && action.Switch < len(trainer.pokemon) {
        if trainer.pokemon[action.Switch].state.health > 0 {
            result.SwitchPokemon = true
            result.Pokemon1 = trainer.pokemon[0].name
            result.Pokemon2 = trainer.pokemon[action.Switch].name

            tmp := trainer.pokemon[action.Switch]
            trainer.pokemon[action.Switch] = trainer.pokemon[0]
            trainer.pokemon[0] = tmp
        }
    }
    return result
}

func (battle *Battle) getStates(roundResultMsg1, roundResultMsg2 RoundResultMessage) (state1 StateMessage, state2 StateMessage) {
    trainer1 := *battle.conn1.trainer
    trainer2 := *battle.conn2.trainer

    state1 = makeStateMessage(trainer1, trainer2, roundResultMsg1, roundResultMsg2)
    state2 = makeStateMessage(trainer2, trainer1, roundResultMsg1, roundResultMsg2)
    return
}

