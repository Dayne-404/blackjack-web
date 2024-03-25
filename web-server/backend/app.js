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

let players = {};
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
  
  socket.on('initPlayer', (username, bank) => {
    if(!players[socket.id]) {
      console.log('\nPlayer sent from:', socket.id);
      players[socket.id] = new Player(socket.id, username, bank);
      console.log('New player created: ', players[socket.id].toString());
    }
  }); 

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
    rooms[roomId].addPlayer(
      new Player(socket.id, playerName, playerBank)
    );

    console.log(`${socket.id} creating room with id: ${roomId}`);
    console.log(rooms[roomId]);
  });

  socket.on('join-room', (playerName, playerBank, roomId) => {
    console.log(`${socket.id} joined room with id: ${roomId}`);
    
    if(!roomId in rooms || rooms[roomId].AtCapacity()) {
      console.log(`${socket.id} unable to join room with id: ${roomId}`);
      return;
    }
    
    rooms[roomId].addPlayer(
      new Player(socket.id, playerName, playerBank)
    );
    socket.join(roomId);

    console.log(rooms[roomId]);
  });

  
  socket.on('disconnect', (reason) => {
    console.log('\nPlayer disconnected:', reason, socket.id);
    
    if(socket.id in players) {
      delete players[socket.id];
      console.log('Player deleted for', socket.id);
    }
  });
});

function sendErrorMessage(message) {
  socket.emit('send-message', (message));
}

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});