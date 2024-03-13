export default class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.total = 0;
        this.state = 0; //0 for under 21.. 1 for bust.. 2 for perfect 21 
    }

    recieveCard(card, hidden = 0) {
        if(hidden)
            card.hidden = hidden;

        this.hand.push(card);

        if(card.value > 10) {
            this.total += 10;
        } else {
            this.total += card.value;
        }

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