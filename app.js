// ============================== //
// Declaração de variáveis globais //
// ============================== //

let participants = []; //Lista oficial de participantes do sorteio.
let secretPairs = {};   // Objeto para armazenar os pares de amigo secreto
let currentPairIndex = 0; // Índice para controlar qual par está sendo exibido

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
        'continue': 'Continuar', // Estado inicial, exibe "Continuar"
        'prepare': 'Preparar', // Estado de preparo, exibe "Preparar"
        'draw': 'Sortear', // Estado de sorteio, exibe "Sortear"
        'restart' : 'Reiniciar' // Estado final, exibe "Reiniciar"
    };
    buttonElement.textContent = buttonStateText[currentState] || currentState; // Define o texto do botão baseado no estado atual
}

// Atualiza a lista de amigos visíveis na tela
function updateFriendsList() {
    let list = document.getElementById('participantsList'); // Obtém a lista de participantes na interface
    list.innerHTML = ''; // Limpa a lista para evitar duplicações
    participants.forEach(friend => { // Percorre todos os amigos na lista
        let listItem = document.createElement('li'); // Cria um novo elemento de lista (li)
        listItem.textContent = friend; // Define o nome do amigo como o conteúdo do item de lista
        list.appendChild(listItem); // Adiciona o item de lista à lista visível na interface
    });
}

// Alterna a visibilidade da lista de participantes
function toggleParticipants() {
    const participants = document.getElementById('participants'); // Obtém o elemento da lista de participantes
    const participantsBtn = document.querySelector('.participants-btn'); // Obtém o botão de alternância

    participants.classList.toggle('collapsed'); // Alterna a classe 'collapsed' para esconder/exibir participantes

    // Define o novo texto do botão baseado na presença da classe 'collapsed'
    participantsBtn.textContent = participants.classList.contains('collapsed') ? 'Lista de Amigos +' : 'Lista de Amigos -';
}

// Oculta ou exibe o nome do amigo sorteado
function hideSelectedFriend() {
    const resultElement = document.getElementById('selected-friend'); // Obtém o elemento que mostra o sorteado
    const hideBtn = document.querySelector('.hide-btn'); // Obtém o botão de esconder

    resultElement.classList.toggle('collapsed'); // Alterna a classe 'collapsed' para esconder/exibir o nome sorteado

    // Define o novo estado baseado na presença da classe 'collapsed'
    const newState = resultElement.classList.contains('collapsed') ? 'Exibir +' : 'Ocultar -';

    // Atualiza o texto do botão dinamicamente
    updateDrawButtonState(hideBtn, newState);
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
        participants.push(inputName.value); // Adiciona o nome à lista de amigos para o sorteio
        inputName.value = ''; // Limpa o campo de entrada após adicionar o nome
        updateFriendsList(); // Atualiza a interface com os novos amigos
        console.log(`participants: ${participants}`); // Exibe a lista de amigos disponíveis para sorteio
    }
}

// ========================= //
// Funções do Sorteio       //
// ========================= //

// Função que mistura a lista
function shuffleArray(array) {
    // Percorre o array do último índice até o primeiro
    for (let i = array.length - 1; i > 0; i--) {
        // Gera um índice aleatório entre 0 e o índice atual (inclusive)
        let j = Math.floor(Math.random() * (i + 1));

        // Troca os elementos nos índices 'i' e 'j'
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos de lugar
    }
}

// Função que gera um sorteio perfeito para o Amigo Secreto
function generatePairs(participants) {
    // Verifica se há pelo menos 2 participantes
    if (participants.length < 2) {
        showAlertMessage("Por favor, adicione mais amigos!"); // Exibe um alerta pedindo mais amigos
        return; // Retorna null, pois o sorteio não pode ser feito
    }

    let pickedFriends; // Lista de participantes embaralhada
    let isValid = false; // Variável para verificar se o sorteio é válido (ninguém se tirou)

    // Tenta gerar um sorteio válido até que ninguém se tire
    while (!isValid) {
        pickedFriends = [...participants]; // Cria uma cópia da lista original
        shuffleArray(pickedFriends); // Embaralha a lista copiada

        // Verifica se todos os participantes são diferentes de si mesmos (ninguém pode se tirar)
        isValid = pickedFriends.every((friend, index) => friend !== participants[index]);
    }

    // Mapeia os participantes para seus respectivos amigos secretos
    let friendsPairs = {}; // Objeto para armazenar o amigo secreto de cada participante
    participants.forEach((participant, index) => {
        // Adiciona o participante e o seu respectivo amigo secreto ao objeto
        friendsPairs[participant] = pickedFriends[index];
    });

    // Retorna o objeto com todos os pares de amigo secreto
    return friendsPairs;
}

