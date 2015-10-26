function testFunc(){
    console.log("Loaded the external script!");
}

var socket = io();
var g_playerName = "";
var g_gameName = "";
//var g_firstSubmissionWasMade = false;
var g_mailbox = [];
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
    g_playerName = playerName;
    g_gameName = gameName;
    g_mailbox.push({chainName : playerName + "'s chain"});
    socket.emit('gameCreated', 
            {gameName: gameName,
             playerName : playerName});
}

function enterLobby(gameName, playerList, playerIsFirst)
{
    console.log(JSON.stringify(playerList));

    $('#gameListStuff').remove();
    $('#lobbyPlayerListHeading').text("Player List:");
    for(var i = 0; i < playerList.length; i++){
        $('#playerList').append("<li>" + playerList[i] + "</li>");
    }
    if(playerIsFirst){ //This player created the game
        $("#startGameButtonContainer")
            .append("<button id='startGameBtn' onclick='startGame()'>Start Game</button>");
    }
    $('#lobbyStuff').show();
}

function startGame(){
    console.log("Starting game " + g_gameName);
    $("#startGameButtonContainer").hide();
    socket.emit("gameStarted", {gameName: g_gameName});
}

function showNextClueInMailbox()
{
    console.log("showNextClue!");
    if(g_mailbox.length > 0){
        console.log("something in the mailbox!");
        if(g_mailbox[0].chainName === g_playerName + "'s chain"){
            $("#clueContainer").html("<p>All done! Wait for the reveal!</p>");
            return;
        }
        var clue = g_mailbox[0].submission;
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
        {gameName : g_gameName,
            playerName : g_playerName,
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

socket.on("initialize", function(data) {
    console.log("initial_data: " + JSON.stringify(data));
    if (!data) {
        //Draw the gameListStuff
        $("#gameListStuff").show();
    } else {
        enterLobby(data.game_name,
                   data.player_name_list,
                   data.player_name_list[0] === data.player_name);
        if (data.game_has_started) {
            g_mailbox = data.mailbox;
            for (var i = 0, clue; clue = g_mailbox[i++]; ) {
                add_clue_to_mailbox(clue);
            }

            $("#gameplayStuff").show();
            $("#mainEntryContainer").show();
            $("#submitBtn").removeAttr("disabled");
        }
    }
});

socket.on("warning", function(data){
    alert(data.msg);
});

socket.on('addGame', function(data){
    addGameToList(data.gameName);
});

socket.on("joinedGame", function(data){
    enterLobby(data.gameName, data.playerList, data.playerIsFirst);
});

socket.on("gameStarted", function(data){
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
    if(data.recievingPlayer === g_playerName){
        add_clue_to_mailbox(data.submissionInfo);
    }
});

$(function(){
    console.log("Top-level jQuery function started");
    console.log("Waiting for initial_data");

    $("#createGameBtn").click(function() {createGame();});
    $("#submitBtn").click(function() {submitClue();});

    $("#gameListStuff").hide();
    $("#lobbyStuff").hide()
    $("#gameplayStuff").hide();
});
