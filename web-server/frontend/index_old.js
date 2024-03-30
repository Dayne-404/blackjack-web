import * as menu from "./views/menu.js";
import * as blackjack from "./views/game.js";

const socket = io();

const mainMenu = document.getElementById('main-menu');

const table = document.getElementById('room-selection-table');
const modal = document.getElementById('modal-container');
const roomNameContainer = document.getElementById('room-name-container');

const playersContainer = document.getElementById('players-container');
const buttonsContainer = document.getElementById('button-container');
const betInputContainer = document.getElementById('bet-input-container');
const betInput = document.getElementById('bet-input');
const statusText = document.getElementById('status-text');
const readyButton = document.getElementById('ready-btn');

const hitButton = document.getElementById('hit-btn');
const stayButton = document.getElementById('stay-btn');
const dblDownButton = document.getElementById('dbl-down-btn');
const splitButton = document.getElementById('split-btn');

menu.initRoomSelect(socket, mainMenu, table, modal, roomNameContainer); //Will come back to make this more readable later

socket.on('send-room-data', (serverRooms) => {
    console.log(serverRooms);
    menu.renderTable(table, serverRooms);
});

socket.on('take-turn', () => {
    console.log('take turn!');
    enableGameButtons();
});

socket.on('first-turn-over', () => {
    console.log('first-turn-over');
    dblDownButton.disabled = true;
    splitButton.disabled = true;
});

hitButton.addEventListener('click', () => {
    socket.emit('blackjack-action', 'hit');
});

stayButton.addEventListener('click', () => {
    socket.emit('blackjack-action', 'stay');
});

dblDownButton.addEventListener('click', () => {
    socket.emit('blackjack-action', 'dbl-down');
});

socket.on('starting-round', () => {
    console.log('starting round!');
    readyButton.style.display = 'none';
    readyButton.disabled = true;
    betInput.disabled = true;
    console.log('starting round');
});

socket.on('end-turn', () => {
    console.log('turn ended');
    disableGameButtons();
});

socket.on('start-game', (roomData) =>  {
    const gameView = document.getElementById('game-view');
    mainMenu.style.display = 'none';
    gameView.style.display = 'block';
    blackjack.renderGame(playersContainer, roomData);
    blackjack.initBlackjack(socket, buttonsContainer);
});

socket.on('joined-queue', (roomData) => {
    console.log('Added to queue');
    const gameView = document.getElementById('game-view');
    mainMenu.style.display = 'none';
    gameView.style.display = 'block';
    blackjack.renderGame(playersContainer, roomData);
    blackjack.initBlackjack(socket, buttonsContainer);
    disableBetInputContainer();
    statusText.innerText = "Joined queue";
});

socket.on('update-status', message => {
    console.log('update status recieved');
    statusText.innerText = message;
});

socket.on('render-game', roomData => {
    console.log('re-rendering window');
    blackjack.renderGame(playersContainer, roomData);
});

socket.on('ready-recieved', () => {
    console.log('ready recieved!');
    statusText.innerText = "Waiting for players"
    readyButton.disabled = true;
    console.log(betInput);
    betInput.disabled = true;
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

socket.on('new-round', (roomData) => {
    console.log('new round!');
    enableBetInputContainer();
    blackjack.renderGame(playersContainer, roomData);
});

socket.on('disable-bet-input', () => {
    console.log('disabling bet input');
    betInput.disabled = true;
});

function enableBetInputContainer() {
    readyButton.disabled = false;
    readyButton.style.display = 'inline'
    betInput.disabled = false;
    betInputContainer.style.display = 'block';
    betInput.value = '';
}
    
function disableBetInputContainer() {
    readyButton.disabled = true;
    readyButton.style.display = 'none'
    betInput.disabled = true;
    betInputContainer.style.display = 'none';
}
    
function disableGameButtons() {
    buttonsContainer.style.display = 'none';
    hitButton.disabled = true;
    stayButton.disabled = true;
    dblDownButton.disabled = true;
    splitButton.disabled = true;
}

function enableGameButtons() {
    buttonsContainer.style.display = 'block'
    hitButton.disabled = false;
    stayButton.disabled = false;
    dblDownButton.disabled = false;
    splitButton.disabled = false;
}




