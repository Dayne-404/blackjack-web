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

const validActions = new Set(['hit', 'stay', 'dbl-down', 'split']);


app.get('/', (req, res) => {
  res.sendFile(rootPath + "/frontend/index.html");
});

//Everything needs to be inside connection
io.on('connection', socket => {
  //Main menu Request
  socket.on('get-room-data', () => sendSimplifiedRoomData(socket));
  
  //Client Creates and gets added to a table
  socket.on('create-table', (tableName, playerName, playerBank) => {
    const status = createTable(socket.id, tableName, playerName, playerBank);
    console.log(`${socket.id} : Create table exited with code ${status}`);
  });

  //Client joins a table that has already opened
  socket.on('joined-table', (tableId, playerName, playerBank) => {
    const status = addPlayerToTable(io, socket, tableId, playerName, playerBank);
    console.log(`${socket.id} : Add player to table exited with code ${status}`);
  });

  //Client readies when in a room
  //Starts the game of blackjack when all players readied
  //May exit much later than expected
  socket.on('player-ready', bet => {
    const status = playerReady(io, socket, bet);
    console.log(`${socket.id} : player readied and exited with code ${status}`);
  });
  
  socket.on('play-turn', action => {
    const tableId = socketToTable[socket.id];
    const table = tables[tableId];
    const currentPlayer = table.getPlayerInTurn();
    
    if(!validActions.has(action))
  });

  socket.on('disconnect', (reason) => {});
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

function doesTableExist(socketId) {
  const tableId = socketToTable[socketId];

  if(tableId && tableId in tables) 
    return true;

  return false;
}

function sendSimplifiedRoomData(socket) {
  const simplifiedRooms = {};
  for(const tableId in tables) {
    simplifiedRooms[tableId] = tables[tableId].safeFormat();
  }
  socket.emit('send-room-data', simplifiedRooms);
}

function createTable(socket, tableName, playerName, playerBank) {
  const tableId = uuidv4();
  tables[tableId] = new Table(tableName);
  tables[tableId].addPlayer(socket.id, new Player(playerName, playerBank));
  socketToTable[socket.id] = tableId;
    
  socket.join(tableId);
  socket.emit('joined-table');
  sendGameDataToSocket(socket, tableId);

  return 0;
}

function addPlayerToTable(io, socket, tableId, playerName, playerBank) {
  if(!tableId in tables) return 1;
  if(tables[tableId].full) return 1;

  const newPlayer = new Player(playerName, playerBank);
  const table = tables[roomId];

  if(rooms[roomId].state === 1) {
    table.addPlayerToQueue(socket.id, newPlayer);
    socket.emit('joined-queue', table.gameFormat());
  } else {
    table.addPlayer(socket.id, newPlayer);
    socket.emit('joined-table', table.gameFormat())
  }

  socket.join(tableId);
  socketToTable[socket.id] = tableId;
  io.to(tableId).emit('render-game', table.gameFormat());

  return 0;
}

function playerReady(io, socket, bet) {
  const tableId = socketToTable[socket.id];
  const table = tables[tableId];
  const player = table.players[socket.id];

  if(!tableId || !table || !player) 
    return 1;

  if(!player.ready) {
    table.playerReady(socket.id, bet);
    socket.emit('ready-recieved');

    if(table.canStartRound()) 
      startBlackjack(io, roomId); //TODO
  }

  return 0;
}
