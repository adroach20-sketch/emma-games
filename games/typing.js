// =====================================================================
// TYPING PRACTICE GAME
// Shows an emoji clue, displays a letter-by-letter progress display,
// and renders an on-screen keyboard for each letter.
// Depends on: data.js, core.js, games/categories.js
// =====================================================================

const typingState = {
  wordList: [],
  currentIndex: 0,
  currentWord: null,
  typedSoFar: '',
  score: 0,
  pendingStoryMoment: false,
};

// category: 'all' | 'animal' | 'nature' | 'home' (optional — uses lastCategory from save)
function startTyping(category) {
  if (!category) {
    const save = loadSave();
    category = save.lastCategory || 'all';
  }
  const pool = category === 'all' ? WORDS : WORDS.filter(w => w.category === category);
  startTypingWithWords(pool);
}

function startTypingWithWords(wordPool) {
  const easy   = shuffle(wordPool.filter(w => w.word.length === 3));
  const medium = shuffle(wordPool.filter(w => w.word.length === 4));
  const hard   = shuffle(wordPool.filter(w => w.word.length >= 5));
  typingState.wordList = [...easy, ...medium, ...hard];
  if (typingState.wordList.length === 0) typingState.wordList = shuffle([...WORDS]);
  typingState.currentIndex = 0;
  typingState.score = 0;
  typingState.pendingStoryMoment = false;
  state.activeGame = 'typing';

  document.getElementById('typing-mascot').textContent = state.companion.emoji || loadSave().companion || '🐰';
  showScreen('typing-screen');
  loadTypingWord();
}

function loadTypingWord() {
  if (typingState.currentIndex >= typingState.wordList.length) {
    showAllDone('typing');
    return;
  }
  if (typingState.pendingStoryMoment) {
    typingState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  typingState.currentWord = typingState.wordList[typingState.currentIndex];
  typingState.typedSoFar = '';

  const pct = (typingState.currentIndex / typingState.wordList.length) * 100;
  document.getElementById('typing-progress-fill').style.width = pct + '%';
  document.getElementById('typing-score-badge').textContent = `⌨️ ${typingState.score}`;

  const clueEl = document.getElementById('typing-emoji-clue');
  clueEl.textContent = typingState.currentWord.emoji;
  clueEl.style.animation = 'none';
  void clueEl.offsetWidth;
  clueEl.style.animation = '';

  renderTypingDisplay();
  renderKeyboard();
}

function typingHintTap() {
  if (typingState.currentWord) speakWord(typingState.currentWord.word);
}

function renderTypingDisplay() {
  const word = typingState.currentWord.word;
  const typed = typingState.typedSoFar;
  const display = document.getElementById('typing-display');
  display.innerHTML = '';

  for (let i = 0; i < word.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'typing-cell';

    if (i < typed.length) {
      cell.textContent = typed[i];
      cell.classList.add('typing-filled');
    } else if (i === typed.length) {
      cell.classList.add('typing-active');
    }

    // Make long words use smaller cells
    if (word.length >= 5) cell.classList.add('sm');

    display.appendChild(cell);
  }
}

function renderKeyboard() {
  const rows = [
    ['a','b','c','d','e','f','g','h','i'],
    ['j','k','l','m','n','o','p','r','s'],
    ['t','u','v','w','y','⌫'],
  ];

  const wrap = document.getElementById('keyboard-wrap');
  wrap.innerHTML = '';

  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';

    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'keyboard-key';
      btn.textContent = key;
      btn.onclick = () => handleKeyPress(key);
      rowEl.appendChild(btn);
    });

    wrap.appendChild(rowEl);
  });
}

function handleKeyPress(key) {
  if (key === '⌫') {
    // Backspace — remove last typed letter
    if (typingState.typedSoFar.length > 0) {
      typingState.typedSoFar = typingState.typedSoFar.slice(0, -1);
      renderTypingDisplay();
    }
    return;
  }

  const word = typingState.currentWord.word;
  const nextPos = typingState.typedSoFar.length;
  const expectedLetter = word[nextPos];

  if (key === expectedLetter) {
    // Correct letter
    speakLetter(key);
    typingState.typedSoFar += key;
    triggerMascotEl('typing-mascot', 'happy');
    renderTypingDisplay();

    if (typingState.typedSoFar === word) {
      typingWordComplete();
    }
  } else {
    // Wrong letter — flash the key red
    const keys = document.querySelectorAll('.keyboard-key');
    keys.forEach(k => {
      if (k.textContent === key) {
        k.classList.add('keyboard-wrong');
        setTimeout(() => k.classList.remove('keyboard-wrong'), 350);
      }
    });
    triggerMascotEl('typing-mascot', 'wrong');
  }
}

function typingWordComplete() {
  typingState.score++;
  const save = loadSave();
  writeSave({ totalTyped: (save.totalTyped || 0) + 1 });

  triggerMascotEl('typing-mascot', 'happy');
  checkMilestones();
  launchConfetti();

  speakWord(typingState.currentWord.word);
  document.getElementById('typing-score-badge').textContent = `⌨️ ${typingState.score}`;

  // Mark all cells as correct
  document.querySelectorAll('.typing-cell').forEach(c => c.classList.add('typing-correct'));

  setTimeout(() => {
    speakPhrase(`${typingState.currentWord.word}! Amazing Emma!`);
    setTimeout(() => {
      typingState.currentIndex++;
      loadTypingWord();
    }, 1400);
  }, 600);
}
