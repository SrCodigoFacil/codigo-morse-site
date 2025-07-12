const morseMap = {
  'A': '·−', 'B': '−···', 'C': '−·−·', 'D': '−··', 'E': '·',
  'F': '··−·', 'G': '−−·', 'H': '····', 'I': '··', 'J': '·−−−',
  'K': '−·−', 'L': '·−··', 'M': '−−', 'N': '−·', 'O': '−−−',
  'P': '·−−·', 'Q': '−−·−', 'R': '·−·', 'S': '···', 'T': '−',
  'U': '··−', 'V': '···−', 'W': '·−−', 'X': '−··−', 'Y': '−·−−',
  'Z': '−−··'
};

const dotSound = document.getElementById('dotSound');
const dashSound = document.getElementById('dashSound');
const playSoundBtn = document.getElementById('playSoundBtn');
const checkBtn = document.getElementById('checkBtn');
const answerInput = document.getElementById('answer');
const morseDisplay = document.getElementById('morse');
const resultDisplay = document.getElementById('result');
const modeSelect = document.getElementById('modeSelect');
const timerDisplay = document.getElementById('timer');
const promptText = document.getElementById('promptText');

const modalAlfabeto = document.getElementById('modalAlfabeto');
const openAlfabetoBtn = document.getElementById('openAlfabetoBtn');
const modalCloseBtn = document.getElementById('modalClose');
const alfabetoTableBody = document.getElementById('alfabetoTableBody');

let currentLetter = '';
let timerId = null;
let timeLeft = 10;
let score = 0;
let mode = 'normal';

// Multiplayer variables
let multiplayerActive = false;
let currentPlayer = 1;
let scores = {1: 0, 2: 0};
let multiplayerRounds = 0;
const maxRounds = 10; // Number of rounds for multiplayer

// Preenche a tabela do modal com o alfabeto e código Morse
function preencherAlfabeto() {
  alfabetoTableBody.innerHTML = '';
  for(const letra in morseMap) {
    const tr = document.createElement('tr');
    const tdLetra = document.createElement('td');
    const tdCodigo = document.createElement('td');
    tdLetra.textContent = letra;
    tdCodigo.textContent = morseMap[letra];
    tr.appendChild(tdLetra);
    tr.appendChild(tdCodigo);
    alfabetoTableBody.appendChild(tr);
  }
}

// Função para dormir (esperar)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Toca um sinal (ponto ou traço)
async function playSignal(signal) {
  if(signal === '·') {
    dotSound.currentTime = 0;
    await dotSound.play();
    await sleep(300);
  } else if(signal === '−') {
    dashSound.currentTime = 0;
    await dashSound.play();
    await sleep(900);
  }
  await sleep(200);
}

// Toca o código Morse inteiro
async function playMorse(morseCode) {
  for(const sig of morseCode) {
    await playSignal(sig);
  }
}

// Sorteia uma letra aleatória
function randomLetter() {
  const letters = Object.keys(morseMap);
  return letters[Math.floor(Math.random() * letters.length)];
}

// Carrega uma nova questão para multiplayer
function loadQuestionMultiplayer() {
  multiplayerActive = true;
  currentLetter = randomLetter();
  morseDisplay.textContent = morseMap[currentLetter];
  promptText.textContent = `Jogador ${currentPlayer}, traduza para letra:`;
  answerInput.value = '';
  answerInput.disabled = false;
  checkBtn.disabled = false;
  playSoundBtn.disabled = false;
  resultDisplay.textContent = `Pontuação: Jogador 1 = ${scores[1]} | Jogador 2 = ${scores[2]}`;
  answerInput.focus();
}

// Carrega a pergunta conforme modo
function loadQuestion() {
  if(mode === 'multiplayer') {
    loadQuestionMultiplayer();
    return;
  }

  if(mode === 'escuta') {
    currentLetter = randomLetter();
    morseDisplay.textContent = '??';
    promptText.textContent = 'Digite a letra do som tocado:';
    answerInput.value = '';
    resultDisplay.textContent = '';
    playSoundBtn.disabled = false;
    answerInput.disabled = false;
    checkBtn.disabled = false;
    answerInput.focus();
    stopTimer();
    timerDisplay.style.display = 'none';
  } else if(mode === 'cronometro') {
    currentLetter = randomLetter();
    morseDisplay.textContent = morseMap[currentLetter];
    promptText.textContent = 'Traduza para letra:';
    answerInput.value = '';
    resultDisplay.textContent = '';
    playSoundBtn.disabled = false;
    answerInput.disabled = false;
    checkBtn.disabled = false;
    answerInput.focus();
    startTimer();
  } else { // normal
    currentLetter = randomLetter();
    morseDisplay.textContent = morseMap[currentLetter];
    promptText.textContent = 'Traduza para letra:';
    answerInput.value = '';
    resultDisplay.textContent = '';
    playSoundBtn.disabled = false;
    answerInput.disabled = false;
    checkBtn.disabled = false;
    answerInput.focus();
    stopTimer();
    timerDisplay.style.display = 'none';
  }
}

