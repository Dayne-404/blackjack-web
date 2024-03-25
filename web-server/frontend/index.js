// document.addEventListener('DOMContentLoaded', () => {
//     const socket = io();

//     const form = document.getElementById('player-form');
//     form.addEventListener('submit', event => {
//         event.preventDefault();

//         const username = document.getElementById('username').value;
//         const bank = document.getElementById('bank').value;

//         socket.emit('initPlayer', username, bank);
//     });
// });

const socket = io();

let clientRooms = null;
let selectedRoom = null;

const table = document.getElementById('server-selection-table');
const playerCreationModel = document.getElementById('player-create-modal');
const serverCreateInput = document.getElementById('server-name-container');

table.addEventListener('click', event => {
    setSelectedTableRow(table, event);
});

table.addEventListener('dblclick', event => {
    setSelectedTableRow(table, event);
    joinServer();
});

playerCreationModel.addEventListener('submit', event => {
    event.preventDefault();
    const username = document.getElementById('create-username').value;
    const bank = document.getElementById('create-bank').value;
    
    if(serverCreateInput.style.display === 'none') {
        joinRoom(username, bank, selectedRoom);
    } else {
        const serverName = document.getElementById('create-server').value;
        createRoom(serverName, username, bank);
    }
        
    serverCreateInput.style.display = 'none';
    playerCreationModel.style.display = 'none';
});

playerCreationModel.querySelector('#cancel-btn').addEventListener('click', event => {
    console.log("Close modal");
    playerCreationModel.querySelectorAll('input').forEach((input) => {
        input.value = '';
    })
    serverCreateInput.style.display = 'none';
    playerCreationModel.style.display = 'none';
});

document.addEventListener('click', documentClickHandler);
playerCreationModel.style.display = 'none';
initServerSelect(table);

function refreshServers() {
    console.log('requesting room data');
    socket.emit('request-room-data');
}

function createRoom(serverName, playerName, playerBank) {
    console.log(`Attempting to create room with name=${serverName}`);
    socket.emit('create-room', serverName, playerName, playerBank);
}

function createServer() { //Rename this
    serverCreateInput.style.display = 'block';
    playerCreationModel.style.display = 'block';
}

function initServerSelect() {
    console.log('requesting room data');
    socket.emit('request-room-data');
    document.getElementById('create-room-btn').addEventListener('click', createServer);
    document.getElementById('server-join-btn').addEventListener('click', joinServer);
    document.getElementById('server-refresh-btn').addEventListener('click', refreshServers);
}

socket.on('send-room-data', (serverRooms) => {
    clientRooms = serverRooms;
    renderTable(table, clientRooms);
});

function joinServer () {
    const selectedRow = table.querySelector('#table-row-selected');
    let roomId = null;
    
    if(!selectedRow) {
        console.log('ERR: User has not selected a server');
        return;
    }

    roomId = selectedRow.dataset.id;
    
    if(!roomId) {
        console.log('ERR: Room not found unable to join..');
        return;
    } 

    console.log('Activating player creation modal');
    selectedRoom = selectedRow.dataset.id;
    playerCreationModel.style.display = 'block';
}

function joinRoom(playerName, playerBank, roomId) {
    console.log(`Attempting to join room with id=${roomId}`);
    socket.emit('join-room', playerName, playerBank, roomId);
}

function renderTable(table, rooms = null) {
/*
    serverName: str
    currentPlayers: num
    maxPlayers: num
    private: bool
*/
    const tbody = table.querySelector('tbody');
    if(!tbody) return;

    tbody.innerHTML = '';

    if(rooms === null || rooms.length === 0) {
        tbody.textContent = 'No servers';
        return;
    }

    let nameCell, playersCell, privateCell;

    Object.entries(rooms).forEach(([roomId, room]) => {
        let newRow = document.createElement('tr');
        newRow.setAttribute('data-id', roomId);
        nameCell = document.createElement('td');
        playersCell = document.createElement('td');
        privateCell = document.createElement('td');

        nameCell.textContent = room.name;
        playersCell.textContent = `${room.currentPlayers} / ${room.maxPlayers}`;
        privateCell.textContent = room.private;

        newRow.append(nameCell, playersCell, privateCell);
        
        console.log(room.avalible); //Need to change to capacity
        if(room.avalible) {
            newRow.classList.add('unavalible');
        }
        
        tbody.appendChild(newRow);
    });
}

function documentClickHandler(event) {
    const target = event.target;
    
    if (target.tagName.toLowerCase() === 'button' || playerCreationModel.style.display === 'block') {
        return;
    }

    if (!target.closest('.player-table')) {
        const selectedRow = document.querySelector('.player-table tbody tr#table-row-selected');
        if (selectedRow) {
            selectedRow.removeAttribute('id');
        }
    }
}

function setSelectedTableRow(table, event) {
    const targetRow = event.target.closest('tr');
    const tbody = table.querySelector('tbody');

    if(!targetRow || !table.contains(targetRow) || !tbody.contains(targetRow)) return;

    const selectedRow = table.querySelector('#table-row-selected');
    if(selectedRow) {
        selectedRow.removeAttribute('id');
    }
    targetRow.setAttribute('id', 'table-row-selected');
}
