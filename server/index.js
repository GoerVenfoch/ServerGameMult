const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server)

var fiveInRow = require('./server/game.js');

app.set("port", 3000);
app.use("/static", express.static(__dirname + "/static"));

app.get('/', function (require, response) {
    response.sendFile(path.join(__dirname + "/static" + '/index.html'));
});

server.listen(3000, function () {
    console.log(`Starting server on port 3000`);
});

var Game = new fiveInRow();
Game.x = Game.y = 10;

io.on('connection', function (socket) {
    Game.start(socket.id, function(start, roomId, opponent, x, y) {
        if (start) {
            socket.join(roomId);
            io.in(opponent).socketsJoin(roomId);
            socket.emit('ready', roomId, 'X', x, y);
            io.in(opponent).emit('ready', roomId, 'O', x, y)
        }
        else {
            io.sockets.emit('wait');
        }
    });

    socket.on('step', function (gameId, id) {
        var coordinates = id.split('x');
        Game.step(gameId, parseInt(coordinates[0]), parseInt(coordinates[1]), socket.id.toString(), function(win, turn) {
            io.to(gameId).emit('step', id, turn, win);s
            if(win) {
                Game.end(socket.id.toString(), function(gameId, opponent) {
                    socket.leave(gameId);
                    io.in(opponent).socketsLeave(gameId);
                });
            }
        });
    });

    socket.on('disconnect', function () {
        Game.end(socket.id.toString(), function(gameId, opponent) {
            io.in(opponent).emit('exit');
            socket.leave(gameId);
            io.in(opponent).socketsLeave(gameId);
        });
        console.log('%s: %s - disconnected', socket.id.toString(), socket.handshake.address.address);
    });
});