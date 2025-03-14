// ─────────────────────────────────────────────────
// 1. VARIÁVEIS GLOBAIS
// ─────────────────────────────────────────────────

let participants = []; // Lista oficial de participantes do sorteio 
let secretPairs = {};   // Objeto para armazenar os pares de amigo secreto 
let currentPairIndex = 0; // Índice para controlar qual par está sendo exibido
let entries = []; // Converte o objeto secretPairs em um array de pares [sorteador, amigo secreto]
  
// ─────────────────────────────────────────────────
// 2. FUNÇÕES UTILITÁRIAS BÁSICAS
// ─────────────────────────────────────────────────

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
    
    // Verifica se a tela é menor que 400px
    const isSmallScreen = window.innerWidth < 400;
    
    // Diminui x caracteres no maxLength se for uma tela pequena
    const adjustedMaxLength = isSmallScreen ? maxLength - 2 : maxLength;
    
    // Retorna o texto original ou com reticências
    return text.length > adjustedMaxLength ? text.slice(0, adjustedMaxLength) + "..." : text;
}

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

// <-- Função para efeito de confetes -->
function launchConfetti(element) {
    // Verifica se o elemento existe
    if (!element) {
        console.error("Elemento não encontrado.");
        return;
    }
    
    // Obtém as dimensões e posição do elemento
    const { left, top, width, height } = element.getBoundingClientRect();
    
    // Calcula as posições normalizadas (valores entre 0 e 1)
    const leftX = left / window.innerWidth;         // Origem à esquerda
    const rightX = (left + width) / window.innerWidth; // Origem à direita
    const y = (top + height / 2) / window.innerHeight; // Meio do elemento na vertical
    
    // Verifica a largura da janela para ajustar os parâmetros
    const isSmallScreen = window.innerWidth < 400;
    
    // Configurações comuns para ambos os lados
    const confettiSettings = {
        particleCount: 125,    // Quantidade de partículas
        spread: isSmallScreen ? 20 : 30,  // Ajusta o spread com base no tamanho da tela
        startVelocity: 60,     // Velocidade inicial
        gravity: 1,            // Força da gravidade
        decay: 0.9,            // Taxa de desaceleração
        ticks: 350,            // Duração da animação
        disableForReducedMotion: true,
        colors: ['#3fa9f5', '#ff5862', '#cc1de8', '#2071f6', '#ebf5ff', '#ea46ff']
    };
    
    // Lança confete do lado esquerdo 
    confetti({
        ...confettiSettings,
        angle: isSmallScreen ? 80 : 75,  // Ajusta o ângulo com base no tamanho da tela
        origin: { x: leftX, y }
    });
    
    // Lança confete do lado direito 
    confetti({
        ...confettiSettings,
        angle: isSmallScreen ? 100 : 105,  // Ajusta o ângulo com base no tamanho da tela
        origin: { x: rightX, y }
    });
}

// ─────────────────────────────────────────────────
// 3. FUNÇÕES DE MANIPULAÇÃO DOM
// ─────────────────────────────────────────────────

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

