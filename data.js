// =====================================================================
// DATA CONSTANTS
// =====================================================================

// Word Builder words — easy → medium → hard
// Each entry has: word, emoji, category ('animal' | 'nature' | 'home')
const WORDS = [
  // ── Easy: 3-letter CVC ──────────────────────────────────────────────
  { word: 'cat',   emoji: '🐱', category: 'animal' },
  { word: 'dog',   emoji: '🐶', category: 'animal' },
  { word: 'pig',   emoji: '🐷', category: 'animal' },
  { word: 'bug',   emoji: '🐛', category: 'nature' },
  { word: 'sun',   emoji: '☀️', category: 'nature' },
  { word: 'hat',   emoji: '🎩', category: 'home'   },
  { word: 'fox',   emoji: '🦊', category: 'animal' },
  { word: 'hen',   emoji: '🐔', category: 'animal' },
  { word: 'bat',   emoji: '🦇', category: 'animal' },
  { word: 'cup',   emoji: '🥤', category: 'home'   },
  { word: 'bed',   emoji: '🛏️', category: 'home'   },
  { word: 'nut',   emoji: '🥜', category: 'nature' },
  { word: 'rat',   emoji: '🐀', category: 'animal' },
  { word: 'van',   emoji: '🚐', category: 'home'   },
  { word: 'log',   emoji: '🪵', category: 'nature' },
  { word: 'ram',   emoji: '🐏', category: 'animal' },
  { word: 'web',   emoji: '🕸️', category: 'animal' },
  { word: 'pup',   emoji: '🐕', category: 'animal' },
  { word: 'tub',   emoji: '🛁', category: 'home'   },
  { word: 'jug',   emoji: '🏺', category: 'home'   },
  { word: 'map',   emoji: '🗺️', category: 'nature' },
  { word: 'top',   emoji: '🪀', category: 'home'   },
  // ── Medium: 4-letter words ───────────────────────────────────────────
  { word: 'frog',  emoji: '🐸', category: 'animal' },
  { word: 'fish',  emoji: '🐟', category: 'animal' },
  { word: 'duck',  emoji: '🦆', category: 'animal' },
  { word: 'bird',  emoji: '🐦', category: 'animal' },
  { word: 'crab',  emoji: '🦀', category: 'animal' },
  { word: 'drum',  emoji: '🥁', category: 'home'   },
  { word: 'ship',  emoji: '🚢', category: 'home'   },
  { word: 'star',  emoji: '⭐', category: 'nature' },
  { word: 'flag',  emoji: '🚩', category: 'home'   },
  { word: 'bear',  emoji: '🐻', category: 'animal' },
  { word: 'deer',  emoji: '🦌', category: 'animal' },
  { word: 'wolf',  emoji: '🐺', category: 'animal' },
  { word: 'lamb',  emoji: '🐑', category: 'animal' },
  { word: 'worm',  emoji: '🪱', category: 'animal' },
  { word: 'swan',  emoji: '🦢', category: 'animal' },
  { word: 'seal',  emoji: '🦭', category: 'animal' },
  { word: 'cake',  emoji: '🎂', category: 'home'   },
  { word: 'bike',  emoji: '🚲', category: 'home'   },
  { word: 'kite',  emoji: '🪁', category: 'home'   },
  { word: 'bone',  emoji: '🦴', category: 'home'   },
  { word: 'milk',  emoji: '🥛', category: 'home'   },
  { word: 'moon',  emoji: '🌙', category: 'nature' },
  { word: 'rain',  emoji: '🌧️', category: 'nature' },
  { word: 'mice',  emoji: '🐭', category: 'animal' },
  // ── Hard: 5-letter words (blends, clusters, CVCE) ───────────────────
  { word: 'snail', emoji: '🐌', category: 'animal' },
  { word: 'shark', emoji: '🦈', category: 'animal' },
  { word: 'skunk', emoji: '🦨', category: 'animal' },
  { word: 'grape', emoji: '🍇', category: 'nature' },
  { word: 'plant', emoji: '🪴', category: 'nature' },
  { word: 'tiger', emoji: '🐯', category: 'animal' },
  { word: 'horse', emoji: '🐎', category: 'animal' },
  { word: 'koala', emoji: '🐨', category: 'animal' },
  { word: 'panda', emoji: '🐼', category: 'animal' },
  { word: 'zebra', emoji: '🦓', category: 'animal' },
  { word: 'llama', emoji: '🦙', category: 'animal' },
  { word: 'sloth', emoji: '🦥', category: 'animal' },
  { word: 'otter', emoji: '🦦', category: 'animal' },
  { word: 'moose', emoji: '🫎', category: 'animal' },
  { word: 'train', emoji: '🚂', category: 'home'   },
  { word: 'truck', emoji: '🚛', category: 'home'   },
  { word: 'tulip', emoji: '🌷', category: 'nature' },
  { word: 'toast', emoji: '🍞', category: 'home'   },
];

