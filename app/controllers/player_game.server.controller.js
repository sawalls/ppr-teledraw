var GameManager = require("../models/teledraw.js");

var sessionGameManager = new GameManager;

exports.renderEntryPage = function(req, res){
    var gameList = sessionGameManager.getGameList();
    res.render("teledraw_page.jade",{gameList: gameList});
    console.log("SessionID in express-land: ", req.sessionID);
    console.log("CHANGING IN EXPRESS LAND");
    req.session.SCOTT_POINTS = 77;
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

//Get the mailbox of every single player in every single game
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

exports.getInitialData = function(game_name, player_name) {
    console.log('getInitialData called with: game_name: "' + JSON.stringify(game_name) + '", player_name: "' + JSON.stringify(player_name) + '"');
    if (game_name === undefined) {
        return undefined;
    }

    var game_list = sessionGameManager.getGameList(game_name),
        game = game_list[game_name];

    if (!game) {
        console.log("ERROR: we got the game_name: '" + game_name +
                    "' from the session, but no such game exists!")
        return undefined;
    }

    var initialData = {
        game_name: game_name,
        game_has_started: sessionGameManager.gameHasStarted(game_name),
        player_name_list: game,
        player_name: player_name,
    };
    if (initialData.game_has_started) {
        var mailbox = sessionGameManager.get_mailbox(game_name, player_name);
        var client_mailbox = [];

        for (var i = 0, chain; chain = mailbox[i];) {
            var client_chain = {};
            client_chain.chainName = chain.getName();

            var last_submission = chain.getLastSubmission();
            if (last_submission !== undefined) {
                client_chain.submission = last_submission.content;
            }
            client_mailbox.push(client_chain);
        }

        initialData.mailbox = client_mailbox;
    }

    return initialData;
};
