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

const table = document.getElementById('server-selection-table');
table.addEventListener('click', event => {
    setSelectedTableRow(table, event);
});

table.addEventListener('dblclick', event => {
    setSelectedTableRow(table, event);
    //Send to server
});

document.addEventListener('click', documentClickHandler);

initServerSelect(table);

function refreshServers(table) {
    const servers = getServerData();
    renderTable(table, servers);
}

function initServerSelect(table) {
    console.log('requesting room data');
    socket.emit('request-room-data');
    document.getElementById('server-join-btn').addEventListener('click', joinServer);
    document.getElementById('server-refresh-btn').addEventListener('click', refreshServers);
}

socket.on('send-room-data', (serverRooms) => {
    clientRooms = serverRooms;
    renderTable(table, clientRooms);
});

function getServerData() {
    
}



function joinServer () {
    console.log('joining server.. [ data ]');
    //Do somethiwng
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
        
        console.log(room.avalible);
        if(!room.avalible) {
            newRow.classList.add('room-unavalible');
        }
        
        tbody.appendChild(newRow);
    });
}



function documentClickHandler(event) {
    const target = event.target;
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