// Dolch Pre-Primer + Primer sight words (52 total)
const SIGHT_WORDS = [
  // Pre-Primer (20)
  'the','a','and','is','it','in','on','I','see','look','can','go','my','we','he','she','to','up','run','big',
  // Primer (32 — 'she' already above)
  'away','blue','come','down','find','for','funny','get','help','here','jump','little','make','me','not','now',
  'one','play','red','ride','said','saw','say','so','soon','that','there','they','this','too','want','well',
  'went','what','where','who','will','with','yes','yellow','you',
];

// Story moments — triggered every 5 total words across all games
const STORY_MOMENTS = [
  { sentence: 'Cat sat. Cat napped.',        scene: '🐱😴' },
  { sentence: 'The big dog ran!',             scene: '🐶💨' },
  { sentence: 'A frog sat on a log.',         scene: '🐸🪵' },
  { sentence: 'I see a red bug.',             scene: '🐛❤️' },
  { sentence: 'The duck can swim!',           scene: '🦆💦' },
  { sentence: 'Look! A fish in the sea!',     scene: '🐟🌊' },
  { sentence: 'We can run and jump and play!',scene: '🌟'   },
  { sentence: 'I can read! I can read!',      scene: '📖✨' },
];

// 30 animal stickers (in order of award)
const STICKERS = ['🐱','🐶','🐷','🐸','🦊','🐰','🐔','🦇','🐛','🐌','🦈','🦨','🐟','🦆','🐦','🦀','🐮','🦁','🐯','🐺','🦋','🐝','🐢','🦎','🐙','🦑','🐬','🐘','🦒','🦓'];

// Sticker animal names (for TTS)
const STICKER_NAMES = ['cat','dog','pig','frog','fox','bunny','hen','bat','caterpillar','snail','shark','skunk','fish','duck','bird','crab','cow','lion','tiger','wolf','butterfly','bee','turtle','lizard','octopus','squid','dolphin','elephant','giraffe','zebra'];

// Letters used as distractors (never include x, q, z — confusing at this age)
const DISTRACTOR_POOL = 'bdfghjklmnprstvw'.split('');

// Flash card colors for spotter (cycles through)
const FLASH_COLORS = ['flash-color-0','flash-color-1','flash-color-2','flash-color-3','flash-color-4','flash-color-5'];

