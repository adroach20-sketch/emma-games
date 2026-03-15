// =====================================================================
// SIGHT WORD SPOTTER GAME
// Depends on: data.js, core.js
// =====================================================================

const spotterState = {
  wordList: [],
  currentIndex: 0,
  currentWord: '',
  score: 0,
  timerTimeout: null,
  colorIndex: 0,
  pendingStoryMoment: false,
};

function startSpotter() {
  const save = loadSave();
  // Shuffle words, put unseen ones first
  const unseen = SIGHT_WORDS.filter(w => !save.sightWordsLearned.includes(w));
  const seen   = SIGHT_WORDS.filter(w =>  save.sightWordsLearned.includes(w));
  spotterState.wordList = [...shuffle(unseen), ...shuffle(seen)];
  spotterState.currentIndex = 0;
  spotterState.score = 0;
  spotterState.colorIndex = 0;
  spotterState.pendingStoryMoment = false;
  state.activeGame = 'spotter';

  document.getElementById('spotter-mascot').textContent = state.companion.emoji || loadSave().companion || '🐰';
  showScreen('spotter-screen');
  loadSpotterWord();
}

function loadSpotterWord() {
  if (spotterState.currentIndex >= spotterState.wordList.length) {
    showAllDone('spotter');
    return;
  }

  // Check pending story moment before loading next word
  if (spotterState.pendingStoryMoment) {
    spotterState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  const word = spotterState.wordList[spotterState.currentIndex];
  spotterState.currentWord = word;

  // Update progress
  const pct = (spotterState.currentIndex / spotterState.wordList.length) * 100;
  document.getElementById('spotter-progress-fill').style.width = pct + '%';
  document.getElementById('spotter-score-badge').textContent = `👁️ ${spotterState.score}`;

  // Show flash phase
  showSpotterFlash(word);
}

function showSpotterFlash(word) {
  // Show flash card
  document.getElementById('spotter-flash-phase').style.display = 'block';
  document.getElementById('spotter-choose-phase').style.display = 'none';

  // Cycle flash card color
  const card = document.getElementById('spotter-flash-card');
  FLASH_COLORS.forEach(c => card.classList.remove(c));
  card.classList.add(FLASH_COLORS[spotterState.colorIndex % FLASH_COLORS.length]);
  spotterState.colorIndex++;

  document.getElementById('spotter-flash-word').textContent = word;

  // Speak word immediately
  speakWord(word);

  // Adaptive flash duration: 3000ms for new words, 1500ms for already-known words
  const save = loadSave();
  const flashDuration = save.sightWordsLearned.includes(word) ? 1500 : 3000;

  // Start timer bar — drains over flashDuration ms
  const timerBar = document.getElementById('spotter-timer-bar');
  timerBar.style.transition = 'none';
  timerBar.style.width = '100%';
  void timerBar.offsetWidth; // force reflow
  timerBar.style.transition = 'width ' + flashDuration + 'ms linear';
  timerBar.style.width = '0%';

  // After flashDuration ms, move to choose phase
  if (spotterState.timerTimeout) clearTimeout(spotterState.timerTimeout);
  spotterState.timerTimeout = setTimeout(() => {
    showSpotterChoose();
  }, flashDuration);
}

function showSpotterChoose() {
  document.getElementById('spotter-flash-phase').style.display = 'none';
  document.getElementById('spotter-choose-phase').style.display = 'block';

  const correct = spotterState.currentWord;

  // Pick 2 distractors from sight words (not the correct word)
  const others = SIGHT_WORDS.filter(w => w !== correct);
  const distractors = shuffle(others).slice(0, 2);

  const choices = shuffle([correct, ...distractors]);
  const container = document.getElementById('spotter-choices');
  container.innerHTML = '';

  choices.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'spotter-choice-btn';
    btn.textContent = word;
    btn.onclick = () => handleSpotterChoice(btn, word, correct);
    container.appendChild(btn);
  });
}

function handleSpotterChoice(btn, chosen, correct) {
  if (chosen === correct) {
    // Correct!
    spotterState.score++;
    triggerMascotEl('spotter-mascot', 'happy');

    // Update save data
    const save = loadSave();
    const newLearned = save.sightWordsLearned.includes(correct)
      ? save.sightWordsLearned
      : [...save.sightWordsLearned, correct];
    writeSave({ totalSightWords: save.totalSightWords + 1, sightWordsLearned: newLearned });

    // Check milestones
    checkMilestones();

    speakPhrase(`That says ${correct}! Great, Emma!`);
    launchConfetti();

    setTimeout(() => {
      spotterState.currentIndex++;
      loadSpotterWord();
    }, 1400);

  } else {
    // Wrong — shake and try again
    btn.classList.add('wrong-shake');
    triggerMascotEl('spotter-mascot', 'wrong');
    setTimeout(() => btn.classList.remove('wrong-shake'), 420);
  }
}