// <-- Função reutilizável para criar um botão -->
function createButton(innerHtml, className, onClick, ariaLabel) {
    const button = document.createElement('button'); // Cria um botão
    button.innerHTML = innerHtml; // Define o ícone do botão
    button.className = className; // Adiciona a classe CSS
    button.onclick = onClick; // Define a ação ao clicar
    button.setAttribute('aria-label', ariaLabel); // Adiciona acessibilidade
    return button; // Retorna o botão criado
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

// <-- Handler para o evento de clique duplo -->
function handleDoubleClick(event) {
    // Localiza o elemento span com a classe 'participant-name' mais próximo do evento
    const nameSpan = event.target.closest('.participant-name');
    
    // Se encontrou um elemento válido, inicia a edição inline
    if (nameSpan) {
        // Chama a função que prepara o nome para edição (torna editável e seleciona o texto)
        startInlineEdit(nameSpan);
    }
}

// <-- Handler para validar e atualizar um nome após edição -->
function handleNameUpdate(nameSpan) {
    // Obtém o novo nome removendo espaços em branco no início e fim
    const newName = nameSpan.textContent.trim();
    
    // Obtém o índice do participante a partir do atributo data-index
    const index = parseInt(nameSpan.getAttribute('data-index'), 10);

    // Verifica se o nome está vazio
    if (newName === '') {
        // Exibe mensagem de erro caso o nome esteja vazio
        showAlertMessage("Nome não pode estar vazio!");
        // Restaura o nome original
        nameSpan.textContent = participants[index];
        return false;
    } 
    
    // Verifica se o nome já existe na lista (ignorando maiúsculas/minúsculas)
    // Exceção: permite manter o mesmo nome com diferentes maiúsculas/minúsculas
    if (
        participants.map(p => p.toLowerCase()).includes(newName.toLowerCase()) && 
        newName.toLowerCase() !== participants[index].toLowerCase()
    ) {
        // Exibe mensagem de erro caso o nome já exista
        showAlertMessage(`<span class="highlight-random">${newName}</span> já está na lista do sorteio!`);
        // Restaura o nome original
        nameSpan.textContent = participants[index];
        return false;
    }
    
    // Se passou pelas validações, atualiza o nome no array de participantes
    participants[index] = newName;
    
    // Prepara o nome para exibição na mensagem (com reticências se for muito longo)
    const shortenedName = ellipsizeText(newName, 11);
    
    // Exibe mensagem de sucesso
    showAlertMessage(`Nome atualizado para <span class="highlight-random">${shortenedName}</span>!`);
    
    // Atualiza a lista visual de participantes
    updateFriendsList();
    return true;
}

// <-- Handler para o evento de teclado -->
function handleKeyDown(event) {
    // Localiza o elemento span editável mais próximo
    const nameSpan = event.target.closest('.participant-name');
    
    // Verifica se encontrou um span que está sendo editado
    if (nameSpan && nameSpan.getAttribute('contenteditable') === 'true') {
        // Se a tecla pressionada for Enter
        if (event.key === 'Enter') {
            // Impede o comportamento padrão (quebra de linha)
            event.preventDefault();
            
            // Tenta atualizar o nome e finaliza a edição
            handleNameUpdate(nameSpan);
            nameSpan.removeAttribute('contenteditable');
        } 
        // Se a tecla pressionada for Escape
        else if (event.key === 'Escape') {
            // Obtém o índice do participante
            const index = parseInt(nameSpan.getAttribute('data-index'), 10);
            
            // Restaura o texto original sem salvar alterações
            nameSpan.textContent = participants[index];
            
            // Finaliza o modo de edição
            nameSpan.removeAttribute('contenteditable');
        }
    }
}

// <-- Handler para o evento de perda de foco -->
function handleBlur(event) {
    // Localiza o elemento span editável mais próximo
    const nameSpan = event.target.closest('.participant-name');
    
    // Verifica se encontrou um span que está sendo editado
    if (nameSpan && nameSpan.getAttribute('contenteditable') === 'true') {
        // Quando o usuário clica fora do elemento, salva as alterações
        handleNameUpdate(nameSpan);
        
        // Finaliza o modo de edição
        nameSpan.removeAttribute('contenteditable');
    }
}

// ─────────────────────────────────────────────────
// 4. FUNÇÕES DE INTERFACE DO USUÁRIO
// ─────────────────────────────────────────────────

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

// <-- Função para atualizar o texto do botão com base na tela atual -->
function updateParticipantsButtonText() {
    const participants = document.getElementById('participants'); // Obtém a lista de participantes
    const participantsBtn = document.querySelector('.participants-btn'); // Obtém o botão que controla a lista

    if (!participantsBtn || !participants) return; // Sai da função se os elementos não existirem

    const isSmallScreen = window.innerWidth < 400; // Verifica se a tela é menor que 400px
    const isCollapsed = participants.classList.contains('collapsed'); // Verifica se a lista está recolhida

    // Define o texto do botão conforme o tamanho da tela e o estado da lista
    participantsBtn.textContent = isCollapsed
        ? (isSmallScreen ? 'Lista +' : 'Lista de Amigos +') // Texto quando a lista está recolhida
        : (isSmallScreen ? 'Lista -' : 'Lista de Amigos -'); // Texto quando a lista está visível
}

// <-- Função que alterna a visibilidade da lista de participantes -->
function toggleParticipants() {
    const participants = document.getElementById('participants');
    
    // Alterna a classe 'collapsed' para esconder/exibir a lista
    participants.classList.toggle('collapsed');
    
    // Chama a função para atualizar o texto do botão
    updateParticipantsButtonText();
}

// <-- Alterna a visibilidade de elementos -->
function toggleElementsVisibility(action, selectors) {
    // Define se deve remover (mostrar) ou adicionar (ocultar) a classe
    const method = action === 'show' ? 'remove' : 'add';
    
    // Garante que "selectors" seja um array e percorre cada item
    (Array.isArray(selectors) ? selectors : [selectors]).forEach(selector => {
        // Obtém o elemento do DOM se for uma string, ou usa o próprio elemento
        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        
        // Se o elemento existir, adiciona ou remove a classe "collapsed"
        element?.classList[method]('collapsed');
    });
}

// <-- Alterna a ativação de botões definindo ou removendo o atributo "disabled" -->
function toggleButtonsState(action, selectors) {
    // Define se deve remover o atributo "disabled" (ativar) ou adicionar (desativar)
    const disabledState = action !== 'enable'; // Se a ação for 'enable', disabledState será false (ativo); senão, true (desativado).
    
    // Garante que "selectors" seja tratado como um array e percorre cada item
    (Array.isArray(selectors) ? selectors : [selectors]).forEach(selector => {
        
        // Se o seletor for uma string (ID ou classe)
        if (typeof selector === 'string') {
            
            // Verifica se o seletor contém um ponto (.) para identificar se é uma classe
            if (selector.includes('.')) {
                // Se for uma classe, seleciona todos os elementos correspondentes
                const buttons = document.querySelectorAll(selector);
                // Para cada botão encontrado pela classe, altera o atributo "disabled"
                buttons.forEach(button => button.disabled = disabledState);
            } else {
                // Caso contrário, é um seletor de ID, então seleciona um único botão
                const button = document.querySelector(selector);
                // Se o botão existir, altera o atributo "disabled"
                if (button) button.disabled = disabledState;
            }
        } else {
            // Se o seletor já for um elemento DOM (não uma string), aplica diretamente o atributo "disabled"
            selector.disabled = disabledState;
        }
    });
}

// <-- Oculta ou exibe o nome do amigo sorteado -->
function hideSelectedFriend() {
    const resultElement = document.getElementById('selected-friend');
    const hideBtn = document.querySelector('.hide-btn');
    
    resultElement.classList.toggle('collapsed');
    
    // Atualiza o texto do botão com base no estado atual
    hideBtn.textContent = resultElement.classList.contains('collapsed') ? 'Exibir +' : 'Ocultar -';
}

// <-- Mostra ou esconde o botão de ocultar o jogador sorteado. -->
function toggleHideButton(show) {
    const hideBtn = document.getElementById("hideBtn");
    if (hideBtn) {
        hideBtn.style.display = show ? "inline" : "none";
    }
}

// ─────────────────────────────────────────────────
// 5. FUNÇÕES DE GERENCIAMENTO DE PARTICIPANTES
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
        const shortenedName = ellipsizeText(normalizedName, 13);
        
        // Mensagem diferente baseada no tamanho da tela
        const duplicateMessage = isSmallScreen
            ? `<span class="highlight-random">${shortenedName}</span> já está na lista!`
            : `<span class="highlight-random">${shortenedName}</span> já está na lista do sorteio!`;   
            
        showAlertMessage(duplicateMessage);
    } else {
        // Se o nome for válido e não estiver na lista, adiciona à lista de participantes
        participants.push(normalizedName); 

        // Aqui usamos maxLength = 11 
        const shortenedName = ellipsizeText(normalizedName, 11);
        
        // Mensagem diferente baseada no tamanho da tela
        const successMessage = isSmallScreen
            ? `<span class="highlight-random">${shortenedName}</span> adicionado à lista!`
            : `Você adicionou <span class="highlight-random">${shortenedName}</span> à lista do sorteio!`;
            
        showAlertMessage(successMessage);
        
        inputName.value = ''; // Limpa o campo de entrada de nome
        updateFriendsList();
        console.log(`participants: ${participants}`);
    }
}

