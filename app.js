// Declaração de variáveis globais para armazenar as listas de amigos
let friendsList = [];   // Lista que armazenará os nomes dos amigos ainda não sorteados
let pickedFriends = []; // Lista que armazenará os nomes dos amigos sorteados que vão ser chamados para sorteio
let currentDrawerIndex = 0; // Declaração global do índice atual

// Função para exibir um texto dentro de um elemento HTML especificado
function displayTextOnScreen(tag, text) {
    let element = document.querySelector(tag); // Seleciona o elemento HTML usando o seletor fornecido
    element.innerHTML = text; // Define o conteúdo do elemento com o texto fornecido
}

// Função para adicionar um novo amigo à lista de amigos
function insertFriend() {
    let inputName = document.getElementById('inputField'); // Seleciona o campo de entrada de texto onde o nome é digitado
    // Verifica se o campo de entrada está vazio ou contém apenas espaços
    if (inputName.value.trim() === '') {
        // Se estiver vazio, exibe uma mensagem de alerta
        showAlertMessage("Por favor, insira um nome!");
    } else {
        // Se não estiver vazio, adiciona o nome à lista de amigos
        friendsList.push(inputName.value);
        pickedFriends.push(inputName.value);
        inputName.value = ''; // Limpa o campo de entrada após adicionar o nome
        console.log(friendsList); // Exibe a lista de amigos no console (para fins de debug)
        updateFriendsList(); // Atualiza a lista de amigos na interface
        console.log(pickedFriends); // Exibe a lista de amigos no console (para fins de debug)
    }
}

// Função para atualizar as listas de amigos visíveis na tela
function updateFriendsList() {
    let list = document.getElementById('participantsList'); // Seleciona o elemento onde a lista de amigos será exibida
    list.innerHTML = ''; // Limpa a lista atual para não exibir duplicados
    // Loop que percorre todos os amigos na lista de amigos ainda não sorteados
    for (let i = 0; i < friendsList.length; i++) {
        let listItem = document.createElement('li'); // Cria um novo item de lista (li) para cada amigo
        listItem.textContent = friendsList[i]; // Define o nome do amigo como o conteúdo do item
        list.appendChild(listItem); // Adiciona o item à lista na página
    }
}

// Função para sortear um amigo aleatoriamente da lista e removê-lo

function drawRandomParticipant() {
    // Obtém o botão pelo ID 'drawButton'
    const button = document.getElementById('drawButton');
    // Captura o texto atual do botão
    const buttonText = button.textContent;

    // Verifica se há menos de 2 amigos na lista e se o botão está no estado "Verificar"
    if (friendsList.length < 2 && buttonText === "Continuar") {
        // Exibe uma mensagem de alerta se não houver amigos suficientes para o sorteio
        showAlertMessage("Por favor, adicione mais amigos!");
        return;
    }

    // Altera o texto do botão para "Preparar"
     button.textContent = "Preparar";
     
    // Atualiza a tela informando que tudo está certo e pede para o usuário clicar em "Preparar"
    displayTextOnScreen(
        '#drawResult',
        `Esta tudo certo! Agora clique em Preparar!`
    );

    
    // Se o botão estiver com o texto "Preparar", indica quem será o próximo a sortear
    if (buttonText === "Preparar") {
        // Obtém o nome do participante que deve sortear
        let currentDrawer = pickedFriends[currentDrawerIndex];
        // Atualiza a tela com o nome da pessoa que deve sortear
        displayTextOnScreen(
            '#drawResult',
            `É a vez de <span class="highlight-current">${currentDrawer}</span> sortear!`
        );
        // Altera o texto do botão para "Sortear"
        button.textContent = "Sortear";
        
    } else if (buttonText === "Sortear") {
        // Obtém o nome do participante que está sorteando
        let currentDrawer = pickedFriends[currentDrawerIndex];
    
        // Encontra o índice dessa pessoa na lista de amigos
        let drawerIndexInCurrentList = friendsList.indexOf(currentDrawer);
    
        // Gera um índice aleatório, garantindo que não seja o mesmo da pessoa sorteando
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * friendsList.length);
        } while (randomIndex === drawerIndexInCurrentList && friendsList.length > 1);
    
        // Seleciona o amigo secreto baseado no índice aleatório gerado
        let pickRandomFriend = friendsList[randomIndex];
        
        // Remove o amigo sorteado da lista para evitar repetições
        friendsList.splice(randomIndex, 1);
    
        // Exibe o resultado do sorteio na tela
        displayTextOnScreen(
            '#drawResult',
            `O amigo secreto de <span class="highlight-current">${currentDrawer}</span> é: <span class="highlight-random">${pickRandomFriend}</span>`
        );
    
        // Atualiza a lista de amigos na interface
        updateFriendsList();
    
        // Remove o sorteador da lista de pickedFriends
        pickedFriends.splice(currentDrawerIndex, 1);
    
        // Se todos já sortearam, volta ao início
        if (currentDrawerIndex >= pickedFriends.length) {
            currentDrawerIndex = 0;
        }
    
        // Se não houver mais amigos na lista após o sorteio, redefine o botão
        if (friendsList.length === 0) {
            button.textContent = "Continuar";
            currentDrawerIndex = 0; // Reinicia o índice para uma nova rodada
        }
    }
}

// Função para exibir uma mensagem de alerta na tela
function showAlertMessage(message) {
    const alertMessage = document.querySelector(".alert-message"); // Seleciona o elemento de alerta
    
    alertMessage.textContent = message; // Define o texto da mensagem de alerta
    alertMessage.style.opacity = "1"; // Torna a mensagem visível com opacidade 1 (totalmente visível)
    alertMessage.style.visibility = "visible"; // Garante que a mensagem seja visível na tela

    // Define um temporizador para esconder a mensagem automaticamente após 3 segundos
    setTimeout(() => {
        alertMessage.style.opacity = "0"; // Torna a mensagem invisível (opacidade 0)
        alertMessage.style.visibility = "hidden"; // Torna a mensagem invisível (retira do fluxo da página)
    }, 3000); // O tempo de 3 segundos define o tempo de exibição da mensagem
}