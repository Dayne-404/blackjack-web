export default function generatePlayersForm (numPlayers) {
    const container = document.getElementById("start-screen");
    let generatedForm = '<form id="add-players-form" class="add-players-form"><div class="add-players-container">';

    for(let i = 1; i <= numPlayers; i++) {
        generatedForm += `
        <div>
        <h4>Player ${i}</h4>
            <div class="player-items">
                <label for="player${i}-name">Name</label>
                <input type="text" id="player${i}-name" name="player${i}-name" value="player ${i}">
                <label for="player${i}-total">Total</label>
                <input type="number" id="player${i}-total" name="player${i}-total" value="1000">
            </div>
        </div>
        `
    }

    generatedForm += `
    </div><br>
    <input type="submit" class="submit-btn" value="Start Game">
    </form>
    `;
    
    container.innerHTML += generatedForm;
    return document.getElementById("add-players-form");
}