// 1. VARIÁVEIS GLOBAIS

let participants = []; // Lista oficial de participantes do sorteio 
let secretPairs = {};   // Objeto para armazenar os pares de amigo secreto 
let currentPairIndex = 0; // Índice para controlar qual par está sendo exibido
let entries = []; // Converte o objeto secretPairs em um array de pares [sorteador, amigo secreto]

// 2. FUNÇÕES DE MANIPULAÇÃO DA INTERFACE

// <-- Exibe um texto dentro de um elemento HTML especificado -->
function displayTextOnScreen(tag, text) {
    const element = document.querySelector(tag); 
    element.innerHTML = text; 
}

// <-- Exibe uma mensagem de alerta e a oculta após 3 segundos -->
function showAlertMessage(message) {
    const alertMessage = document.querySelector(".alert-message"); 
    alertMessage.innerHTML = message;
    alertMessage.style.opacity = "1";
    alertMessage.style.visibility = "visible";

    setTimeout(() => {
        alertMessage.style.opacity = "0";
        alertMessage.style.visibility = "hidden";
    }, 3000);
}

// <-- Adiciona reticências (...) ao texto se ultrapassar o limite de caracteres especificado -->
function ellipsizeText(text, maxLength) {
    if (typeof maxLength !== "number" || maxLength <= 0) {
        throw new Error("maxLength deve ser um número maior que zero.");
    }
    
    // Verifica se a tela é igual ou menor que 400px
    const isSmallScreen = window.innerWidth <= 400;
    
    // Diminui x caracteres no maxLength se for uma tela pequena
    const adjustedMaxLength = isSmallScreen ? maxLength - 2 : maxLength;
    
    // Retorna o texto original ou com reticências
    return text.length > adjustedMaxLength ? text.slice(0, adjustedMaxLength) + "..." : text;
}

// <-- Atualiza a lista de amigos na interface -->
function updateFriendsList() {
    const list = document.getElementById('participantsList');
    
    // Limpa o conteúdo da lista antes de recriá-la
    list.innerHTML = '';

    // Percorre o array de participantes e cria um item de lista para cada um
    participants.forEach((friend, index) => {
        const listItem = createParticipantItem(friend, index);
        list.prepend(listItem); // Adiciona o item no início da lista
    });
}

// <-- Cria um item de lista para um participante específico -->
function createParticipantItem(friend, index) {
    const listItem = document.createElement('li'); // Cria o elemento <li>
    
    const container = document.createElement('div'); // Cria um container interno
    container.className = 'participant-inner'; // Define a classe CSS para estilização

    // Cria um elemento de número (ex: "1.", "2.", "3.")
    const numberSpan = createSpan(`${index + 1}.`, 'participant-number');

    // Cria um elemento para exibir o nome do participante
    const nameSpan = createSpan(friend, 'participant-name', index);

    // Cria os botões de ação (editar e excluir)
    const actionContainer = createActionButtons(index, nameSpan);

    // Monta a estrutura do item adicionando os elementos ao container
    container.appendChild(numberSpan);
    container.appendChild(nameSpan);
    container.appendChild(actionContainer);

    // Adiciona o container ao item da lista
    listItem.appendChild(container);

    return listItem; // Retorna o item pronto para ser adicionado à lista
}

// <-- Cria um elemento <span> com o texto e classe informados -->
function createSpan(text, className, index = null) {
    const span = document.createElement('span'); // Cria um <span>
    span.textContent = text; // Define o texto do span
    span.className = className; // Adiciona a classe CSS para estilização

    // Se um índice foi passado, adiciona um atributo para referência
    if (index !== null) {
        span.setAttribute('data-index', index);
    }
    return span; // Retorna o span criado
}

