export function renderPlayers(container, players, dealer=null) {
    let innerHTML = '';
    
    for(const player of players) {
        innerHTML += getPlayerHTML(player);
    }

    if(dealer) {
        innerHTML += getDealerHTML(dealer);
    }

    container.innerHTML = innerHTML;
}

export function renderPlayer(container, player) {
    container.innerHTML = getPlayerHTML(player);
}

export function renderGame(playersContainer, roomData) {
    let players = Object.values(roomData.players);
    let dealer = roomData.dealer;
    renderPlayers(playersContainer, players, dealer);
}

function getPlayerHTML(player) {
    return `
        <div id="${player.name}-card" class="player-card">
                <h3 id="player-${player.name}">${player.name}</h3>
                <p id="${player.name}-hand">[ ${player.hand.cards} ]</p>
                <p id="${player.name}-total">${player.hand.total}</p>
                <p id="${player.name}-bank">Earnings: ${player.bank}$</p>
                <p id="${player.name}-bet">Bet: ${player.bet}$</p><br>
        </div>`;
}

function getDealerHTML(dealer) {
        return `
        <div id="dealer-card" class="player-card">
                <h3>Dealer</h3>
                <p id="dealer-hand">[ ${dealer.hand.cards} ]</p>
                <p id="dealer-total">${dealer.hand.total}</p>
                <p id="dealer-bank">Earnings: ${dealer.bank}$</p>
        </div>`;
}



