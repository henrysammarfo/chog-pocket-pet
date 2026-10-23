# Chog Pocket — feature plan

Henry is already registered for Chogathon. This plan covers the pocket features after the inner-page polish. The jar in `contracts/ChogPocketJar.sol` is keyed by wallet, so a buyer of the NFT cannot inherit the on-chain jar from a read. Token memory is a phone record keyed by token id. The program is reviewed in AUDIT.md and is deployed at `0xf8Ae354fa05f315B81F2296D541021068CbbECde`.

## 5. Arcade

Henry approved six open-source games. They live at `/app/arcade`, not `/app/play`. There is no play stub. A sample Chog can play with no wallet. A Chog Genesis in the connected wallet doubles the score that reaches the pet. The games do not grant a streak freeze. The only covers stay the Laser trait shield and the Keeper streak freeze.

Each score above zero writes the pet’s mood, adds one play morning on a new day, and shows on the leaderboard. A higher savings streak still wins over the play streak. Playing again the same day does not add another morning.

| Game | Route | Upstream | Licence |
| --- | --- | --- | --- |
| Chog Stack | `/app/arcade/stack` | iamkun/tower_game | MIT |
| Chog Tower 3D | `/app/arcade/tower` | KonradLinkowski/Stack | MIT |
| Chog Dash | `/app/arcade/dash` | wayou/t-rex-runner | BSD-3-Clause |
| Floppy Chog | `/app/arcade/floppy` | nebez/floppybird | Apache-2.0 |
| Chog 2048 | `/app/arcade/coin2048` | gabrielecirulli/2048 | MIT |
| Chog Snack Hunt | `/app/arcade/snack` | MattSurabian/DuckHunt-JS | MIT |

Licence files and credits are in `licenses/arcade/`. Art is original navy, neon, and peach pictures in `public/arcade/` (Chog frames, neon pipes, rug, candle, snacks, clouds, skyline). Upstream sprites are not shipped. Floppy Chog replaces the original art. Snack Hunt rebuilds the Nintendo art as snacks. Tower uses lit three.js slabs and shadows. Every game answers the keyboard and a tap or swipe, and ends on a card that says the points landed on the Chog.

Files:

- `src/lib/arcade.ts`, `src/lib/coin2048.ts`, `src/lib/memory.ts`, `src/lib/memory-store.ts`
- `src/components/arcade/*`
- `src/app/app/arcade/page.tsx`, `src/app/app/arcade/[game]/page.tsx`
- `src/lib/leaderboard.ts` — arcade column, and the active pet stays visible even below the top five
- Nav entry in `src/components/app/app-shell.tsx`

Tests:

- Unit: a pet can play, Genesis doubles the points, one play morning per day, the opening 2048 slide merges to 4, and #88 leads the arcade board at 90.
- Browser: each game starts, answers its key, and (except the first flap) banks a score. A stacked point shows as Arcade cozy, a 1-day streak, and Bubblegum Chog on the arcade board.

## Design

Match the pocket that is already shipped. No new illustration style.

- Navy `#010828`, card `#071033`, neon `#6FFF00`, cream `#EFF4FF`, peach `#F4845F`.
- Figurines already in `/figures` (`bubblegum.png`, `laser.png`, `crown.png`, `quiet.png`). Heroes use `PageHero`. The jar uses `JarMark`.
- Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96. Radius 12 / 18 / 24, plus pill on buttons.
- Buttons 48px tall below 640px and 44px from 640px up (`--control`). Focus ring is 2px neon, 3px offset.
- New copy avoids yield, return, and betting language. History titles that already say "returned" stay, because the existing tests look for that word.

## Order

### 1. Token-bound memory

The streak, the lifetime jar total, and the mood history travel with the Chog’s token id. A sample is keyed `sample:<id>`. A held Chog is keyed `token:<tokenId>`. Pets shows the active record and a seeded Chog #123 (14-day streak, 2,000 $CHOG, moods Beloved / Beaming / Cozy) so a buyer can see what they inherit. Lifetime jar total grows when coins are set aside and does not shrink when coins are taken back.

Files:

- `src/lib/memory.ts` — record shape, key, credit.
- `src/lib/memory-store.ts` — `localStorage` book. The server snapshot is one constant so React does not loop.
- `src/components/app/use-pocket.ts` — `rememberPet` after a successful set-aside.
- `src/app/app/pets/page.tsx` — memory card and inherited card.

Tests:

- Unit: `memoryKey`, and `creditMemory` stores streak, jar total, and the mood title.
- Browser: feed once, open Pets, see a 1-day streak and 100 $CHOG, and see Chog #123 still at 14 days and 2,000 $CHOG.

### 2. Traits change a rule, and the Chog is essential

Each trait changes one rule of the pocket. Laser or fire eyes cover exactly one missed morning and do not consume anything. Bubblegum appends “Bubblegum sweetens this mood.” without changing the mood id. A crown fills the jar picture 1.5× (capped at 100) and does not change `jarFill` itself. A quiet Chog (origin skin, or crying / sad / closed eyes) only changes the line. `Why your Chog matters` says “Without a Chog, there is no pet” on Pets and Traits.

