const { v4: uuidv4 } = require('uuid');
const Player = require('./classes/Player');
const Table = require('./classes/Table');
const path = require('path');

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const { table } = require('console');
const io = new Server(server);

const port = 3000;
const rootPath = path.join(__dirname, '..');

app.use(express.static(rootPath + "/frontend"));

let socketToTable = {};
let tables = {
  [uuidv4()]: new Table('alpha'),
  [uuidv4()]: new Table('beta'),
  [uuidv4()]: new Table('charlie'),
  [uuidv4()]: new Table('delta'),
  [uuidv4()]: new Table('epsilon')
};


app.get('/', (req, res) => {
  res.sendFile(rootPath + "/frontend/index.html");
});

//Everything needs to be inside connection
io.on('connection', (socket) => {
  //Main menu Request
  socket.on('get-room-data', () => {
    const simplifiedRooms = {};
    for(const tableId in tables) {
      simplifiedRooms[tableId] = tables[tableId].safeFormat();
    }
    socket.emit('send-room-data', simplifiedRooms);
  });
  
  //User Creates a room
  socket.on('create-room', (tableName, playerName, playerBank) => {
    const tableId = uuidv4();
    tables[tableId] = new Table(tableName);
    tables[tableId].addPlayer(socket.id, new Player(playerName, playerBank));
    socketToTable[socket.id] = tableId;
    
    socket.join(tableId);
    socket.emit('joined-table');
    sendGameDataToSocket(socket, tableId);
  });

  socket.on('join-room', (roomId, playerName, playerBank) => {});

  socket.on('player-ready', (bet) => {});
  
  socket.on('blackjack-action', action => {});

  socket.on('disconnect', (reason) => {});
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

function sendGameDataToSocket(socket, tableId) {
  socket.emit('render-game', tables[tableId].gameFormat);
}

function startBlackjack(io, roomId) {
  const room = rooms[roomId];
  let [firstPlayerId, firstPlayerName] = room.startRound();
  io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
  
  if(rooms[roomId].isPlayerBlackjack()) {
    let nextPlayerId = rooms[roomId].playerStay();
    if(nextPlayerId) {
      const nextPlayerName = rooms[roomId].players[nextPlayerId].name;
      updateSocketsInRoom(io, roomId, `${nextPlayerName} turn`);
      io.sockets.sockets.get(nextPlayerId).emit('take-turn');
    } else {
      endRound(io, roomId);
      setTimeout(() => gotoNextRound(io, roomId), 8000);
    }
  } else {
    updateSocketsInRoom(io, roomId, `${firstPlayerName} turn`);
    io.sockets.sockets.get(firstPlayerId).emit('take-turn');
  }
}

function endRound(io, roomId) {
  updateSocketsInRoom(io, roomId, 'Dealers turn');
  rooms[roomId].dealerPlay();
  const socketWinConditions = rooms[roomId].endRound();
  
  for(const [socketId, winCondition] of Object.entries(socketWinConditions)) {
    updateSocketStatus(io.sockets.sockets.get(socketId), winCondition);
  }

  io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
}

function validAction(action, player) {
  console.log('Player action ', action);
  if(action === 'dbl-down' && !player.canDoubleDown()) {
    return false;
  }

  return true;
  //Add split logic and other valid checks later
}

function gotoNextRound(io, roomId) {
  if(!rooms[roomId])
    return;
  
  rooms[roomId].nextRound();
  rooms[roomId].moveFromQueueToGame();
  io.to(roomId).emit('new-round', rooms[roomId].gameFormat());
  rooms[roomId].order.forEach(socketID => {
    console.log(rooms[roomId].players[socketID]);
    if(rooms[roomId].players[socketID].bet > 0) {
      console.log('player is pushed!');
      rooms[roomId].players[socketID].resetPush();
      io.sockets.sockets.get(socketID).emit('disable-bet-input');
    }
  });
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

