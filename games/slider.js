// =====================================================================
// SOUND IT OUT GAME — drag the slider to hear each letter's sound
// Depends on: data.js, core.js
// =====================================================================

const sliderState = {
  wordList: [],
  currentIndex: 0,
  currentWord: null,
  score: 0,
  pendingStoryMoment: false,
  dragActive: false,
  lastSpokenIndex: -1,
};

function startSlider(category) {
  if (!category) {
    const save = loadSave();
    category = save.lastCategory || 'all';
  }
  const pool   = category === 'all' ? WORDS : WORDS.filter(w => w.category === category);
  const easy   = shuffle(pool.filter(w => w.word.length === 3));
  const medium = shuffle(pool.filter(w => w.word.length === 4));
  const hard   = shuffle(pool.filter(w => w.word.length >= 5));
  sliderState.wordList = [...easy, ...medium, ...hard];
  if (sliderState.wordList.length === 0) sliderState.wordList = shuffle([...WORDS]);
  sliderState.currentIndex = 0;
  sliderState.score = 0;
  sliderState.pendingStoryMoment = false;
  state.activeGame = 'slider';

  const save = loadSave();
  const companion = state.companion.emoji || save.companion || '🐰';
  document.getElementById('slider-mascot').textContent = companion;
  document.getElementById('slider-handle').textContent = companion;

  showScreen('slider-screen');
  _attachSliderDragListeners();
  loadSliderWord();
}

function loadSliderWord() {
  if (sliderState.currentIndex >= sliderState.wordList.length) {
    showAllDone('slider');
    return;
  }
  if (sliderState.pendingStoryMoment) {
    sliderState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  sliderState.currentWord    = sliderState.wordList[sliderState.currentIndex];
  sliderState.lastSpokenIndex = -1;
  sliderState.dragActive      = false;

  const pct = (sliderState.currentIndex / sliderState.wordList.length) * 100;
  document.getElementById('slider-progress-fill').style.width = pct + '%';
  document.getElementById('slider-score-badge').textContent   = `🔉 ${sliderState.score}`;

  const clueEl = document.getElementById('slider-emoji-clue');
  clueEl.textContent    = sliderState.currentWord.emoji;
  clueEl.style.animation = 'none';
  void clueEl.offsetWidth;
  clueEl.style.animation = '';

  document.getElementById('slider-done-btn').style.display = 'none';

  _renderSliderLetters();
  _resetHandle();
}

function _renderSliderLetters() {
  const word      = sliderState.currentWord.word;
  const container = document.getElementById('slider-letters-row');
  container.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    const el = document.createElement('div');
    el.className   = 'slider-letter';
    el.id          = `sletter-${i}`;
    el.textContent = word[i].toUpperCase();
    container.appendChild(el);
  }
}

function _resetHandle() {
  const handle = document.getElementById('slider-handle');
  if (handle) handle.style.left = '0px';
}

function _attachSliderDragListeners() {
  const track = document.getElementById('slider-track');
  if (!track) return;

  // Allow dragging from anywhere on the track (easier for small hands)
  track.onmousedown  = e => { e.preventDefault(); _sliderStartDrag(e.clientX); };
  track.ontouchstart = e => { e.preventDefault(); _sliderStartDrag(e.touches[0].clientX); };

  document.onmousemove = e => { if (sliderState.dragActive) _sliderMoveDrag(e.clientX); };
  document.ontouchmove = e => {
    if (sliderState.dragActive) { e.preventDefault(); _sliderMoveDrag(e.touches[0].clientX); }
  };

  document.onmouseup  = () => { sliderState.dragActive = false; };
  document.ontouchend = () => { sliderState.dragActive = false; };
}

function _sliderStartDrag(clientX) {
  if (!sliderState.currentWord) return;
  // Don't allow dragging once the word is complete (done button showing)
  if (document.getElementById('slider-done-btn').style.display === 'block') return;
  sliderState.dragActive = true;
  _sliderMoveDrag(clientX);
}

