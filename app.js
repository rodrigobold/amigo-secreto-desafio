let friendsList = []

function insertFriend() {
    let nameInput = document.getElementById('inputName')
    if (nameInput.value.trim() === '') {
        alert('Por favor, insira um nome')
    } else {
        friendsList.push(nameInput.value)
        nameInput.value = ''
        console.log(friendsList)
        updateFriendsList()
    }
}

function updateFriendsList() {
    let list = document.getElementById('namesList'); 
    list.innerHTML = ''; 
    for (let i = 0; i < friendsList.length; i++) { 
        let listaItem = document.createElement('li'); 
        listaItem.textContent = friendsList[i]; 
        list.appendChild(listaItem); 
    }
}