// Timer do modo cronometrado
function startTimer() {
  timeLeft = 10;
  timerDisplay.textContent = `Tempo: ${timeLeft}`;
  timerDisplay.style.display = 'block';

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Tempo: ${timeLeft}`;
    if(timeLeft <= 0) {
      clearInterval(timerId);
      resultDisplay.textContent = '⏰ Tempo esgotado! Você perdeu.';
      score = 0;
      loadQuestion();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerDisplay.style.display = 'none';
}

// Evento clique botão verificar
checkBtn.addEventListener('click', () => {
  const answer = answerInput.value.toUpperCase();
  if(!answer) return;

  if(mode === 'multiplayer') {
    if(!multiplayerActive) return;

    if(answer === currentLetter) {
      scores[currentPlayer]++;
      resultDisplay.innerHTML = `✅ Jogador ${currentPlayer} acertou! Pontuação: Jogador 1 = ${scores[1]} | Jogador 2 = ${scores[2]}`;
    } else {
      scores[currentPlayer] = Math.max(0, scores[currentPlayer] - 1);
      resultDisplay.innerHTML = `❌ Jogador ${currentPlayer} errou! Pontuação: Jogador 1 = ${scores[1]} | Jogador 2 = ${scores[2]}`;
    }

    multiplayerRounds++;

    if(multiplayerRounds >= maxRounds) {
      // Final do jogo
      multiplayerActive = false;
      answerInput.disabled = true;
      checkBtn.disabled = true;
      playSoundBtn.disabled = true;

      let vencedor = '';
      if(scores[1] > scores[2]) vencedor = 'Jogador 1 venceu!';
      else if(scores[2] > scores[1]) vencedor = 'Jogador 2 venceu!';
      else vencedor = 'Empate!';

      resultDisplay.innerHTML += `<br><strong>Fim do jogo! ${vencedor}</strong><br><button id="restartMultiplayerBtn">Reiniciar Multiplayer</button>`;

      document.getElementById('restartMultiplayerBtn').addEventListener('click', () => {
        scores = {1:0, 2:0};
        multiplayerRounds = 0;
        currentPlayer = 1;
        loadQuestionMultiplayer();
      });

      return;
    }

    // Alterna jogador
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    // Próxima pergunta após pequeno delay
    setTimeout(loadQuestionMultiplayer, 1500);

    return;
  }

  // Modos normais (normal, cronometro, escuta)

  if(answer === currentLetter) {
    score++;
    resultDisplay.innerHTML = `✅ Correto! A letra para <strong>${morseMap[currentLetter]}</strong> é <strong>${currentLetter}</strong>.<br> Pontuação: ${score}`;
    playSoundBtn.disabled = true;

    if(mode === 'cronometro') {
      stopTimer();
      loadQuestion();
    } else {
      setTimeout(loadQuestion, 1500);
    }
  } else {
    resultDisplay.textContent = '❌ Errado! Tente novamente.';
    if(mode === 'cronometro') {
      score = 0;
      stopTimer();
      loadQuestion();
    }
  }
});

// Evento clique botão ouvir som
playSoundBtn.addEventListener('click', () => {
  playMorse(morseMap[currentLetter]);
});

// Evento mudança modo
modeSelect.addEventListener('change', () => {
  mode = modeSelect.value;
  score = 0;
  multiplayerActive = false;
  currentPlayer = 1;
  scores = {1:0, 2:0};
  multiplayerRounds = 0;
  answerInput.disabled = false;
  checkBtn.disabled = false;
  loadQuestion();
});

// Modal abrir
openAlfabetoBtn.addEventListener('click', () => {
  preencherAlfabeto();
  modalAlfabeto.style.display = 'block';
});

// Modal fechar
modalCloseBtn.addEventListener('click', () => {
  modalAlfabeto.style.display = 'none';
});

// Fecha modal clicando fora da área do conteúdo
window.addEventListener('click', (e) => {
  if(e.target === modalAlfabeto) {
    modalAlfabeto.style.display = 'none';
  }
});

// Inicia o jogo
window.onload = () => {
  loadQuestion();
};