// 18 sentences — blank word has emoji shown in-place as the clue
const SENTENCES = [
  { sentence: 'The ___ sat on the mat.',      blank: 'cat',   emoji: '🐱' },
  { sentence: 'I see a big ___.',              blank: 'dog',   emoji: '🐶' },
  { sentence: 'The ___ went in the mud.',      blank: 'pig',   emoji: '🐷' },
  { sentence: 'The ___ is up in the sky.',     blank: 'sun',   emoji: '☀️' },
  { sentence: 'A ___ is on my head.',          blank: 'hat',   emoji: '🎩' },
  { sentence: 'The ___ sat on a log.',         blank: 'frog',  emoji: '🐸' },
  { sentence: 'I can see a ___.',              blank: 'fish',  emoji: '🐟' },
  { sentence: 'The ___ can swim fast.',        blank: 'duck',  emoji: '🦆' },
  { sentence: 'Look at the big ___.',          blank: 'bear',  emoji: '🐻' },
  { sentence: 'I see a ___ in the sky.',       blank: 'bird',  emoji: '🐦' },
  { sentence: 'I can see the ___.',            blank: 'moon',  emoji: '🌙' },
  { sentence: 'The ___ is so bright!',         blank: 'star',  emoji: '⭐' },
  { sentence: 'Look at the big ___.',          blank: 'shark', emoji: '🦈' },
  { sentence: 'The ___ runs so fast.',         blank: 'horse', emoji: '🐎' },
  { sentence: 'A ___ likes to sleep.',         blank: 'sloth', emoji: '🦥' },
  { sentence: 'I see a ___ on a leaf.',        blank: 'snail', emoji: '🐌' },
  { sentence: 'The ___ is black and white.',   blank: 'panda', emoji: '🐼' },
  { sentence: 'Look at the big ___!',          blank: 'tiger', emoji: '🐯' },
];

// Word Families — 12 rime pattern families
const WORD_FAMILIES = [
  { rime: '-at', members: ['cat','bat','hat','rat','mat','pat'] },
  { rime: '-og', members: ['dog','log','fog','hog','bog','jog'] },
  { rime: '-ug', members: ['bug','jug','mug','hug','rug','tug'] },
  { rime: '-un', members: ['sun','run','fun','bun','gun','nun'] },
  { rime: '-ip', members: ['dip','hip','lip','rip','sip','tip'] },
  { rime: '-ig', members: ['big','dig','fig','jig','pig','wig'] },
  { rime: '-ed', members: ['bed','fed','led','red','wed','shed'] },
  { rime: '-op', members: ['top','hop','mop','pop','cop','drop'] },
  { rime: '-ap', members: ['map','cap','lap','nap','tap','rap'] },
  { rime: '-ub', members: ['tub','cub','hub','rub','sub','club'] },
  { rime: '-in', members: ['bin','fin','pin','tin','win','thin'] },
  { rime: '-an', members: ['van','can','fan','man','pan','ran'] },
];

// Story Reader stories — 6 short 3-sentence illustrated stories
const STORIES = [
  {
    title: 'The Cat and the Hat',
    sentences: ['The cat sat on the mat.', 'The hat fell on the cat.', 'The cat ran away fast!'],
    scene: '🐱🎩',
    question: 'Did the cat sit on the hat?',
    choices: ['Yes!', 'No!'],
    correct: 'No!',
  },
  {
    title: 'A Frog on a Log',
    sentences: ['A big frog sat on a log.', 'The frog saw a bug.', 'The frog ate the bug up!'],
    scene: '🐸🪵',
    question: 'What did the frog eat?',
    choices: ['A fish', 'A bug'],
    correct: 'A bug',
  },
  {
    title: 'The Red Bird',
    sentences: ['A red bird sat in a tree.', 'It saw the sun come up.', 'The bird sang a song!'],
    scene: '🐦🌅',
    question: 'What did the bird do?',
    choices: ['It flew away', 'It sang a song'],
    correct: 'It sang a song',
  },
  {
    title: 'The Big Duck',
    sentences: ['A big duck went to swim.', 'The duck saw a fish.', 'They swam in the pond!'],
    scene: '🦆🐟',
    question: 'Where did they swim?',
    choices: ['In a pond', 'In the sea'],
    correct: 'In a pond',
  },
  {
    title: 'Milk and a Cup',
    sentences: ['I got a big cup.', 'I put milk in the cup.', 'I drank it all up!'],
    scene: '🥛🥤',
    question: 'What was in the cup?',
    choices: ['Milk', 'Water'],
    correct: 'Milk',
  },
  {
    title: 'The Moon at Night',
    sentences: ['The moon came up at night.', 'I saw a star by the moon.', 'I went to bed and slept!'],
    scene: '🌙⭐',
    question: 'What did I see by the moon?',
    choices: ['A cloud', 'A star'],
    correct: 'A star',
  },
];
