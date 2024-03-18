/*
    class Player (name, bank = 0, dealer = false)

    This class is meant to represent a player in a game of blackjack
    this class has a variety of helper functions that provide extra
    functionality to the class
*/
export default class Player {
    constructor(name, bank = 0, dealer = false) {
        this.dealer = dealer;   //Whether or not the player is a dealer
        this.name = name;       //The players name
        this.hand = [];         //The current hand the player has
        
        this.total = 0; //Total amount of the hand
        this.state = 0; //0 for under 21.. 1 for bust.. 2 for perfect 21 
        
        this.bank = bank;   //The total amount of money the player has to work with
        this.bet = 0;       //The bet the player has currently placed
        
        this.winModifier = 0;   //The win Modifier the players bet has
        this.push = false;      //Whether or not the player is getting pushed
        this.isSplit = false;     //Whether the hand is split into two or not
        this.currentHand = 0;
    }

    split() {
        this.isSplit = true;
        this.currentHand = 0;
        this.winModifier = [0, 0];
        this.state = [0, 0];
        this.bet = [this.bet, this.bet]; 
        this.total = [
            this.getCardValue(this.hand[0]), 
            this.getCardValue(this.hand[0])];
        let splitArray = [[this.hand[0]],[this.hand[1]]];
        this.hand = splitArray;
    }

    getCardValue(card, handValue) {
        if(card.value > 10) {
            return 10;
        } else if (card.value === 1 && (handValue + 11) < 22) {
            return 11;
        }
        
        return card.value;
    }

    /*
        reset()

        This function will reset the player to its default state. Call
        this function in order to reset everything back to the default
        values. The only value that will remain unchanged is the bank.
        If the player push variable is true then the bet and winModifier
        will not be reset to default
    */
    reset() {
        this.hand = [];
        this.total = 0;
        this.state = 0;
        this.isSplit = false;
        this.currentHand = 0;
        
        if(!this.push && !this.isSplit) {
            this.bet = 0;
        } else if(this.isSplit) {
            this.bet = this.bet[0] + this.bet[1];
        }

        this.push = false;
    }

    canSplit() {
        return (
            this.hand[0].value === this.hand[1].value &&
            this.canDoubleDown()
        );
    }

    canDoubleDown() {
        if(!this.isSplit) {
            return this.bank >= this.bet;
        } else {
            return this.bank >= this.bet[this.currentHand];
        }
    }

    /*
        recieveCard(card, hidden = 0)

        This function will add a card to the players hand
        and update the total variable to represent the total
        score a player has in their hand. If the card is meant
        to be hidden but in the players hand then the hidden flag
        can be changed to 1 and the card will be added to the players hand
        but not visible
    */
    recieveCard(card, hidden = 0) {
        if(hidden) {
            card.hidden = hidden;
        }

        if(this.isSplit) {
            this.total[this.currentHand] += this.getCardValue(card, this.total[this.currentHand]);
            this.hand[this.currentHand].push(card);
            this.state[this.currentHand] = this.getState(this.total[this.currentHand]);
        } else {
            this.total += this.getCardValue(card, this.total);
            this.hand.push(card);
            this.state = this.getState(this.total);
        }
    }

    /*
        getState()

        This function will return either 0, 1 or 2 based on
        the current total the player has. The function returns
        1 if the total is over 21. If the total is equal to 21 then
        the function returns 2 and anything else the function will 
        return 0
    */
    getState(total) {
        if(total > 21) {
            return 1;
        } else if (total === 21) {
            return 2;
        }

        return 0;
    }
}
