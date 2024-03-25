const Dealer = require('./Dealer');

class Table {
    constructor(name, maxPlayers = 4, dealer = new Dealer()) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = {};
        this.order =[]; //Have to fix this if players are added
        this.turnIndex = 0;
        this.dealer = dealer;
        this.playersReady = 0;
        this.roomAvalible = this.AtCapacity();
    }

    canStartGame() {
        return Object.keys(this.players).length === this.playersReady;
    }

    startGame() {
        console.log("Starting blackjack!");
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