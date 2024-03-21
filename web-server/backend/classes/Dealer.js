const Hand = require('./Hand');

class Dealer {
    constructor(bank = 0) {
        this.bank = bank;
        this.hand = new Hand();
    }

    toString() {
        return `
        name: ${this.name}
        -----------------------
        bank: ${this.bank}
        hand: ${this.hand.toString()}
        `
    }
}

module.exports = Dealer;