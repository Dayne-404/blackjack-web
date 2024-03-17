import Player from "./blackjack-classes/player.js";
import Deck from "./blackjack-classes/deck.js";
import playBlackJack from "./blackjack-classes/controller.js";
import generatePlayersForm from "./generatePlayersForm.js";

const deck = new Deck();
const dealer = new Player('Dealer', 0, true);
const players = [];

const restartButton = document.getElementById('new-game-btn');
let generatedForm = null;

const numPlayersForm = document.getElementById('num-players-form');
const startScreen = document.getElementById('start-screen');

const MAX_PLAYERS = 5;
const MIN_PLAYERS = 1;

numPlayersForm.addEventListener('submit', e => {
    e.preventDefault();
    const numPlayersInputEl = document.getElementById("num-players");
    let numPlayers = parseInt(numPlayersInputEl.value);

    if(numPlayers > MAX_PLAYERS) {
        numPlayers = MAX_PLAYERS
    } else if (numPlayers < MIN_PLAYERS || isNaN(numPlayers) || numPlayers === null) {
        numPlayers = MIN_PLAYERS
    }

    numPlayersForm.style.display = 'none';
    generatedForm = generatePlayersForm(numPlayers);
    console.log(generatedForm);

    generatedForm.addEventListener('submit', e => {
        e.preventDefault();
        for(let i = 1; i <= numPlayers; i++) {
            const playerName = document.getElementById(`player${i}-name`).value;
            const playerTotal = parseInt(document.getElementById(`player${i}-total`).value);
            const newPlayer = new Player(playerName, playerTotal);
            players.push(newPlayer);
            console.log('Player added: ', newPlayer);
            startScreen.style.display = 'none';
        }

        console.log("Players", players);
        console.log("Dealer", dealer);
        playBlackJack(players, dealer, deck);
        restartButton.addEventListener('click', e => playBlackJack(players, dealer, deck));
    });
});






