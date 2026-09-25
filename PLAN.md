# Proposal Project Plan (v2)

## 1. Goal
A mobile-first web experience, fully in Myanmar language, where she plays
through a series of short games and puzzles. Each one she clears unlocks the
next. After the last one, the real question appears: "will you be my girlfriend?"
Her answer (and an optional message from her) is emailed to you automatically.

## 2. Locked decisions
| Topic | Decision |
|---|---|
| Kind | Ask her to be my girlfriend |
| Language | Myanmar (Unicode), with embedded webfont so it renders on any phone |
| Structure | Intro -> 5 levels (games/puzzles) -> final question -> answer sent to email |
| Tech | Plain HTML/CSS/JS with ES modules. No framework, no build step. |
| Hosting | **Vercel**: https://be-mine-taupe-six.vercel.app/ (live 2026-09-25), noindex via vercel.json |
| Email | Web3Forms -> **khaingwutyiwin1712@gmail.com** (decided). Access key goes in js/email.js |

## 3. Experience flow
```
[0] Intro       "ခဏလေး ကစားကြည့်ပါ..."  her name, soft animation, "Start"
[1] Level 1     Quiz about us          (facts only she would know; 1 true + 3 funny wrong. NOT feelings questions - those belong on the final screen)
[2b] Bonus     "Ma Ma thinks I am..."  no-wrong-answer card, every option passes (optional, between level 2 and 3)
[2] Level 2     Memory match           (flip cards: places / foods / moments we share)
[3] Level 3     Photo jigsaw / slide puzzle   (a photo of us, or a place)
[4] Level 4     Catch the hearts       (tap game, reach a score; timed, forgiving)
[5] Level 5     Unlock the lock        (a 4-6 digit code; the answer is a date or number only she'd know; riddle clues in Burmese)
[6] The letter  Short personal message, typed out letter by letter
[7] Question    "ခိုင့် ချစ်သူ ဖြစ်ပေးမလား?"  big and clear
[8] Answer      buttons -> emailed to you -> thank-you screen (different per answer)
```
Between levels: a progress bar (hearts filling up), a one-line reveal
("Level 1 cleared: the first thing I noticed about you was...").
Every level clear unlocks a piece of the final message, so the games *build*
toward the question instead of being random filler.

## 4. Game design rules
- **Never let her get stuck.** Every level has a hint button, and after 3 failed
  attempts a "skip" appears. Frustration kills the mood.
- **Each level under 90 seconds.** Whole thing 6-8 minutes max.
- **Personal > clever.** Quiz questions and code clues must be about you two.
  A generic puzzle feels like a template; a puzzle about "the cafe where we first
  talked" feels like you.
- **Progress saved** in localStorage so if she closes the tab she resumes, not restarts.
- **Touch-first.** Big tap targets, no hover-only interactions, no drag precision
  needed (jigsaw uses tap-to-swap, not free drag).
- No autoplay sound. Optional mute-by-default music toggle only.

## 5. Answer + email flow
Buttons on the final screen:
- **ဖြစ်ပေးမယ် (Yes)**  -> confetti, "yes" screen
- **စဉ်းစားချိန်ပေးပါ (Give me time)** -> warm, no-pressure screen
- Optional free-text box: "ပြောချင်တာရှိရင်..." (anything you want to say)

On submit, the page POSTs to the form service which emails you:
```
Subject: [Proposal] Answer: YES
Answer:   yes / need-time
Message:  <her text, if any>
Time:     2026-xx-xx hh:mm (local)
Levels:   completed 5/5, skipped: none
```
Failure handling: if the request fails (offline, service down), the page still
shows the thank-you screen and says "screenshot this and send it to me" so the
moment isn't broken by a network error. It also retries once in the background.

Why a form service instead of our own backend: no server to run, no secrets to
leak beyond a public form key, free tier is enough for one submission. The key
being public is acceptable because the URL is unguessable and the worst case is
a spam email to you.

## 6. Myanmar language notes
- Use **Unicode**, not Zawgyi. Embed **Noto Sans Myanmar** (or Padauk) via
  Google Fonts so text renders correctly even on a phone with Zawgyi system font.
- Line-height 1.7-1.9 for Burmese; stacked diacritics get clipped at 1.4.
- No `letter-spacing`, no `text-transform`, no forced `word-break: break-all`.
- Font size min 18px on mobile for readability.
- For word-scramble style puzzles, scramble **syllables** or whole words, never
  individual characters (combining marks break).
- All copy lives in one file (`content/copy.js`) so wording can be tweaked
  without touching game code.

## 7. Project structure
```
Proposal/
  index.html
  css/
    base.css        fonts, colors, layout, Burmese typography
    screens.css     per-screen styles, transitions
  js/
    app.js          screen router, progress, localStorage
    content.js      ALL Burmese text, quiz Q&A, code answer, letter text
    email.js        submit answer to form service, retry, fallback
    confetti.js     tiny canvas confetti, no dependency
    games/
      quiz.js
      memory.js
      jigsaw.js
      hearts.js
      lock.js
  assets/
    photos/         (kept out of any public repo)
    sounds/         optional
  PLAN.md
```

