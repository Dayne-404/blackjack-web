const Dealer = require('./Dealer');

class Table {
    constructor(name, maxPlayers = 4, players = [], dealer = new Dealer()) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = players;
        this.dealer = dealer;
        this.roomAvalible = this.AtCapacity();
    }

    addPlayer(player) {
        if(!this.AtCapacity()) {
            this.players.push(player);
            this.roomAvalible = this.AtCapacity();
        }
        else
            console.log('Table at capacity with id: ', this.id);
    }

    safeFormat() {
        return {
            'name': this.name,
            'currentPlayers': this.players.length,
            'maxPlayers': this.maxPlayers,
            'full': this.roomAvalible,
            'private': false
        }
    }

    AtCapacity() {
        if(this.players.length >= this.maxPlayers)
            return true;

        return false;
    }
}

module.exports = Table;