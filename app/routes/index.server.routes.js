module.exports = function(app){
    var index = require("../controllers/index.server.controller.js");
    var player_game = require("../controllers/player_game.server.controller.js");
    app.get('/', player_game.renderEntryPage);
    app.post("/my-handling-form-page", function(req, res){
        console.log("handling the post");
        var game_name = req.param("user_game_name");
        var player_name = req.param("user_player_name");
        console.log(game_name);
        console.log(player_name);
        var obj = player_game.processNewPlayerGameInfo(game_name, player_name);
        var rc = obj.rc;
        //TODO: Do something when these return codes appear
        if(rc === 1){
            //Cannot find game and failed to create
        }
        else if(rc === 2){
            //Player name in use
        }
        req.session.game_name = game_name;
        req.session.player_name = player_name;
        req.session.player_is_first = obj.player_is_first;
        res.redirect("/next_prompt");
    });
    app.post("/my_submission_form_page", function(req, res){
        // Process the request to submit the POST data!
        var submission = req.param("user_submission");
        var chainName = req.param("chainName");
        console.log("Params: " + chainName);
        var game_name = req.session.game_name;
        var player_name = req.session.player_name;
        console.log(game_name);
        console.log(player_name);
        var obj = player_game.submitEntry(game_name, player_name,
                                          {chainName : chainName,
                                           submission : submission});
        if(obj.rc){
            console.log("submitEntry returned error code " + obj.rc);
            return;
        }
        else if(obj.chainCompleted){
            res.render("finished", {game_name : game_name,
                                    player_name : player_name});
            return;
        }
        else{
            //TODO sawalls: check this return code :D

            //Now await your next prompt
            res.redirect("/next_prompt");
        }
    });
    app.get("/next_prompt", function(req, res) {
        var game_name = req.session.game_name;
        if(!player_game.gameHasStarted(game_name)){
            res.render("lobby", {player_is_first : req.session.player_is_first, playerNames : player_game.getAllPlayerNamesInGame(game_name) });
            return;
        }
        var player_name = req.session.player_name;
        var promptInfo = player_game.getNextPrompt(game_name, player_name);
        if (promptInfo === undefined) {
          //TODO: do something about unrecoverable error
        } else if (promptInfo.has_clue === true) {
          res.render("submit_text", {game_name : game_name,
                                     player_name : player_name,
                                     clue : promptInfo.clue,
                                     chainName : promptInfo.chainName});
        } else {
          if (promptInfo.finished === true) {
            res.render("finished", {game_name : game_name,
                                    player_name : player_name});
          } else {
            var prevPlayerName = player_game.getPreviousPlayer(game_name, player_name);
            res.render("please_wait", {prev_player_name: prevPlayerName});
          }
        }
    });
    app.get("/admin", function(req, res){
        res.render("admin_landing");
    });
    app.post("/admin_get_game_data", function(req, res){
        console.log("Get game data");
        console.log(req.param("game_name"));
        res.send(player_game.getAllGameData(req.param("game_name")));
    });
    app.post("/start_game", function(req, res){
        var game_name = req.session.game_name
        console.log("Starting game" + game_name);
        player_game.startGame(game_name);
        res.redirect("/next_prompt");

    });
};
