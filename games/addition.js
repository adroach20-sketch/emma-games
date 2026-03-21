// =====================================================================
// HOW MANY? — visual addition game
// Two groups of emoji objects stay separate while Emma counts, then
// merge together after she taps the correct answer.
// =====================================================================

// Number words for TTS (indices 0–10)
const NUMBER_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];

const additionState = {
  problemList: [],
  currentIndex: 0,
  currentProblem: null,
  currentEmoji: '',
  score: 0,
  firstTryStreak: 0,
  currentHadWrong: false,
  pendingStoryMoment: false,
  // timer we may need to cancel on navigation
  choicesTimeout: null,
};

// ── START ─────────────────────────────────────────────────────────────
function startAddition() {
  // Tier 1 only for v1 (sums to 5)
  const pool = MATH_PROBLEMS.filter(p => p.tier === 1);
  additionState.problemList = shuffle(pool);
  additionState.currentIndex = 0;
  additionState.score = 0;
  additionState.firstTryStreak = 0;
  additionState.currentHadWrong = false;
  additionState.pendingStoryMoment = false;

  state.activeGame = 'addition';
  const companion = state.companion.emoji || loadSave().companion || '🐰';
  document.getElementById('addition-mascot').textContent = companion;
  document.getElementById('addition-score-badge').textContent = '➕ 0';

  showScreen('addition-screen');
  loadAdditionProblem();
}

// ── LOAD PROBLEM ──────────────────────────────────────────────────────
function loadAdditionProblem() {
  // Clear any pending timer from previous round
  if (additionState.choicesTimeout) clearTimeout(additionState.choicesTimeout);

  // Done?
  if (additionState.currentIndex >= additionState.problemList.length) {
    showAllDone('addition');
    return;
  }

  // Story moment pending?
  if (additionState.pendingStoryMoment) {
    additionState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  const problem = additionState.problemList[additionState.currentIndex];
  additionState.currentProblem = problem;
  additionState.currentHadWrong = false;

  // Pick a random emoji for this round
  additionState.currentEmoji = MATH_EMOJIS[Math.floor(Math.random() * MATH_EMOJIS.length)];

  // Update progress bar
  const pct = (additionState.currentIndex / additionState.problemList.length) * 100;
  document.getElementById('addition-progress-fill').style.width = pct + '%';

  // Reset UI
  const groupsEl = document.getElementById('addition-groups');
  groupsEl.classList.remove('merged');

  const equationEl = document.getElementById('addition-equation');
  equationEl.style.display = 'none';
  equationEl.textContent = '';

  document.getElementById('addition-prompt').textContent = 'How many?';

  // Render emoji groups (they stay separate until she answers correctly)
  renderAdditionGroups(problem.a, problem.b, additionState.currentEmoji);

  // Clear choices, then show them after the emoji pop-in finishes
  document.getElementById('addition-choices').innerHTML = '';

  // Wait for all emoji to pop in before showing answer choices
  const totalObjects = problem.a + problem.b;
  const popInTime = totalObjects * 150 + 500;
  additionState.choicesTimeout = setTimeout(() => {
    renderAdditionChoices(problem.a + problem.b);
    speakPhrase('How many?');
  }, popInTime);
}

// ── RENDER GROUPS ─────────────────────────────────────────────────────
function renderAdditionGroups(a, b, emoji) {
  const leftEl = document.getElementById('addition-group-left');
  const rightEl = document.getElementById('addition-group-right');
  leftEl.innerHTML = '';
  rightEl.innerHTML = '';

  for (let i = 0; i < a; i++) {
    const span = document.createElement('span');
    span.className = 'math-object';
    span.textContent = emoji;
    span.style.animationDelay = (i * 0.15) + 's';
    leftEl.appendChild(span);
  }

  for (let i = 0; i < b; i++) {
    const span = document.createElement('span');
    span.className = 'math-object';
    span.textContent = emoji;
    span.style.animationDelay = ((a + i) * 0.15) + 's';
    rightEl.appendChild(span);
  }
}

// ── RENDER CHOICES ────────────────────────────────────────────────────
function renderAdditionChoices(correct) {
  const choicesEl = document.getElementById('addition-choices');
  choicesEl.innerHTML = '';

  // Generate distractors: correct ± 1, clamped to 1+
  let d1 = correct - 1;
  let d2 = correct + 1;
  if (d1 < 1) d1 = correct + 2;
  if (d2 === d1) d2 = correct + 2;

  const options = shuffle([correct, d1, d2]);

  options.forEach(num => {
    const btn = document.createElement('button');
    btn.className = 'addition-choice-btn';
    btn.textContent = num;
    btn.onclick = () => handleAdditionChoice(btn, num, correct);
    choicesEl.appendChild(btn);
  });
}

// ── HANDLE ANSWER ─────────────────────────────────────────────────────
function handleAdditionChoice(btn, chosen, correct) {
  if (btn.classList.contains('dimmed') || btn.classList.contains('correct')) return;

  const problem = additionState.currentProblem;

  if (chosen === correct) {
    // ✓ Correct
    btn.classList.add('correct');
    additionState.score++;
    document.getElementById('addition-score-badge').textContent = '➕ ' + additionState.score;

    // Streak
    if (!additionState.currentHadWrong) {
      additionState.firstTryStreak++;
    } else {
      additionState.firstTryStreak = 0;
    }

    // Save progress
    const save = loadSave();
    writeSave({ totalMathProblems: (save.totalMathProblems || 0) + 1 });
    checkMilestones();

    // Merge the groups together — THIS is when they combine
    const groupsEl = document.getElementById('addition-groups');
    groupsEl.classList.add('merged');

    // Show equation as reinforcement (after merge animation)
    setTimeout(() => {
      const equationEl = document.getElementById('addition-equation');
      equationEl.textContent = `${problem.a} + ${problem.b} = ${correct}`;
      equationEl.style.display = 'block';
    }, 700);

    // Celebration
    triggerMascotEl('addition-mascot', 'happy');
    launchConfetti();

    const phrase = `${NUMBER_WORDS[problem.a]} plus ${NUMBER_WORDS[problem.b]} equals ${NUMBER_WORDS[correct]}! Great job!`;
    speakPhrase(phrase);

    // Advance after delay (longer to let merge + equation land)
    setTimeout(() => {
      additionState.currentIndex++;
      loadAdditionProblem();
    }, 2800);

  } else {
    // ✗ Wrong
    additionState.currentHadWrong = true;
    btn.classList.add('wrong-shake');
    triggerMascotEl('addition-mascot', 'wrong');

    setTimeout(() => {
      btn.classList.remove('wrong-shake');
      btn.classList.add('dimmed');
    }, 400);

    // Groups stay separate — she can recount and try again
  }
}
