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
        
        if(!this.push && !this.dealer) {
            this.bet = 0;
            this.winModifier = 0;
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

    /*
        getState()

        This function will return either 0, 1 or 2 based on
        the current total the player has. The function returns
        1 if the total is over 21. If the total is equal to 21 then
        the function returns 2 and anything else the function will 
        return 0
    */
    getState() {
        if(this.total > 21) {
            return 1;
        } else if (this.total === 21) {
            return 2;
        }

        return 0;
    }

    /*
        toString()

        Simple toString method that has the format:
        <name>
        [ <hand> ] : <total>
        In this state: <state>
    */
    toString() {
        return `${this.name}\n[ ${this.hand} ] : ${this.total}\nIn this state: ${this.getState()}`;
    }
}
