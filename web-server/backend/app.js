const Player = require('./classes/Player');
const Table = require('./classes/Table');
const getWinCondition = require('./helper/winConditions');

const express = require('express');
const app = express();

const path = require('path');

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 3000;
const rootPath = path.join(__dirname, '..');

const { v4: uuidv4 } = require('uuid');

app.use(express.static(rootPath + "/frontend"));

let socketToRoom = {};
let rooms = {
  [uuidv4()]: new Table('alpha'),
  [uuidv4()]: new Table('beta'),
  [uuidv4()]: new Table('charlie'),
  [uuidv4()]: new Table('delta'),
  [uuidv4()]: new Table('epsilon')
};

app.get('/', (req, res) => {
  res.sendFile(rootPath + "/frontend/index.html");
});

io.on('connection', (socket) => {
  socket.on('request-room-data', () => {
    const simplifiedRooms = {};
    for(const roomId in rooms) {
      simplifiedRooms[roomId] = rooms[roomId].safeFormat();
    }

    socket.emit('send-room-data', simplifiedRooms);
  });

  socket.on('create-room', (roomName, playerName, playerBank) => {
    const roomId = uuidv4();
    rooms[roomId] = new Table(roomName);
    rooms[roomId].addPlayer(socket.id,
      new Player(playerName, playerBank)
    );

    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socket.emit('start-game', rooms[roomId].gameFormat());
  });

  socket.on('blackjack-action', action => {
    const roomId = socketToRoom[socket.id];
    const currentPlayer = rooms[roomId].getPlayerInTurn();
    
    if(socket.id === currentPlayer) {
      let nextPlayer = playerTurn(socket, roomId, currentPlayer, action);
      io.to(roomId).emit('render-game', rooms[roomId].gameFormat());

      if(!nextPlayer) {
        socket.emit('end-turn');
        endRound(io, roomId);
        setTimeout(() => gotoNextRound(io, roomId), 8000);
      } else if (currentPlayer != nextPlayer) {
        socket.emit('end-turn');
        updateSocketsInRoom(io, roomId, rooms[roomId].players[nextPlayer].name + ' turn');
        io.sockets.sockets.get(nextPlayer).emit('take-turn');
      }
    }
  });

  socket.on('join-room', (playerName, playerBank, roomId) => {
    if(!roomId in rooms) {
      return;
    } else if(rooms[roomId].roomAvalible) {
      return;
    }

    rooms[roomId].addPlayer(socket.id,
      new Player(playerName, playerBank)
    );

    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socket.emit('start-game', rooms[roomId].gameFormat());
    io.to(roomId).emit('player-connect', rooms[roomId].gameFormat());
  });

  socket.on('player-ready', (bet) => {
    const roomId = socketToRoom[socket.id];
    const player = rooms[roomId].players[socket.id]
    const room = rooms[roomId];
    if(!player.ready) {
      player.setBet(Number(bet));
      player.ready = true;
      room.playersReady++;
      socket.emit('ready-recieved');

      if(room.canStartRound()) {
        let [firstPlayerId, firstPlayerName] = room.startRound();
        io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
        
        if(rooms[roomId].isPlayerBlackjack()) {
          let nextPlayerId = rooms[roomId].playerStay();
          if(nextPlayerId) {
            let nextPlayerName = rooms[roomId].players[nextPlayerId].name;
            updateSocketsInRoom(io, roomId, `${nextPlayerName} turn`);
            io.sockets.sockets.get(nextPlayerId).emit('take-turn');
          } else {
            updateSocketsInRoom(io, roomId, `dealer turn`);
            rooms[roomId].dealerPlay();
          }
        } else {
          updateSocketsInRoom(io, roomId, `${firstPlayerName} turn`);
          io.sockets.sockets.get(firstPlayerId).emit('take-turn');
        }
      }
    }
  });

  socket.on('disconnect', (reason) => {
    let roomId = socketToRoom[socket.id];
    if(roomId) {
      delete rooms[roomId].removePlayer(socket.id);
      delete socketToRoom[socket.id];
      io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
    }
  });
});

function endRound(io, roomId) {
  updateSocketsInRoom(io, roomId, 'Dealers turn');
  rooms[roomId].dealerPlay();
  const socketWinConditions = rooms[roomId].endRound();
  
  for(const [socketId, winCondition] of Object.entries(socketWinConditions)) {
    updateSocketStatus(io.sockets.sockets.get(socketId), winCondition);
  }

  io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
}

function gotoNextRound(io, roomId) {
  rooms[roomId].nextRound();
  io.to(roomId).emit('new-round', rooms[roomId].gameFormat());
  updateSocketsInRoom(io, roomId, 'Ready up');
}

function playerTurn(socket, roomId, currentPlayer, action) {  
  if(action === 'hit') {
    socket.emit('first-turn-over');
    let nextPlayer = rooms[roomId].playerHit();

    if(nextPlayer && currentPlayer === nextPlayer && rooms[roomId].isPlayerBlackjack()) {
      return rooms[roomId].playerStay();
    }

    return nextPlayer;
  } else if (action === 'stay') {
    return rooms[roomId].playerStay();
  } else if (action === 'dbl-down') {         //Add a first round check
    return rooms[roomId].playerDoubleDown();
  }

  return null;
}

function updateSocketsInRoom(io, roomId, message) {
  io.to(roomId).emit('update-status', message);
}

function updateSocketStatus(socket, message) {
  socket.emit('update-status', message);
}

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});