# User flows

The marketing site (`/`, `/gallery`, `/care`, `/collection`) introduces the pocket. The product itself lives under `/app`, with `/connect` for the wallet. Demo mode needs no wallet. Demo mode keeps set-aside and take-back on this phone. A connected wallet that holds a Chog Genesis can feed the deployed jar. The rules match the jar program.

Every screen has a way forward. On a phone the bottom bar is one row: Today, Jar, Arcade, Board, and More. More opens Streak, Traits, History, Pets, Settings, Gallery, For judges, and Connect wallet. The desktop sidebar still lists every pocket page. Settings and the sidebar also reach Connect and the marketing site.

## a. First-time visitor, no wallet

Someone who has never opened the pocket and has no wallet in the browser.

1. Land on `/`. Read the hero, how it works, the jar, traits, the streak, the Monad story, and the questions.
2. Tap **Open pocket**. That goes to `/app`.
3. See Bubblegum Chog, the mood, and one action: set aside today's $CHOG. A demo badge shows this is not a live wallet.
4. Optional: open Jar from the tab bar, or Traits and Streak from More. Each is a short page, not the whole product.
5. Optional: tap **Use my Chog**. That goes to `/connect`.

States:

- Empty: the jar is at 0, the streak is 0, history says nothing has been set aside.
- Loading: the pocket line "Opening the pocket…" if the save has not been read yet. Connect shows the choose-wallet card as soon as it is ready.
- Error: Connect with no wallet shows "No wallet found" and a way back to the demo.
- Success: not yet. The first success is a set-aside.

## b. Demo or trial user

Someone trying the loop with the sample Chogs.

1. Start on `/app`. Bubblegum is selected. The hand balance is 2500 $CHOG. The goal starts at 100.
2. Tap **Set aside 100 $CHOG**. The mood moves, coins leave the hand, and the jar fills. Stay on Today to see the celebration, or do the same action from `/app/jar`, which then opens the success screen at `/app/jar/done`.
3. Open `/app/streak` to see the day on the calendar and the mood rewards. **Demo: skip to tomorrow** moves the demo clock to the next morning. The streak stays alive for one missed morning.
4. Come back to `/app` and set aside again. The streak becomes 2.
5. Open `/app/pets` and choose another sample (Laser Wizard, Little Crown, Quiet One). The jar and the streak stay. The voice changes.
6. Open `/app/traits` to read that Chog's cards.
7. Open `/app/history` to see each set-aside, with the time, the colour of the move, and the jar balance after.
8. Open `/app/jar` to change the daily amount (50, 100, 250, 1000) before the next set-aside.
9. Open `/app/settings` and **Start over** to clear the jar, the streak, the clock, and the history.

States:

- Empty: jar 0, streak 0, history empty, no demo date until the clock is skipped.
- Loading: "Opening the pocket…"
- Error: a goal the hand cannot cover disables the set-aside and explains the shortfall (the sample "Quiet One" fixture with 40 $CHOG). A second set-aside on the same demo day says "Fed today" and points at the streak.
- Success: `/app/jar/done` after a jar set-aside, the celebration on Today, and a new history row.

## c. Chog NFT holder connecting a wallet

Someone who wants the pet to be a Chog they hold.

1. From Today or Settings, open `/connect`.
2. **Choose wallet.** The only connector is the injected browser wallet (MetaMask, Rabby, and others that can add Monad).
3. If the wallet is on another chain, the screen is **Wrong network**, with **Switch to Monad**.
4. On Monad, the app reads $CHOG and how many Chogs the wallet holds.
5. If the balance of Chogs is 0, the screen is **No Chog found**, with a token-id field if they know one, and a way back to the samples.
6. If a Chog is found, the screen is **Connected**. Pick **Use token**, or type a token id and **Open**. That picture becomes the pet on `/app` and `/app/pets`. The demo jar on this phone still holds the set-aside until a jar is deployed.
7. Settings shows the connected address and **Disconnect**.

States:

- Empty: not connected. Pets shows "No wallet yet" and a link to Connect.
- Loading: "Reading your $CHOG…", "Looking for your Chogs…", "Opening this Chog…".
- Error: no injected wallet; the wallet refuses the switch; the read from Monad fails; the token id is not theirs or has no traits.
- Success: connected on Monad, with the Chog name on the pets page and on Today.

## d. Daily returning user keeping a streak

Someone who already set $CHOG aside and comes back the next day.

1. Open `/app`. The mood matches the streak (waiting, if they have not fed this demo day).
2. The single action is today's set-aside, or "Fed today" if this day already counted.
3. Open `/app/streak`. Fed days in the current run are marked. Rewards unlock as the streak grows: day 1 nibbling, day 2 cozy, day 4 buzzing, day 7 glowing, day 14 legendary. The reward is the mood, not a second token.
4. One skipped morning keeps the streak. A second skipped morning rests it at 0 and the mood sulks until the next set-aside.
5. History keeps the earlier days.

States:

- Empty: streak 0 and an unmarked calendar.
- Loading: the same pocket loading line.
- Error: "Fed today" when they already set aside on this date. "Not enough $CHOG" when the hand cannot cover the goal.
- Success: the streak number goes up and the next reward unlocks.

## e. Someone who wants to take money back

Withdraw does not break the streak. The coins were always theirs.

1. Open `/app/jar`. See the hand, the jar, and the fill.
2. If the jar is empty, there is no take-back button. The page explains that and offers the set-aside instead.
3. If the jar has coins, tap **Take some back**. That opens `/app/jar/confirm`, which shows the jar emptying, the before and after balances, and says the streak stays.
4. **Cancel** returns to the jar. **Return the $CHOG** moves the coins back to the hand and opens `/app/jar/done`.
5. Today’s mood line adds that the coins are still theirs. The streak number does not change. History records the return.

States:

- Empty: jar at 0, confirm page (if opened directly) says the jar is empty and links back.
- Loading: the pocket loading line.
- Error: none beyond an empty jar. A take-back never exceeds what is saved.
- Success: `/app/jar/done` for a return, jar at 0, hand restored, streak unchanged.

## f. A judge exploring quickly

A two-minute pass with no wallet.

1. `/` for the story. No sign-in.
2. `/app` and set aside 100 $CHOG. Watch the celebration.
3. `/app/streak`, skip to tomorrow, return to `/app`, set aside again.
4. `/app/pets`, switch to Laser Wizard. `/app/traits` shows the laser eyes.
5. `/app/history` shows both days.
6. `/app/jar`, take some back, confirm, and read the success screen.
7. `/app/settings`, open **How this works**, turn on **1 day = 1 minute**, then **Start over**.
8. `/app/arcade`, start Chog Stack, and drop one block. The score lands on the pet. `/app/leaderboard` shows arcade points, including streaks about to break. `/judges` is the three-step pass.
9. `/connect` once, to see the no-wallet message, then **Back to samples**.
10. `/gallery`, `/care`, and `/collection` are the same visual system, and each links back to the pocket.

States: the judge should be able to hit empty (fresh history), success (set-aside and take-back), and the connect error, without a dead end on any of them.
