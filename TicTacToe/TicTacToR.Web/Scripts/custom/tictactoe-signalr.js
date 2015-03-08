/// <reference path="../jquery-ui-1.8.20.js" />
/// <reference path="../jquery-1.7.1.js" />
/// <reference path="ajaxUtils.js" />
/// <reference path="../knockout-2.1.0.debug.js" />
/// <reference path="../ko-protected-observable.js" />

var gameViewModel = function ()
{
    var self = this;

    self.Users = ko.observableArray([]);
    self.UserConnections = [];
    self.Game = {};
    self.CurrentPlayer = ko.observable('Game not started');
    self.ChallengeDisabled = ko.observable(false);

    self.showChallenge = function (item)
    {
        if (self.ChallengeDisabled() != true)
        {
            return "display:visible";
        }
        else
        {
            return "display:none";
        }
    }
}

$(function ()
{
    var viewModel = new gameViewModel();
    ko.applyBindings(viewModel);
    var canvas = document.getElementById("gameCanvas");
    if (canvas)
    {
        var hSpacing = canvas.width / 6;
        var vSpacing = canvas.height / 6;
    }
    var hub = $.connection.GameNotificationHub;

    hub.client.DrawPlay = function (rowCol, game, letter)
    {
        viewModel.Game = game;
        var row = rowCol.row;
        var col = rowCol.col;
        var hCenter = (col - 1) * hSpacing + (hSpacing / 6);
        var vCenter = (row - 1) * vSpacing + (vSpacing / 6);
        writeMessage(canvas, letter, hCenter, vCenter);
        if (game.GameStatus == 0)
        {
            viewModel.CurrentPlayer(game.NextTurn);
        }
        else
        {
            viewModel.CurrentPlayer(game.Message);
            alert("Game Over - " + game.Message);
            location.reload();
        }
    };

    hub.client.joined = function (connection, dateTime)
    {
        viewModel.Users.remove(function (item) { return item.UserId == connection.UserId })
        viewModel.Users.push(connection);
    };

    hub.client.getChallengeResponse = function (connectionId, userId)
    {
        viewModel.ChallengeDisabled(true);
        refreshConnections();
        var cnf = confirm('You have been challenged to a game of Tic-Tac-Toe by \'' + userId + '\'. Click Ok to Accept!')
        if (cnf)
        {
            hub.server.challengeAccepted(connectionId);
        }
        else
        {
            hub.server.challengeRefused(connectionId);
            viewModel.ChallengeDisabled(false);
            refreshConnections();
        }
    };

    function refreshConnections()
    {
        var conns = viewModel.Users;
        var oldItems = viewModel.Users.removeAll();
        viewModel.Users(oldItems);
    }

    hub.client.updateSelf = function (connections, connectionName)
    {
        for (var i = 0; i < connections.length; i++)
        {
            if (connections[i].UserId != connectionName)
            {
                viewModel.Users.push(connections[i]);
            }
        }
    };

    hub.client.challengeRefused = function ()
    {
        viewModel.ChallengeDisabled(false);
        viewModel.CurrentPlayer('Challenge not accepted!');
        refreshConnections();
    }


    hub.client.waitForResponse = function (userId)
    {
        viewModel.ChallengeDisabled(true);
        viewModel.CurrentPlayer('Waiting for ' + userId + ' to accept challenge');
        refreshConnections();
    };

    hub.client.rejoinGame = function (connections, connectionName, gameDetails)
    {
        if (gameDetails != null)
        {
            viewModel.ChallengeDisabled(true);
            refreshConnections();
            viewModel.Game = gameDetails;

            viewModel.CurrentPlayer(gameDetails.NextTurn);
            for (var row = 0; row < 6; row++)
            {
                for (var col = 0; col < 6; col++)
                {
                    var letter = '';
                    if(gameDetails.GameMatrix[row][col] == 1)
                    {
                        letter = 'O';
                    }
                    else if(gameDetails.GameMatrix[row][col] == 10)
                    {
                        letter = 'X';
                    }
                    if (letter != '')
                    {
                        var hCenter = (col) * hSpacing + (hSpacing / 3);
                        var vCenter = (row) * vSpacing + (vSpacing / 3);
                        writeMessage(canvas, letter, hCenter, vCenter);
                    }
                }              
            }
        }
        viewModel.Users = ko.observableArray([]);
        for (var i = 0; i < connections.length; i++)
        {
            if (connections[i].UserId != connectionName)
            {
                viewModel.Users.push(connections[i]);
            }
        }
        viewModel.Users.remove(function (item) { return item.UserId == gameDetails.User1Id.UserId });
        viewModel.Users.remove(function (item) { return item.UserId == gameDetails.User2Id.UserId });
    };

    hub.client.beginGame = function (gameDetails)
    {
        viewModel.ChallengeDisabled(true);
        refreshConnections();
        if (gameDetails.User1Id.UserId == clientId ||
            gameDetails.User2Id.UserId == clientId)
        {
            clearCanvas();
            viewModel.Game = gameDetails;
            viewModel.CurrentPlayer(gameDetails.NextTurn);
        }
        var oldArray = viewModel.Users;
        viewModel.Users.remove(function (item) { return item.UserId == gameDetails.User1Id.UserId });
        viewModel.Users.remove(function (item) { return item.UserId == gameDetails.User2Id.UserId });
    };


    hub.client.leave = function (connectionId)
    {
        viewModel.Users().remove(function (item) { return item.ConnectionId == connectionId });
    };
    
    $.connection.hub.start().done(function ()
    {
        var canvasContext;
        $("#activeUsersList").delegate(".challenger", "click", function ()
        {
            viewModel.ChallengeDisabled(true);
            var challengeTo = ko.dataFor(this);
            viewModel.CurrentPlayer('Waiting for ' + challengeTo.UserId + ' to accept challenge');
            hub.server.challenge(challengeTo.ConnectionId, clientId);
            refreshConnections();

        });

        if (canvas && canvas.getContext)
        {
            canvasContext = canvas.getContext('2d');
            var rect = canvas.getBoundingClientRect();
            canvas.height = rect.height;
            canvas.width = rect.width;
            hSpacing = canvas.width / 6;
            vSpacing = canvas.height / 6;

            canvas.addEventListener('click', function (evt)
            {
                if (viewModel.CurrentPlayer() == clientId)
                {
                    var rowCol = getRowCol(evt);
                    rowCol.Player = 'O';
                    hub.server.gameMove(viewModel.Game.GameId, rowCol);
                }
            }, false);

            drawGrid(canvasContext);
        }

        function getRowCol(evt)
        {
            var hSpacing = canvas.width / 6;
            var vSpacing = canvas.height / 6;
            var mousePos = getMousePos(canvas, evt);
            return {
                row: Math.ceil(mousePos.y / vSpacing),
                col: Math.ceil(mousePos.x / hSpacing)
            }
        }

        function getMousePos(canvas, evt)
        {

            var rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }
    });

    function clearCanvas()
    {
        if (canvas && canvas.getContext)
        {
            var canvasContext = canvas.getContext('2d');
            var rect = canvas.getBoundingClientRect();
            canvas.height = rect.height;
            canvas.width = rect.width;

            if (canvasContext)
            {
                canvasContext.clearRect(rect.left, rect.top, rect.width, rect.height);
            }
            drawGrid(canvasContext);
        }
    }

    function drawGrid(canvasContext)
    {
        var hSpacing = canvas.width / 6;
        var vSpacing = canvas.height / 6;
        canvasContext.lineWidth = "4.0";
        for (var i = 1; i < 6; i++)
        {
            canvasContext.beginPath();
            canvasContext.moveTo(0, vSpacing * i);
            canvasContext.lineTo(canvas.width, vSpacing * i);
            canvasContext.stroke();

            canvasContext.beginPath();
            canvasContext.moveTo(hSpacing * i, 0);
            canvasContext.lineTo(hSpacing * i, canvas.height);
            canvasContext.stroke();
        }
    }

    function writeMessage(canvas, message, x, y)
    {
        var canvasContext = canvas.getContext('2d');
        canvasContext.font = '60pt Calibri';
        canvasContext.fillStyle = 'red';
        var textSize = canvasContext.measureText(message);
        canvasContext.fillText(message, x - (textSize.width /3), y + 40);

    }
});