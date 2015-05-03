
module.exports = GameManager;

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
                threads : [], //Thread i is the one that player i started
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
                var insertion_index = d_active_games[game_name].player_list.length;
                d_active_games[game_name].player_list.push(
                    {
                        name : player_name,
                        current_thread : insertion_index,
                    });
                d_active_games[game_name].threads.push([]);//Need an empty thread for each player
                return {rc : 0, player_index : insertion_index};
            }
        }
    };

    this.submitEntryForPlayer = function(game_name, player_name, submission)
    {
        console.log("submitting: " + game_name + " - " + player_name + " - " + submission);
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
            console.log("Attempting to push submission: " + submission);
            var current_player = game.player_list[player_index];
            var thread_index = current_player.current_thread;
            game.threads[thread_index].push(submission);
            thread_index = (thread_index + game.player_list.length - 1) % game.player_list.length;
            current_player.current_thread = thread_index;
            console.log("New thread index" + current_player.current_thread);
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
        //The number of submissions this player has made so far
        //It is also the index that the player is about to submit
        var thread_index = game.player_list[player_index].current_thread;
        var player_submission_count = (player_index + game.player_list.length - thread_index)
                                        % game.player_list.length;

        var current_thread = game.threads[thread_index];
        if (current_thread.length < player_submission_count)
        {
            console.log("Not terribly out of the ordinary. Someone's too fast.");
            return undefined;
        } else if (current_thread.length > player_submission_count)
        {
            console.log("ASSERTION ERROR. Somehow the player would be "
                        + "submitting to the middle of the thread");
            return undefined;
        }

        if(player_submission_count === 0)
        {
            console.log("Initial clue for player" + player_name);
            nextClue = "Pick a word or phrase";
        }
        else
        {
            nextClue = current_thread[player_submission_count - 1];
        }

        return {clue : nextClue, thread_index : thread_index, submission_index : player_submission_count};
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
