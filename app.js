// ─────────────────────────────────────────────────
// 1. VARIÁVEIS GLOBAIS
// ─────────────────────────────────────────────────

let participants = []; //Lista oficial de participantes do sorteio.
let secretPairs = {};   // Objeto para armazenar os pares de amigo secreto
let currentPairIndex = 0; // Índice para controlar qual par está sendo exibido


// ─────────────────────────────────────────────────
// 2. FUNÇÕES DE MANIPULAÇÃO DA INTERFACE
// ─────────────────────────────────────────────────

// Exibe um texto dentro de um elemento HTML especificado
function displayTextOnScreen(tag, text) {
    let element = document.querySelector(tag); // Seleciona o elemento HTML com base na tag fornecida
    element.innerHTML = text; // Define o conteúdo HTML do elemento selecionado
}

// Exibe uma mensagem de alerta na tela
function showAlertMessage(message) {
    const alertMessage = document.querySelector(".alert-message"); // Seleciona o elemento da mensagem de alerta
    alertMessage.innerHTML = message; // Define o HTML da mensagem 
    alertMessage.style.opacity = "1"; // Torna a mensagem visível
    alertMessage.style.visibility = "visible"; // Garante que a mensagem seja exibida

    setTimeout(() => {
        alertMessage.style.opacity = "0"; // Reduz a opacidade para ocultar a mensagem
        alertMessage.style.visibility = "hidden"; // Remove a visibilidade da mensagem
    }, 3000); // Define um tempo de 3 segundos antes de esconder a mensagem
}


/**
 * Atualiza o texto e o estado de um botão com base no estado atual do sorteio.
 * 
 * @param {HTMLElement} buttonElement - O elemento do botão que será atualizado.
 * @param {string} currentState - O estado atual do sorteio que determinará o texto exibido no botão.
 */
function updateDrawButtonState(buttonElement, currentState) {
    //A função usa um objeto `buttonStateText` para mapear os possíveis estados do sorteio
    const buttonStateText = {
        'continue': 'Continuar', // Exibe "Continuar" quando o estado é 'continue'
        'prepare': 'Preparar',   // Exibe "Preparar" quando o estado é 'prepare'
        'draw': 'Sortear',       // Exibe "Sortear" quando o estado é 'draw'
        'restart': 'Reiniciar'   // Exibe "Reiniciar" quando o estado é 'restart'
    };
    
    // Tenta acessar o valor mapeado para o estado atual (`currentState`) no objeto `buttonStateText`.
    // Se encontrar o valor correspondente, ele será atribuído como o texto do botão.
    // Caso contrário, se o estado não estiver mapeado, o próprio nome do estado será usado como texto.
    // Isso permite que o botão exiba um texto adequado mesmo para estados não mapeados no objeto.
    buttonElement.textContent = buttonStateText[currentState] || currentState; 
}

// Função responsável por atualizar a lista de amigos exibidos na tela
function updateFriendsList() {
    // Pega o elemento HTML com o id 'participantsList', que é onde a lista de amigos será exibida
    let list = document.getElementById('participantsList');
    
    // Limpa o conteúdo atual da lista, garantindo que ela esteja vazia antes de adicionar novos itens
    list.innerHTML = '';
    
    // Percorre a lista de participantes (uma array chamada 'participants') para adicionar cada amigo à lista na tela
    // O 'forEach' passa por cada item da lista e executa a função fornecida para cada item
    // 'friend' é o nome do amigo atual na iteração
    // 'index' é a posição do amigo na lista (começando de 0)
    participants.forEach((friend, index) => {
        
        // Cria um novo item de lista (<li>) para cada amigo
        let listItem = document.createElement('li');
        
        // Cria um container <div> que será usado para organizar o conteúdo dentro do item da lista
        let container = document.createElement('div');
        container.className = 'participant-inner';  // Adiciona uma classe CSS para estilizar o container

        // Cria um elemento <span> para mostrar o número do participante na lista (1, 2, 3, etc.)
        let numberSpan = document.createElement('span');
        numberSpan.textContent = `${index + 1}.`;  // Define o número do participante, começando de 1
        numberSpan.className = 'participant-number';  // Adiciona uma classe CSS para estilizar o número

        // Cria um outro <span> para mostrar o nome do amigo
        let nameSpan = document.createElement('span');
        nameSpan.textContent = friend;  // Atribui o nome do amigo à variável 'friend' da lista
        nameSpan.className = 'participant-name';  // Adiciona uma classe CSS para estilizar o nome

        // Adiciona os dois <span> (número e nome) ao container
        container.appendChild(numberSpan);
        container.appendChild(nameSpan);
        
        // Adiciona o container completo ao item de lista (<li>)
        listItem.appendChild(container);
        
        // Insere o novo item de lista no topo da lista existente na tela (usando 'prepend' para colocar no início)
        list.prepend(listItem);
    });
}

