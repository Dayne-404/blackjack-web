const socket = io();

let clientRooms = null;
let selectedRoom = null;

const table = document.getElementById('room-selection-table');
const modal = document.getElementById('modal-container');
const roomNameContainer = document.getElementById('room-name-container');

socket.on('send-room-data', (serverRooms) => {
    clientRooms = serverRooms;
    renderTable(table, clientRooms);
});

document.addEventListener('click', documentClickHandler);

table.addEventListener('click', event => { setSelectedTableRow(table, event); });
table.addEventListener('dblclick', event => {
    setSelectedTableRow(table, event);
    joinPressed();
});

modal.addEventListener('submit', event => {
    event.preventDefault();
    const username = document.getElementById('username-input').value;
    const bank = document.getElementById('bank-input').value;
    
    if(roomNameContainer.style.display === 'none') {
        joinRoom(username, bank, selectedRoom);
    } else {
        const roomName = document.getElementById('room-name-input').value;
        createRoom(roomName, username, bank);
    }
        
    roomNameContainer.style.display = 'none';
    modal.style.display = 'none';
});

modal.querySelector('#cancel-btn').addEventListener('click', event => {
    modal.querySelectorAll('input').forEach((input) => {
        input.value = '';
    })
    roomNameContainer.style.display = 'none';
    modal.style.display = 'none';
});


modal.style.display = 'none';
initRoomSelect(table);

function documentClickHandler(event) {
    const target = event.target;
    if (target.tagName.toLowerCase() === 'button' || modal.style.display === 'block') {
        return;
    }

    if (!target.closest('#room-selection-table')) {
        const selectedRow = document.querySelector('#table-row-selected');
        if (selectedRow) {
            selectedRow.removeAttribute('id');
        }
    }
}

function initRoomSelect() {
    console.log('requesting room data');
    socket.emit('request-room-data');
    document.getElementById('create-room-btn').addEventListener('click', createPressed);
    document.getElementById('join-btn').addEventListener('click', joinPressed);
    document.getElementById('refresh-btn').addEventListener('click', refreshPressed);
}

function createPressed() {
    console.log('Activating room/player creation modal');
    roomNameContainer.style.display = 'flex';
    modal.style.display = 'block';
}

function joinPressed () {
    const selectedRow = table.querySelector('#table-row-selected');
    let roomId = null;
    
    if(!selectedRow) {
        console.log('ERR: User has not selected a room');
        return;
    }

    roomId = selectedRow.dataset.id;
    
    if(!roomId) {
        console.log('ERR: Room not found unable to join..');
        return;
    } 

    console.log('Activating player creation modal');
    selectedRoom = selectedRow.dataset.id;
    roomNameContainer.style.display = 'none';
    modal.style.display = 'block';
}

function refreshPressed() {
    console.log('requesting room data');
    socket.emit('request-room-data');
}

function createRoom(roomName, playerName, playerBank) {
    console.log(`Attempting to create room with name=${roomName}`);
    socket.emit('create-room', roomName, playerName, playerBank);
}

function joinRoom(playerName, playerBank, roomId) {
    console.log(`Attempting to join room with id=${roomId}`);
    socket.emit('join-room', playerName, playerBank, roomId);
}

function renderTable(table, rooms = null) {
    const tbody = table.querySelector('tbody');
    if(!tbody) return;

    tbody.innerHTML = '';

    if(rooms === null || rooms.length === 0) {
        tbody.textContent = 'No rooms avalible';
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
        
        if(room.full) {
            newRow.classList.add('unavalible');
        }
        
        tbody.appendChild(newRow);
    });
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
