// =====================================================================
// WORD DECODER GAME
// Depends on: data.js, core.js
// =====================================================================

const decoderState = {
  wordList: [],
  currentIndex: 0,
  currentWord: null,
  revealedCount: 0,
  score: 0,
  pendingStoryMoment: false,
};

// category: 'all' | 'animal' | 'nature' | 'home' (optional — uses lastCategory from save)
function startDecoder(category) {
  if (!category) {
    const save = loadSave();
    category = save.lastCategory || 'all';
  }
  const pool = category === 'all' ? WORDS : WORDS.filter(w => w.category === category);
  const easy   = shuffle(pool.filter(w => w.word.length === 3));
  const medium = shuffle(pool.filter(w => w.word.length === 4));
  const hard   = shuffle(pool.filter(w => w.word.length >= 5));
  decoderState.wordList = [...easy, ...medium, ...hard];
  if (decoderState.wordList.length === 0) decoderState.wordList = shuffle([...WORDS]);
  decoderState.currentIndex = 0;
  decoderState.score = 0;
  decoderState.pendingStoryMoment = false;
  state.activeGame = 'decoder';

  document.getElementById('decoder-mascot').textContent = state.companion.emoji || loadSave().companion || '🐰';
  showScreen('decoder-screen');
  loadDecoderWord();
}

function loadDecoderWord() {
  if (decoderState.currentIndex >= decoderState.wordList.length) {
    showAllDone('decoder');
    return;
  }
  if (decoderState.pendingStoryMoment) {
    decoderState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  decoderState.currentWord = decoderState.wordList[decoderState.currentIndex];
  decoderState.revealedCount = 0;

  const pct = (decoderState.currentIndex / decoderState.wordList.length) * 100;
  document.getElementById('decoder-progress-fill').style.width = pct + '%';
  document.getElementById('decoder-score-badge').textContent = `🔍 ${decoderState.score}`;

  const clueEl = document.getElementById('decoder-emoji-clue');
  clueEl.textContent = decoderState.currentWord.emoji;
  clueEl.style.animation = 'none';
  void clueEl.offsetWidth;
  clueEl.style.animation = '';

  document.getElementById('decoder-done-btn').style.display = 'none';
  renderDecoderTiles();
}

function renderDecoderTiles() {
  const word = decoderState.currentWord.word;
  const isLong = word.length >= 5;
  const container = document.getElementById('decoder-tiles-row');
  container.innerHTML = '';

  for (let i = 0; i < word.length; i++) {
    const tile = document.createElement('div');
    tile.className = 'decoder-tile' + (isLong ? ' sm' : '') + (i === 0 ? ' active-tile' : '');
    tile.id = `dtile-${i}`;
    tile.onclick = () => handleDecoderTap(i);

    const inner = document.createElement('div');
    inner.className = 'decoder-tile-inner';

    const front = document.createElement('div');
    front.className = 'decoder-tile-front';
    front.textContent = '?';

    const back = document.createElement('div');
    back.className = 'decoder-tile-back';
    back.textContent = word[i];

    inner.appendChild(front);
    inner.appendChild(back);
    tile.appendChild(inner);
    container.appendChild(tile);
  }
}

function handleDecoderTap(index) {
  // Only allow tapping the next unrevealed tile (left-to-right)
  if (index !== decoderState.revealedCount) return;

  const tile = document.getElementById(`dtile-${index}`);
  if (!tile || tile.classList.contains('flipped')) return;

  tile.classList.add('flipped');
  tile.classList.remove('active-tile');
  speakLetter(decoderState.currentWord.word[index]);

  decoderState.revealedCount++;

  if (decoderState.revealedCount < decoderState.currentWord.word.length) {
    // Activate the next tile
    const next = document.getElementById(`dtile-${decoderState.revealedCount}`);
    if (next) next.classList.add('active-tile');
  } else {
    // All letters revealed
    decoderWordComplete();
  }
}

function decoderWordComplete() {
  decoderState.score++;
  const save = loadSave();
  writeSave({ totalDecoded: (save.totalDecoded || 0) + 1 });

  triggerMascotEl('decoder-mascot', 'happy');
  checkMilestones();

  setTimeout(() => {
    speakWord(decoderState.currentWord.word);
    setTimeout(() => {
      launchConfetti();
      speakPhrase(`${decoderState.currentWord.word}! Amazing Emma!`);
      document.getElementById('decoder-score-badge').textContent = `🔍 ${decoderState.score}`;
      const doneBtn = document.getElementById('decoder-done-btn');
      doneBtn.style.display = 'block';
      doneBtn.textContent = decoderState.pendingStoryMoment ? 'Story Time! 📖' : 'Next Word ➜';
    }, 500);
  }, 350);
}

function decoderHintTap() {
  if (decoderState.currentWord) speakWord(decoderState.currentWord.word);
}

function decoderNextClicked() {
  document.getElementById('decoder-done-btn').style.display = 'none';
  decoderState.currentIndex++;
  loadDecoderWord();
}
