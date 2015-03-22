
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
    }

    this.addPlayerToGame = function(player_name, game_name)
    {
        if(d_active_games[game_name] === undefined)
        {
            return ADD_PLAYER_ERRORS.CANNOT_FIND_GAME_BY_NAME;
        }
        else
        {
            if(findPlayer(d_active_games[game_name].player_list, player_name) !== undefined)
            {
                return ADD_PLAYER_ERRORS.PLAYER_NAME_IN_USE;
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
                return 0;
            }
        }
    }

    this.submitEntryForPlayer = function(game_name, player_name, submission)
    {
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
            game.threads[game.player_list[player_index].current_thread].push(submission);
            game.player_list[player_index].current_thread--;
            game.player_list[player_index].current_thread = 
                (game.player_list[player_index].current_thread)%(game.player_list.length);
        }
    }

    this.getGameData = function(game_name)
    {
        var game = d_active_games[game_name];
        if(game === undefined){
            return "No such game " + game_name;
        }
        return JSON.stringify(game);
    };
}


