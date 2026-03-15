# Emma's Word Games ✨

A browser-based reading and spelling game built for Emma (age 4-5). No apps to install — just open a browser.

## What it does

- Emma picks an animal companion (Bunny, Puppy, Fox, or Froggy)
- A picture clue appears — she taps letter tiles to spell the word
- Letters speak their name when tapped; the full word is spoken aloud when complete
- Celebration with confetti and her name after every correct word
- Tap the emoji picture for a hint (hears the word)
- 26 words across three difficulty tiers: 3-letter → 4-letter → 5-letter
- Works on phone and computer; designed for touch-first

## How to run locally

Just open `index.html` in any browser. No server, no install, no dependencies.

## How to save to iPhone home screen (feels like an app)

1. Open the site URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

The game will appear as an app icon on her home screen.

## Deployment (Render)

This is a static site — one HTML file, nothing to build.

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Static Site
3. Connect the GitHub repo
4. Settings:
   - **Root Directory:** `/` (or `emma-games/` if in a monorepo)
   - **Build Command:** *(leave blank)*
   - **Publish Directory:** `.`
5. Deploy — Render gives you a free `*.onrender.com` URL

## Word list

Words are split into three tiers and played in order (easy first):

| Tier | Words |
|------|-------|
| Easy (3-letter) | cat, dog, pig, bug, sun, hat, fox, hen, bat, cup, bed, nut |
| Medium (4-letter) | frog, fish, duck, bird, crab, drum, ship, star, flag |
| Hard (5-letter) | snail, shark, skunk, grape, plant |

To add words: edit the `WORDS` array in `index.html`. Each entry needs `word` (string) and `emoji` (unambiguous emoji clue).

## Roadmap

- [ ] v2: Sight word flash cards (the, and, look, is, a...)
- [ ] v2: Sticker reward collection after N words
- [ ] v3: Typing mode (keyboard input) for computer skills practice
- [ ] v3: More word categories (animals, food, colors)
