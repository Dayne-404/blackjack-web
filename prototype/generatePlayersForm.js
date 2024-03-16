export default function generatePlayersForm (numPlayers) {
    const container = document.getElementById("start-screen");
    let generatedForm = '<form id="add-players-form" class="add-players-form">';

    for(let i = 1; i <= numPlayers; i++) {
        generatedForm += `
        <h4>Player ${i}</h4>
        <label for="player${i}-name">Name</label>
        <input type="text" id="player${i}-name" name="player${i}-name">
        <label for="player${i}-bet">Bet</label>
        <input type="number" id="player${i}-bet" name="player${i}-bet">
        `
    }

    generatedForm += `
    <input type="submit" class="submit-btn" value="Submit">
    </form>`;
    container.innerHTML += generatedForm;
}