const Card = require('./Card');

class Deck {
    constructor() {
        this.cards = [];
        this.top = 0;
        
        for(let suit = 1; suit < 5; suit++) {
            for(let value = 1; value < 14; value++) {
                this.cards.push(new Card(value, suit));
            }
        }
    }

    shuffle() {
        this.top = 0;

        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }

        this.cards[0] = new Card(5, 1);
        this.cards[1] = new Card(10, 1);    
        this.cards[2] = new Card(4, 1);
        this.cards[3] = new Card(7, 1);
    }

    takeCard() {
        const card = this.cards[this.top];
        this.top++;
        return card;
        
    }

    toString() {
        return `Deck:\n${this.cards.map(card => card.toString()).join('\n')}\nLength: ${this.cards.length}`;
    }
}

module.exports = Deck;