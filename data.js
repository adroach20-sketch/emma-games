// =====================================================================
// DATA CONSTANTS
// =====================================================================

// Word Builder words — easy → medium → hard
// Sorted by length; within each tier words are shuffled at runtime.
const WORDS = [
  // ── Easy: 3-letter CVC ──────────────────────────────────────────────
  { word: 'cat',   emoji: '🐱' },
  { word: 'dog',   emoji: '🐶' },
  { word: 'pig',   emoji: '🐷' },
  { word: 'bug',   emoji: '🐛' },
  { word: 'sun',   emoji: '☀️' },
  { word: 'hat',   emoji: '🎩' },
  { word: 'fox',   emoji: '🦊' },
  { word: 'hen',   emoji: '🐔' },
  { word: 'bat',   emoji: '🦇' },
  { word: 'cup',   emoji: '🥤' },
  { word: 'bed',   emoji: '🛏️' },
  { word: 'nut',   emoji: '🥜' },
  { word: 'rat',   emoji: '🐀' },
  { word: 'van',   emoji: '🚐' },
  { word: 'log',   emoji: '🪵' },
  { word: 'ram',   emoji: '🐏' },
  { word: 'web',   emoji: '🕸️' },
  { word: 'pup',   emoji: '🐕' },
  { word: 'tub',   emoji: '🛁' },
  { word: 'jug',   emoji: '🏺' },
  { word: 'map',   emoji: '🗺️' },
  { word: 'top',   emoji: '🪀' },
  // ── Medium: 4-letter words ───────────────────────────────────────────
  { word: 'frog',  emoji: '🐸' },
  { word: 'fish',  emoji: '🐟' },
  { word: 'duck',  emoji: '🦆' },
  { word: 'bird',  emoji: '🐦' },
  { word: 'crab',  emoji: '🦀' },
  { word: 'drum',  emoji: '🥁' },
  { word: 'ship',  emoji: '🚢' },
  { word: 'star',  emoji: '⭐' },
  { word: 'flag',  emoji: '🚩' },
  { word: 'bear',  emoji: '🐻' },
  { word: 'deer',  emoji: '🦌' },
  { word: 'wolf',  emoji: '🐺' },
  { word: 'lamb',  emoji: '🐑' },
  { word: 'worm',  emoji: '🪱' },
  { word: 'swan',  emoji: '🦢' },
  { word: 'seal',  emoji: '🦭' },
  { word: 'cake',  emoji: '🎂' },
  { word: 'bike',  emoji: '🚲' },
  { word: 'kite',  emoji: '🪁' },
  { word: 'bone',  emoji: '🦴' },
  { word: 'milk',  emoji: '🥛' },
  { word: 'moon',  emoji: '🌙' },
  { word: 'rain',  emoji: '🌧️' },
  { word: 'mice',  emoji: '🐭' },
  // ── Hard: 5-letter words (blends, clusters, CVCE) ───────────────────
  { word: 'snail', emoji: '🐌' },
  { word: 'shark', emoji: '🦈' },
  { word: 'skunk', emoji: '🦨' },
  { word: 'grape', emoji: '🍇' },
  { word: 'plant', emoji: '🪴' },
  { word: 'tiger', emoji: '🐯' },
  { word: 'horse', emoji: '🐎' },
  { word: 'koala', emoji: '🐨' },
  { word: 'panda', emoji: '🐼' },
  { word: 'zebra', emoji: '🦓' },
  { word: 'llama', emoji: '🦙' },
  { word: 'sloth', emoji: '🦥' },
  { word: 'otter', emoji: '🦦' },
  { word: 'moose', emoji: '🫎' },
  { word: 'train', emoji: '🚂' },
  { word: 'truck', emoji: '🚛' },
  { word: 'tulip', emoji: '🌷' },
  { word: 'toast', emoji: '🍞' },
];

// 20 Dolch Pre-Primer sight words
const SIGHT_WORDS = ['the','a','and','is','it','in','on','I','see','look','can','go','my','we','he','she','to','up','run','big'];

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
