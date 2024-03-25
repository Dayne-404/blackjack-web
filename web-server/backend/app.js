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
  console.log('\nPlayer connected: ', socket.id);
  
  socket.on('request-room-data', () => {
    console.log('\nClient asking for room data:', socket.id);

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
    console.log(rooms[roomId]);
    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socket.emit('start-game', rooms[roomId]);
  });

  socket.on('join-room', (playerName, playerBank, roomId) => {
    console.log(`${socket.id} joined room with id: ${roomId}`);
    
    if(!roomId in rooms || rooms[roomId].AtCapacity()) {
      console.log(`${socket.id} unable to join room with id: ${roomId}`);
      return;
    }
    
    rooms[roomId].addPlayer(socket.id,
      new Player(playerName, playerBank)
    );

    socket.join(roomId);
    socketToRoom[socket.id] = roomId;
    socket.emit('start-game', rooms[roomId]);
    io.to(roomId).emit('player-connect', rooms[roomId]);
  });

  socket.on('player-ready', (bet) => {
    const roomId = socketToRoom[socket.id];
    
    if(!rooms[roomId].players[socket.id].ready) {
      console.log(`\n${socket.id} player is ready`);
      rooms[roomId].players[socket.id].bet = Number(bet);
      rooms[roomId].players[socket.id].ready = true;
      rooms[roomId].playersReady++;
      socket.emit('ready-recieved');
      //Check if the room is all ready
    }
  });

  
  socket.on('disconnect', (reason) => {
    console.log('\nSocket disconnecting: ', socket.id);
    
    let roomId = socketToRoom[socket.id];
    if(roomId) {
      console.log('Socket was part of room: ', roomId)
      delete rooms[roomId].removePlayer(socket.id);
      delete socketToRoom[socket.id];
      io.to(roomId).emit('player-disconnect', rooms[roomId]);
    }


    socket.rooms.forEach(room => {
      console.log(room);
    })
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});