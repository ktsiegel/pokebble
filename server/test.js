function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

ws = new WebSocket("ws:localhost:10914/battle")

hash = window.location.hash;
var trainer = hash.substring(1, hash.length);
var pokemon = [
    {
        "id": "3",
        "level": 100,
    },
    {
        "id": "6",
        "level": 100,
    },
    {
        "id": "9",
        "level": 100
    }
]
pokemon = shuffle(pokemon)

msg1 = {
    "trainer": trainer,
    "pokemon": pokemon,
    "Lat": 42.3646,
    "Lng": -71.1028
};

ws.onopen = function(e) {
    ws.send(JSON.stringify(msg1));
};

ws.onmessage = function(e) {
    console.log(e.data);
};
