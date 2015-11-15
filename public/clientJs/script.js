localStorage.debug = '*';

function testFunc(){
    console.log("Loaded the external script!");
}

var socket = io();
var g_player_name = "";
var g_game_name = "";
var g_game_has_started = false;
//var g_firstSubmissionWasMade = false;
var g_mailbox = [];
var g_game_has_finished = false;
var g_player_is_first = false;
testFunc();


function addGameToList(gameName){
    console.log("Adding Game " + gameName);
    $('#gameList').append('<li> ' + gameName + "</li>");
    $('#noGamesNote').remove();
}

function createGame(){
    var gameName = $('#gameNameInput').val();
    if(gameName == ""){
        console.log("Empty game name!");
        return;
    }
    var playerName = $('#playerNameInput').val();
    if(playerName === ""){
        console.log("Empty player name!");
        return;
    }
    g_player_name = playerName;
    g_game_name = gameName;
    g_mailbox.push({chainName : playerName + "'s chain"});
    socket.emit('gameCreated', 
            {gameName: gameName,
             playerName : playerName});
}

function renderLobby(gameName, playerList)
{
    console.log(JSON.stringify(playerList));

    $('#gameListStuff').remove();
    $('#lobbyPlayerListHeading').text("Player List:");
    for(var i = 0; i < playerList.length; i++){
        $('#playerList').append("<li>" + playerList[i] + "</li>");
    }
    if(g_player_is_first && !g_game_has_started){ //This player created the game
        $("#startGameButtonContainer")
            .append("<button id='startGameBtn' onclick='startGame()'>Start Game</button>");
    }
    $('#lobbyStuff').show();
}

function startGame(){
    console.log("Starting game " + g_game_name);
    $("#startGameButtonContainer").hide();
    socket.emit("gameStarted", {gameName: g_game_name});
}

function showNextClueInMailbox()
{
    console.log("showNextClue!");
    if(g_mailbox.length > 0){
        var chain = g_mailbox[0];
        console.log("something in the mailbox!");
        if(chain.chainName === g_player_name + "'s chain"){
            console.log('Reloaded with only your own chain. No problem.');
            return;
        }
        var clue = chain.submission;
        if(clue.match(/\.jpg\b|\.png\b|\.gif\b/g)){
            $("#clueContainer").html("<img src=" + clue + " alt=" + clue + ">");
        }
        else{
            $("#clueContainer").html("<p>" + clue + "</p>");
        }
        $("#submitBtn").removeAttr("disabled");
    }
    else{
        console.log("Nothing in the mailbox!");
        $("#clueContainer").html("<p>Please wait for your next clue!</p>");
        $("#submitBtn").attr("disabled", "disabled");
    }
}

function submitClue(){
    console.log("Submitting!");
    var clueText = $("#mainEntry").val();
    if(clueText === ""){
        alert("No clue to submit!");
        return;
    }
    var chainName = g_mailbox.splice(0,1)[0].chainName; //Remove whatever clue we just responded to
    socket.emit("clueSubmitted", 
        {gameName : g_game_name,
            playerName : g_player_name,
            submissionInfo : {
                chainName : chainName,
                submission : clueText}});
    $("#mainEntry").val("");
    showNextClueInMailbox();
}

function add_clue_to_mailbox(clue) {
    g_mailbox.push(clue);
    if(g_mailbox.length === 1){
        showNextClueInMailbox();
    }
}

function render_player_finished() {
    $("#gameplayStuff").show();
    $('#mainEntryContainer').hide();
    $('#clueContainer').html("<p>You're all done! Just wait for the reveal.</p>");
}

function render_game_finished() {
    if (g_player_is_first) {
        $('#clueContainer').html("<p>The game's totally over. You're the host!</p>");
        $('#clueContainer')
            .append("<button id='start_reveal_btn' onclick='start_reveal()'>Start Reveal</button>");
    } else {
        $('#clueContainer').html("<p>The game's totally over! Yell at the host to start the reveal!</p>");
    }
}

function start_reveal() {
    console.log("Starting reveal!");
    $("#start_reveal_btn").hide();
    socket.emit("reveal_started", {gameName: g_game_name});
}

socket.on("initializeResponse", function(data) {
    console.log("initial_data: " + JSON.stringify(data));
    if (!data) {
        //Draw the gameListStuff
        $("#gameListStuff").show();
    } else {
        g_game_name = data.game_name;
        g_player_name = data.player_name;
        g_game_has_started = data.game_has_started;
        g_game_has_finished = data.game_has_finished;
        if (g_game_has_started) {
            for (var i = 0, clue; clue = data.mailbox[i++]; ) {
                add_clue_to_mailbox(clue);
            }
        }

        console.log('About to call renderLobby from initializeResponse handler');
        g_player_is_first = data.player_name_list[0] === data.player_name;
        renderLobby(data.game_name,
                    data.player_name_list);

        if (g_game_has_started) {
            $("#gameplayStuff").show();
            $("#mainEntryContainer").show();
            $("#submitBtn").removeAttr("disabled");
        }
        if (data.player_has_finished) {
            render_player_finished();
        }
        if (g_game_has_finished) {
            render_game_finished();
        }
    }
});

socket.on("game_finished", function(data) {
    console.log("game_finished");
    render_game_finished();
});

socket.on("warning", function(data){
    alert(data.msg);
});

socket.on('addGame', function(data){
    addGameToList(data.gameName);
});

socket.on("joinedGame", function(data){
    console.log("joinedGame: " + data);
    g_player_is_first = data.playerIsFirst;
    renderLobby(data.gameName, data.playerList);
});

socket.on("gameStarted", function(data){
    console.log("gameStarted websocket message received");
    $("#mainEntryContainer").show();
    $("#submitBtn").removeAttr("disabled");
    $("#gameplayStuff").show();
});

socket.on('otherPlayerJoinedGame', function(data){
    console.log("otherPlayerJoinedGame");
    $('#playerList').append("<li>" + data.player_name + "</li>");
});

socket.on("clueRecieved", function(data){
    console.log("Clue Recieved: " + JSON.stringify(data));
    if(data.recievingPlayer === g_player_name){
        add_clue_to_mailbox(data.submissionInfo);
    }
});

socket.on("player_finished", function(data) {
    console.log("player_finished");
    render_player_finished();
});

$(function(){
    console.log("Top-level jQuery function started");

    $("#createGameBtn").click(function() {createGame();});
    $("#submitBtn").click(function() {submitClue();});

    socket.emit('initializeRequest', {});
});