// <-- Função para deletar um participante da lista -->
function deleteFriend(index) {
    // Remove o participante do array e pega o primeiro item do array retornado
    const removedParticipant = participants.splice(index, 1)[0];

    // Reduz o tamanho do nome se for muito grande usando a função ellipsizeText
    const shortenedName = ellipsizeText(removedParticipant, 11);

    // Atualiza a interface da lista de participantes
    updateFriendsList();
    
    // Exibe uma mensagem informando que o participante foi removido, com nome encurtado
    showAlertMessage(`Você removeu <span class="highlight-removed">${shortenedName}</span> da lista!`);
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

// <-- Função que configura a edição inline dos nomes na lista de participantes -->
function setupInlineEdit() {
    const participantsList = document.getElementById('participantsList');
    
    // Adiciona os event listeners, delegando para handlers específicos
    participantsList.addEventListener('dblclick', handleDoubleClick);
    participantsList.addEventListener('keydown', handleKeyDown);
    participantsList.addEventListener('blur', handleBlur, true);
}

// ─────────────────────────────────────────────────
// 6. FUNÇÕES DO SORTEIO
// ─────────────────────────────────────────────────

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
    displayTextOnScreen(
        '#drawResult',  // Elemento onde o resultado será mostrado
        
        // Mensagem formatada com destaque para os nomes e botão de ocultar
        `O amigo secreto de <span class="highlight-current">${drawer}</span> é: 
        <span id="selected-friend" class="highlight-random">${friend}</span>
        <button id="hideBtn" class="hide-btn" onclick="hideSelectedFriend()">Ocultar -</button>`
    );
}

