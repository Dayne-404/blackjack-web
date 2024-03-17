export default class Player {
    constructor(name, bank = 0, dealer = false) {
        this.name = name;
        this.hand = [];
        this.total = 0;
        this.state = 0; //0 for under 21.. 1 for bust.. 2 for perfect 21 
        this.bank = bank;
        this.bet = 0;
        this.winModifier = 0;
        this.push = false;
        this.dealer = dealer;

        if(dealer) {
            this.bet = -1;
        }
    }

    reset() {
        this.hand = [];
        this.total = 0;
        this.state = 0;
        
        if(!this.push && !this.dealer) {
            this.bet = 0;
            this.winModifier = 0;
        } else {
            this.push = false;
        }        
    }

    recieveCard(card, hidden = 0) {
        if(hidden) {
            card.hidden = hidden;
        }

        if(card.value > 10) {
            this.total += 10;
        } else if (card.value === 1 && (this.total + 11) < 22) {
            this.total += 11;
        } else {
            this.total += card.value;
        }

        this.hand.push(card);
        this.state = this.getState();
    }

    getState() {
        if(this.total > 21) {
            return 1;
        } else if (this.total === 21) {
            return 2;
        }

        return 0;
    }

    toString() {
        return `${this.name}\n[ ${this.hand} ] : ${this.total}\nIn this state: ${this.getState()}`;
    }
}

   // getTotal(cards) {
    //     return cards.reduce((total, currentValue) => total + currentValue);
    // }