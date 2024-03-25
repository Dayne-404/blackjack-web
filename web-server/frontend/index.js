import * as menu from "./views/menu.js";
import * as blackjack from "./views/game.js";

const socket = io();

const mainMenu = document.getElementById('main-menu');


const table = document.getElementById('room-selection-table');
const modal = document.getElementById('modal-container');
const roomNameContainer = document.getElementById('room-name-container');

const playersContainer = document.getElementById('players-container');
const statusText = document.getElementById('status-text');

menu.initRoomSelect(socket, mainMenu, table, modal, roomNameContainer); //Will come back to make this more readable later

socket.on('send-room-data', (serverRooms) => {
    menu.renderTable(table, serverRooms);
});

socket.on('start-game', (roomData) =>  {
    const gameView = document.getElementById('game-view');

    mainMenu.style.display = 'none';
    gameView.style.display = 'block';
    console.log('Starting game...');
    blackjack.renderGame(playersContainer, roomData);
});

socket.on('player-disconnect', (roomData) => {
    console.log('Player disconnected re-rendering window');
    blackjack.renderGame(playersContainer, roomData);
});

socket.on('player-connect', (roomData) => {
    console.log('Player joined re-rendering window');
    blackjack.renderGame(playersContainer, roomData);
});




