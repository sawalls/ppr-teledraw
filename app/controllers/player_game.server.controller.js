var GameManager = require("../models/teledraw.js");

var sessionGameManager = new GameManager;

exports.renderEntryPage = function(req, res){
    var gameList = sessionGameManager.getGameList();
    res.render("player_game_form",{gameList: gameList});
};

exports.processNewPlayerGameInfo = function(game_name, player_name){
    var rc = sessionGameManager.createGame(game_name);
    var player_is_first = false;
    if(rc === 1){
        console.log("Game name already in use");
    }
    else{
        player_is_first = true;
    }
    var obj = sessionGameManager.addPlayerToGame(player_name, game_name);
    obj.player_is_first = player_is_first;
    var rc = obj.rc;
    if(rc === 1){
        console.log("Cannot find game: " + game_name);
    }
    else if(rc === 2){
        console.log("Player name " + player_name + " is in use");
    }
    return obj;
};

exports.submitEntry = function(game_name, player_name, submission_info) {
    //TODO swalls check this return code
    var obj = sessionGameManager.submitEntryForPlayer(game_name, player_name, submission_info);
    return obj;
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
    return sessionGameManager.getChainInfos(game_name);
};

exports.startGame = function(game_name){
    return sessionGameManager.startGame(game_name);
};

exports.gameHasStarted = function(game_name){
    return sessionGameManager.gameHasStarted(game_name);
};

exports.getAllPlayerNamesInGame = function(game_name) {
    return sessionGameManager.getAllPlayerNamesInGame(game_name);
};