// <-- Cria o container com os botões de ação (editar e excluir) -->
function createActionButtons(index, nameSpan) {
    const actionContainer = document.createElement('div'); // Cria um container para os botões
    actionContainer.className = 'participant-actions'; // Adiciona a classe CSS

    // Cria o botão de edição
    const editButton = createButton(
        '<i class="fa-solid fa-pen-to-square"></i>', // Ícone do botão (font awesome)
        'edit-btn', // Classe CSS
        () => startInlineEdit(nameSpan), // Função chamada ao clicar
        'Editar participante' // Texto alternativo para acessibilidade
    );

    // Cria o botão de exclusão
    const deleteButton = createButton(
        '<i class="fa-solid fa-trash"></i>',
        'delete-btn',
        () => deleteFriend(index),
        'Remover participante'
    );

    // Adiciona os botões ao container de ações
    actionContainer.appendChild(editButton);
    actionContainer.appendChild(deleteButton);

    return actionContainer; // Retorna o container com os botões
}

// <-- Função reutilizável para criar um botão -->
function createButton(innerHtml, className, onClick, ariaLabel) {
    const button = document.createElement('button'); // Cria um botão
    button.innerHTML = innerHtml; // Define o ícone do botão
    button.className = className; // Adiciona a classe CSS
    button.onclick = onClick; // Define a ação ao clicar
    button.setAttribute('aria-label', ariaLabel); // Adiciona acessibilidade
    return button; // Retorna o botão criado
}

// <-- Função responsável por alternar a visibilidade da lista de participantes e atualizar o texto do botão -->
function toggleParticipants() {
    const participants = document.getElementById('participants');
    const participantsBtn = document.querySelector('.participants-btn');

    // Alterna a classe 'collapsed' para esconder/exibir a lista
    participants.classList.toggle('collapsed');

    // Define o texto do botão com base no tamanho da tela e no estado da lista
    const isSmallScreen = window.innerWidth < 400;
    participantsBtn.textContent = participants.classList.contains('collapsed')
        ? (isSmallScreen ? 'Lista +' : 'Lista de Amigos +')
        : (isSmallScreen ? 'Lista -' : 'Lista de Amigos -');
}

// <-- Adiciona um evento que escuta quando a tela é redimensionada. -->
window.addEventListener("resize", () => {
    // Pega o botão da lista de participantes novamente.
    const participantsBtn = document.querySelector('.participants-btn');
    
    // Se o botão não existir, a função não faz nada e sai.
    if (!participantsBtn) return;

    // Verifica novamente se a largura da tela é menor que 400 pixels.
    const isSmallScreen = window.innerWidth < 400;
    
    // Atualiza o texto do botão de acordo com o tamanho da tela.
    participantsBtn.textContent = isSmallScreen ? 'Lista +' : 'Lista de Amigos +';
});

// <-- Oculta ou exibe o nome do amigo sorteado -->
function hideSelectedFriend() {
    const resultElement = document.getElementById('selected-friend');
    const hideBtn = document.querySelector('.hide-btn');
    
    resultElement.classList.toggle('collapsed');
    
    // Atualiza o texto do botão com base no estado atual
    hideBtn.textContent = resultElement.classList.contains('collapsed') ? 'Exibir +' : 'Ocultar -';
}

// ─────────────────────────────────────────────────
// 3. FUNÇÕES DE GERENCIAMENTO
// ─────────────────────────────────────────────────

