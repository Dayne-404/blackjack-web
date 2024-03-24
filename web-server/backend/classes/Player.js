const Hand = require('./Hand');

class Player {
    constructor(id, name, bank = 1000) {
        this.id = id;
        this.name = name;
        this.bank = bank;
        this.hand = new Hand();
    }

    toString() {
        return `id: ${this.id} name: ${this.name} bank: ${this.bank} hand: ${this.hand.toString()}`
    }
}

module.exports = Player;