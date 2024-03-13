import Player from "./blackjack-classes/player.js";
import Deck from "./blackjack-classes/deck.js";

const deck = new Deck();
const dayne = new Player('Dayne');
const niko = new Player('Niko');
const players = [dayne, niko];
const dealer = new Player('Dealer');

const hitButton = document.getElementById('hit-btn');
const standButton = document.getElementById('stay-btn');
const doubleDownButton = document.getElementById('dbl-down-btn');
const startBtn = document.getElementById('start-btn');
const newGameBtn = document.getElementById('new-game-btn');

const playersContainer = document.getElementById('players-container');
const interfaceElements = [document.getElementById('interface-elements'), startBtn];

function toggleInterfaceVisibility(interfaceElements) {
    for(const element of interfaceElements)
        if(element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }        
}

function waitForPlayerInput() {
    return new Promise(resolve => {
        hitButton.addEventListener('click', () => resolve('hit'));
        standButton.addEventListener('click', () => resolve('stand'));
        doubleDownButton.addEventListener('click', () => resolve('double-down'));
    });
}

function resetPlayers(players, dealer) {
    for(const player of players) {
        player.reset();
    }

    dealer.reset();
}

function startGame(dealer, players, deck) {
    players.push(dealer);
    deck.shuffle();

    for(let i = 0; i < 2; i++) {
        players.forEach(player => {
            if(i === 1 && player.name === 'Dealer') {
                player.recieveCard(deck.takeCard(), 1);
            } else {
                player.recieveCard(deck.takeCard());
            }

            if(i === 1) {
                console.log(player.toString());
                updatePlayerCard(player);
            }
        });
    }
    
    players.pop();
}

function updatePlayerCard(player) {
    const handEl = document.getElementById(`${player.name}-hand`);
    const totalEl = document.getElementById(`${player.name}-total`);

    totalEl.innerHTML = player.total;
    handEl.innerHTML = `[${player.hand}]`;
}

async function playRound(players) { 
    for (const player of players) {
        console.log(`Waiting for ${player.name}:`);
        let playerAction = null;
        doubleDownButton.disabled = false;
        
        while((playerAction === null || playerAction === 'hit') && player.state === 0) {
            playerAction = await waitForPlayerInput();
    
            if(playerAction === 'hit') {
                doubleDownButton.disabled = true;
                const card = deck.takeCard();
                player.recieveCard(card);
                console.log(`${player.name} hits and draws a ${card.toString()}`);
            }

            updatePlayerCard(player);
        }

        if(playerAction === 'stand') {
            console.log(`${player.name} stands...`);
            updatePlayerCard(player);
        } else if (playerAction === 'double-down') {
            doubleDownButton.disabled = true;
            const card = deck.takeCard();
            player.recieveCard(card);
            console.log(`${player.name} doubles down and draws a ${card.toString()}`);
            updatePlayerCard(player);
        }
            
        if(player.state === 0) {
            console.log(`${player.name} has a total of ${player.total} with the hand\n${player.hand}`);
        } else if (player.state === 1 ) {
            console.log(`${player.name} busts with a total of ${player.total} with the hand\n${player.hand}`);
        } else if (player.state === 2) {
            console.log(`${player.name} Blackjack! ${player.total} with the hand\n${player.hand}`);
        }        
    }
}

function dealerPlay(dealer) {
    console.log('dealer reveals the second card..');
    dealer.hand[1].hidden = 0;
    console.log(`dealers current hand: ${dealer.hand}`);
    updatePlayerCard(dealer);

    while(dealer.total < 17 && dealer.state === 0) {
        const card = deck.takeCard();
        dealer.recieveCard(card);
        console.log(`${dealer.name} hits and draws a ${card.toString()}`);
        updatePlayerCard(dealer);
    }

    if(dealer.state === 0) {
        console.log(`${dealer.name} has a total of ${dealer.total} with the hand\n${dealer.hand}`);
    } else if (dealer.state === 1 ) {
        console.log(`${dealer.name} busts with a total of ${dealer.total} with the hand\n${dealer.hand}`);
    } else if (dealer.state === 2) {
        console.log(`${dealer.name} Blackjack! ${dealer.total} with the hand\n${dealer.hand}`);
    }
}

function getResults(players, dealer) {
    for (const player of players) {
        if (player.state === 0 && dealer.state === 1) {
            console.log(`${player.name} beats the dealer!`);
        } else if (player.state === 0 && player.total > dealer.total) {
            console.log(`${player.name} beats the dealer!`);
        } else if (player.state === 0 && player.total === dealer.total) {
            console.log(`${player.name} is tied with the dealer! (bets pushed to the next round)`);
        } else if (player.state === 0 && player.total < dealer.total && dealer.state === 0) {
            console.log(`${player.name} lost.. womp womp`);
        } else if (player.state === 2 && dealer.state !== 2) {
            console.log(`${player.name} has a blackjack! (2x the bet)`);
        } else if (player.state === 2 && dealer.state === 2) {
            console.log(`${player.name} and dealer both have blackjack (2x bets pushed to the next round)`);
        } else if (player.state === 1) {
            console.log(`${player.name} busts!`);
        } else if (player.state !== 2 && dealer.state === 2) {
            console.log(`${player.name} lost to dealer's blackjack...`);
        } else if (player.state !== 2 && player.total > dealer.total) {
            console.log(`${player.name} beats the dealer!`);
        } else if (player.state !== 2 && player.total === dealer.total) {
            console.log(`${player.name} is tied with the dealer! (bets pushed to the next round)`);
        } else if (player.state !== 2 && (dealer.state === 1 || player.total < dealer.total)) {
            console.log(`${player.name} lost.. womp womp`);
        }
    }
}

function setPlayerCards(players, dealer, container) {
    let innerHtml = '';
    
    players.push(dealer);
    for(const player of players) {
        innerHtml += `
        <div class="player-card">
                <h3 id="player-${player.name}">${player.name}</h3>
                <p id="${player.name}-hand">[ ${player.hand} ]</p>
                <p id="${player.name}-total">${player.total}</p>
        </div>`;
    }
    players.pop();

    console.log(innerHtml);
    container.innerHTML = innerHtml;
}

function playBlackJack(players, dealer, deck) {
    console.log('Starting game!');
    
    newGameBtn.style.display = 'none';
    resetPlayers(players, dealer);
    setPlayerCards(players, dealer, playersContainer);

    if(startBtn.style.display === 'block') {
        toggleInterfaceVisibility(interfaceElements);
    }

    startGame(dealer, players, deck);
    playRound(players).then(() => {
        dealerPlay(dealer);
        getResults(players, dealer);
        newGameBtn.style.display = 'block';
    });
}

newGameBtn.addEventListener('click', e => playBlackJack(players, dealer, deck));
startBtn.addEventListener('click', e => playBlackJack(players, dealer, deck));