Files:

- `src/lib/trait-rules.ts`
- `src/lib/shield.ts` — `missedOneDay`, `coverMiss` for the trait, then the freeze.
- `src/lib/present.ts` — optional `covered` flag, only for the trait shield.
- `src/components/app/why-chog.tsx`
- `src/app/app/traits/page.tsx`

Tests:

- Unit: Laser has a shield, Bubblegum sweetens, crown picture fill is 1.5×, quiet is present, a trait cover lets the next feed continue the streak, a longer gap does not.
- Browser: Traits shows “Bonus mood” on Bubblegum and “Streak shield” after switching to Laser Wizard. The why card is on the page.

### 3. X share card

Public line, exact: `Chog #123 · 14-day streak · 2,000 $CHOG saved`. Sample display numbers are bubblegum 11, laser 22, crown 33, quiet 44. A real token id wins. The button opens an X intent. The image is `GET /share/card` (1200×630, peach ground, same line). No `runtime` export on that route.

Files:

- `src/lib/share-card.ts`
- `src/components/app/share-button.tsx`
- `src/app/share/card/route.tsx`
- Wired from `src/app/app/pets/page.tsx` (active pet and the inherited #123).

Tests:

- Unit: the line, the comma in 2,000, and the sample numbers.
- Browser: the inherited share button’s `data-line` is the exact sentence.

### 4. Leaderboard

`/app/leaderboard`, labeled Board. Three lists: longest streak, biggest jar, and Chogs that set aside yesterday and not yet today. Seed field: #88 streak 21, #56 jar 6,500, #123 / #14 / #7 at risk. The active pet is merged in when its memory has a streak, a jar total, or arcade points. Seed arcade scores: #88 90, #56 70, #123 55, #14 20, #7 8. The phone’s Chog stays on the arcade list even when it is below those five.

Files:

- `src/lib/leaderboard.ts`
- `src/app/app/leaderboard/page.tsx`
- Nav entry in `src/components/app/app-shell.tsx`

Tests:

- Unit: longest starts at #88, biggest at #56, at-risk order is 123, 14, 7.
- Browser: those three test ids contain those token numbers.

### 6. $CHOG holder tiers

A balance read only. No transaction. Visitor under 500 $CHOG, plain jar, no freeze. Peach from 500, peach jar skin, no freeze. Keeper from 2,000, peach skin and one streak freeze. The demo hand is 2,500, so it starts as Keeper with one freeze. The freeze is spent only from the streak page, and only for a gap of exactly one day. It does not hide a broken streak by itself. Spending it checks the tier again.

Files:

- `src/lib/tiers.ts`
- `src/components/app/jar-mark.tsx` — `skin="peach"` recolors the lid.
- Jar pages pass `tier.skin`.
- `src/app/app/settings/page.tsx` — holder card.
- `src/app/app/streak/page.tsx` — “Use streak freeze”.
- `src/lib/demo-store.ts` — `freezeLeft`.

Tests:

- Unit: the three tiers, and a freeze cover spends the one freeze while a disallowed freeze does nothing.
- Browser: Settings shows “Keeper”.

### 7. Demo speed

Settings toggles “1 day = 1 minute”. `pocketDay` uses 60 seconds or 86,400. Switching speed remaps “fed today” and “fed yesterday”. Skipping ahead adds 60 seconds in minute mode, or jumps to the next morning otherwise. The streak page uses that day index, not a raw UTC day, so the freeze button lines up with the clock.

Files:

- `src/lib/demo-clock.ts`
- `src/components/app/use-pocket.ts` — `setSpeed`, `skipDay`, minute tick.
- `src/app/app/settings/page.tsx` — `speed-toggle`.

Tests:

- Unit: a minute clock, a skip of 60 seconds, and a feed-day shift that keeps “fed today”.
- Browser: the toggle heading reads “1 day = 1 minute”.

### 8. Judges page

`/judges` uses the marketing shell. Three steps: set aside on Today with no wallet, read why the Chog matters on Pets, then turn on the minute clock in Settings and open the share card and the leaderboard. Copy says demo mode moves no coins. A connected Genesis holder can use the deployed jar.

Files:

- `src/app/judges/page.tsx`
- Footer link from `src/components/app/app-shell.tsx`

Tests:

- Browser: the three step titles are on the page, and every link on `/judges` is clicked by the crawl.

## Test run

`npm test` for the unit files above (`src/lib/pocket-features.test.ts`, `src/lib/arcade.test.ts`, plus the existing pocket tests). `npm run test:e2e` clicks every visible link, including `/app/arcade` and each game, `/app/leaderboard`, and `/judges`. There is no `/app/play` route. `npx tsc --noEmit` and `npx eslint src e2e --max-warnings 0` before a production build.
