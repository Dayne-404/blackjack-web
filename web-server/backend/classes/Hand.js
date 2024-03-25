class Hand {
    constructor() {
        this.cards = [];
        this.total = this.calculateHandTotal(this.cards);
    }

    calculateHandTotal(hand) {
        if(hand != null || hand.length > 0) {
            return hand.reduce((total, card) => total + card.value, 0);
        } 
        
        return 0;
    }

    test() {
        console.log('test');
    }
}

module.exports = Hand;