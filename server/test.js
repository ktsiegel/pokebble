ws = new WebSocket("ws:localhost:10914/battle")

hash = window.location.hash;
var trainer = hash.substring(1, hash.length);

msg1 = {
    "trainer": trainer,
    "pokemon": [
        {
            "id": "4",
            "name": "Charmander",
            "level": 100,
            "hp": 159,
            "maxhp": 159,
            "moves": [
                {
                    "name": "Scratch",
                    "pp": 20,
                    "maxpp": 20,
                    "power": 40,
                    "type": "normal"
                }
            ]
        }
    ],
    "Lat": 42.3646,
    "Lng": -71.1028
};

ws.onopen = function(e) {
    ws.send(JSON.stringify(msg1));
};

ws.onmessage = function(e) {
    console.log(e.data);
};
