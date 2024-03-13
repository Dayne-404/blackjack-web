import Player from "./player.js";
import Deck from "./deck.js";

export default class BlackjackController {
    constructor(dealer, players, deck) {
        this.players = players;
        this.players.push(dealer);
        this.deck = deck;
        this.turn = 0;
    }

    startGame() {
        this.deck.shuffle();

        for(let i = 0; i < 2; i++) {
            this.players.forEach(player => {
                if(i === 1 && player.name === 'Dealer') {
                    player.recieveCard(this.deck.takeCard(), 1);
                } else {
                    player.recieveCard(this.deck.takeCard());
                }
                
                console.log(player.toString());
            });
        }  
    }

    playRound(interfaceElements) {
        
    }
}
