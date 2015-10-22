function testFunc(){
    console.log("Loaded the external script!");
}

var socket = io();
testFunc();
alert("Loaded the socket on the client!");


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
    socket.emit('gameCreated', 
            {gameName: gameName,
             playerName : playerName});
    enterLobby(gameName, playerName);
}

function enterLobby(gameName, playerName)
{
    $('#startupFormStuff').remove();
    $('#lobbyStuff').append("<p id='newPara'>SOME TEXT</p>");
    $('#lobbyTestPara').text("Banana!!!");
    $('#playerList').append("<li>" + playerName + "</li>");
}

socket.on('addGame', function(data){
    addGameToList(data.gameName);
});

socket.on('playerJoinedGame', function(data){
    $('#playerList').append("<li>" + data.playerName + "</li>");
    addPlayerToList(data.playerName);
});

$(function(){
    console.log("Loaded presets!");
    $('#createGameBtn').click(function() {createGame();});
});
