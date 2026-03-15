// =====================================================================
// WORD FAMILIES GAME
// Shows a rime (-at, -an, etc.) and tiles with words — some belong to
// the family, some are distractors. Tap all members to complete the family.
// Depends on: data.js, core.js
// =====================================================================

const familyState = {
  familyList: [],
  currentIndex: 0,
  current: null,    // current WORD_FAMILIES entry
  remaining: [],    // words still to tap
  score: 0,
  pendingStoryMoment: false,
};

function startWordFamilies() {
  familyState.familyList = shuffle([...WORD_FAMILIES]);
  familyState.currentIndex = 0;
  familyState.score = 0;
  familyState.pendingStoryMoment = false;
  state.activeGame = 'families';

  document.getElementById('family-mascot').textContent = state.companion.emoji || loadSave().companion || '🐰';
  showScreen('family-screen');
  loadFamily();
}

function loadFamily() {
  if (familyState.currentIndex >= familyState.familyList.length) {
    showAllDone('families');
    return;
  }
  if (familyState.pendingStoryMoment) {
    familyState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  familyState.current = familyState.familyList[familyState.currentIndex];
  familyState.remaining = [...familyState.current.members];

  const pct = (familyState.currentIndex / familyState.familyList.length) * 100;
  document.getElementById('family-progress-fill').style.width = pct + '%';
  document.getElementById('family-score-badge').textContent = `🎵 ${familyState.score}`;

  // Display the rime prompt
  const rimeEl = document.getElementById('family-rime-display');
  rimeEl.innerHTML = `<span class="family-rime-text">${familyState.current.rime}</span>`;
  rimeEl.style.animation = 'none';
  void rimeEl.offsetWidth;
  rimeEl.style.animation = '';

  // Speak the rime
  speakPhrase(`Words that end in ${familyState.current.rime}`);

  renderFamilyTiles();
}

function renderFamilyTiles() {
  const members = familyState.current.members;

  // Build distractors: words from WORDS that do NOT share the rime
  const rime = familyState.current.rime.slice(1); // e.g. 'at' from '-at'
  const distractors = shuffle(
    WORDS.filter(w => !w.word.endsWith(rime) && w.word.length <= 4)
  ).slice(0, 4).map(w => w.word);

  const allTiles = shuffle([...members, ...distractors]);

  const grid = document.getElementById('family-tiles-grid');
  grid.innerHTML = '';

  allTiles.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'family-tile-btn';
    btn.textContent = word;
    btn.dataset.word = word;
    btn.onclick = () => handleFamilyTap(btn, word);
    grid.appendChild(btn);
  });
}

function handleFamilyTap(btn, word) {
  if (btn.classList.contains('used') || btn.classList.contains('wrong-family')) return;

  const isMember = familyState.remaining.includes(word);

  if (isMember) {
    // Correct — mark found
    btn.classList.add('used');
    btn.classList.add('correct-family');
    speakWord(word);
    triggerMascotEl('family-mascot', 'happy');

    familyState.remaining = familyState.remaining.filter(w => w !== word);

    if (familyState.remaining.length === 0) {
      // All family members found
      familyComplete();
    }
  } else {
    // Wrong — shake
    btn.classList.add('wrong-family');
    triggerMascotEl('family-mascot', 'wrong');
    setTimeout(() => btn.classList.remove('wrong-family'), 420);
  }
}

function familyComplete() {
  familyState.score++;
  const save = loadSave();
  writeSave({ totalFamilies: (save.totalFamilies || 0) + 1 });

  triggerMascotEl('family-mascot', 'happy');
  checkMilestones();
  launchConfetti();

  const rime = familyState.current.rime;
  speakPhrase(`${rime} family, amazing Emma!`);

  document.getElementById('family-score-badge').textContent = `🎵 ${familyState.score}`;

  // Show a "Next" button in the grid area
  setTimeout(() => {
    const grid = document.getElementById('family-tiles-grid');
    const nextBtn = document.createElement('button');
    nextBtn.className = 'family-next-btn';
    nextBtn.textContent = familyState.pendingStoryMoment ? 'Story Time! 📖' : 'Next Family ➜';
    nextBtn.onclick = familyNextClicked;
    grid.appendChild(nextBtn);
  }, 600);
}

function familyNextClicked() {
  familyState.currentIndex++;
  loadFamily();
}

// Alias used by core.js resumeAfterStory
function loadFamilyRound() { loadFamily(); }
