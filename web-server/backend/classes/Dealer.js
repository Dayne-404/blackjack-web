const Hand = require('./Hand');

class Dealer {
    constructor(bank = 0) {
        this.bank = bank;
        this.hand = new Hand();
        this.state = 0;
    }

    recieveCard(card) {
        if(this.hand.cards.length === 0) {
            card.hidden = true;
            console.log('hiding card');
        }
            
        this.hand.recieveCard(card);
        console.log(this.hand);
    }

    format() {
        return {
            'bank': this.bank,
            'hand': this.hand.format(),
            'state': this.state,
            'total': this.hand.total
        }
    }

    toString() {
        return `
        bank: ${this.bank}
        hand: ${this.hand.toString()}
        `
    }
}

module.exports = Dealer;