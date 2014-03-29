package main

import (
    "encoding/json"
    "flag"
    "fmt"
    "io/ioutil"
    "log"
    "net"
    "net/http"
    "net/url"

    "github.com/gorilla/websocket"
)

var (
    listenAddr = flag.String("addr", ":10915", "http service address")
    server_url, _ = url.Parse("/battle")
    connections = make(map[string] *Connection)
)

type GenericMessage struct {
    Trainer string `json:"trainer"`
}
type InitializeMessage struct {

}
type AttackMessage struct {
    Move uint64 `json:"move"`
}
type SwitchMessage struct {
    Pokemon uint64 `json:"pokemon"`
}

type Connection struct {
    ws *websocket.Conn

    last chan []byte
    send chan []byte

}
func (c *Connection) Reader() {
    for {
        _, msg, _ := c.ws.ReadMessage()
        c.last <- msg
    }
}
func (c *Connection) Writer() {
    for {
        c.ws.WriteMessage(websocket.TextMessage, <-c.send)
    }
}

func viewHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method == "GET" {
        getHandler(w, r)
    } else if r.Method == "POST" {
        postHandler(w, r)
    }
}

func getHandler(w http.ResponseWriter, r *http.Request) {
    trainer_id := r.URL.Query()["trainer"][0]
    conn := connections[trainer_id]
    response := <-conn.last
    fmt.Fprintf(w, string(response))
    log.Println("Sent ", string(response))
}

func postHandler(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Path[8:]
    log.Println("New", path, "request")
    body, _ := ioutil.ReadAll(r.Body)

    gm := GenericMessage{}
    json.Unmarshal(body, &gm)
    trainer_id := gm.Trainer
    if _, ok := connections[trainer_id]; !ok {
        HttpConn, _ := net.Dial("tcp", "127.0.0.1:10914")
        ws, _, _ := websocket.NewClient(HttpConn, server_url, r.Header, 4096, 4096)
        conn := &Connection{
            ws: ws,
            last: make(chan []byte),
            send: make(chan []byte),
        }
        go conn.Reader()
        go conn.Writer()
        connections[trainer_id] = conn
    }
    conn := connections[trainer_id]

    if path == "initialize" {
        conn.send <- body
    } else if path == "attack" {
        amsg := AttackMessage{}
        json.Unmarshal(body, &amsg)
        jmsg, _ := json.Marshal(amsg)
        conn.send <- jmsg
    } else if path == "switch" {
        smsg := SwitchMessage{}
        json.Unmarshal(body, &smsg)
        jmsg, _ := json.Marshal(smsg)
        conn.send <- jmsg
    } else {
        return
    }

    response := <-conn.last
    fmt.Fprintf(w, string(response))
    log.Println("Sent ", string(response))
}


func main() {
    http.HandleFunc("/battle/", viewHandler)
    http.ListenAndServe(*listenAddr, nil)
}