// Exibe o resultado do sorteio
function displayDrawResult(drawer, friend) {
    // Exibe o resultado
    displayTextOnScreen(
        '#drawResult',
        `O amigo secreto de <span class="highlight-current">${drawer}</span> é: 
        <span id="selected-friend" class="highlight-random">${friend}</span>
        <button id="hideBtn" class="hide-btn" onclick="hideSelectedFriend()">Ocultar -</button>`
    );
}

// ================================ //
// Função Principal do Sorteio    //
// ================================ //

// Controla o fluxo do sorteio do amigo secreto, gerenciando os estados do botão e realizando o sorteio
function drawRandomParticipant() {
    const button = document.getElementById('drawButton'); // Obtém o botão de sorteio
    const buttonText = button.textContent; // Obtém o texto atual do botão

    // Estado "Continuar": Prepara a interface para o início do sorteio
    if (buttonText === "Continuar") {
        // Verificar se há participantes suficientes
        if (participants.length < 2) {
            showAlertMessage("Por favor, adicione mais amigos!"); // Exibe um alerta pedindo mais amigos
            return;
        }

        const participantsList = document.getElementById('participants');
        if (!participantsList.classList.contains('collapsed')) {
            toggleParticipants(); // Esconde a lista de participantes
        }
        
        // Gera os pares de amigo secreto
        secretPairs = generatePairs(participants);
        
        if (secretPairs === null) {
            return; // Se não foi possível gerar os pares, interrompe a execução
        }
        
        // Atualiza a lista de pares
        entries = Object.entries(secretPairs);
        console.log(secretPairs); // Exibe o resultado do sorteio no console
        
        // Reseta o índice do par atual
        currentPairIndex = 0;
        
        // Exibe a mensagem inicial
        displayTextOnScreen('#drawResult', 'Está tudo certo! Agora clique em Preparar!'); 
        
        // Atualiza o botão para "Preparar"
        updateDrawButtonState(button, 'prepare');
        return;
    }

    // Estado "Preparar": Exibe o participante que irá sortear
    if (buttonText === "Preparar") {
        if (currentPairIndex < entries.length) {
            const [drawer] = entries[currentPairIndex]; // Obtém apenas o nome da pessoa que sorteia
            
            // Exibe o sorteador atual
            displayTextOnScreen('#drawResult', `Sorteador da vez é: <span class="highlight-current">${drawer}</span>`);
            
            // Atualiza o botão para "Sortear"
            updateDrawButtonState(button, 'draw');
            
            // Certifica que o botão de ocultar não aparece ainda
            const hideBtn = document.getElementById("hideBtn");
            if (hideBtn) hideBtn.style.display = "none";
        } else {
            // Se todos os pares já foram exibidos, reinicia o processo
            displayTextOnScreen('#drawResult', 'Todos os sorteios foram realizados!');
            updateDrawButtonState(button, 'continue');
        }
        return;
    }

    // Estado "Sortear": Realiza o sorteio e exibe o resultado
    if (buttonText === "Sortear") {
        if (currentPairIndex < entries.length) {
            const [drawer, friend] = entries[currentPairIndex]; // Obtém o par atual (sorteador e amigo)
            
            // Exibe o resultado do sorteio
            displayDrawResult(drawer, friend);
            document.getElementById("hideBtn").style.display = "inline"; // Exibe o botão de ocultar
            
            // Avança para o próximo par
            currentPairIndex++;
            
            // Se este foi o último par, prepara para recomeçar
            if (currentPairIndex >= entries.length) {
                updateDrawButtonState(button, 'restart');
            } else {
                updateDrawButtonState(button, 'prepare');
            }
        }
        return;
    }

        // Estado "Reiniciar": Reseta tudo e exibe a lista de participantes novamente
        if (buttonText === "Reiniciar") {
            participants = []; // Zera a lista de participantes
            secretPairs = {}; // Zera os pares do sorteio
            currentPairIndex = 0; // Reseta o índice do sorteio
        
            // Atualiza a interface
            updateFriendsList(); // Atualiza a lista de participantes visível na tela
            displayTextOnScreen('#drawResult', 'Sorteio reiniciado! Adicione novos participantes.');
            
            // Exibe a lista de participantes novamente
            const participantsList = document.getElementById('participants');
            if (participantsList.classList.contains('collapsed')) {
                toggleParticipants();
            }
        
            // Atualiza o botão para voltar ao estado inicial
            updateDrawButtonState(button, 'continue');
        }
}