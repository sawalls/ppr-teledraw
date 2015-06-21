
module.exports = GameManager;

var Chain = require('./teledraw_chain.js');
var Mailbox = require('./teledraw_mailbox.js');

const GAME_CREATION_ERRORS =
{
    GAME_NAME_IN_USE : 1,
};

const ADD_PLAYER_ERRORS = 
{
    CANNOT_FIND_GAME_BY_NAME : 1,
    PLAYER_NAME_IN_USE : 2,
};

const SUBMISSION_ERRORS = 
{
    CANNOT_FIND_GAME_BY_NAME : 1,
    CANNOT_FIND_PLAYER_NAME : 2,
};

function GameManager()
{
    var d_active_games = {};//Key value pair gameId to game
    
    //Helper functions
    function findPlayer(player_list, name)
    {
        for(i = 0, len = player_list.length; i < len; i++)
        {
            var player = player_list[i];
            if(player.name === name)
            {
                return i;
            }
        }
        return undefined;
    }

    //Public Interface
    this.createGame = function(game_name, password)
    {
        if(d_active_games[game_name] === undefined)
        {
            d_active_games[game_name] = 
            {
                player_list : [],
            };
            return 0;
        }
        else
        {
            return GAME_CREATION_ERRORS.GAME_NAME_IN_USE;
        }
    };

    this.addPlayerToGame = function(player_name, game_name)
    {
        if(d_active_games[game_name] === undefined)
        {
            return {rc : ADD_PLAYER_ERRORS.CANNOT_FIND_GAME_BY_NAME};
        }
        else
        {
            if(findPlayer(d_active_games[game_name].player_list, player_name) !== undefined)
            {
                return {rc : ADD_PLAYER_ERRORS.PLAYER_NAME_IN_USE};
            }
            else
            {
                var mailbox = new Mailbox(player_name + "'s mailbox");
                var initialChain = new Chain(player_name + "'s chain");
                mailbox.addItem(initialChain);
                console.log(mailbox.getName());
                d_active_games[game_name].player_list.push(
                    {
                        name : player_name,
                        mailbox : mailbox,
                    });
                console.log(JSON.stringify(d_active_games[game_name].player_list.mailbox.getName()));
                return {rc : 0};
            }
        }
    };

    this.submitEntryForPlayer = function(game_name, player_name, submission_info)
    {
        console.log("submitting: " + game_name + " - " + player_name 
                + " - " + JSON.stringify(submission_info));
        var game = d_active_games[game_name];
        if(game === undefined)
        {
            return SUBMISSION_ERRORS.CANNOT_FIND_GAME_BY_NAME;
        }
        var player_index = findPlayer(game.player_list, player_name);
        if(player_index === undefined)
        {
            return SUBMISSION_ERRORS.CANNOT_FIND_PLAYER_NAME;
        }
        else
        {
            var current_player = game.player_list[player_index];
            if(current_player.mailbox.isEmpty())
            {
                console.log("Player " + player_name + " submitted to chain "
                        + chainName + "but there's no chain to submit to!");
                return;
            }
            intendedChainNameForSubmission = submission_info.chainName;
            if(intendedChainNameForSubmission !== current_player.mailbox.getFrontItem().getName()){
                console.log("Player " + player_name + " tried to submit to chain "
                    + current_player.mailbox.getFrontItem().getName()
                    + " but they thought it was chain " + intendedChainNameForSubmission);
                return;
            }
            current_chain = current_player.mailbox.popFrontItem();
            current_chain.addSubmission(player_name, submission_info.submission);
            next_player = game.player_list[player_index + 1];
            next_player.mailbox.addItem(current_chain);
        }
    };

    this.getNextClueForPlayer = function(game_name, player_name)
    {
        var nextClue = "";

        var game = d_active_games[game_name];
        if(game === undefined)
        {
            console.log("Cannot find game name " + game_name);
            return undefined;
        }
        var player_index = findPlayer(game.player_list, player_name);
        if(player_index === undefined)
        {
            console.log("Cannot find player name " + player_name);
            return undefined;
        }

        var player = game.player_list[player_index];
        if(player.mailbox.isEmpty()){
            console.log("Not terribly out of the ordinary. Someone's too fast.");
            return {has_clue : false, finished : false};
        }
        else{
            var currentChain = player.mailbox.getFrontItem();
            var nextClue = "";
            if(currentChain.submissionCount() === 0){
                //First submission
                nextClue = "Pick a word or phrase";
            }
            else if(currentChain.isComplete()){
                nextClue = "You're all done!";
                console.log("Player " + player_name + " is totally done!");
                return {has_clue : false, finished : true};
            }
            else{
                nextClue = currentChain.getLastSubmission();
            }
            return {has_clue : true,
                    clue : nextClue,
                    chainName : currentChain.getName()};
        }
    };

    this.getPreviousPlayer = function(game_name, player_name)
    {
        var game = d_active_games[game_name];
        if(game === undefined)
        {
            console.log("Cannot find game name " + game_name);
            return undefined;
        }
        var player_index = findPlayer(game.player_list, player_name);
        if(player_index === undefined)
        {
            console.log("Cannot find player name " + player_name);
            return undefined;
        }

        var player_index = findPlayer(game.player_list, player_name);
        if(player_index === 0){
            return game.player_list[game.player_list.length - 1].name;
        }
        return game.player_list[player_index - 1].name;
    };

    this.getGameData = function(game_name)
    {
        var game = d_active_games[game_name];
        if(game === undefined){
            return "No such game " + game_name;
        }
        return JSON.stringify(game);
    };

    //Arguments: none
    //Returns: object with keys string GameName, values list of string UserNames
    this.getGameList = function()
    {
      var gameList = {};
      for (var gameName in d_active_games) {
        if (!d_active_games.hasOwnProperty(gameName)) {
          continue;
        }
        console.log("Game name: " + gameName);
        var playerList = d_active_games[gameName].player_list;
        console.log(playerList);
        var playerNames = [];
        for (var i = 0; i < playerList.length; i += 1) {
          player = playerList[i];
          console.log(player);
          playerNames.push(player.name);
        }
        gameList[gameName] = playerNames;
      }
      console.log("RETURNING:");
      console.log(gameList);
      return gameList;
    };
}
