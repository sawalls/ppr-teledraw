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

exports.getAllGameData = function(game_name){
    return sessionGameManager.getGameData(game_name);
};
