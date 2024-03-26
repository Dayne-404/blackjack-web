const Hand = require('./Hand');

class Player {
    constructor(name, bank = 1000) {
        this.name = name;
        this.bank = bank;
        this.bet = 0;
        this.hand = new Hand();
        this.ready = false;
    }

    format() {
        return {
            'name': this.name,
            'bank': this.bank,
            'bet': this.bet,
            'hand': this.hand.format(),
            'total': this.hand.total
        }
    }

    recieveCard(card) {
        this.hand.recieveCard(card);
    }

    toString() {
        return `id: ${this.id} name: ${this.name} bank: ${this.bank} hand: ${this.hand.toString()}`
    }
}

module.exports = Player;