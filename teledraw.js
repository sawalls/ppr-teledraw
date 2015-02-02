var express = require('express');
var bodyParser = require('body-parser');

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

const DEFAULT_HTTP_LISTEN_PORT = 80;
const PORT_ARGUMENT_INDEX = 2;
const VIEWS_DIRECTORY = "./views";

function GameManager()
{
    var d_active_games = {};//Key value pair gameId to game
    
    //Helper functions
    function findPlayer(player_list, name)
    {
        for(var i = 0, len = player_list.length; i < len; i++)
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
    this.createGame = function(game_name)
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
            if(findPlayer(d_active_games[game_name].player_list, player_name) != undefined)
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
            game.player_list[player_index].current_thread = (game.player_list[player_index].current_thread)%(game.player_list.length);
        }
    }
}

var gm = new GameManager();

var port = DEFAULT_HTTP_LISTEN_PORT;
if (process.argv.length === PORT_ARGUMENT_INDEX + 1) {
  port = process.argv[PORT_ARGUMENT_INDEX];
}

var app = express();

app.set('views', VIEWS_DIRECTORY);
app.set('view engine', 'jade');

var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Created a listening port at http://%s:%s', host, port);
});

app.use(bodyParser.urlencoded({extended: false}));

app.get('/tmp', function(req, res) {
  res.render('index', { title: 'THE TITLE', message: 'Howdy!' });
});

app.get('/', function(req, res) {
  res.sendFile('player_game_form.html', {root: __dirname });
});

app.post('/my-handling-form-page', function(req, res) {
  var game_name = req.body.user_game_name;
  var player_name = req.body.user_player_name;
  console.log("Player: '" + player_name + "' is attempting to join game: '" + game_name + "'");

  var created_game = false;
  switch (gm.createGame(game_name)) {
    case 0:
      created_game = true;
      console.log("Game '" + game_name + "' didn't exist. Successfully created it.");
      break;
    case GAME_CREATION_ERRORS.GAME_NAME_IN_USE:
      break;
    default:
      console.log("UNEXPECTED BEHAVIOR! createGame returned something odd.");
      res.sendFile('unexpected.html', {root: __dirname });
      return;
  }

  switch (gm.addPlayerToGame(player_name, game_name)) {
    case 0:
      console.log("All set. Added player to game");
      if (created_game) {
        res.sendFile('host_game.html', {root: __dirname });
        return;
      } else {
        res.sendFile('welcome_screen.html', {root: __dirname });
        return;
      }
      break;
    case ADD_PLAYER_ERRORS.CANNOT_FIND_GAME_BY_NAME:
      console.log("UNEXPECTED BEHAVIOR no game named '" + game_name + "'");
      res.sendFile('unexpected.html', {root: __dirname });
      return;
      break;
    case ADD_PLAYER_ERRORS.PLAYER_NAME_IN_USE:
      //TODO this needs a good error message to user
      console.log("User error there's already someone named '" + player_name + "' in game: '" + game_name + "'");
      res.sendFile('player_game_form.html', {root: __dirname });
      return;
      break;
    default:
      console.log("UNEXPECTED BEHAVIOR! addPlayerToGame returned something odd.");
      res.sendFile('unexpected.html', {root: __dirname });
      return;
  }
});
