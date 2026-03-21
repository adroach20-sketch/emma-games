// =====================================================================
// CORE — save/load, audio, shared state, hub, stickers, story moments,
//        shared utilities. Depends on data.js being loaded first.
// =====================================================================

// ── SAVE / LOAD ───────────────────────────────────────────────────────
const SAVE_KEY = 'emmaSave';

const DEFAULT_SAVE = {
  companion: '',
  companionName: '',
  totalWordsSpelled: 0,
  totalSightWords: 0,
  totalDecoded: 0,
  totalSentences: 0,
  totalFamilies: 0,
  totalStoriesRead: 0,
  totalTyped: 0,
  totalSlider: 0,
  totalMathProblems: 0,
  stickersEarned: [],
  storyMomentIndex: 0,
  sightWordsLearned: [],
  lastCategory: 'all',
};

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return Object.assign({}, DEFAULT_SAVE, JSON.parse(raw));
  } catch(e) {}
  return Object.assign({}, DEFAULT_SAVE);
}

function writeSave(patch) {
  const current = loadSave();
  const updated = Object.assign(current, patch);
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(updated)); } catch(e) {}
  return updated;
}

// ── AUDIO — Web Speech API with best-voice selection ─────────────────
let selectedVoice = null;

function loadBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  const tests = [
    v => v.name === 'Google US English',
    v => v.name.includes('Microsoft') && v.name.toLowerCase().includes('aria'),
    v => v.name.includes('Microsoft') && v.name.toLowerCase().includes('jenny'),
    v => v.name.includes('Microsoft') && v.name.toLowerCase().includes('guy'),
    v => v.name.includes('Microsoft') && v.lang === 'en-US',
    v => v.name === 'Samantha',
    v => v.name === 'Karen',
    v => v.name === 'Moira',
    v => v.lang === 'en-US' && v.localService,
    v => v.lang === 'en-US',
    v => v.lang.startsWith('en'),
  ];

  for (const test of tests) {
    const match = voices.find(test);
    if (match) { selectedVoice = match; return; }
  }

  selectedVoice = voices[0];
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadBestVoice;
  loadBestVoice();
}

function speakWord(word)     { speak(word,   0.55, 1.05); }
function speakLetter(letter) { speak(letter, 0.6,  1.05); }
function speakPhrase(phrase) { speak(phrase, 0.7,  1.05); }

function speak(text, rate, pitch) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate   = rate;
  utt.pitch  = pitch;
  utt.volume = 1;
  if (selectedVoice) utt.voice = selectedVoice;
  window.speechSynthesis.speak(utt);
}

// ── GAME STATE ────────────────────────────────────────────────────────
// Declared early so all game files can reference it.
const state = {
  companion: { emoji: '', name: '' },
  wordList:  [],
  currentIndex: 0,
  currentWord:  null,
  activeSlot:   0,
  score:        0,
  isAnimating:  false,
  roundComplete: false,
  pendingStoryMoment: false,
  // Which game is active: 'builder'|'spotter'|'decoder'|'sentence'|'families'|'reader'|'typing'|'addition'
  activeGame: 'builder',
  // Which learning path is active (null = came from hub directly)
  activePath: null,
};

