// =====================================================================
// STORY READER GAME
// Reads short illustrated stories one sentence at a time, with word
// highlighting, then asks a simple comprehension question.
// Depends on: data.js, core.js
// =====================================================================

const readerState = {
  storyList: [],
  currentIndex: 0,
  currentStory: null,
  sentenceIndex: 0,     // which sentence in the story we're on
  score: 0,
  pendingStoryMoment: false,
};

function startReader() {
  readerState.storyList = shuffle([...STORIES]);
  readerState.currentIndex = 0;
  readerState.score = 0;
  readerState.pendingStoryMoment = false;
  state.activeGame = 'reader';

  document.getElementById('reader-mascot').textContent = state.companion.emoji || loadSave().companion || '🐰';
  showScreen('reader-screen');
  loadReaderStory();
}

function loadReaderStory() {
  if (readerState.currentIndex >= readerState.storyList.length) {
    showAllDone('reader');
    return;
  }
  if (readerState.pendingStoryMoment) {
    readerState.pendingStoryMoment = false;
    showStoryMoment();
    return;
  }

  readerState.currentStory = readerState.storyList[readerState.currentIndex];
  readerState.sentenceIndex = 0;

  const pct = (readerState.currentIndex / readerState.storyList.length) * 100;
  document.getElementById('reader-progress-fill').style.width = pct + '%';
  document.getElementById('reader-score-badge').textContent = `📚 ${readerState.score}`;

  const story = readerState.currentStory;
  document.getElementById('reader-story-title').textContent = story.title;
  document.getElementById('reader-scene').textContent = story.scene;

  renderReaderSentence();
}

function renderReaderSentence() {
  const story = readerState.currentStory;
  const sentence = story.sentences[readerState.sentenceIndex];

  const box = document.getElementById('reader-sentence-box');
  box.innerHTML = '';

  // Build word spans for tap-to-speak and highlight animation
  const words = sentence.split(' ');
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'reader-word-span';
    span.textContent = w + (i < words.length - 1 ? ' ' : '');
    span.dataset.index = i;
    span.onclick = () => speakWord(w.replace(/[^a-zA-Z']/g, ''));
    box.appendChild(span);
  });

  // Clear next area while sentence is loading
  const nextArea = document.getElementById('reader-next-area');
  nextArea.innerHTML = '';

  // Speak and highlight after a short delay
  setTimeout(() => {
    speakPhrase(sentence);
    words.forEach((w, i) => {
      setTimeout(() => {
        box.querySelectorAll('.reader-word-span').forEach(s => s.classList.remove('reader-lit'));
        const spans = box.querySelectorAll('.reader-word-span');
        if (spans[i]) spans[i].classList.add('reader-lit');
      }, i * 600);
    });
    // After sentence finishes, show Next/Question button
    setTimeout(() => {
      box.querySelectorAll('.reader-word-span').forEach(s => s.classList.remove('reader-lit'));
      showReaderNext();
    }, words.length * 600 + 500);
  }, 400);
}

function showReaderNext() {
  const story = readerState.currentStory;
  const isLastSentence = readerState.sentenceIndex >= story.sentences.length - 1;
  const nextArea = document.getElementById('reader-next-area');
  nextArea.innerHTML = '';

  const btn = document.createElement('button');
  btn.className = 'reader-next-btn';

  if (isLastSentence) {
    btn.textContent = 'Answer a question! ❓';
    btn.onclick = showReaderQuestion;
  } else {
    btn.textContent = 'Keep reading ➜';
    btn.onclick = () => {
      readerState.sentenceIndex++;
      renderReaderSentence();
    };
  }
  nextArea.appendChild(btn);
}

function showReaderQuestion() {
  const story = readerState.currentStory;

  const box = document.getElementById('reader-sentence-box');
  box.innerHTML = `<div class="reader-question">${story.question}</div>`;

  const nextArea = document.getElementById('reader-next-area');
  nextArea.innerHTML = '';

  // Build choice buttons
  story.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'reader-choice-btn';
    btn.textContent = choice;
    btn.onclick = () => handleReaderChoice(btn, choice, story.correct);
    nextArea.appendChild(btn);
  });

  speakPhrase(story.question);
}

function handleReaderChoice(btn, chosen, correct) {
  // Disable all choice buttons
  document.querySelectorAll('.reader-choice-btn').forEach(b => { b.onclick = null; });

  if (chosen === correct) {
    btn.classList.add('reader-correct');
    readerState.score++;
    triggerMascotEl('reader-mascot', 'happy');
    checkMilestones();
    launchConfetti();

    const save = loadSave();
    writeSave({ totalStoriesRead: (save.totalStoriesRead || 0) + 1 });

    speakPhrase(`That\'s right! ${correct}!`);
    document.getElementById('reader-score-badge').textContent = `📚 ${readerState.score}`;

    // Show next story button
    setTimeout(() => {
      const nextArea = document.getElementById('reader-next-area');
      nextArea.innerHTML = '';
      const nextBtn = document.createElement('button');
      nextBtn.className = 'reader-next-btn';
      nextBtn.textContent = readerState.pendingStoryMoment ? 'Story Time! 📖' : 'Next Story ➜';
      nextBtn.onclick = () => {
        readerState.currentIndex++;
        loadReaderStory();
      };
      nextArea.appendChild(nextBtn);
    }, 1200);
  } else {
    btn.classList.add('reader-wrong');
    triggerMascotEl('reader-mascot', 'wrong');
    speakPhrase('Try again!');
    // Re-enable other buttons after a moment
    setTimeout(() => {
      btn.classList.remove('reader-wrong');
      document.querySelectorAll('.reader-choice-btn').forEach(b => {
        b.onclick = () => handleReaderChoice(b, b.textContent, correct);
      });
    }, 500);
  }
}
