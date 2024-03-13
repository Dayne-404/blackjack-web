export default class Card {
    constructor(value, suit, hidden = 0) {
        this.suit = suit; //1 for spade 2 for diamond 3 for club 4 for heart
        this.value = value;
        this.hidden = hidden;
    }

    toString() {
        if(this.hidden === 1)
            return `hidden`;
        
        const suitNames = {
            1: 'spades',
            2: 'diamonds',
            3: 'clubs',
            4: 'hearts'
        };

        let cardName = String(this.value);
        if(this.value === 11) {
            cardName = 'Jack';
        } else if (this.value === 12) {
            cardName = 'Queen';
        } else if (this.value === 13) {
            cardName = 'King'
        } else if (this.value === 1) {
            cardName = 'Ace';
        }

        const suitName = suitNames[this.suit] || 'unkown';
        return `${cardName} of ${suitName}`;
    }
}