var User = {
    roomId: null,
    turn: null,
    moveTurn: null,
    init: function () {
        $('#reload').button({ icons: { primary: 'ui-icon-refresh' } }).click(function () { window.location.reload(); });
        var socket = io.connect(window.location.hostname + ':3000', { resource: 'api' });
        //Подключение
        socket.on('connect', function () {
            $('#status').html('Успешно подключились к игровому серверу');
        });
        // Переподключаемся
        socket.on('reconnect', function () {
            $('#connect-status').html('Переподключились, продолжайте игру');
        });
        // Соединение потеряно
        socket.on('reconnecting', function () {
            $('#status').html('Соединение с сервером потеряно, переподключаемся...');
        });
        // Ошибка
        socket.on('error', function (e) {
            $('#status').html('Ошибка: ' + (e ? e : 'неизвестная ошибка'));
        });
        // Соперник отлючился
        socket.on('exit', function () {
            User.endGame(User.turn, 'exit');
        });
        //Ожидание
        socket.on('wait', function () {
            $('#status').html('... Ожидаем соперника...');
        });
        //Запуск
        socket.on('ready', function (roomId, turn, x, y) {
            $('#status').html('... Начинаем Игру...');
            User.startGame(roomId, turn, x, y);

            $("#board-table td").click(function (e) {
                if (User.moveTurn) socket.emit('step', User.roomId, e.target.id);
            }).hover(function () {
                $(this).toggleClass('ui-state-hover');
            }, function () {
                $(this).toggleClass('ui-state-hover');
            });

            console.log(socket);
        });

        socket.on('step', function (id, turn, win) {
            User.move(id, turn, win);
        });
    },

    startGame: function (roomId, turn, x, y) {
        this.roomId = roomId;
        this.turn = turn;
        this.moveTurn = (turn == 'X');
        var table = $('#board-table').empty();

        for (var i = 1; i <= y; i++) {
            var tr = $('<tr height="50px"/>');
            for (var j = 0; j < x; j++) {
                tr.append($('<td/>').attr('id', (j + 1) + 'x' + i).addClass('ui-state-default'));
            }
            table.append(tr);
        }
    },

    move: function (id, turn, win) {
        console.log('1Turn: ' + this.turn + ' MoveTurn: ' + turn);
        this.moveTurn = this.turn != turn;
        $("#" + id).attr('class', 'ui-state-hover').html(turn); 
        if (!win) { 
            $('#status').html('Сейчас ' + (this.turn != turn ? 'ваш ход' : 'ходит соперник'));
        } else {
            this.endGame(turn, win);
        }
    },

    endGame: function (turn, win) {
        var text = '';
        switch (win) {
            case 'none': text = 'Ничья!'; break; 
            case 'exit': text = 'Соперник сбежал с поля боя! Игра закончена'; break; 
            default: text = 'Вы ' + (this.moveTurn ? 'проиграли! =(' : 'выиграли! =)'); 
        }
        
        $("<div/>").html(text).dialog({
            title: 'Конец игры',
            modal: true,
            closeOnEscape: false,
            resizable: false,
            buttons: {
                "Играть по новой": function () {
                    $(this).dialog("close");
                    window.location.reload();
                }
            },
            close: function () {
                window.location.reload();
            }
        });
    }
}
