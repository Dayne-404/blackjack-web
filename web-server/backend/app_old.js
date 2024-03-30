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
      if(!validAction(action, rooms[roomId].players[currentPlayer])) {
        return;
      }

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
    } else if(rooms[roomId].full) {
      return;
    }

    const newPlayer = new Player(playerName, playerBank);

    if(rooms[roomId].state === 1) {
      rooms[roomId].addPlayerToQueue(socket.id, newPlayer);
      socket.emit('joined-queue', rooms[roomId].gameFormat());
    } else {
      rooms[roomId].addPlayer(socket.id, newPlayer);
      socket.emit('start-game', rooms[roomId].gameFormat());
    }
    
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
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

      //Start Game Function
      if(rooms[roomId].canStartRound()) {
        startBlackjack(io, roomId);
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`${socket.id} disconnected`);
    let roomId = socketToRoom[socket.id];
    if(roomId) {
      console.log(`${socket.id} was part of ${roomId}`);
      
      const nextPlayerId = rooms[roomId].removePlayer(socket.id);
      delete socketToRoom[socket.id];
      
      if(rooms[roomId].order.length === 0 && rooms[roomId].queue.length > 0) {
        console.log('Ending game early', roomId);
        endRound(io, roomId);
        setTimeout(() => gotoNextRound(io, roomId), 8000);
        return;
      } else if(rooms[roomId].order.length === 0 && rooms[roomId].queue.length === 0) {
        console.log('deleting room: ', roomId);
        delete rooms[roomId];
        return;
      }
      
      io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
      if(rooms[roomId].canStartRound()) {
        startBlackjack(io, roomId);
      } else if (rooms[roomId].state === 1) {
        if(nextPlayerId) {
          updateSocketsInRoom(io, roomId, rooms[roomId].players[nextPlayerId].name + ' turn');
          io.sockets.sockets.get(nextPlayerId).emit('take-turn');
        } else {
          endRound(io, roomId);
          setTimeout(() => gotoNextRound(io, roomId), 8000);
        }
      }
    }
  });
});

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

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});