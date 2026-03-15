// =====================================================================
// SENTENCE BUILDER GAME
// Depends on: data.js, core.js
// =====================================================================

const sentenceState = {
  sentenceList: [],
  currentIndex: 0,
  current: null,
  score: 0,
  answered: false,
  pendingStoryMoment: false,
};

function startSentenceBuilder() {
  sentenceState.sentenceList = shuffle([...SENTENCES]);
  sentenceState.currentIndex = 0;
  sentenceState.score = 0;
  sentenceState.answered = false;
  sentenceState.pendingStoryMoment = false;
  state.activeGame = 'sentence';

  document.getElementById('sentence-mascot').textContent = state.companion.emoji || loadSave().companion || '🐰';
  showScreen('sentence-screen');
  loadSentence();
}

function loadSentence() {
  if (sentenceState.currentIndex >= sentenceState.sentenceList.length) {
    showAllDone('sentence');
    return;
  }
  if (sentenceState.pendingStoryMoment) {
    sentenceState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  sentenceState.current = sentenceState.sentenceList[sentenceState.currentIndex];
  sentenceState.answered = false;

  const pct = (sentenceState.currentIndex / sentenceState.sentenceList.length) * 100;
  document.getElementById('sentence-progress-fill').style.width = pct + '%';
  document.getElementById('sentence-score-badge').textContent = `📖 ${sentenceState.score}`;

  document.getElementById('sentence-next-btn').classList.remove('show');
  renderSentenceDisplay(false);
  renderSentenceChoices();
}

function renderSentenceDisplay(solved) {
  const { sentence, blank, emoji } = sentenceState.current;
  const parts = sentence.split('___');
  const container = document.getElementById('sentence-display');
  container.innerHTML = '';

  // Words before the blank
  parts[0].trim().split(' ').forEach(word => {
    if (!word) return;
    const span = document.createElement('span');
    span.className = 'sentence-word';
    span.textContent = word;
    container.appendChild(span);
  });

  // The blank — show emoji if unsolved, filled word if solved
  if (solved) {
    const filled = document.createElement('span');
    filled.className = 'sentence-filled-word';
    filled.textContent = blank;
    container.appendChild(filled);
  } else {
    const blankEl = document.createElement('span');
    blankEl.className = 'sentence-blank-emoji';
    blankEl.textContent = emoji;
    container.appendChild(blankEl);
  }

  // Words after the blank
  if (parts[1]) {
    parts[1].trim().split(' ').forEach(word => {
      if (!word) return;
      const span = document.createElement('span');
      span.className = 'sentence-word';
      span.textContent = word;
      container.appendChild(span);
    });
  }
}

function renderSentenceChoices() {
  const correct = sentenceState.current.blank;
  const correctLen = correct.length;

  // Prefer same-length distractors so choices look plausible
  const sameLen = shuffle(WORDS.filter(w => w.word.length === correctLen && w.word !== correct));
  const diffLen = shuffle(WORDS.filter(w => w.word !== correct && w.word.length !== correctLen));
  const pool = [...sameLen, ...diffLen];
  const distractors = pool.slice(0, 2).map(w => w.word);

  const choices = shuffle([correct, ...distractors]);
  const container = document.getElementById('sentence-choices');
  container.innerHTML = '';

  choices.forEach(word => {
    const btn = document.createElement('button');
    btn.className = 'sentence-choice-btn';
    btn.textContent = word;
    btn.onclick = () => handleSentenceChoice(btn, word, correct);
    container.appendChild(btn);
  });
}

function handleSentenceChoice(btn, chosen, correct) {
  if (sentenceState.answered) return;

  if (chosen === correct) {
    sentenceState.answered = true;
    sentenceState.score++;

    const save = loadSave();
    writeSave({ totalSentences: (save.totalSentences || 0) + 1 });

    // Lock all buttons; highlight correct one
    document.querySelectorAll('.sentence-choice-btn').forEach(b => {
      b.onclick = null;
      if (b.textContent === correct) b.classList.add('correct-flash');
    });

    triggerMascotEl('sentence-mascot', 'happy');
    checkMilestones();

    // Swap emoji blank for the real word
    renderSentenceDisplay(true);

    // Speak the full sentence, then show Next button
    setTimeout(() => {
      const fullSentence = sentenceState.current.sentence.replace('___', correct);
      speakPhrase(fullSentence);
      setTimeout(() => {
        launchConfetti();
        document.getElementById('sentence-score-badge').textContent = `📖 ${sentenceState.score}`;
        const nextBtn = document.getElementById('sentence-next-btn');
        nextBtn.textContent = sentenceState.pendingStoryMoment ? 'Story Time! 📖' : 'Next Sentence ➜';
        nextBtn.classList.add('show');
      }, 800);
    }, 400);

  } else {
    btn.classList.add('wrong-shake');
    triggerMascotEl('sentence-mascot', 'wrong');
    setTimeout(() => btn.classList.remove('wrong-shake'), 420);
  }
}

function sentenceNextClicked() {
  document.getElementById('sentence-next-btn').classList.remove('show');
  sentenceState.currentIndex++;
  loadSentence();
}
