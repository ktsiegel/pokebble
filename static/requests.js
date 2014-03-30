/* jshint esnext: true, sub: true*/
/* global Pebble */

var SERVER = 'http://jinpan.mit.edu:10916';

var requests = {};

// Perform a standard GET request for the given trainer and pass
// the JSON response data to the given callback
requests.getResponse = function (trainer, callback){
  ajax({
    method: 'get',
    url: SERVER + '/battle?trainer=' + trainer,
    type: 'json',
    async: false,
    cache: false
  }, callback(data));
};

// Start a battle for the given trainer and party and pass the JSON response
// data to the battleStart callback. When the opponent has made their move,
// the JSON response data is passed to the nextTurn callback.
requests.postBattleStart = function (trainer, party, battleStart, nextTurn) {
  navigator.geolocation.getCurrentPosition(function(pos) {
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
      battleStart(data);
      getResponse(trainer, nextTurn);
    });
  });
};

// Send an attack from the active pokemon of the given trainer and pass the
// JSON response to the response callback. When the opponent
requests.postAttack = function (trainer, move, response, nextTurn) {
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
    response(data);
    getResponse(trainer, nextTurn);
  });
};


requests.postSwitch = function (trainer, newpokemon, response, nextTurn){
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
    response(data);
    getResponse(trainer, nextTurn);
  });
};

module.exports = requests;
