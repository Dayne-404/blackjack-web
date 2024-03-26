class Hand {
    constructor() {
        this.cards = [];
        this.total = this.calculateHandTotal(this.cards);
        this.state = 0; //0 for 
    }

    recieveCard(card, hidden = 0) {
        if(hidden) {
            card.hidden = hidden;
        }

        this.cards.push(card);
        this.total += card.value;
        this.state = this.getHandState();
    }

    format() {
        let formattedCard = '[ ';
        this.cards.forEach(card => {
            formattedCard += card.toString() + ' ';
        })
        formattedCard += ']'
        return formattedCard;
    }

    getHandState() {
        if(this.total > 21) {
            return 1;
        } else if (this.total === 21) {
            return 2;
        }

        return 0;
    }

    calculateHandTotal(hand) {
        if(hand != null || hand.length > 0) {
            return hand.reduce((total, card) => total + card.value, 0);
        } 
        
        return 0;
    }
}

module.exports = Hand;