function get_initial_data(session) {
	
};

module.exports = function(app, io){

    var player_game = require("../controllers/player_game.server.controller.js");

    io.sockets.on("connection", function(socket){
        console.log("Connection made to the socket server from " + socket.request.connection.remoteAddress + "!");
        console.log("Session: ", socket.handshake.session);

	var initial_data = player_game.getInitialData(
                                socket.handshake.session.gameName,
			 	socket.handshake.session.player_name);
	socket.emit("initialize", initial_data);

        socket.on("gameCreated", function(data){
            console.log("Client created game: " + data.gameName);
            var gameName = data.gameName;
            var player_name = data.playerName;
            console.log(gameName);
            console.log(player_name);
            var obj = player_game.processNewPlayerGameInfo(gameName, player_name);
            var rc = obj.rc;
            //TODO: Do something when these return codes appear
            if(rc === 1){
                //Cannot find game and failed to create
            }
            else if(rc === 2){
                //Player name in use
                socket.emit("warning", 
                        {msg : "Player name " + player_name + " is already in use"});
                return;
            }
            if(obj.playerIsFirst) //Player created the game
            {
                socket.broadcast.emit("addGame", data);
            }
            var player_list = player_game.getAllPlayerNamesInGame(gameName);
            socket.emit("joinedGame", {
                gameName : gameName,
                playerList : player_list,
                playerIsFirst : player_list[0] === player_name
            });
            io.to(gameName).emit("otherPlayerJoinedGame", {player_name : player_name});
            socket.join(gameName);
            socket.handshake.session.gameName = gameName;
            socket.handshake.session.player_name = player_name;
            socket.handshake.session.playerIsFirst = obj.playerIsFirst;
            socket.handshake.session.save();
        });
        socket.on("gameStarted", function(data){
            player_game.startGame(data.gameName);
            io.to(data.gameName).emit("gameStarted", {});
        });
        socket.on("clueSubmitted", function(data){
            console.log("Game: " + data.gameName + " Player: " 
                    + data.playerName + " Clue: " + data.clue);
            var retObj = player_game.submitEntry(data.gameName, data.playerName, data.submissionInfo);
            console.log("retObj: " + JSON.stringify(retObj));
            if(retObj.rc){
                console.log("submitEntry returned code: " + retObj.rc);
                return;
            }
            io.to(data.gameName).emit("clueRecieved", {
                recievingPlayer : retObj.recievingPlayer,
                submissionInfo : retObj.submissionInfo
            });
        });
    });


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
            res.render("lobby", {player_is_first : req.session.player_is_first, 
                playerNames : player_game.getAllPlayerNamesInGame(game_name) });
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
        var gameData = player_game.getAllGameData(req.param("game_name"));
        res.render("admin_get_game_data", {chain_infos: gameData});
    });
    app.post("/start_game", function(req, res){
        var game_name = req.session.game_name
        console.log("Starting game" + game_name);
        player_game.startGame(game_name);
        res.redirect("/next_prompt");

    });
};
