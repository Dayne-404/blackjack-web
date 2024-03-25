const Dealer = require('./Dealer');

class Table {
    constructor(name, maxPlayers = 4, players = {}, dealer = new Dealer()) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = players;
        this.dealer = dealer;
        this.roomAvalible = this.AtCapacity();
    }

    addPlayer(socketId, player) {
        if(!this.AtCapacity()) {
            this.players[socketId] = player;
            this.roomAvalible = this.AtCapacity();
        }
        else
            console.log('Table at capacity with id: ', this.id);
    }

    removePlayer(socketId) {
        delete this.players[socketId];
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