// <-- Função responsável por adicionar um novo amigo à lista de participantes -->
function insertFriend() {
    const inputName = document.getElementById('inputField'); // Obtém o campo onde o nome é inserido
    
    // Remove espaços em branco antes e depois do nome inserido
    const normalizedName = inputName.value.trim(); 
    
    // Verifica se a tela é pequena (menor que 400px)
    const isSmallScreen = window.innerWidth < 400;

    if (normalizedName === '') { 
        // Se o nome estiver vazio, exibe uma mensagem de alerta
        showAlertMessage("Por favor, insira um nome!");
    } else if (participants.map(p => p.toLowerCase()).includes(normalizedName.toLowerCase())) {
        // Se o nome já estiver na lista, exibe uma mensagem de alerta, aqui usamos maxLength = 13 
        const ellipsizedName = ellipsizeText(normalizedName, 13);
        
        // Mensagem diferente baseada no tamanho da tela
        const duplicateMessage = isSmallScreen
            ? `<span class="highlight-random">${ellipsizedName}</span> já está na lista!`
            : `<span class="highlight-random">${ellipsizedName}</span> já está na lista do sorteio!`;
            
        showAlertMessage(duplicateMessage);
    } else {
        // Se o nome for válido e não estiver na lista, adiciona à lista de participantes
        participants.push(normalizedName); 

        // Aqui usamos maxLength = 11 
        const ellipsizedName = ellipsizeText(normalizedName, 11);
        
        // Mensagem diferente baseada no tamanho da tela
        const successMessage = isSmallScreen
            ? `<span class="highlight-random">${ellipsizedName}</span> adicionado à lista!`
            : `Você adicionou <span class="highlight-random">${ellipsizedName}</span> à lista do sorteio!`;
            
        showAlertMessage(successMessage);
        
        inputName.value = ''; // Limpa o campo de entrada de nome
        updateFriendsList();
        console.log(`participants: ${participants}`);
    }
}

// <-- Adiciona um evento ao campo de input para detectar quando o usuário pressionar Enter -->
document.getElementById("inputField").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("addButton").click();
    }
});

// <-- Função para deletar um participante da lista -->
function deleteFriend(index) {
    // Remove o participante do array 'participants' na posição indicada pelo índice
    participants.splice(index, 1);
    
    // Atualiza a interface da lista de participantes após a remoção
    updateFriendsList();
    
    // Exibe uma mensagem informando que o participante foi removido
    showAlertMessage(`Participante removido da lista!`);
}

// <-- Função para iniciar a edição inline do nome de um participante -->
function startInlineEdit(nameSpan) {
    // Define o atributo 'contenteditable' como 'true', tornando o elemento editável
    nameSpan.setAttribute('contenteditable', 'true');

    // Define o foco no elemento para que o usuário possa começar a editar imediatamente
    nameSpan.focus();
    
    // Cria um objeto de seleção de texto para destacar automaticamente o conteúdo ao iniciar a edição
    const range = document.createRange();
    range.selectNodeContents(nameSpan);
    const selection = window.getSelection();
    selection.removeAllRanges(); // Remove seleções anteriores, se houver
    selection.addRange(range); // Seleciona todo o conteúdo do elemento
}

// <-- Handler para o evento de clique duplo -->
function handleDoubleClick(event) {
    const nameSpan = event.target.closest('.participant-name');
    if (nameSpan) {
        startInlineEdit(nameSpan);
    }
}

// <-- Handler para validar e atualizar um nome após edição -->
function handleNameUpdate(nameSpan) {
    // Obtém o novo nome e o índice do participante
    const newName = nameSpan.textContent.trim();
    const index = parseInt(nameSpan.getAttribute('data-index'), 10);

    // Verifica se o nome está vazio
    if (newName === '') {
        showAlertMessage("Nome não pode estar vazio!");
        nameSpan.textContent = participants[index]; // Restaura nome original
        return false;
    } 
    
    // Verifica se o nome já existe na lista (ignorando maiúsculas/minúsculas)
    if (
        participants.map(p => p.toLowerCase()).includes(newName.toLowerCase()) && 
        newName.toLowerCase() !== participants[index].toLowerCase()
    ) {
        showAlertMessage(`<span class="highlight-random">${newName}</span> já está na lista do sorteio!`);
        nameSpan.textContent = participants[index]; // Restaura nome original
        return false;
    }
    
    // Atualiza o nome e a lista
    participants[index] = newName;
    showAlertMessage(`Nome atualizado para <span class="highlight-random">${newName}</span>!`);
    updateFriendsList();
    return true;
}

// <-- Handler para o evento de teclado -->
function handleKeyDown(event) {
    const nameSpan = event.target.closest('.participant-name');
    
    if (nameSpan && nameSpan.getAttribute('contenteditable') === 'true') {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleNameUpdate(nameSpan);
            nameSpan.removeAttribute('contenteditable');
        } else if (event.key === 'Escape') {
            const index = parseInt(nameSpan.getAttribute('data-index'), 10);
            nameSpan.textContent = participants[index];
            nameSpan.removeAttribute('contenteditable');
        }
    }
}

