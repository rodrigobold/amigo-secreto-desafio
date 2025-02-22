// Declaração de variáveis globais para armazenar as listas de amigos
let friendsList = [];   // Lista que armazenará os nomes dos amigos ainda não sorteados
let pickedFriends = []; // Lista que armazenará os nomes dos amigos que vão ser chamados para realizar o sorteio
let currentDrawerIndex = 0; // Índice do participante atual

// ============================== //
// Funções de Manipulação da Interface //
// ============================== //

// Exibe um texto dentro de um elemento HTML especificado
function displayTextOnScreen(tag, text) {
    let element = document.querySelector(tag); // Seleciona o elemento HTML com base na tag fornecida
    element.innerHTML = text; // Define o conteúdo HTML do elemento selecionado
}

// Exibe uma mensagem de alerta na tela
function showAlertMessage(message) {
    const alertMessage = document.querySelector(".alert-message"); // Seleciona o elemento da mensagem de alerta
    alertMessage.textContent = message; // Define o texto da mensagem de alerta
    alertMessage.style.opacity = "1"; // Torna a mensagem visível
    alertMessage.style.visibility = "visible"; // Garante que a mensagem seja exibida

    setTimeout(() => {
        alertMessage.style.opacity = "0"; // Reduz a opacidade para ocultar a mensagem
        alertMessage.style.visibility = "hidden"; // Remove a visibilidade da mensagem
    }, 3000); // Define um tempo de 3 segundos antes de esconder a mensagem
}

// Atualiza o estado e texto do botão de sorteio
function updateDrawButtonState(buttonElement, currentState) {
    const buttonStateText = {
        'prepare': 'Preparar', // Estado inicial, exibe "Preparar"
        'draw': 'Sortear', // Estado de sorteio, exibe "Sortear"
        'continue': 'Continuar' // Estado final, exibe "Continuar"
    };
    buttonElement.textContent = buttonStateText[currentState] || currentState; // Define o texto do botão baseado no estado atual
}

// Atualiza a lista de amigos visíveis na tela
function updateFriendsList() {
    let list = document.getElementById('participantsList'); // Obtém a lista de participantes na interface
    list.innerHTML = ''; // Limpa a lista para evitar duplicações
    friendsList.forEach(friend => { // Percorre todos os amigos na lista
        let listItem = document.createElement('li'); // Cria um novo elemento de lista (li)
        listItem.textContent = friend; // Define o nome do amigo como o conteúdo do item de lista
        list.appendChild(listItem); // Adiciona o item de lista à lista visível na interface
    });
}

// ======================== //
// Funções de Gerenciamento //
// ======================== //

// Adiciona um novo amigo às listas
function insertFriend() {
    let inputName = document.getElementById('inputField'); // Obtém o campo de entrada de texto
    if (inputName.value.trim() === '') { // Verifica se o campo está vazio
        showAlertMessage("Por favor, insira um nome!"); // Exibe uma mensagem de alerta caso esteja vazio
    } else {
        friendsList.push(inputName.value); // Adiciona o nome à lista de amigos ainda não sorteados
        pickedFriends.push(inputName.value); // Adiciona o nome à lista de amigos para o sorteio
        inputName.value = ''; // Limpa o campo de entrada após adicionar o nome
        console.log(`friendList: ${friendsList}`); // Exibe a lista de amigos no console
        updateFriendsList(); // Atualiza a interface com os novos amigos
        console.log(`pickedFriends: ${pickedFriends}`); // Exibe a lista de amigos disponíveis para sorteio
    }
}

// Valida se existem participantes suficientes para o sorteio
function validateParticipantsCount(friendsList, buttonText) {
    if (friendsList.length < 2 && buttonText === "Continuar") { // Se houver menos de 2 amigos e estiver no estado "Continuar"
        showAlertMessage("Por favor, adicione mais amigos!"); // Exibe um alerta pedindo mais amigos
        return false; // Retorna falso para impedir o sorteio
    }
    return true; // Retorna verdadeiro se houver participantes suficientes
}

