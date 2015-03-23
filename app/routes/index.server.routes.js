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
        var rc = player_game.processNewPlayerGameInfo(game_name, player_name);
        if(rc === 1){
            //Cannot find game and failed to create
        }
        else if(rc === 2){
            //Player name in use
        }
        //Set player session info
        req.session.game_name = game_name;
        req.session.player_name = player_name;
        res.render("submit_text", {game_name : game_name,
                                    player_name : player_name,
                                    clue : "Think of a word or phrase!"});
    });
    app.post("/my_submission_form_page", function(req, res){
        // Process the request to submit the POST data!
        var submission = req.param("user_submission");
        console.log("Params: " + req.params);
        var game_name = req.session.game_name;
        var player_name = req.session.player_name;
        console.log(game_name);
        console.log(player_name);
        var rc = player_game.submitEntry(game_name, player_name, submission);
        //TODO sawalls: check this return code :D

        //Now await your next prompt
        res.redirect("/next_prompt");
    });
    app.get("/next_prompt", function(req, res) {
        var game_name = req.session.game_name;
        var player_name = req.session.player_name;
        var nextPrompt = player_game.getNextPrompt(game_name, player_name);
        if (nextPrompt === undefined) {
          var prevPlayerName = player_game.getPreviousPlayer(game_name, player_name);
          res.render("please_wait", {prev_player_name: prevPlayerName});
        } else {
          res.render("submit_text", {game_name : game_name,
                                     player_name : player_name,
                                     clue : nextPrompt});
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
};