function _sliderMoveDrag(clientX) {
  if (!sliderState.dragActive || !sliderState.currentWord) return;

  const track  = document.getElementById('slider-track');
  const handle = document.getElementById('slider-handle');
  if (!track || !handle) return;

  const rect    = track.getBoundingClientRect();
  const handleW = handle.offsetWidth;
  const word    = sliderState.currentWord.word;

  // Clamp handle so it stays within track bounds
  let x = clientX - rect.left - handleW / 2;
  x = Math.max(0, Math.min(x, rect.width - handleW));
  handle.style.left = x + 'px';

  // Map handle center → letter index
  const centerX     = x + handleW / 2;
  const letterIndex = Math.min(
    Math.floor((centerX / rect.width) * word.length),
    word.length - 1
  );

  if (letterIndex > sliderState.lastSpokenIndex) {
    // Speak only the leading (most recently entered) letter
    speakLetter(word[letterIndex]);

    // Light up all letters swept so far
    for (let i = 0; i <= letterIndex; i++) {
      const el = document.getElementById(`sletter-${i}`);
      if (el) el.classList.add('lit');
    }

    // "Active" pulse on just the current letter
    document.querySelectorAll('.slider-letter').forEach(l => l.classList.remove('active'));
    const activeEl = document.getElementById(`sletter-${letterIndex}`);
    if (activeEl) activeEl.classList.add('active');

    sliderState.lastSpokenIndex = letterIndex;
  }

  // Complete only when handle is dragged all the way to the right edge
  if (sliderState.lastSpokenIndex === word.length - 1) {
    const atEnd = x >= rect.width - handleW - 4; // 4px tolerance for finger imprecision
    if (atEnd) {
      sliderState.dragActive = false;
      _sliderWordComplete();
    }
  }
}

function sliderHintTap() {
  if (!sliderState.currentWord) return;
  const word = sliderState.currentWord.word;
  window.speechSynthesis && window.speechSynthesis.cancel();
  // Speak each letter in sequence, then the full word
  word.split('').forEach((letter, i) => {
    setTimeout(() => speakLetter(letter), i * 750);
  });
  setTimeout(() => speakWord(word), word.length * 750 + 400);
}

function sliderTryAgain() {
  document.getElementById('slider-try-again-btn').style.display = 'none';
  document.getElementById('slider-done-btn').style.display = 'none';
  sliderState.lastSpokenIndex = -1;
  sliderState.dragActive = false;
  document.querySelectorAll('.slider-letter').forEach(l => l.classList.remove('lit', 'active'));
  _resetHandle();
}

function _sliderWordComplete() {
  sliderState.score++;
  const save = loadSave();
  writeSave({ totalSlider: (save.totalSlider || 0) + 1 });

  // Snap handle to the far right
  const track  = document.getElementById('slider-track');
  const handle = document.getElementById('slider-handle');
  if (track && handle) handle.style.left = (track.offsetWidth - handle.offsetWidth) + 'px';

  // Remove the active pulse — all letters stay lit
  document.querySelectorAll('.slider-letter').forEach(l => l.classList.remove('active'));

  triggerMascotEl('slider-mascot', 'happy');
  checkMilestones();

  setTimeout(() => {
    speakWord(sliderState.currentWord.word);
    setTimeout(() => {
      launchConfetti();
      speakPhrase(`${sliderState.currentWord.word}! Amazing Emma!`);
      document.getElementById('slider-score-badge').textContent = `🔉 ${sliderState.score}`;
      document.getElementById('slider-try-again-btn').style.display = 'block';
      const doneBtn = document.getElementById('slider-done-btn');
      doneBtn.style.display = 'block';
      doneBtn.textContent = sliderState.pendingStoryMoment ? 'Story Time! 📖' : 'Next Word ➜';
    }, 600);
  }, 300);
}

function sliderNextClicked() {
  document.getElementById('slider-done-btn').style.display = 'none';
  document.getElementById('slider-try-again-btn').style.display = 'none';
  sliderState.currentIndex++;
  loadSliderWord();
}
