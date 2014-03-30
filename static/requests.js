/* jshint sub: true*/
/* global Pebble */

var SERVER = 'http://jinpan.mit.edu:10916';

var requests = {};

// Perform a standard GET request for the given trainer and pass
// the JSON response data to the given callback
requests.getResponse = function (trainer, callback){
  console.log("get request sent");
  ajax({
    method: 'get',
    url: SERVER + '/battle?trainer=' + trainer,
    type: 'json',
    async: false,
    cache: false
  }, function(data){
    console.log("received response: " + data.toString());
    callback(data);
  });
};

// Start a battle for the given trainer and party and pass the JSON response
// data to the battleStart callback. When the opponent has made their move,
// the JSON response data is passed to the nextTurn callback.
requests.postBattleStart = function (trainer, party, battleStart, nextTurn) {
  navigator.geolocation.getCurrentPosition(function(pos) {
    console.log("posted battle request for party " + JSON.stringify(party));
    ajax({
      method: 'post',
      url: SERVER + '/battle/start/',
      type: 'json',
      async: false,
      cache: false,
      data: {
        "trainer": trainer,
        "pokemon": JSON.stringify(party),
        "lat": pos.coords.longitude,
        "lng": pos.coords.latitude
      }
    }, function (data) {
      console.log("received response: " + data.toString());
      battleStart(data);
      getResponse(trainer, nextTurn);
    });
  });
};

// Send an attack from the active pokemon of the given trainer and pass the
// JSON response to the response callback. When the opponent
requests.postAttack = function (trainer, move, response, nextTurn) {
  console.log("posted attack " + move);
  ajax({
    method: 'post',
    url: SERVER + '/battle/attack/',
    type: 'json',
    async: false,
    cache: false,
    data: {
      "trainer": trainer,
      "move": move
    }
  }, function (data) {
    console.log("received response: " + data.toString());
    response(data);
    getResponse(trainer, nextTurn);
  });
};


requests.postSwitch = function (trainer, newpokemon, response, nextTurn){
  console.log("posted attack " + move);
  ajax({
    method: 'post',
    url: SERVER + '/battle/switch/',
    type: 'json',
    async: false,
    cache: false,
    data: {
      "trainer": trainer,
      "pokemon": newpokemon
    }
  }, function (data) {
    console.log("received response: " + data.toString());
    response(data);
    getResponse(trainer, nextTurn);
  });
};

module.exports = requests;
