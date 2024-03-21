class Hand {
    constructor() {
        this.hand = [];
        this.total = this.calculateHandTotal(this.hand);
    }

    calculateHandTotal(hand) {
        if(hand != null || hand.length > 0) {
            return hand.reduce((total, card) => total + card.value, 0);
        } 
        
        return 0;
    }

    toString() {
        return `[${this.hand}]`
    }
}

module.exports = Hand;