// <-- Handler para o evento de perda de foco -->
function handleBlur(event) {
    const nameSpan = event.target.closest('.participant-name');
    
    if (nameSpan && nameSpan.getAttribute('contenteditable') === 'true') {
        handleNameUpdate(nameSpan);
        nameSpan.removeAttribute('contenteditable');
    }
}

// <-- Função que configura a edição inline dos nomes na lista de participantes -->
function setupInlineEdit() {
    const participantsList = document.getElementById('participantsList');
    
    // Adiciona os event listeners, delegando para handlers específicos
    participantsList.addEventListener('dblclick', handleDoubleClick);
    participantsList.addEventListener('keydown', handleKeyDown);
    participantsList.addEventListener('blur', handleBlur, true);
}

// <-- Inicializa a funcionalidade de edição inline -->
setupInlineEdit();

// ─────────────────────────────────────────────────
// 4. FUNÇÕES PRINCIPAIS DO SORTEIO
// ─────────────────────────────────────────────────

// <-- Função que mistura a lista -->
function shuffleArray(array) {
    // Percorre o array do último índice até o primeiro
    for (let i = array.length - 1; i > 0; i--) {
        // Gera um índice aleatório entre 0 e o índice atual (inclusive)
        const j = Math.floor(Math.random() * (i + 1));

        // Troca os elementos nos índices 'i' e 'j'
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// <-- Função que gera pares para o sorteio do Amigo Secreto -->
function generatePairs(participants) {
    // Verifica se há pelo menos 2 participantes. Se não, exibe um alerta.
    if (participants.length < 2) {
        showAlertMessage("Por favor, adicione mais amigos!"); // Exibe um alerta pedindo mais amigos
        return; // Retorna null, pois o sorteio não pode ser feito
    }

    let pickedFriends; // Variável para nova lista de participantes que será embaralhada
    let isValid = false; // Variável para garantir que o sorteio seja válido (ninguém pode se tirar)

    // Tenta gerar um sorteio válido até que todos os participantes tenham amigos diferentes
    while (!isValid) {
        pickedFriends = [...participants]; // Cria uma cópia da lista original de participantes
        shuffleArray(pickedFriends); // Chama a função shuffleArray para embaralhar a lista copiada para gerar novos pares

        // Verifica se ninguém se tirou no sorteio (cada participante não pode ser seu próprio amigo secreto)
        isValid = pickedFriends.every((friend, index) => friend !== participants[index]);
    }

    // Cria um objeto para armazenar o amigo secreto de cada participante
    const friendsPairs = {}; 

    // Mapeia cada participante para o seu amigo secreto
    participants.forEach((participant, index) => {
        // Adiciona no objeto o participante e o seu respectivo amigo secreto
        friendsPairs[participant] = pickedFriends[index];
    });

    // Retorna o objeto com todos os pares de amigo secreto
    return friendsPairs;
}

// <-- Função responsável por exibir o resultado do sorteio na tela -->
function displayDrawResult(drawer, friend) {
    // A função displayTextOnScreen é chamada para exibir o texto no elemento com o id 'drawResult'
    // O texto a ser exibido inclui o nome do participante sorteado ('drawer') e o nome do amigo secreto ('friend')
    // Além disso, a função cria um botão para ocultar o amigo secreto
    displayTextOnScreen(
        '#drawResult',  // Seleciona o elemento da tela onde o resultado será exibido (usando o id 'drawResult')
        
        // O texto exibido inclui:
        `O amigo secreto de <span class="highlight-current">${drawer}</span> é: 
        <span id="selected-friend" class="highlight-random">${friend}</span>
        <button id="hideBtn" class="hide-btn" onclick="hideSelectedFriend()">Ocultar -</button>`

        // O nome do participante sorteado (drawer) e o amigo secreto (friend) são inseridos no HTML dinamicamente
        // A classe 'highlight-current' é usada para destacar o nome do participante sorteado
        // A classe 'highlight-random' é usada para destacar o nome do amigo secreto
        // O botão 'Ocultar -' tem um evento de clique que chama a função hideSelectedFriend para ocultar o nome do amigo secreto
    );
}

// ─────────────────────────────────────────────────
// 5. FUNÇÕES QUE CONTROLAM O FLUXO DO SORTEIO
// ─────────────────────────────────────────────────

/**
 * <-- Atualiza o texto e o estado de um botão com base no estado atual do sorteio. -->
 * <-- @param {HTMLElement} buttonElement - O elemento do botão que será atualizado.-->
 * <-- @param {string} newState - O estado atual do sorteio que determinará o texto exibido no botão.  --> */

function updateDrawButtonState(buttonElement, newState) {
    const buttonStateText = {
        'continue': 'Continuar',
        'prepare': 'Preparar',
        'draw': 'Sortear',
        'restart': 'Reiniciar'
    };

    buttonElement.textContent = buttonStateText[newState] || newState;
    buttonElement.setAttribute('data-state', newState); 
}

/* <-- Controla o fluxo do sorteio com base no estado do botão --> */
function drawRandomParticipant() {
    const button = document.getElementById('drawButton');
    const currentState = button.getAttribute('data-state'); 

    if (currentState === 'continue') {
        startDraw(button);
    } else if (currentState === 'prepare') {
        prepareNextDrawer(button);
    } else if (currentState === 'draw') {
        revealSecretFriend(button);
    } else if (currentState === 'restart') {
        resetDraw(button);
    }
}

/* <-- Inicia o sorteio, gera os pares e prepara a interface. --> */
function startDraw(button) {
    if (participants.length < 2) {
        showAlertMessage("Por favor, adicione mais amigos!");
        return;
    }

    toggleParticipants();
    secretPairs = generatePairs(participants);
    
    entries = Object.entries(secretPairs);
    currentPairIndex = 0;

    toggleAddButton(false);
    displayTextOnScreen('#drawResult', 'Está tudo certo! Agora clique em Preparar!');
    updateDrawButtonState(button, 'prepare');
}

/* <-- Prepara o próximo sorteador para revelar o amigo secreto --> */
function prepareNextDrawer(button) {
    if (currentPairIndex < entries.length) {
        const [drawer] = entries[currentPairIndex];
        displayTextOnScreen('#drawResult', `Sorteador da vez é: <span class="highlight-current">${drawer}</span>`);
        toggleHideButton(false);
        updateDrawButtonState(button, 'draw');
    } else {
        displayTextOnScreen('#drawResult', 'Todos os sorteios foram realizados!');
        updateDrawButtonState(button, 'restart');
    }
}

/* <-- Revela o amigo secreto do sorteador atual. --> */
function revealSecretFriend(button) {
    if (currentPairIndex < entries.length) {
        const [drawer, friend] = entries[currentPairIndex];
        displayDrawResult(drawer, friend);
        toggleHideButton(true);

        currentPairIndex++;

        if (currentPairIndex >= entries.length) {
            updateDrawButtonState(button, 'restart');
        } else {
            updateDrawButtonState(button, 'prepare');
        }
    }
}

/* <-- Reinicia o sorteio e permite adicionar novos participantes --> */
function resetDraw(button) {
    participants = [];
    secretPairs = {};
    currentPairIndex = 0;

    updateFriendsList();
    displayTextOnScreen('#drawResult', 'Sorteio reiniciado! Adicione novos participantes.');

    toggleParticipants();
    toggleAddButton(true);
    updateDrawButtonState(button, 'continue');
}

/* <-- Habilita ou desabilita o botão de adicionar participantes. --> */
function toggleAddButton(enable) {
    document.getElementById('addButton').disabled = !enable;
}

/* <-- Mostra ou esconde o botão de ocultar o sorteio. --> */
function toggleHideButton(show) {
    const hideBtn = document.getElementById("hideBtn");
    if (hideBtn) {
        hideBtn.style.display = show ? "inline" : "none";
    }
}