## 8. Content to gather (from you)
- [x] Her name: Kiki. Site addresses her as "Ma Ma" (မမ) throughout. You refer to yourself as "ခိုင်" (never ကျွန်တော်); possessive form is ခိုင့်.
- [x] 5 quiz questions: js/content.js (Q3 hint = "Kin Neko matcha & berry", from the photo)
- [x] Memory match: 6 photo cards cut from Telegram folder (corgi, Kin Neko table, heart cloud, shadow heart, sundae, kitten) - swap any if you want
- [x] Jigsaw photo: assets/photos/gift-dog-block.jpg (from Telegram folder)
- [x] Lock code: her birthday as DDMM = 1409 (assumes Sept 14; change `lock.code` in js/content.js if wrong)
- [ ] The 5 "reveal" lines shown after each level
- [ ] The letter text (5-8 lines, sincere, specific)
- [ ] Exact wording of the final question
- [ ] Wording for the Yes screen and the Give-me-time screen
- [ ] Color / vibe (her favorite color; default: warm rose + cream)
- [x] Email: khaingwutyiwin1712@gmail.com via Web3Forms, key in js/email.js, test submission accepted 2026-09-25

## 9. Build steps
1. Write `content.js` first with all Burmese text. Review wording together.
2. Scaffold app shell: screen router, progress hearts, transitions.
3. Build games one at a time, easiest first: quiz -> memory -> lock -> hearts -> jigsaw.
4. Letter + question + answer screens, confetti.
5. Wire email service, test a real submission to your inbox.
6. Test on your actual phone: portrait, dark mode, slow network, Zawgyi-font phone if possible.
7. Host on Netlify/Vercel with a random path (e.g. /for-<name>-<random>), add noindex.
8. Full dry run start to finish, time it, cut anything that drags.
9. Decide the moment: send the link, or hand her your phone.

## 10. Guardrails
- Skip buttons exist. The games are a gift, not a test.
- Photos never go into a public git repo; deploy folder only.
- Have a plan for "give me time" that is as gracious as the "yes" one.
- Keep total play time under 8 minutes.

## 11. Timeline
- Day 1: content (section 8), agree on games and wording
- Day 2-3: build app shell + 5 games
- Day 4: final screens, email, polish, phone testing
- Day 5: host, dry run, pick the moment

## 12. Build log
- 2026-09-25: app shell (intro, level intro, progress hearts, level clear, localStorage resume), Level 1 quiz complete with real content and photos. Email module written (needs Web3Forms key). Photos imported from Telegram folder and resized; 6 memory-card faces cut.
- 2026-09-25 (later): Levels 2-5 built (memory match, jigsaw, catch the hearts, lock 1409). Letter (typewriter, placeholder text), question, answer -> email, thank-you screens, confetti. Dev: ?reset clears progress, ?level=N jumps to level N.
- 2026-09-25 (sounds): fixed hearts game class clash. Added js/sound.js (Web Audio, unlock on first tap, mute button top-right, persisted). 23 CC0 clips from Kenney (Interface Sounds + female Voiceover Pack) converted offline to 22 kHz WAV via headless Chrome because the network was ~9 KB/s. Wired: button click, card flip/match, quiz correct/wrong + voice, heart catch, keypad, unlock + voice, level clear chime + 'level up', letter typing tick, question sting, yes = 'congratulations' + 'you win'.
- 2026-09-25 (polish): replaced 'level up' / 'mission completed' / 'you win' voice lines with synthesized bell jingles (js/sound.js JINGLES). Added js/fx.js: emoji bursts, floating hearts, heart rain. Restart button on the thank-you screen; hidden 7-tap reset on the speaker button. npm start / npm run start:phone.
- 2026-09-25 (music): 'correct' and 'congratulations' voices replaced by bell jingles. Added js/music.js: original music-box background loop (C-Am-F-G / C-Am-Dm-G, 92 BPM) synthesized in Web Audio, fades in on Start, follows the mute button. Voice lines left: ready, go, time over.
- 2026-09-25 (design): minimalist restyle (flat bg, 1px-bordered cards, calmer buttons), Myanmar type scale reduced (body 15px), keep-all line breaking, shorter hint/skip labels, question split on two lines. Letter v1 written into content.js. Verified at iPhone 12 mini size (375x812) via _shots.html harness + headless Chrome (dev only, excluded by .vercelignore).
- 2026-09-25 (email): Web3Forms key wired; API returned success on a browser-style test submission. Note: Web3Forms free plan rejects pure server-side calls, so only test from a real browser.
- 2026-09-25 (deploy): live at https://be-mine-taupe-six.vercel.app/. Dev files were publicly served, so vercel.json now rewrites PLAN.md, content/, _shots.html, package.json to a 404. Redeploy needed.
- Next: redeploy, real iPhone test on the live URL (layout, sound, music, a real Give-me-time submission), then pick the moment.
