var GameManager = require("../models/teledraw.js");

var sessionGameManager = new GameManager;

exports.renderEntryPage = function(req, res){
    var gameList = sessionGameManager.getGameList();
    res.render("teledraw_page.jade",{gameList: gameList});
};

exports.processNewPlayerGameInfo = function(gameName, playerName){
    var rc = sessionGameManager.createGame(gameName);
    var playerIsFirst = false;
    if(rc === 1){
        console.log("Game name already in use");
    }
    else{
        playerIsFirst = true;
    }
    var obj = sessionGameManager.addPlayerToGame(playerName, gameName);
    obj.playerIsFirst = playerIsFirst;
    var rc = obj.rc;
    if(rc === 1){
        console.log("Cannot find game: " + gameName);
    }
    else if(rc === 2){
        console.log("Player name " + playerName + " is in use");
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
    console.log(JSON.stringify(sessionGameManager.getAllPlayerNamesInGame(game_name)));
    return sessionGameManager.getAllPlayerNamesInGame(game_name);
};
