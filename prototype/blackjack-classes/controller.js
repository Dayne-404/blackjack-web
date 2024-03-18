import Card from "./card.js";

const hitButton = document.getElementById('hit-btn');
const standButton = document.getElementById('stay-btn');
const doubleDownButton = document.getElementById('dbl-down-btn');
const splitButton = document.getElementById('split-btn');

const restartButton = document.getElementById('new-game-btn');

const cardsContainer = document.getElementById('players-container');
const buttonsContainer = document.getElementById('button-container');
const betButton = document.getElementById('bet-btn');
const betButtonsContainer = document.getElementById('bet-btn-container');
const riskButton = document.getElementById('risk-btn');
const gameInterfaceElements = document.getElementById('interface-elements');

export default function playBlackJack(players, dealer, deck) {
    resetPlayers(players);
    dealer.reset();
    deck.shuffle();
    setPlayerCards(players, dealer);
    
    restartButton.style.display = 'none';
    buttonsContainer.style.display = 'none';
    gameInterfaceElements.style.display = 'block'; 
    betButtonsContainer.style.display = 'block';

    collectBets(players).then(() => {
        startGame(dealer, players, deck);
        updatePlayerCard(players[0]);
        playRound(players, deck).then(() => {
            console.log('bet', players[0].bet);
            dealerPlay(dealer, deck);
            getResults(players, dealer);
            restartButton.style.display = 'block';
        });
    }); 
}

async function collectBets(players) {
    const betInput = await waitForPlayerBetInput();
    
    for(const player of players) {
        if(player.push) {
            player.push = false;
            continue;
        }

        const betAmount = parseInt(document.getElementById(`${player.name}-bet-input`).value);
        const betContainer = document.getElementById(`${player.name}-bet-input-container`);
        
        if(betAmount > player.bank || betInput === 'risk') {
            player.bet = player.bank;
        } else if (betAmount < 0 || isNaN(betAmount)) {
            player.bet = 0;
        } else {
            player.bet = betAmount;
        }

        player.bank -= player.bet;
        
        betContainer.style.display = 'none';
        betButtonsContainer.style.display = 'none';
        buttonsContainer.style.display = 'block';
    }
}

function waitForPlayerBetInput() {
    return new Promise(resolve => {
        betButton.addEventListener('click', () => resolve('bet'));
        riskButton.addEventListener('click', () => resolve('risk'));
    });
}

function resetPlayers(players) {
    for(const player of players) {
        player.reset();
    }
}

function startGame(dealer, players, deck) {
    players.push(dealer);

    for(let i = 0; i < 2; i++) {
        players.forEach(player => {
            if(i === 1 && player.name === 'Dealer') {
                player.recieveCard(deck.takeCard(), 1);
            } else {
                player.recieveCard(deck.takeCard());
            }

            if(i === 1) {
                updatePlayerCard(player);
            }
        });
    }
    
    players.pop();
}

async function playRound(players, deck) { 
    for (const player of players) {
        colorPlayerBackground(player);
        doubleDownButton.disabled = true;
        splitButton.disabled = true;

        if(player.canDoubleDown()) { doubleDownButton.disabled = false; }
        if(player.canSplit()) { splitButton.disabled = false; }

        let playerAction = null;

        if(player.state === 0) {
            playerAction = await waitForPlayerInput();

            if(playerAction === 'split') {
                await split(player, deck);
            } else if (playerAction === 'hit') {
                await hit(player, deck);
            } else if (playerAction === 'double-down') {
                doubleDown(player, deck);
            } 
        }
        
        doubleDownButton.disabled = true;
        splitButton.disabled = true;
        removePlayerBackground(player);
    }
}

function doubleDown(player, deck) {
    splitButton.disabled = true;
    doubleDownButton.disabled = true;
    
    if(player.isSplit) {
        player.winModifier[player.currentHand] += 2;
        player.bank -= player.bet[player.currentHand]; 
    } else {
        player.winModifier += 2;
        player.bank -= player.bet;
    }
    
    player.recieveCard(deck.takeCard());
    updatePlayerCard(player);
    colorPlayerBackground(player, true);
}

async function hit(player, deck) {
    let playerAction = 'hit';
    
    while(playerAction === 'hit' && player.state === 0) {
        splitButton.disabled = true;
        doubleDownButton.disabled = true;
        player.recieveCard(deck.takeCard());
        updatePlayerCard(player);

        if(player.state === 0) {
            playerAction = await waitForPlayerInput();
        }
    }
}

