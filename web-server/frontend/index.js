import * as menu from "./views/menu.js";
import * as blackjack from "./views/game.js";

const socket = io();

const mainMenu = document.getElementById('main-menu');

const table = document.getElementById('room-selection-table');
const modal = document.getElementById('modal-container');
const roomNameContainer = document.getElementById('room-name-container');

const playersContainer = document.getElementById('players-container');
const buttonsContainer = document.getElementById('button-container');
const statusText = document.getElementById('status-text');
const readyButton = document.getElementById('ready-btn');

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
    blackjack.initBlackjack(socket, buttonsContainer);
});

socket.on('ready-recieved', () => {
    statusText.innerText = "Waiting for players"
    readyButton.disabled = true;
    readyButton.style.display = 'none';
});

socket.on('player-disconnect', (roomData) => {
    console.log('Player disconnected re-rendering window');
    blackjack.renderGame(playersContainer, roomData);
});

socket.on('player-connect', (roomData) => {
    console.log('Player joined re-rendering window');
    blackjack.renderGame(playersContainer, roomData);
});




