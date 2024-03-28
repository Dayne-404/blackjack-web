const Hand = require('./Hand');

class Player {
    constructor(name, bank = 1000) {
        this.name = name;
        this.bank = bank;
        this.bet = 0;
        this.hand = new Hand();
        this.ready = false;
        this.push = false;
    }

    format() {
        return {
            'name': this.name,
            'bank': this.bank,
            'bet': this.bet,
            'hand': this.hand.format(),
            'total': this.hand.total,
        }
    }

    reset() {
        this.hand = new Hand();
        this.ready = false;

        if(!this.push) {
            this.bet = 0;
        }
    }

    canDoubleDown() {
        if(this.hand.cards.length === 2) {
            return true;
        }

        return false;
    }

    resetPush() {
        this.push = false;
    }

    setBet(bet) {
        if(this.bet != 0) {
            return;
        }
            
        this.bet = bet;
        this.bank -= bet;
    }

    recieveCard(card) {
        this.hand.recieveCard(card);
    }

    toString() {
        return `id: ${this.id} name: ${this.name} bank: ${this.bank} hand: ${this.hand.toString()}`
    }
}

module.exports = Player;