async function split(player, deck) {
    splitButton.disabled = true;
    doubleDownButton.disabled = true;
    
    
    player.split();
    player.recieveCard(deck.takeCard());
    player.currentHand = 1;
    player.recieveCard(deck.takeCard());
    setPlayerCardsAsSplit(player);

    player.bank -= player.bet[0];
    
    for(let i = 0; i < player.hand.length; i++) {
        player.currentHand = i;
        if(player.canDoubleDown()) { doubleDownButton.disabled = false; }
        colorCurrentHand(player);

        let playerAction = null;

        while((playerAction === 'hit' || playerAction === null) && player.state[i] === 0) {
            updatePlayerCard(player);    
            playerAction = await waitForPlayerInput();
            
            if(playerAction === 'hit') {
                doubleDownButton.disabled = true;
                player.recieveCard(deck.takeCard());
            }           
        }

        if(playerAction === 'double-down') {
            doubleDown(player, deck);
        }
    }
    colorCurrentHand(player, true);
}

function dealerPlay(dealer, deck) {
    dealer.hand[1].hidden = 0;
    updatePlayerCard(dealer, true);

    while(dealer.total < 17 && dealer.state === 0) {
        dealer.recieveCard(deck.takeCard());
        updatePlayerCard(dealer);
    }
}

function getResults(players, dealer) {
    for (const player of players) {
        if (player.isSplit) {
            for (let i = 0; i < player.hand.length; i++) {
                const handTotal = player.total[i];
                const handState = player.state[i];
                const winModifier = player.winModifier[i];
                player.currentHand = i;
                processHand(player, handTotal, handState, winModifier, dealer);
            }
        } else {
            // Single hand scenario
            processHand(player, player.total, player.state, player.winModifier, dealer);
        }
    }

    updatePlayerCard(dealer);
    colorPlayerBorder(dealer, 1);
}

function processHand(player, handTotal, handState, winModifier, dealer) {
    if (handState === 0 && dealer.state === 1) {
        console.log(`${player.name} beats the dealer!`);
        winModifier += 2;
    } else if (handState === 0 && handTotal > dealer.total) {
        console.log(`${player.name} beats the dealer!`);
        winModifier += 2;
    } else if (handState === 0 && handTotal === dealer.total) {
        console.log(`${player.name} is tied with the dealer! (bets pushed to the next round)`);
        player.push = true;
        winModifier += 2;
    } else if (handState === 0 && handTotal < dealer.total && dealer.state === 0) {
        console.log(`${player.name} lost.. womp womp`);
        winModifier = 0;
    } else if (handState === 2 && dealer.state !== 2) {
        console.log(`${player.name} has a blackjack! (1.5x the bet)`);
        winModifier += 2.5;
    } else if (handState === 2 && dealer.state === 2) {
        console.log(`${player.name} and dealer both have blackjack (2x bets pushed to the next round)`);
        player.push = true;
        winModifier += 2.5;
    } else if (handState === 1) {
        console.log(`${player.name} busts!`);
        winModifier = 0;
    } else if (handState !== 2 && dealer.state === 2) {
        console.log(`${player.name} lost to dealer's blackjack...`);
        winModifier = 0;
    } else if (handState !== 2 && handTotal > dealer.total) {
        console.log(`${player.name} beats the dealer!`);
        winModifier += 2;
    } else if (handState !== 2 && handTotal === dealer.total) {
        console.log(`${player.name} is tied with the dealer! (bets pushed to the next round)`);
        player.push = true;
        winModifier += 2;
    } else if (handState !== 2 && (dealer.state === 1 || handTotal < dealer.total)) {
        console.log(`${player.name} lost.. womp womp`);
        winModifier = 0;
    }

    if (player.push === false) {
        if (winModifier === 0) {
            if (player.isSplit) {
                console.log('lose', player.bet[player.currentHand]);
                dealer.bank += player.bet[player.currentHand];
            } else {
                dealer.bank += player.bet;
            } 
        } else {
            if(player.isSplit) {
                console.log('win', player.bet[player.currentHand] * winModifier, winModifier);
                player.bet[player.currentHand] *= winModifier;
                player.bank += player.bet[player.currentHand];
            } else {
                player.bet *= winModifier;
                player.bank += player.bet;
            }
        }
    }

    updatePlayerCard(player);
    colorPlayerBorder(player, 1);
}

function waitForPlayerInput() {
    return new Promise(resolve => {
        hitButton.addEventListener('click', () => resolve('hit'));
        standButton.addEventListener('click', () => resolve('stand'));
        doubleDownButton.addEventListener('click', () => resolve('double-down'));
        splitButton.addEventListener('click', () => resolve('split'));
    });
}