// Função responsável por alternar a visibilidade da lista de participantes e atualizar o texto do botão
function toggleParticipants() {
    // Pega o elemento HTML com o id 'participants' que representa a lista de participantes
    const participants = document.getElementById('participants'); 

    // Pega o botão que será utilizado para esconder/exibir a lista de participantes
    const participantsBtn = document.querySelector('.participants-btn'); 

    // Alterna a classe 'collapsed' no elemento da lista. 
    // Se a lista estiver visível, ela será escondida. Se estiver escondida, será exibida.
    participants.classList.toggle('collapsed'); 

    // Verifica se a largura da tela é menor que 400 pixels.
    // Isso ajuda a definir um comportamento diferente do botão quando a tela for pequena (como em celulares).
    const isSmallScreen = window.innerWidth < 400;

    // Atualiza o texto do botão com base no tamanho da tela e no estado da lista.
    // Se a tela for pequena (menos de 400px), o texto será 'Lista +' ou 'Lista -' dependendo se a lista está visível ou não.
    // Se a tela for maior que 400px, o texto será 'Lista de Amigos +' ou 'Lista de Amigos -'.
    participantsBtn.textContent = isSmallScreen
        ? (participants.classList.contains('collapsed') ? 'Lista +' : 'Lista -')  // Para telas pequenas
        : (participants.classList.contains('collapsed') ? 'Lista de Amigos +' : 'Lista de Amigos -');  // Para telas maiores
}

// Adiciona um evento que escuta quando a tela é redimensionada.
window.addEventListener("resize", () => {
    // Pega o botão da lista de participantes novamente.
    const participantsBtn = document.querySelector('.participants-btn');
    
    // Se o botão não existir, a função não faz nada e sai.
    if (!participantsBtn) return;

    // Verifica novamente se a largura da tela é menor que 400 pixels.
    const isSmallScreen = window.innerWidth < 400;
    
    // Atualiza o texto do botão de acordo com o tamanho da tela.
    // Se a tela for pequena, o texto será 'Lista +', senão será 'Lista de Amigos +'.
    participantsBtn.textContent = isSmallScreen ? 'Lista +' : 'Lista de Amigos +';
});


// Oculta ou exibe o nome do amigo sorteado
function hideSelectedFriend() {
    const resultElement = document.getElementById('selected-friend'); // Obtém o elemento que mostra o nome do amigo sorteado
    const hideBtn = document.querySelector('.hide-btn'); // Obtém o botão de esconder

    resultElement.classList.toggle('collapsed'); // Alterna a classe 'collapsed' para esconder/exibir o nome sorteado

    // Define o novo estado baseado na presença da classe 'collapsed'
    const newState = resultElement.classList.contains('collapsed') ? 'Exibir +' : 'Ocultar -';

    // Atualiza o texto do botão dinamicamente
    updateDrawButtonState(hideBtn, newState);
}


// ─────────────────────────────────────────────────
// 3. FUNÇÕES DE GERENCIAMENTO
// ─────────────────────────────────────────────────