// ─────────────────────────────────────────────────
// 7. FUNÇÕES DO FLUXO DO SORTEIO
// ─────────────────────────────────────────────────

// <-- Atualiza o texto e o estado de um botão com base no estado atual do sorteio -->
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

// <-- Controla o fluxo do sorteio com base no estado do botão -->
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

// <-- Inicia o sorteio, gera os pares e prepara a interface -->
function startDraw(button) {
    // Verifica mínimo de 2 participantes
    if (participants.length < 2) {
        showAlertMessage("Por favor, adicione mais amigos!");
        return;
    }

    // Gera os pares do amigo secreto
    secretPairs = generatePairs(participants);
    entries = Object.entries(secretPairs);
    currentPairIndex = 0;

    // Desativa botões de gerenciamento de participantes
    toggleButtonsState('disable', ['#addButton', '.edit-btn', '.delete-btn']);
    
    // Oculta elementos não necessários durante o sorteio
    toggleElementsVisibility('hide', ['.participants', '#inputField', 'label[for="inputField"]']);
    
    updateParticipantsButtonText();
    displayTextOnScreen('#drawResult', 'Está tudo certo! Agora clique em Preparar!');
    updateDrawButtonState(button, 'prepare');
}

// <-- Prepara o próximo sorteador para revelar o amigo secreto -->
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

// <-- Revela o amigo secreto do sorteador atual -->
function revealSecretFriend(button) {
    if (currentPairIndex < entries.length) {
        const [drawer, friend] = entries[currentPairIndex];
        displayDrawResult(drawer, friend);
        toggleHideButton(true);
        const addButton = document.getElementById('drawButton');
        launchConfetti(addButton);
        currentPairIndex++;

        if (currentPairIndex >= entries.length) {
            updateDrawButtonState(button, 'restart');
            showAlertMessage("Parabéns! Seu sorteio foi concluído com sucesso!");
        } else {
            updateDrawButtonState(button, 'prepare');
        }
    }
}

// <-- Reinicia o sorteio e limpa os dados -->
function resetDraw(button) {
    participants = [];
    secretPairs = {};
    currentPairIndex = 0;
    updateFriendsList();
    displayTextOnScreen('#drawResult', 'Sorteio concluído! 😎 adicione novos amigos para sortear novamente! 🎉');

    // Ativa botões de gerenciamento de participantes
    toggleButtonsState('enable', ['#addButton', '.edit-btn', '.delete-btn']);

    // Exibe elementos necessários para o sorteio
    toggleElementsVisibility('show', ['.participants', '#inputField', 'label[for="inputField"]']);

    updateParticipantsButtonText();
    updateDrawButtonState(button, 'continue');
}

// ─────────────────────────────────────────────────
// 8. INICIALIZAÇÃO E EVENTOS
// ─────────────────────────────────────────────────

// <-- Inicializa a funcionalidade de edição inline -->
setupInlineEdit();

// <-- Adiciona um evento ao campo de input para detectar quando o usuário pressionar Enter -->
document.getElementById("inputField").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("addButton").click();
    }
});

// <-- Adiciona um evento que escuta quando a tela é redimensionada -->
window.addEventListener("resize", updateParticipantsButtonText);