var GameManager = require("../models/teledraw.js");

var sessionGameManager = new GameManager;

exports.renderEntryPage = function(req, res){
    var gameList = sessionGameManager.getGameList();
    res.render("player_game_form",{gameList: gameList});
};

exports.processNewPlayerGameInfo = function(game_name, player_name){
    var rc = sessionGameManager.createGame(game_name);
    if(rc === 1){
        console.log("Game name already in use");
    }
    rc = sessionGameManager.addPlayerToGame(player_name, game_name);
    if(rc === 1){
        console.log("Cannot find game: " + game_name);
    }
    else if(rc === 2){
        console.log("Player name " + player_name + " is in use");
    }
    return rc;
};

exports.submitEntry = function(game_name, player_name, submission) {
    //TODO swalls check this return code
    var rc = sessionGameManager.submitEntryForPlayer(game_name, player_name, submission);
    return rc;
};

exports.getNextPrompt = function(game_name, player_name) {
  var nextPrompt = sessionGameManager.getNextClueForPlayer(game_name, player_name);
  return nextPrompt;
};

exports.getPreviousPlayer = function(game_name, player_name) {
  var rv = sessionGameManager.getPreviousPlayer(game_name, player_name);
  return rv;
};

exports.getAllGameData = function(game_name){
    return sessionGameManager.getGameData(game_name);
};
