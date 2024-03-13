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
            1: '♠',
            2: '♦',
            3: '♣',
            4: '♥'
        };

        let cardName = String(this.value);
        if(this.value === 11) {
            cardName = 'J';
        } else if (this.value === 12) {
            cardName = 'Q';
        } else if (this.value === 13) {
            cardName = 'K'
        } else if (this.value === 1) {
            cardName = 'A';
        }

        const suitName = suitNames[this.suit] || 'U';
        return `${cardName}${suitName}`;
    }
}