let friendsList = []

function displayTextOnScreen(tag, text) {
    let element = document.querySelector(tag);
    element.innerHTML = text;
}

function insertFriend() {
    let inputName = document.getElementById('inputField')
    if (inputName.value.trim() === '') {
        displayTextOnScreen(
            '.alert-message',
            'Por favor, insira um nome'
        );
    } else {
        friendsList.push(inputName.value)
        inputName.value = ''
        console.log(friendsList)
        updateFriendsList()
    }
}

function updateFriendsList() {
    let list = document.getElementById('participantsList'); 
    list.innerHTML = ''; 
    for (let i = 0; i < friendsList.length; i++) { 
        let listItem = document.createElement('li'); 
        listItem.textContent = friendsList[i]; 
        list.appendChild(listItem); 
    }
}

function drawRandomParticipant() { 
    if (friendsList.length < 2) {
        displayTextOnScreen(
            '.alert-message',
            'Por favor, adicione mais amigos'
        );
    } else {
        let pickRandomFriend = friendsList[Math.floor(Math.random() * friendsList.length)];
        displayTextOnScreen(
            '#drawResult', 
            `Seu amigo secreto é: ${pickRandomFriend}`
        );
    }
}