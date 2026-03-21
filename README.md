# Emma's Games

A browser-based learning app built for Emma (age 4-5). Reading, spelling, and math — no apps to install, just open a browser.

## Games

| Game | What Emma does |
|------|----------------|
| **Word Builder** | Taps letter tiles to spell a word shown as an emoji clue |
| **Sight Word Spotter** | Sees a flash card for 1.8 seconds, then identifies the word from 3 choices |
| **Word Decoder** | Taps tiles one-by-one to flip and reveal each letter of a word |
| **Sentence Builder** | Picks the missing word to complete a sentence |
| **Word Families** | Taps all words that share the same ending sound (-at, -og, etc.) |
| **Story Reader** | Reads a short story sentence by sentence with word highlighting, then answers a comprehension question |
| **Typing Practice** | Types words on an on-screen keyboard, letter by letter |
| **Sound It Out** | Drags a slider left-to-right under a word; each letter sounds as the handle passes it |
| **How Many?** | Sees two groups of emoji objects, counts the total, and taps the answer (addition) |

## Features

- Pick an animal companion (Bunny, Puppy, Fox, Froggy)
- Letters and words spoken aloud via Web Speech API
- Phonics hint button in Word Builder ("Sound it out!") speaks each letter
- Sound It Out slider game: drag to reveal and hear each letter; "Hear it!" hint auto-plays the word; Try Again button to repeat the same word
- Slower, deliberate TTS rates globally (letters 0.6, words 0.55, phrases 0.7) for better clarity at age 4-5
- Word Categories filter (Animals / Nature / Home / All) for Builder, Decoder, and Typing
- 64 words across three difficulty tiers: 3-letter CVC, 4-letter, 5-letter
- ~52 Dolch Pre-Primer + Primer sight words
- 12 word family rime patterns
- 6 illustrated short stories
- How Many? addition game: two emoji groups stay separate for counting, merge on correct answer; equation shown as reinforcement
- 35 math problems across two tiers (tier 1: sums to 5, tier 2: sums to 10 — dormant for now)
- Story Moments unlock every 5 words completed (across all games)
- Sticker Book — earn an animal sticker after each story moment
- Progress saved in localStorage
- Mobile-first, 80px+ touch targets, works on iPhone home screen

## How to run locally

Open `index.html` in any browser. No server, no install, no dependencies.

## How to save to iPhone home screen (feels like an app)

1. Open the site URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

## Project structure

```
emma-games/
├── index.html       — HTML screens and overlays (shell only)
├── main.css         — all CSS
├── data.js          — WORDS, SIGHT_WORDS, SENTENCES, WORD_FAMILIES, STORIES, MATH_PROBLEMS, constants
├── core.js          — save/load, TTS, shared state, hub, story moments, stickers
├── init.js          — page-load companion restore (runs last)
└── games/
    ├── builder.js   — Word Builder + category picker + phonics hint
    ├── spotter.js   — Sight Word Spotter
    ├── decoder.js   — Word Decoder
    ├── sentence.js  — Sentence Builder
    ├── families.js  — Word Families
    ├── reader.js    — Story Reader
    ├── typing.js    — Typing Practice
    ├── slider.js    — Sound It Out (drag slider to decode letters)
    └── addition.js  — How Many? (visual addition with emoji groups)
```

## Deployment (Render)

This is a static site — nothing to build.

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Static Site
3. Connect the GitHub repo
4. Settings:
   - **Root Directory:** `/` (or `emma-games/` if in a monorepo)
   - **Build Command:** *(leave blank)*
   - **Publish Directory:** `.`
5. Deploy — Render gives you a free `*.onrender.com` URL
