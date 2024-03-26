const Player = require('./classes/Player');
const Table = require('./classes/Table');

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
  console.log('Player connected: ', socket.id);
  
  socket.on('request-room-data', () => {
    console.log('Client asking for room data:', socket.id);

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

    console.log(`${socket.id} creating room with id: ${roomId}`);
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socket.emit('start-game', rooms[roomId].gameFormat());
  });

  socket.on('join-room', (playerName, playerBank, roomId) => {
    if(!roomId in rooms || rooms[roomId].roomAvalible) {
      console.log(`${socket.id} unable to join room with id: ${roomId}`);
      return;
    }

    console.log(`${socket.id} joined room with id: ${roomId}`);
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
      console.log(`${socket.id} player is ready`);
      player.bet = Number(bet);
      player.ready = true;
      room.playersReady++;
      socket.emit('ready-recieved');

      if(room.canStartRound()) {
        let [firstPlayerId, firstPlayerName] = room.startRound();
        io.to(roomId).emit('render-game', rooms[roomId].gameFormat());
        updateSocketsInRoom(io, roomId, `${firstPlayerName} turn`);
        io.sockets.sockets.get(firstPlayerId).emit('take-turn');
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnecting: ', socket.id);
    
    let roomId = socketToRoom[socket.id];
    if(roomId) {
      console.log('Socket was part of room: ', roomId)
      delete rooms[roomId].removePlayer(socket.id);
      delete socketToRoom[socket.id];
      io.to(roomId).emit('player-disconnect', rooms[roomId]);
    }
  });
});

function updateSocketsInRoom(io, roomId, message) {
  io.to(roomId).emit('update-status', message);
}

function updateSocketStatus(socket, message) {
  socket.emit('update-status', message);
}

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});