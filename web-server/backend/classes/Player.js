const Hand = require('./Hand');

class Player {
    constructor(name, bank = 1000) {
        this.name = name;
        this.bank = bank;
        this.bet = 0;
        this.hand = [new Hand()];
        this.handIndex = 0;
        this.ready = false;
        this.push = false;
    }

    format() {
        const handsToString = this.hand.map(hand => hand.format()).join('\n');
        const totalToString = this.hand.map(hand => `${hand.total}`).join('\n');

        return {
            'name': this.name,
            'bank': this.bank,
            'bet': this.bet,
            'hand': handsToString,
            'total': totalToString,
        }
    }

    isValidBet(bet) {
        return (this.bank - bet) >= 0
    }

    hasAnotherHand() {
        if(this.hand[this.handIndex + 1])
            return true;

        return false;
    }

    gotoNextHand() {
        this.handIndex++;
    }

    getCurrentHand() {
        return this.hand[this.handIndex];
    }

    canSplitHand() {
        return this.hand[this.handIndex].canSplit() &&
            this.bank - this.bet > 0 &&
            this.hand.length < 4;
    }

    split(firstCard, secondCard) {
        const newHands = this.hand[this.handIndex].splitHand();
        newHands[0].recieveCard(firstCard);
        newHands[1].recieveCard(secondCard);
        this.hand[this.handIndex] = newHands[0];
        this.hand.push(newHands[1]);
    }

    reset() {
        this.hand = [new Hand()];
        this.ready = false;
        this.handIndex = 0;

        if(!this.push) {
            this.bet = 0;
        }
    }

    canDoubleDown() {
        return this.hand[this.handIndex].canDoubleDown() &&
            this.bank - this.bet > 0
    }

    resetPush() {
        this.push = false;
    }

    setBet(bet) {
        if(this.bet != 0) {
            return;
        } else if(this.bet < 0) {
            this.bet = 0;
        }
            
        this.bet = bet;
        this.bank -= bet;
    }

    recieveCard(card) {
        this.hand[this.handIndex].recieveCard(card);
    }
}

module.exports = Player;