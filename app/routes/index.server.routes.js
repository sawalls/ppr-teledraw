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
        if(rc === 1){
            //Cannot find game and failed to create
        }
        else if(rc === 2){
            //Player name in use
        }
        req.session.game_name = game_name;
        req.session.player_name = player_name;
        res.redirect("/next_prompt");
    });
    app.post("/my_submission_form_page", function(req, res){
        // Process the request to submit the POST data!
        var submission = req.param("user_submission");
        var thread_index = parseInt(req.param("thread_index"));
        var submission_index = parseInt(req.param("submission_index"));
        console.log("Params: " + thread_index + "\n" 
            + submission + "\n" + submission_index);
        var game_name = req.session.game_name;
        var player_name = req.session.player_name;
        console.log(game_name);
        console.log(player_name);
        var rc = player_game.submitEntry(game_name, player_name,
                                          {thread_index : thread_index,
                                           submission_index : submission_index,
                                           submission : submission});
        //TODO sawalls: check this return code :D

        //Now await your next prompt
        res.redirect("/next_prompt");
    });
    app.get("/next_prompt", function(req, res) {
        var game_name = req.session.game_name;
        var player_name = req.session.player_name;
        var nextPrompt = player_game.getNextPrompt(game_name, player_name);
        if (promptInfo === undefined) {
          //TODO: do something about unrecoverable error
        } else if (promptInfo.has_clue === true) {
          res.render("submit_text", {game_name : game_name,
                                     player_name : player_name,
                                     clue : promptInfo.clue,
                                     thread_index : promptInfo.thread_index,
                                     submission_index : promptInfo.submission_index});
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
};
