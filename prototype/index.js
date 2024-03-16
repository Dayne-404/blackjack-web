import Player from "./blackjack-classes/player.js";
import Deck from "./blackjack-classes/deck.js";
import playBlackJack from "./blackjack-classes/controller.js";
import generatePlayersForm from "./generatePlayersForm.js";

const deck = new Deck();
const dayne = new Player('Dayne', 1000);
const niko = new Player('Niko', 1000);
const players = [];
const dealer = new Player('Dealer', 0, true);

const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('new-game-btn');
const addPlayerButton = document.getElementById('player-add-btn');

const numPlayersForm = document.getElementById('num-players-form');

numPlayersForm.addEventListener('submit', e => {
    e.preventDefault();
    const numPlayersInputEl = document.getElementById("num-players");
    let numPlayers = parseInt(numPlayersInputEl.value);

    if(numPlayers > 4) {
        numPlayers = 4
    } else if (numPlayers < 1 || isNaN(numPlayers) || numPlayers === null) {
        numPlayers = 1
    }

    numPlayersForm.style.display = 'none';
    generatePlayersForm(numPlayers);
});

// restartButton.addEventListener('click', e => playBlackJack(players, dealer, deck));
// startButton.addEventListener('click', e => playBlackJack(players, dealer, deck));




