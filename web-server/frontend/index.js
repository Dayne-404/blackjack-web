import * as menu from "./views/menu.js";
import * as blackjack from "./views/game.js";

const socket = io();

menu.initRoomSelect(socket); //Will come back to make this more readable later


socket.on('start-game', (roomData) =>  {
    const gameView = document.getElementById('game-view');
    const mainMenu = document.getElementById('main-menu');

    mainMenu.style.display = 'none';
    gameView.style.display = 'block';
    console.log('Starting game...');
    renderGame(roomData);
});

socket.on('player-disconnect', (roomData) => {
    console.log('Player disconnected re-rendering window');
    renderGame(roomData);
});

socket.on('player-connect', (roomData) => {
    console.log('Player joined re-rendering window');
    renderGame(roomData);
});

function renderGame(roomData) {
    const playersContainer = document.getElementById('players-container');

    let players = Object.values(roomData.players);
    let dealer = roomData.dealer;
    blackjack.renderPlayers(playersContainer, players, dealer);
}


