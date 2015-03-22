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
        console.log(req.session.game_name);
        console.log(req.session.player_name);
        res.send(req.session.game_name + " " + req.session.player_name);
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
