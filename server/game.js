
var fiveInRow = module.exports = function() {
    this.rooms = [];
    this.freeUser = [];
    this.gameUsers = [];
    this.x = 6;
    this.y = 6;
}

var RoomGame = function(user, opponent, x, y) {
    this.board = [];
    this.busyCages = 0;
    this.user = user; // X
    this.opponent = opponent; // O
    this.x = x;
    this.y = y;
}

fiveInRow.prototype.start = function(user, cb) {

    //поиск оппонента, создание комнаты
    if (this.freeUser.length > 0) {
        var opponent = this.freeUser.shift();
        var game = new RoomGame(user, opponent, this.x, this.y);
        var id = user + opponent;
        this.gameUsers[user] = id;
        this.gameUsers[opponent] = id;
        this.rooms[id] = game
        cb(true, id, opponent, this.x, this.y);
    }
    //на случай, когда оппонента нет
    else {
        this.freeUser.push(user);
        cb(false);
    }
}

fiveInRow.prototype.end = function(user, cb) {
    delete this.freeUser[user];
    if(this.gameUsers[user] === undefined) return; 

    var gameId = this.gameUsers[user];
    if(this.rooms[gameId] === undefined) return;

    var game = this.rooms[gameId];
    var opponent = (user == game.user ? game.opponent : game.user);
    delete this.rooms[gameId];

    game = null;
    delete this.gameUsers[user];
    cb(gameId, opponent);
}

fiveInRow.prototype.step = function(gameId, x, y, user, cb) {
    this.rooms[gameId].step(x, y, user, cb);
}

RoomGame.prototype.step = function(x, y, user, cb) {
    if(this.board[x + 'x' + y] !== undefined) return;
    this.board[x + 'x' + y] = this.getTurn(user);
    this.busyCages++;
    cb(this.checkWinner(x, y, this.getTurn(user)), this.getTurn(user));
}

RoomGame.prototype.getTurn = function(user) {
    return (user == this.user ? 'X' : 'O');
}

RoomGame.prototype.checkWinner = function(x, y, turn) {
    if(this.busyCages == (this.x * this.y)) {
        return 'none';
    } else if(
        this.checkWinnerDynamic('-', x, y, turn)
            || this.checkWinnerDynamic('|', x, y, turn)
            || this.checkWinnerDynamic('\\', x , y, turn)
            || this.checkWinnerDynamic('/', x, y, turn)
        ) {
        return true;
    } else {
        return false;
    }
}

RoomGame.prototype.checkWinnerDynamic = function(combin, x, y, turn) {
    var winCage = 1;
    switch(combin) {
        case '-':
            var toLeft = toRight = true,
                min = x - 5, max = x + 5;
            min = (min < 1) ? 1 : min;
            max = (max > this.x) ? this.x : max;
            for(var i = 1; i <= 5; i++) {
                if(winCage >= 5) return true;
                if(!toLeft && !toRight) return false;
                if(toLeft && min <= (x-i) && this.board[(x-i) + 'x' + y] == turn) { winCage++; } else { toLeft = false; }
                if(toRight && (x+i) <= max && this.board[(x+i) + 'x' + y] == turn) { winCage++; } else { toRight = false; }
            }
            break;

        case '|':
            var toUp = toDown = true,
                min = y - 5, max = y + 5;
            min = (min < 1) ? 1 : min;
            max = (max > this.y) ? this.y : max;
            for(var i = 1; i <= 5; i++) {
               if(winCage >= 5) return true;
               if(!toUp && !toDown) return false;
               if(toUp && min <= (y-i) && this.board[x + 'x' + (y-i)] == turn) { winCage++; } else { toUp = false; }
               if(toDown && (y+i) <= max && this.board[x + 'x' + (y+i)] == turn) { winCage++; } else { toDown = false; }
            }
        break;

        case '\\':
            var toUpLeft = toDownRight = true,
                minX = x - 5, maxX = x + 5,
                minY = y - 5, maxY = y + 5;
            minX = (minX < 1) ? 1 : minX;
            maxX = (maxX > this.x) ? this.x : maxX;
            minY = (minY < 1) ? 1 : minY;
            maxY = (maxY > this.y) ? this.y : maxY;
            for(var i = 1; i <= 5; i++) {
               if(winCage >= 5) return true;
               if(!toUpLeft && !toDownRight) return false;
               if(toUpLeft && minX <= (x-i) && minY <= (y-i) && this.board[(x-i) + 'x' + (y-i)] == turn) { winCage++; } else { toUpLeft = false; }
               if(toDownRight && (x+i) <= maxX && (y+i) <= maxY && this.board[(x+i) + 'x' + (y+i)] == turn) { winCage++; } else { toDownRight = false; }
            }
        break;

        case '/':
            var toDownLeft = toUpRight = true,
                minX = x - 5, maxX = x + 5,
                minY = y - 5., maxY = y + 5;
            minX = (minX < 1) ? 1 : minX;
            maxX = (maxX > this.x) ? this.x : maxX;
            minY = (minY < 1) ? 1 : minY;
            maxY = (maxY > this.y) ? this.y : maxY;
            for(var i = 1; i <= 5; i++) {
                if(winCage >= 5) return true;
                if(!toDownLeft && !toUpRight) return false;
                if(toDownLeft && minX <= (x-i) && (y+i) <= maxY && this.board[(x-i) + 'x' + (y+i)] == turn) { winCage++; } else { toDownLeft = false; }
                if(toUpRight && (x+i) <= maxX && (y-i) <= maxY && this.board[(x+i) + 'x' + (y-i)] == turn) { winCage++; } else { toUpRight = false; }
            }
        break;

        default: return false; break;
    }
    return(winCage >= 5);
}