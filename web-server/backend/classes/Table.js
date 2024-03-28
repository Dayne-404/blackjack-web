const getWinCondition = require('../helper/winConditions');
const Dealer = require('./Dealer');
const Deck = require('./Deck');

class Table {
    constructor(name, maxPlayers = 4) {
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.players = {};
        this.dealer = new Dealer();
        this.deck = new Deck();
        this.full = this.AtCapacity();

        this.order =[]; //Have to fix this if players are added
        this.playersReady = 0;
        this.turnIndex = 0;
        this.state = 0; //0 for waiting for players to bet and ready up
        this.queue = [];
    }

    nextRound() {
        this.state = 0;
        this.turnIndex = 0;
        this.playersReady = 0;
        this.dealer.reset();
        this.order.forEach(id => {
            this.players[id].reset();
        });
        this.deck.shuffle();
    }

    canStartRound() {
        return Object.keys(this.players).length > 0 &&
            Object.keys(this.players).length === this.playersReady &&
            this.state === 0; 
    }

    startRound() {
        this.state = 1; //Means the game is being played
        
        this.deck.shuffle();
        for(let i = 0; i < 2; i++) {
            this.order.forEach((id) => {
                this.players[id].recieveCard(this.deck.takeCard());
            });
            this.dealer.recieveCard(this.deck.takeCard());
        }
        
        const socketId = this.order[this.turnIndex];
        const playerName = this.players[socketId].name;
        return [socketId, playerName];
    }

    endRound() {
        let playersWinType = {};
        this.order.forEach(id => {
            let [winCondition, winModifier, push] = getWinCondition (
                this.players[id].hand.state,
                this.players[id].hand.total,
                this.dealer.hand.state,
                this.dealer.hand.total
            );

            this.players[id].push = push;

            if(!push) {
                if(winModifier === 0) {
                    console.log('adding to dealer bank');
                    this.dealer.bank += this.players[id].bet;
                } else {
                    this.players[id].bet = this.players[id].bet * winModifier;
                    this.players[id].bank += this.players[id].bet;
                }
            }
                
            playersWinType[id] = winCondition;
        });

        return playersWinType;
    }

    playerHit() {
        const playerId = this.getPlayerInTurn()
        this.players[playerId].recieveCard(this.deck.takeCard());

        if(this.players[playerId].hand.state > 0) {
            this.turnIndex++;
        }

        return this.getPlayerInTurn();
    }

    playerDoubleDown() {
        const playerId = this.getPlayerInTurn();
        console.log(this.players[playerId]);
        this.players[playerId].bank -= this.players[playerId].bet;
        this.players[playerId].bet *= 2;
        this.players[playerId].recieveCard(this.deck.takeCard());
        this.turnIndex++;
        return this.getPlayerInTurn();
    }

    playerStay() {
        this.turnIndex++;
        return this.getPlayerInTurn();
    }

    isPlayerBlackjack() {
        const playerId = this.getPlayerInTurn();
        return this.players[playerId].hand.state;
    }

    dealerPlay() {
        this.dealer.revealHand();

        while(this.dealer.hand.total < 17 && this.dealer.hand.state === 0) {
            this.dealer.recieveCard(this.deck.takeCard());
        }
    }

    getPlayerInTurn() {
        return this.order[this.turnIndex];
    }

    addPlayer(socketId, player) {
        if(!this.full) {
            this.players[socketId] = player;
            this.order.push(socketId);
            this.full = this.AtCapacity();
        }
    }

    addPlayerToQueue(socketId, player) {
        console.log('Adding player to queue');
        if(!this.full) {
            this.players[socketId] = player;
            this.queue.push(socketId);
            this.full = this.AtCapacity();
            console.log('players: ', this.players);
            console.log('queue: ', this.queue);
        }
    }

    moveFromQueueToGame() {
        console.log(this.queue);
        console.log(this.queue.length);
        console.log('Moving players from queue to game');
        while (this.queue.length > 0) {
            this.order.push(this.queue.shift());
        }
        

        console.log(this.queue);
    }

    removePlayer(socketId) {
        console.log(this.players);
        const removeIndex = this.order.indexOf(socketId);

        if(this.queue.includes(socketId) && removeIndex > -1) {
            this.queue.splice(removeIndex, 1);
            delete this.players[socketId];
            return this.getPlayerInTurn();
        }

        if(this.players[socketId].ready) {
            this.playersReady--;
        }
        
        this.dealer.bank += this.players[socketId].bet;
        delete this.players[socketId];
        
        if(this.turnIndex && removeIndex < this.turnIndex) {
            this.turnIndex--;
        }
        
        if(removeIndex > -1) {
            this.order.splice(removeIndex, 1);
        }

        return this.getPlayerInTurn();
    }

    safeFormat() {
        return {
            'name': this.name,
            'currentPlayers': Object.keys(this.players).length,
            'maxPlayers': this.maxPlayers,
            'full': this.roomAvalible,
            'private': false,
        };
    }

    gameFormat() {
        let formattedPlayers = [];
        this.order.forEach(key => {
            formattedPlayers.push(this.players[key].format());
        });
        
        return {
            'name': this.name,
            'players': formattedPlayers,
            'dealer': this.dealer.format(),
        };
    }

    AtCapacity() {
        if(Object.keys(this.players).length >= this.maxPlayers)
            return true;

        return false;
    }
}

module.exports = Table;