// Função responsável por adicionar um novo amigo à lista de participantes
function insertFriend() {
    let inputName = document.getElementById('inputField'); // Obtém o campo onde o nome é inserido
    
    // Remove espaços em branco antes e depois do nome inserido
    const normalizedName = inputName.value.trim(); 
    
    if (normalizedName === '') { 
        // Se o nome estiver vazio, exibe uma mensagem de alerta
        showAlertMessage("Por favor, insira um nome!");
    } else if (participants.map(p => p.toLowerCase()).includes(normalizedName.toLowerCase())) {
        // Se o nome já estiver na lista, exibe uma mensagem de alerta
        showAlertMessage(`<span class="highlight-random">${normalizedName}</span> já está na lista do sorteio!`);
    } else {
        // Se o nome for válido e não estiver na lista, adiciona à lista de participantes
        participants.push(normalizedName); 
        
        // Limita o número de caracteres que serão exibidos na mensagem
        const maxLength = 12;
        let message = normalizedName; // A mensagem começa com o nome inserido
        
        if (message.length > maxLength) {
            // Se o nome for muito longo, adiciona "..." no final
            message = message.slice(0, maxLength) + '...';
        }
        
        // Exibe uma mensagem informando que o nome foi adicionado
        showAlertMessage(`Você adicionou <span class="highlight-random">${message}</span> à lista do sorteio!`);
        
        inputName.value = ''; // Limpa o campo de entrada de nome
        updateFriendsList(); // Atualiza a lista de amigos na interface
        console.log(`participants: ${participants}`); // Exibe no console a lista atualizada de participantes
    }
}


// Adiciona um evento ao campo de input para detectar quando o usuário pressionar Enter
document.getElementById("inputField").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        document.getElementById("addButton").click();
    }
});


// ─────────────────────────────────────────────────
// 4. FUNÇÕES PRINCIPAIS DO SORTEIO
// ─────────────────────────────────────────────────

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

// Função que gera pares para o sorteio do Amigo Secreto
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
    let friendsPairs = {}; 

    // Mapeia cada participante para o seu amigo secreto
    participants.forEach((participant, index) => {
        // Adiciona no objeto o participante e o seu respectivo amigo secreto
        friendsPairs[participant] = pickedFriends[index];
    });

    // Retorna o objeto com todos os pares de amigo secreto
    return friendsPairs;
}

// Função responsável por exibir o resultado do sorteio na tela
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
// 5. FUNÇÃO QUE CONTROLA O FLUXO DO SORTEIO
// ─────────────────────────────────────────────────

