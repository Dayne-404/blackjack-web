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

app.use(express.static(rootPath + "/frontend"));

let players = {};
let rooms = {
  1: new Table('alpha'),
  2: new Table('beta'),
  3: new Table('charlie'),
  4: new Table('delta'),
  5: new Table('epsilon')
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

    console.log(rooms);
    console.log(simplifiedRooms);

    socket.emit('send-room-data', simplifiedRooms);
  });

  
  socket.on('disconnect', (reason) => {
    console.log('\nPlayer disconnected:', reason, socket.id);
    
    if(socket.id in players) {
      delete players[socket.id];
      console.log('Player deleted for', socket.id);
    }
  });
});



server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});