// ── WELCOME SCREEN ────────────────────────────────────────────────────
function selectCompanion(btn, emoji, name) {
  document.querySelectorAll('.companion-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.companion = { emoji, name };
  document.getElementById('start-btn').classList.add('visible');
}

function goToHub() {
  // Clear any pending spotter timer so it doesn't fire after navigation
  if (spotterState.timerTimeout) {
    clearTimeout(spotterState.timerTimeout);
    spotterState.timerTimeout = null;
  }
  // Cancel any in-progress speech when returning to hub
  window.speechSynthesis && window.speechSynthesis.cancel();
  // Save companion choice
  writeSave({ companion: state.companion.emoji, companionName: state.companion.name });

  if (state.activePath) {
    // Emma came from a path — go back to it (re-render so stats are fresh)
    openPath(state.activePath);
  } else {
    refreshHubUI();
    showScreen('hub-screen');
  }
}

// ── HUB SCREEN ────────────────────────────────────────────────────────
function refreshHubUI() {
  const save = loadSave();
  document.getElementById('hub-companion').textContent = state.companion.emoji || save.companion || '🐰';
  document.getElementById('hub-sticker-badge').textContent = `⭐ ${save.stickersEarned.length} stickers`;
  // Update each path card's sub-label with aggregated progress
  Object.entries(PATHS).forEach(([id, path]) => {
    const el = document.getElementById('pc-' + id + '-sub');
    if (el) el.textContent = path.pathSub(save);
  });
}

// ── ALL DONE SCREEN ───────────────────────────────────────────────────
function showAllDone(game) {
  let scoreNum, label, sub;
  if (game === 'builder') {
    scoreNum = state.score;
    label = 'words spelled';
    sub = 'You spelled every word!';
  } else if (game === 'spotter') {
    scoreNum = spotterState.score;
    label = 'sight words learned!';
    sub = `You learned ${scoreNum} sight words!`;
  } else if (game === 'decoder') {
    scoreNum = decoderState.score;
    label = 'words decoded!';
    sub = `You decoded ${scoreNum} words!`;
  } else if (game === 'sentence') {
    scoreNum = sentenceState.score;
    label = 'sentences built!';
    sub = `You built ${scoreNum} sentences!`;
  } else if (game === 'families') {
    scoreNum = familyState.score;
    label = 'word families!';
    sub = `You found ${scoreNum} word families!`;
  } else if (game === 'reader') {
    scoreNum = readerState.score;
    label = 'stories read!';
    sub = `You read ${scoreNum} stories!`;
  } else if (game === 'typing') {
    scoreNum = typingState.score;
    label = 'words typed!';
    sub = `You typed ${scoreNum} words!`;
  } else if (game === 'slider') {
    scoreNum = sliderState.score;
    label = 'words sounded out!';
    sub = `You sounded out ${scoreNum} words!`;
  } else if (game === 'addition') {
    scoreNum = additionState.score;
    label = 'problems solved!';
    sub = `You solved ${scoreNum} addition problems!`;
  } else {
    scoreNum = 0;
    label = '';
    sub = 'Great job, Emma!';
  }

  document.getElementById('done-score').textContent = scoreNum;
  document.getElementById('done-score-label').textContent = label;
  document.getElementById('done-sub-text').textContent = sub;

  showScreen(null);
  document.getElementById('done-screen').classList.add('active');
  launchConfetti();
  launchConfetti();
  setTimeout(() => speakPhrase(`Amazing Emma! You are so smart!`), 800);
}

// ── STORY MOMENTS ─────────────────────────────────────────────────────

// storyResumeCallback is called after the story overlay closes, to
// resume whichever game was in progress
let storyResumeCallback = null;
let storyAutoPlayTimeout = null;

function checkMilestones() {
  const save = loadSave();
  const total = save.totalWordsSpelled + save.totalSightWords + (save.totalDecoded || 0) + (save.totalSentences || 0) + (save.totalFamilies || 0) + (save.totalStoriesRead || 0) + (save.totalTyped || 0) + (save.totalSlider || 0) + (save.totalMathProblems || 0);
  const storyDue = Math.floor(total / 5) > save.storyMomentIndex && save.storyMomentIndex < STORY_MOMENTS.length;

  if (storyDue) {
    // Queue the story moment for the active game
    if (state.activeGame === 'builder') {
      state.pendingStoryMoment = true;
    } else if (state.activeGame === 'spotter') {
      spotterState.pendingStoryMoment = true;
    } else if (state.activeGame === 'decoder') {
      decoderState.pendingStoryMoment = true;
    } else if (state.activeGame === 'sentence') {
      sentenceState.pendingStoryMoment = true;
    } else if (state.activeGame === 'families') {
      familyState.pendingStoryMoment = true;
    } else if (state.activeGame === 'reader') {
      readerState.pendingStoryMoment = true;
    } else if (state.activeGame === 'typing') {
      typingState.pendingStoryMoment = true;
    } else if (state.activeGame === 'slider') {
      sliderState.pendingStoryMoment = true;
    } else if (state.activeGame === 'addition') {
      additionState.pendingStoryMoment = true;
    }
  }
}

function showStoryMoment() {
  const save = loadSave();
  const idx = save.storyMomentIndex;
  if (idx >= STORY_MOMENTS.length) {
    // No more stories — resume game
    resumeAfterStory();
    return;
  }

  const moment = STORY_MOMENTS[idx];
  const companion = state.companion.emoji || save.companion || '🐰';

  document.getElementById('story-companion').textContent = companion;
  document.getElementById('story-scene').textContent = moment.scene;

  // Build word spans
  const sentenceEl = document.getElementById('story-sentence');
  sentenceEl.innerHTML = '';
  const words = moment.sentence.split(' ');
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'story-word-span';
    span.textContent = w;
    span.dataset.index = i;
    // Tapping a word speaks it in isolation (strip punctuation for TTS)
    span.onclick = () => speakWord(w.replace(/[^a-zA-Z']/g, ''));
    sentenceEl.appendChild(span);
  });

  // Update story moment index in save
  writeSave({ storyMomentIndex: idx + 1 });

  document.getElementById('story-overlay').classList.add('show');

  // Auto-play the sentence after a short delay
  // Store the timeout so closeStoryMoment can cancel it if user taps "Keep playing" quickly
  storyAutoPlayTimeout = setTimeout(() => playStorySentence(), 700);
}

function playStorySentence() {
  const save = loadSave();
  // storyMomentIndex was already incremented when we opened the overlay,
  // so current story is at index - 1
  const idx = save.storyMomentIndex - 1;
  if (idx < 0 || idx >= STORY_MOMENTS.length) return;

  const moment = STORY_MOMENTS[idx];
  const words = moment.sentence.split(' ');
  const spans = document.querySelectorAll('#story-sentence .story-word-span');

  // Clear all highlights first
  spans.forEach(s => s.classList.remove('lit'));

  // Speak the full sentence
  speakPhrase(moment.sentence);

  // Highlight words one by one at ~600ms per word
  words.forEach((w, i) => {
    setTimeout(() => {
      spans.forEach(s => s.classList.remove('lit'));
      if (spans[i]) spans[i].classList.add('lit');
    }, i * 600);
  });

  // Clear last highlight after sentence finishes
  setTimeout(() => {
    spans.forEach(s => s.classList.remove('lit'));
  }, words.length * 600 + 400);
}

function closeStoryMoment() {
  // Cancel auto-play if user taps "Keep playing" before the 700ms fires
  if (storyAutoPlayTimeout) {
    clearTimeout(storyAutoPlayTimeout);
    storyAutoPlayTimeout = null;
  }
  window.speechSynthesis && window.speechSynthesis.cancel();
  document.getElementById('story-overlay').classList.remove('show');

  // Award a sticker after story
  const save = loadSave();
  const nextStickerIndex = save.stickersEarned.length;
  if (nextStickerIndex < STICKERS.length) {
    const newSticker = STICKERS[nextStickerIndex];
    const newEarned = [...save.stickersEarned, newSticker];
    writeSave({ stickersEarned: newEarned });
    showStickerAward(newSticker, STICKER_NAMES[nextStickerIndex]);
  } else {
    resumeAfterStory();
  }
}

function resumeAfterStory() {
  // Resume the active game
  if (state.activeGame === 'builder') {
    loadWord();
  } else if (state.activeGame === 'spotter') {
    loadSpotterWord();
  } else if (state.activeGame === 'decoder') {
    loadDecoderWord();
  } else if (state.activeGame === 'sentence') {
    loadSentence();
  } else if (state.activeGame === 'families') {
    loadFamilyRound();
  } else if (state.activeGame === 'reader') {
    loadReaderStory();
  } else if (state.activeGame === 'typing') {
    loadTypingWord();
  } else if (state.activeGame === 'slider') {
    loadSliderWord();
  } else if (state.activeGame === 'addition') {
    loadAdditionProblem();
  }
}

// ── STICKER BOOK ──────────────────────────────────────────────────────
function goToStickers() {
  renderStickerGrid();
  showScreen('sticker-screen');
}

function renderStickerGrid() {
  const save = loadSave();
  const earned = save.stickersEarned;

  document.getElementById('sticker-count-label').textContent = `${earned.length} / 30 stickers`;

  const grid = document.getElementById('sticker-grid');
  grid.innerHTML = '';

  let firstLockedMarked = false;
  STICKERS.forEach((emoji, i) => {
    const slot = document.createElement('div');
    const isEarned = earned.includes(emoji);
    let className = 'sticker-slot' + (isEarned ? ' earned' : ' locked');
    // Mark the first locked slot as next-up
    if (!isEarned && !firstLockedMarked) {
      className += ' next-up';
      firstLockedMarked = true;
    }
    slot.className = className;
    slot.textContent = emoji;
    if (isEarned) {
      slot.onclick = () => speakWord(STICKER_NAMES[i]);
    }
    grid.appendChild(slot);
  });

  // Update the next sticker hint label
  const labelEl = document.getElementById('sticker-next-label');
  if (labelEl) {
    if (earned.length >= STICKERS.length) {
      labelEl.textContent = 'You collected all 30 stickers! Amazing Emma! 🏆';
    } else {
      labelEl.textContent = 'Play more games to earn your next sticker! ⭐';
    }
  }
}

function showStickerAward(emoji, name) {
  document.getElementById('sticker-award-emoji').textContent = emoji;
  document.getElementById('sticker-award-sub').textContent = `A ${name} sticker!`;
  document.getElementById('sticker-award-overlay').classList.add('show');
  launchConfetti();
  setTimeout(() => speakPhrase(`You got a ${name} sticker! Yay!`), 500);
}

function closeStickerAward() {
  document.getElementById('sticker-award-overlay').classList.remove('show');
  refreshHubUI();
  resumeAfterStory();
}

// ── SHARED UTILITIES ──────────────────────────────────────────────────

// Trigger animation on the main game mascot by ID
function triggerMascot(emotion) {
  triggerMascotEl('mascot', emotion);
}

function triggerMascotEl(id, emotion) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('happy', 'wrong');
  void el.offsetWidth;
  el.classList.add(emotion);
  setTimeout(() => el.classList.remove(emotion), 700);
}

const CONFETTI_COLORS = ['#7c3aed','#f59e0b','#10b981','#ef4444','#3b82f6','#ec4899','#f97316'];

function launchConfetti() {
  for (let i = 0; i < 45; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = `
        left: ${Math.random() * 100}vw;
        width: ${8 + Math.random() * 9}px;
        height: ${8 + Math.random() * 9}px;
        background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
        animation-duration: ${1.4 + Math.random() * 1.6}s;
        animation-delay: ${Math.random() * 0.4}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3200);
    }, i * 28);
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── LEARNING PATHS ────────────────────────────────────────────────────

const PATHS = {
  explorer: {
    name: 'Word Explorer 🗺️',
    games: [
      { title: 'Word Builder 🔤',  sub: s => `${s.totalWordsSpelled} word${s.totalWordsSpelled !== 1 ? 's' : ''} spelled`,        fn: 'startWordBuilder'  },
      { title: 'Word Decoder 🔍',  sub: s => `${s.totalDecoded} word${s.totalDecoded !== 1 ? 's' : ''} decoded`,                  fn: 'startDecoder'      },
      { title: 'Word Families 🎵', sub: s => `${s.totalFamilies} famil${s.totalFamilies !== 1 ? 'ies' : 'y'} completed`,          fn: 'startWordFamilies' },
      { title: 'Sound It Out 🔉',  sub: s => `${s.totalSlider || 0} word${(s.totalSlider || 0) !== 1 ? 's' : ''} sounded out`,    fn: 'startSlider'       },
    ],
    pathSub: s => {
      const t = (s.totalWordsSpelled || 0) + (s.totalDecoded || 0) + (s.totalFamilies || 0) + (s.totalSlider || 0);
      return t === 0 ? 'Start exploring!' : `${t} words explored`;
    },
  },
  storytime: {
    name: 'Story Time 📖',
    games: [
      { title: 'Sight Word Spotter 👁️', sub: s => `${s.totalSightWords} word${s.totalSightWords !== 1 ? 's' : ''} learned`, fn: 'startSpotter' },
      { title: 'Story Reader 📚',        sub: s => `${s.totalStoriesRead} stor${s.totalStoriesRead !== 1 ? 'ies' : 'y'} read`, fn: 'startReader'  },
    ],
    pathSub: s => {
      const t = (s.totalSightWords || 0) + (s.totalStoriesRead || 0);
      return t === 0 ? 'Start reading!' : `${t} words & stories`;
    },
  },
  maker: {
    name: 'Word Maker ✏️',
    games: [
      { title: 'Sentence Builder 📖', sub: s => `${s.totalSentences} sentence${s.totalSentences !== 1 ? 's' : ''} built`, fn: 'startSentenceBuilder' },
      { title: 'Typing Practice ⌨️',  sub: s => `${s.totalTyped} word${s.totalTyped !== 1 ? 's' : ''} typed`,             fn: 'startTyping'          },
    ],
    pathSub: s => {
      const t = (s.totalSentences || 0) + (s.totalTyped || 0);
      return t === 0 ? 'Start making words!' : `${t} words created`;
    },
  },
  numbers: {
    name: 'Numbers Quest 🔢',
    games: [
      { title: 'How Many? ➕', sub: s => `${s.totalMathProblems || 0} problem${(s.totalMathProblems || 0) !== 1 ? 's' : ''} solved`, fn: 'startAddition' },
    ],
    pathSub: s => {
      const t = s.totalMathProblems || 0;
      return t === 0 ? 'Start counting!' : `${t} problems solved`;
    },
  },
};

function openPath(pathId) {
  const path = PATHS[pathId];
  if (!path) return;
  state.activePath = pathId;

  document.getElementById('path-screen-title').textContent = path.name;

  const save = loadSave();
  const gamesEl = document.getElementById('path-screen-games');
  gamesEl.innerHTML = '';
  path.games.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'path-game-btn';
    btn.innerHTML = `<div class="path-game-btn-title">${g.title}</div><div class="path-game-btn-sub">${g.sub(save)}</div>`;
    btn.onclick = () => window[g.fn]();
    gamesEl.appendChild(btn);
  });

  showScreen('path-screen');
}

function closePathScreen() {
  state.activePath = null;
  refreshHubUI();
  showScreen('hub-screen');
}

function showComingSoon() {
  speakPhrase('Coming soon! Keep playing to unlock new adventures.');
}

// ── PARENT SETTINGS ───────────────────────────────────────────────────

// Gear icon tap counter — requires 4 taps within 2 seconds to open settings
let _gearTapCount = 0;
let _gearTapTimer = null;

// Maps each game key to the save fields it owns
const GAME_RESET_MAP = {
  builder:  { totalWordsSpelled: 0 },
  spotter:  { totalSightWords: 0, sightWordsLearned: [] },
  decoder:  { totalDecoded: 0 },
  sentence: { totalSentences: 0 },
  families: { totalFamilies: 0 },
  reader:   { totalStoriesRead: 0 },
  typing:   { totalTyped: 0 },
  slider:   { totalSlider: 0 },
  addition: { totalMathProblems: 0 },
  all: {
    totalWordsSpelled: 0, totalSightWords: 0, totalDecoded: 0,
    totalSentences: 0, totalFamilies: 0, totalStoriesRead: 0, totalTyped: 0, totalSlider: 0,
    totalMathProblems: 0,
    stickersEarned: [], storyMomentIndex: 0, sightWordsLearned: [],
    companion: '', companionName: '',
  },
};

let _armedResetBtn = null; // tracks which button is in "armed" state

function showParentSettings() {
  _gearTapCount++;
  const gearBtn = document.querySelector('.hub-settings-btn');
  if (gearBtn) {
    gearBtn.classList.add('tapping');
    setTimeout(() => gearBtn.classList.remove('tapping'), 300);
  }
  if (_gearTapTimer) clearTimeout(_gearTapTimer);
  _gearTapTimer = setTimeout(() => { _gearTapCount = 0; }, 2000);
  if (_gearTapCount >= 4) {
    _gearTapCount = 0;
    clearTimeout(_gearTapTimer);
    _disarmReset();
    _refreshParentCategoryUI();
    document.getElementById('parent-overlay').classList.add('show');
  }
}

function setParentCategory(cat) {
  writeSave({ lastCategory: cat });
  _refreshParentCategoryUI();
  closeParentSettings();
}

function _refreshParentCategoryUI() {
  const save = loadSave();
  const active = save.lastCategory || 'all';
  ['animal','nature','home','all'].forEach(c => {
    const btn = document.getElementById('pcat-' + c);
    if (!btn) return;
    btn.style.background = c === active ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.1)';
    btn.style.borderColor = c === active ? '#a78bfa' : 'rgba(255,255,255,0.2)';
    btn.style.color = c === active ? '#e9d5ff' : 'rgba(255,255,255,0.7)';
  });
}

function closeParentSettings() {
  _disarmReset();
  document.getElementById('parent-overlay').classList.remove('show');
}

function resetGame(btn, game) {
  if (_armedResetBtn === btn) {
    // Second tap — execute the reset
    writeSave(GAME_RESET_MAP[game]);
    _disarmReset();
    refreshHubUI();
    // Visual confirmation: flash button green briefly
    btn.textContent = 'Done ✓';
    btn.style.background = 'rgba(16,185,129,0.3)';
    btn.style.color = '#6ee7b7';
    btn.style.borderColor = 'var(--success)';
    setTimeout(() => {
      btn.textContent = game === 'all' ? 'Reset All Progress' : 'Reset';
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      // If "all" was reset, close and go back to welcome screen
      if (game === 'all') {
        closeParentSettings();
        showScreen('welcome-screen');
      }
    }, 1200);
  } else {
    // First tap — arm it
    _disarmReset();
    _armedResetBtn = btn;
    btn.classList.add('armed');
    btn.textContent = 'Confirm?';
  }
}

function _disarmReset() {
  if (_armedResetBtn) {
    _armedResetBtn.classList.remove('armed');
    _armedResetBtn.textContent = _armedResetBtn.classList.contains('parent-reset-all-btn')
      ? 'Reset All Progress'
      : 'Reset';
    _armedResetBtn = null;
  }
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('done-screen').classList.remove('active');
  if (id) document.getElementById(id).classList.add('active');
}