// ========================= //
// Funções do Sorteio      //
// ========================= //

// Exibe na tela de quem é a vez de sortear
function displayCurrentDrawer(currentDrawer) {
    displayTextOnScreen(
        '#drawResult',
        `É a vez de <span class="highlight-current">${currentDrawer}</span> sortear!` // Destaca quem deve sortear
    );
}

// Realiza o sorteio e retorna o amigo selecionado
function performDraw(currentDrawer, friendsList) {
    const drawerIndexInCurrentList = friendsList.indexOf(currentDrawer); // Obtém o índice do sorteador na lista
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * friendsList.length); // Sorteia um índice aleatório
    } while (randomIndex === drawerIndexInCurrentList && friendsList.length > 1); // Garante que o sorteador não se sorteie
    return friendsList[randomIndex]; // Retorna o amigo sorteado
}

// Exibe o resultado do sorteio
function displayDrawResult(currentDrawer, selectedFriend) {
    displayTextOnScreen(
        '#drawResult',
        `O amigo secreto de <span class="highlight-current">${currentDrawer}</span> é: <span class="highlight-random">${selectedFriend}</span>` // Exibe o resultado do sorteio
    );
}

// Atualiza as listas após um sorteio bem sucedido
function updateAfterDraw(randomIndex, currentDrawerIndex, selectedFriend) {
    friendsList.splice(randomIndex, 1); // Remove o amigo sorteado da lista de disponíveis
    updateFriendsList(); // Atualiza a lista visível na interface
    pickedFriends.splice(currentDrawerIndex, 1); // Remove o sorteador da lista de participantes
    return currentDrawerIndex >= pickedFriends.length ? 0 : currentDrawerIndex; // Atualiza o índice do sorteador
}

// ================================ //
// Função Principal do Sorteio    //
// ================================ //

function drawRandomParticipant() {
    const button = document.getElementById('drawButton'); // Obtém o botão de sorteio
    const buttonText = button.textContent; // Obtém o texto atual do botão
    if (!validateParticipantsCount(friendsList, buttonText)) return; // Valida se há participantes suficientes

    if (buttonText === "Continuar") {
        displayTextOnScreen('#drawResult', 'Esta tudo certo! Agora clique em Preparar!'); // Mensagem inicial
        updateDrawButtonState(button, 'prepare'); // Atualiza o botão para "Preparar"
        return;
    }

    if (buttonText === "Preparar") {
        const currentDrawer = pickedFriends[currentDrawerIndex]; // Obtém o sorteador atual
        displayCurrentDrawer(currentDrawer); // Exibe o sorteador
        updateDrawButtonState(button, 'draw'); // Atualiza o botão para "Sortear"
        return;
    }

    if (buttonText === "Sortear") {  // Verifica se o texto do botão é "Sortear"
        const currentDrawer = pickedFriends[currentDrawerIndex];  // Obtém o sorteador atual da lista pickedFriends
        const selectedFriend = performDraw(currentDrawer, friendsList);  // Realiza o sorteio com o sorteador atual e a lista de amigos
        displayDrawResult(currentDrawer, selectedFriend);  // Exibe o resultado do sorteio mostrando quem foi o amigo sorteado
        updateDrawButtonState(button, 'prepare'); // Atualiza o botão para "Preparar"
        
        const newDrawerIndex = updateAfterDraw(
            friendsList.indexOf(selectedFriend),  // Atualiza o índice do sorteador com a posição do amigo sorteado
            currentDrawerIndex,  // Passa o índice do sorteador atual
            selectedFriend  // Passa o amigo sorteado
        ); 
        
        if (friendsList.length === 0) {  // Verifica se a lista de amigos ficou vazia após o sorteio
            updateDrawButtonState(button, 'continue');  // Altera o estado do botão para "continue"
            currentDrawerIndex = 0;  // Reseta o índice do sorteador para 0
        } else {  // Caso ainda haja amigos na lista
            currentDrawerIndex = newDrawerIndex;  // Atualiza o índice do sorteador para o próximo valor
        }
    }
}
