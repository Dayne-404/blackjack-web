const Dealer = require('./Dealer');

class Table {
    constructor(name, maxPlayers = 4, dealer = new Dealer()) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = {};
        this.dealer = dealer;
        this.roomAvalible = this.AtCapacity();

        this.order =[]; //Have to fix this if players are added
        this.playersReady = 0;
        this.turnIndex = 0;
        this.state = 0; //0 for waiting for players to bet and ready up
    }

    canStartRound() {
        return Object.keys(this.players).length === this.playersReady;
    }

    startRound() {
        console.log("Starting blackjack!");
        this.state = 1; //Means the game is being played
        const socketId = this.order[this.turnIndex];
        const playerName = this.players[socketId].name;
        return [socketId, playerName];
    }

    addPlayer(socketId, player) {
        if(!this.AtCapacity()) {
            this.players[socketId] = player;
            this.order.push(socketId);
            this.roomAvalible = this.AtCapacity();
            console.log(this.order);
        }
        else
            console.log('Table at capacity with id: ', this.id);
    }

    removePlayer(socketId) {
        delete this.players[socketId];
        const removeIndex = this.order.indexOf(socketId);

        if(removeIndex > -1) {
            this.order.splice(socketId, 1);
        }
    }

    safeFormat() {
        return {
            'name': this.name,
            'currentPlayers': Object.keys(this.players).length,
            'maxPlayers': this.maxPlayers,
            'full': this.roomAvalible,
            'private': false,
        };
    }

    AtCapacity() {
        if(this.players.length >= this.maxPlayers)
            return true;

        return false;
    }
}

module.exports = Table;