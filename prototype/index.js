import Player from "./blackjack-classes/player.js";
import Deck from "./blackjack-classes/deck.js";
import playBlackJack from "./blackjack-classes/controller.js";

const deck = new Deck();
const dayne = new Player('Dayne', 1000);
const niko = new Player('Niko', 1000);
const players = [dayne, niko];
const dealer = new Player('Dealer', 0, true);

const startButton = document.getElementById('start-btn');
const restartButton = document.getElementById('new-game-btn');

restartButton.addEventListener('click', e => playBlackJack(players, dealer, deck));
startButton.addEventListener('click', e => playBlackJack(players, dealer, deck));




