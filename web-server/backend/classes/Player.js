const Hand = require('./Hand');

class Player {
    constructor(name, bank = 1000) {
        this.name = name;
        this.bank = bank;
        this.hand = new Hand();
    }

    toString() {
        return `name: ${this.name} bank: ${this.bank} hand: ${this.hand.toString()}`
    }
}

module.exports = Player;