function setPlayerCards(players, dealer) {
    let innerHtml = '';
    
    for(const player of players) {
        innerHtml += `
        <div id="${player.name}-card" class="player-card">
                <h3 id="player-${player.name}">${player.name}</h3>
                <p id="${player.name}-hand">[ ${player.hand} ]</p>
                <p id="${player.name}-total">${player.total}</p>
                <p id="${player.name}-bank">Earnings: ${player.bank}$</p>
                <p id="${player.name}-bet">Bet: ${player.bet}$</p><br>`;

        if(!player.push) {
            innerHtml += `
            <div id="${player.name}-bet-input-container">
                <label for="${player.name}-bet-input">Bet Amount</label>
                <input type="number" 
                    id="${player.name}-bet-input" 
                    name="${player.name}-bet-input"
                    min="0"
                    max="${player.bank}">
            </div>
            `
        } 
        
        innerHtml += '</div>';
    }

    innerHtml += `
    <div id="${dealer.name}-card" class="player-card">
            <h3 id="player-${dealer.name}">${dealer.name}</h3>
            <p id="${dealer.name}-hand">[ ${dealer.hand} ]</p>
            <p id="${dealer.name}-total" class="hidden">hidden</p>
            <p id="${dealer.name}-bank">Pot: ${dealer.bank}$</p>
    </div>`;

    cardsContainer.innerHTML = innerHtml;
}

function setPlayerCardsAsSplit(player) {
    const firstHand = document.getElementById(`${player.name}-hand`);
    const totalEl = document.getElementById(`${player.name}-total`);
    const secondHand = document.createElement('p');
    firstHand.id = `${player.name}-hand-0`;
    secondHand.id = `${player.name}-hand-1`;
    firstHand.innerHTML = `[ ${player.hand[0]} ]`;
    secondHand.innerHTML = `[ ${player.hand[1]} ]`;

    totalEl.innerHTML = `${player.total[0]} ${player.total[1]}`;

    firstHand.insertAdjacentElement('afterend', secondHand);
}

function updatePlayerCard(player) {
    const totalEl = document.getElementById(`${player.name}-total`);
    const bankEl = document.getElementById(`${player.name}-bank`);
    
    if(player.isSplit) {
        document.getElementById(`${player.name}-hand-0`).innerHTML = `[${player.hand[0]}]`;
        document.getElementById(`${player.name}-hand-1`).innerHTML = `[${player.hand[1]}]`;
        totalEl.innerHTML = `${player.total[0]} ${player.total[1]}`;
    } else {
        document.getElementById(`${player.name}-hand`).innerHTML = `[${player.hand}]`;
        totalEl.innerHTML = player.total;
    }

    if(player.dealer) {
        totalEl.classList.remove('hidden');
    } else {
        let bet = player.bet;
        if(Array.isArray(bet)) {
            bet = player.bet[0] + player.bet[1];
        }

        document.getElementById(`${player.name}-bet`).innerHTML = `Bet: ${bet}`;
        colorPlayerBorder(player);
    }
    
    bankEl.innerHTML = `Earnings: ${player.bank}`;
}

function colorPlayerBackground(player, isDoubleDown = false) {
    const cardEl = document.getElementById(`${player.name}-card`);

    if(isDoubleDown) {
        cardEl.classList.add('double-down-background');
    }

    cardEl.classList.add('grey-background');
}

function colorCurrentHand(player, removeColor = false) {
    const firstHand = document.getElementById(`${player.name}-hand-0`);
    const secondHand = document.getElementById(`${player.name}-hand-1`);
    
    if(removeColor) {
        firstHand.classList.remove('split-text-color');
        secondHand.classList.remove('split-text-color');
    } else if(player.currentHand === 0) {
        secondHand.classList.remove('split-text-color');
        firstHand.classList.add('split-text-color');
    } else {
        firstHand.classList.remove('split-text-color');
        secondHand.classList.add('split-text-color');
    }
}

function removePlayerBackground(player) {
    const cardEl = document.getElementById(`${player.name}-card`);

    cardEl.classList.remove('grey-background');
}

function colorPlayerBorder(player, finalRound = false) {
    const cardEl = document.getElementById(`${player.name}-card`);

    if(player.dealer) {
        if(player.state === 0) {
            cardEl.classList.add('win-border');
        } else if (player.state === 1) {
            cardEl.classList.add('lose-border');
        } else if (player.state === 2) {
            cardEl.classList.add('blackjack-border');
        }

        return;
    }

    if(player.push) {
        cardEl.classList.add('push-border')
    } else if(player.state === 1 || player.winModifier === 0 && !player.push && finalRound) {
        cardEl.classList.add('lose-border');
    } else if (player.state === 2) {
        cardEl.classList.add('blackjack-border');
    } else if(player.winModifier > 0 && player.state !== 2 && !player.push) {
        const cardEl = document.getElementById(`${player.name}-card`);
        cardEl.classList.add('win-border');
    }
}