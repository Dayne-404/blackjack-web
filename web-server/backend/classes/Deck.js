import Card from "./Card.js";

/*
    class Deck

    This class represents a standard deck of cards. The class
    will first create an empty deck of cards and has a pointer to the
    card at the top of the deck (index 0).
*/
export default class Deck {
    constructor() {
        this.cards = [];
        this.top = 0;
        
        for(let suit = 1; suit < 5; suit++) {
            for(let value = 1; value < 14; value++) {
                this.cards.push(new Card(value, suit));
            }
        }
    }

    /*
        shuffle()

        This function will shuffle the newly created deck of cards. It does this
        using the (algorithm I forgot its name) That will give every card an equal
        chance of getting pulled. It also resets the top deck pointer back to 0
    */
    shuffle() {
        this.top = 0;

        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /*
        takeCard()

        This function will return the card at the top of the deck via the top pointer
        it will also increment the top pointer to now point to the new top card
    */
    takeCard() {
        const card = this.cards[this.top];
        this.top++;
        return card;
        
    }

    /*
        toString

        toString method in the format:
        Deck:
        <card 1>
        ...
        <card n>
        Length: <cards array length>
    */
    toString() {
        return `Deck:\n${this.cards.map(card => card.toString()).join('\n')}\nLength: ${this.cards.length}`;
    }
}