// Gerencia os estados do botão (continuar, preparar, sortear, reiniciar) e realiza as ações do sorteio
function drawRandomParticipant() {
    const button = document.getElementById('drawButton'); // Obtém o botão que dispara o sorteio
    const buttonText = button.textContent; // Obtém o texto atual do botão, que indica o estado atual

    // Estado "Continuar": Prepara a interface para o início do sorteio
    if (buttonText === "Continuar") {
        // Verifica se há pelo menos 2 participantes para que o sorteio possa acontecer
        if (participants.length < 2) {
            showAlertMessage("Por favor, adicione mais amigos!"); // Se não houver participantes suficientes, exibe um alerta
            return; // Retorna e não realiza mais nada se não houver amigos suficientes
        }

        const participantsList = document.getElementById('participants'); // Obtém a lista de participantes
        if (!participantsList.classList.contains('collapsed')) {
            toggleParticipants(); // Se a lista de participantes estiver visível, esconde-a
        }

        // Gera os pares de amigo secreto com a função 'generatePairs'
        secretPairs = generatePairs(participants);
        
        // Se não foi possível gerar os pares (null), interrompe o processo
        if (secretPairs === null) {
            return; // Se não houver pares válidos, a função retorna
        }

        // Converte os pares gerados para uma lista de entradas (arrays) de sorteadores e amigos
        entries = Object.entries(secretPairs); // Transforma o objeto de pares em uma lista de pares
        console.log(secretPairs); // Exibe os pares no console para depuração

        // Reseta o índice de qual par estamos exibindo
        currentPairIndex = 0;

        // Desabilita o botão de adicionar mais participantes, pois o sorteio está em andamento
        const addButton = document.getElementById('addButton');
        addButton.disabled = true; // Desabilita o botão de adicionar participantes

        // Exibe uma mensagem inicial que indica que o sorteio está pronto para ser preparado
        displayTextOnScreen('#drawResult', 'Está tudo certo! Agora clique em Preparar!');
        
        // Atualiza o botão para o estado "Preparar"
        updateDrawButtonState(button, 'prepare');
        return; // Sai da função após preparar o sorteio
    }

    // Estado "Preparar": Exibe quem será o próximo sorteador
    if (buttonText === "Preparar") {
        if (currentPairIndex < entries.length) {
            // Obtém o nome do sorteador atual a partir da lista de entradas
            const [drawer] = entries[currentPairIndex]; // Pegamos o nome do sorteador
            
            // Exibe quem é o sorteador da vez
            displayTextOnScreen('#drawResult', `Sorteador da vez é: <span class="highlight-current">${drawer}</span>`);
            
            // Atualiza o botão para o estado "Sortear"
            updateDrawButtonState(button, 'draw');
            
            // Esconde o botão de "Ocultar" por enquanto
            const hideBtn = document.getElementById("hideBtn");
            if (hideBtn) hideBtn.style.display = "none"; // Garante que o botão de ocultar não apareça ainda
        } else {
            // Se todos os pares já foram exibidos, exibe uma mensagem final
            displayTextOnScreen('#drawResult', 'Todos os sorteios foram realizados!');
            
            // Atualiza o botão para "Continuar", caso o sorteio tenha acabado
            updateDrawButtonState(button, 'continue');
        }
        return;
    }

    // Estado "Sortear": Exibe o amigo secreto do sorteador
    if (buttonText === "Sortear") {
        if (currentPairIndex < entries.length) {
            // Obtém o sorteador e seu respectivo amigo secreto da lista de entradas
            const [drawer, friend] = entries[currentPairIndex]; // Pegamos o par atual: sorteador e amigo secreto
            
            // Exibe o resultado do sorteio
            displayDrawResult(drawer, friend);
            
            // Exibe o botão para ocultar o amigo secreto
            document.getElementById("hideBtn").style.display = "inline";
            
            // Avança para o próximo par (sorteador e amigo secreto)
            currentPairIndex++;
            
            // Se todos os pares foram sorteados, prepara o botão para reiniciar o sorteio
            if (currentPairIndex >= entries.length) {
                updateDrawButtonState(button, 'restart');
            } else {
                // Caso ainda haja mais pares, volta para o estado "Preparar"
                updateDrawButtonState(button, 'prepare');
            }
        }
        return;
    }

    // Estado "Reiniciar": Reseta tudo e começa de novo
    if (buttonText === "Reiniciar") {
        // Zera a lista de participantes e os pares do sorteio
        participants = [];
        secretPairs = {};
        currentPairIndex = 0; // Reseta o índice para 0, indicando que o sorteio começa novamente
    
        // Atualiza a interface com a lista de participantes
        updateFriendsList(); // Atualiza a lista de participantes visível na tela
        displayTextOnScreen('#drawResult', 'Sorteio reiniciado! Adicione novos participantes.');
        
        // Mostra novamente a lista de participantes
        const participantsList = document.getElementById('participants');
        if (participantsList.classList.contains('collapsed')) {
            toggleParticipants(); // Exibe a lista de participantes se estiver oculta
        }

        // Habilita novamente o botão de adicionar
        const addButton = document.getElementById('addButton');
        addButton.disabled = false; // Habilita o botão de adicionar participantes
        
        // Atualiza o botão de sorteio para o estado inicial "Continuar"
        updateDrawButtonState(button, 'continue');
    }
}