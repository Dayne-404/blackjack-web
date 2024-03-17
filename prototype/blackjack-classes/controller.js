const hitButton = document.getElementById('hit-btn');
const standButton = document.getElementById('stay-btn');
const doubleDownButton = document.getElementById('dbl-down-btn');

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
        playRound(players, deck).then(() => {
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
        console.log(`${player.name} is betting ${player.bet}`);
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
    console.log("Starting new game");
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
        let playerAction = null;
        doubleDownButton.disabled = false;
        
        while((playerAction === null || playerAction === 'hit') && player.state === 0) {
            playerAction = await waitForPlayerInput();
    
            if(playerAction === 'hit') {
                doubleDownButton.disabled = true;
                player.recieveCard(deck.takeCard());
            }

            updatePlayerCard(player);
        }

        if(playerAction === 'stand') {
            //Keep for some reason??
        } else if (playerAction === 'double-down') {
            doubleDownButton.disabled = true;
            player.recieveCard(deck.takeCard());
            updatePlayerCard(player);
        }       
    }
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
        if (player.state === 0 && dealer.state === 1) {
            console.log(`${player.name} beats the dealer!`);
            player.winModifier = 2;
        } else if (player.state === 0 && player.total > dealer.total) {
            console.log(`${player.name} beats the dealer!`);
            player.winModifier = 2;
        } else if (player.state === 0 && player.total === dealer.total) {
            console.log(`${player.name} is tied with the dealer! (bets pushed to the next round)`);
            player.push = true;
            player.winModifier = 2;
        } else if (player.state === 0 && player.total < dealer.total && dealer.state === 0) {
            console.log(`${player.name} lost.. womp womp`);
        } else if (player.state === 2 && dealer.state !== 2) {
            console.log(`${player.name} has a blackjack! (1.5x the bet)`);
            player.winModifier = 2.5;
        } else if (player.state === 2 && dealer.state === 2) {
            console.log(`${player.name} and dealer both have blackjack (2x bets pushed to the next round)`);
            player.push = true;
            player.winModifier = 2.5;
        } else if (player.state === 1) {
            console.log(`${player.name} busts!`);
        } else if (player.state !== 2 && dealer.state === 2) {
            console.log(`${player.name} lost to dealer's blackjack...`);
        } else if (player.state !== 2 && player.total > dealer.total) {
            console.log(`${player.name} beats the dealer!`);
            player.winModifier = 2;
        } else if (player.state !== 2 && player.total === dealer.total) {
            console.log(`${player.name} is tied with the dealer! (bets pushed to the next round)`);
            player.push = true;
            player.winModifier = 2;
        } else if (player.state !== 2 && (dealer.state === 1 || player.total < dealer.total)) {
            console.log(`${player.name} lost.. womp womp`);
        }

        if(player.push === false) {
            if(player.winModifier === 0) {
                dealer.bank += player.bet;
            }

            player.bet = player.bet * player.winModifier;
            player.bank += player.bet;
        }
        
        updatePlayerCard(player);
        colorPlayerCard(player, 1);
    }

    updatePlayerCard(dealer);
    colorPlayerCard(dealer, 1);
}

function waitForPlayerInput() {
    return new Promise(resolve => {
        hitButton.addEventListener('click', () => resolve('hit'));
        standButton.addEventListener('click', () => resolve('stand'));
        doubleDownButton.addEventListener('click', () => resolve('double-down'));
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

function updatePlayerCard(player) {
    const handEl = document.getElementById(`${player.name}-hand`);
    const totalEl = document.getElementById(`${player.name}-total`);
    const bankEl = document.getElementById(`${player.name}-bank`);
    
    if(player.dealer) {
        totalEl.classList.remove('hidden');
    } else {
        colorPlayerCard(player);
    }
    
    if (player.bet > 0 && !player.dealer) {
        const betEl = document.getElementById(`${player.name}-bet`);
        betEl.innerHTML = `Bet: ${player.bet}`;
    }
    
    totalEl.innerHTML = player.total;
    handEl.innerHTML = `[${player.hand}]`;
    bankEl.innerHTML = `Earnings: ${player.bank}`;
}

function colorPlayerCard(player, finalRound = false) {
    const cardEl = document.getElementById(`${player.name}-card`);

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