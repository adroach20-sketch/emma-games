// =====================================================================
// WORD BUILDER GAME
// Depends on: data.js, core.js
// =====================================================================

function startWordBuilder() {
  const easy   = shuffle(WORDS.filter(w => w.word.length === 3));
  const medium = shuffle(WORDS.filter(w => w.word.length === 4));
  const hard   = shuffle(WORDS.filter(w => w.word.length >= 5));
  state.wordList = [...easy, ...medium, ...hard];
  state.currentIndex = 0;
  state.score = 0;
  state.roundComplete = false;
  state.pendingStoryMoment = false;
  state.activeGame = 'builder';

  document.getElementById('mascot').textContent = state.companion.emoji;
  showScreen('game-screen');
  loadWord();
}

function loadWord() {
  if (state.currentIndex >= state.wordList.length) {
    showAllDone('builder');
    return;
  }

  // Check if a story moment is pending — show it before loading next word
  if (state.pendingStoryMoment) {
    state.pendingStoryMoment = false;
    showStoryMoment();
    return; // story moment's close button will call loadWord() again
  }

  state.currentWord  = state.wordList[state.currentIndex];
  state.activeSlot   = 0;
  state.isAnimating  = false;

  const pct = (state.currentIndex / state.wordList.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('score-badge').textContent = `⭐ ${state.score}`;

  const clueEl = document.getElementById('emoji-clue');
  clueEl.textContent = state.currentWord.emoji;
  clueEl.style.animation = 'none';
  void clueEl.offsetWidth;
  clueEl.style.animation = '';

  renderSlots();
  renderTiles();
}

function renderSlots() {
  const container = document.getElementById('word-slots');
  const word = state.currentWord.word;
  const isLong = word.length >= 5;

  container.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot' + (i === 0 ? ' active' : '') + (isLong ? ' sm' : '');
    slot.id = `slot-${i}`;
    container.appendChild(slot);
  }
}

function renderTiles() {
  const word    = state.currentWord.word;
  const letters = word.split('');

  const distCount  = word.length <= 3 ? 2 : 3;
  const available  = DISTRACTOR_POOL.filter(l => !letters.includes(l));
  const distractors = shuffle(available).slice(0, distCount);

  const allLetters = shuffle([...letters, ...distractors]);

  const container = document.getElementById('tiles-area');
  container.innerHTML = '';

  allLetters.forEach(letter => {
    const tile = document.createElement('button');
    tile.className = 'tile';
    tile.textContent = letter;
    tile.dataset.letter = letter;
    tile.onclick = () => handleTileTap(tile, letter);
    container.appendChild(tile);
  });
}

function handleTileTap(tileEl, letter) {
  if (state.isAnimating) return;
  if (tileEl.classList.contains('used')) return;

  const expectedLetter = state.currentWord.word[state.activeSlot];

  if (letter === expectedLetter) {
    speakLetter(letter);
    tileEl.classList.add('used');

    const slotEl = document.getElementById(`slot-${state.activeSlot}`);
    slotEl.textContent = letter;
    slotEl.classList.remove('active');
    slotEl.classList.add('filled');

    state.activeSlot++;

    if (state.activeSlot < state.currentWord.word.length) {
      document.getElementById(`slot-${state.activeSlot}`).classList.add('active');
      triggerMascot('happy');
    } else {
      wordComplete();
    }
  } else {
    tileEl.classList.add('wrong');
    triggerMascot('wrong');
    setTimeout(() => tileEl.classList.remove('wrong'), 380);
  }
}

function hintTap() {
  if (state.currentWord) speakWord(state.currentWord.word);
}

function wordComplete() {
  state.isAnimating = true;
  state.score++;

  // Update persistent total
  const save = loadSave();
  writeSave({ totalWordsSpelled: save.totalWordsSpelled + 1 });

  triggerMascot('happy');

  // Check if a story moment should be queued (checks AFTER this word is counted)
  checkMilestones();

  setTimeout(() => {
    speakWord(state.currentWord.word);
    setTimeout(() => showCelebration(), 700);
  }, 200);
}

function showCelebration() {
  document.getElementById('celebrate-emoji').textContent = state.currentWord.emoji;
  document.getElementById('celebrate-word').textContent  = state.currentWord.word + '!';
  document.getElementById('celebrate-name').textContent  = 'Emma got it! ⭐';
  document.getElementById('score-badge').textContent = `⭐ ${state.score}`;

  // Update next button label based on whether story is pending
  const btn = document.getElementById('celebrate-next-btn');
  btn.textContent = state.pendingStoryMoment ? 'Story Time! 📖' : 'Next Word ➜';

  document.getElementById('celebrate-overlay').classList.add('show');
  triggerMascot('happy');
  launchConfetti();

  setTimeout(() => {
    speakPhrase(`${state.currentWord.word}! Amazing, Emma!`);
  }, 600);
}

// Called when the "Next Word" / "Story Time" button is tapped on the celebrate overlay
function celebrateNextClicked() {
  if (state.isAnimating === false) return; // guard against double-tap
  state.isAnimating = false;
  document.getElementById('celebrate-overlay').classList.remove('show');
  state.currentIndex++;
  // loadWord will check pendingStoryMoment before loading the next word
  loadWord();
}
