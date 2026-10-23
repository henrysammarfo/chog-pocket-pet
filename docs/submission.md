# Chog Pocket Pet

## What it is

Chog Pocket is a phone-first pet game. The pet is the Chog Genesis picture you hold, not a shared off-chain mascot like Chog Pet (chogpet.xyz). The picture is the pet, and the savings are a real $CHOG jar on Monad.

Each Chog has traits: eyes, mouth, hat, clothes, and the rest. Those traits pick a personality. A sweet Chog sounds sweet. A wild one gets loud. A proud one struts. A quiet one curls up.

You feed the pet by setting $CHOG aside once a day. The coins are still yours. You can take them back whenever you want. What you cannot fake is the streak: the number of days in a row you set something aside. The mood follows that streak, spoken in the personality the traits chose.

Take the Chog away and there is no pet. A different Chog, with the same streak and the same jar, is a different mood.

## How the Chog picture is used

The app reads the Chog you hold and the traits published with it. Those traits are the personality. Sample Chogs in demo mode are made up, but they use trait names that really appear on the collection, so you can feel the difference with no wallet.

On Monad, "Use my Chog" looks through the collection for pictures in your wallet. The pet on screen is that picture. If the picture file does not load, the traits still drive the mood.

The picture collection address is a setting. The official Chog site prints the $CHOG coin address and does not print a picture-collection address. The default here is the Chog Genesis collection, because those pictures have traits. Details are in the README.

## How $CHOG is used

Feeding is saving. Once a day you move a chosen amount of $CHOG (50, 100, 250, or 1000) into a jar. The streak goes up if yesterday also counted. The same day does not count twice. Miss a day and the next set-aside starts again at day one. Taking coins back does not wipe the streak. The pet just mentions it.

In demo mode the jar is on the phone, so judges can play the whole loop with no wallet and no coins. The rules are the same ones the jar program uses.

The jar is deployed on Monad at `0xf8Ae354fa05f315B81F2296D541021068CbbECde` ([explorer](https://monadscan.com/address/0xf8Ae354fa05f315B81F2296D541021068CbbECde), [deploy tx](https://monadscan.com/tx/0x1a101535d455ac9a20970fd643ea6e566140778cd25da1020e5b919210ec732c), Sourcify exact match). The review is in AUDIT.md. Foundry has 27 tests. Demo mode still plays the whole loop with no wallet. A connected wallet with no Chog Genesis sees a card that links to the collection and sends no transaction. A wallet under 50 $CHOG sees a card that links to a Monad DEX and to the token on Monadscan. Holding a Genesis Chog is what `feed` checks on chain.

## How to try it

1. Open the site. The first screen is the landing page: the pet, the jar, the streak, and Monad. No wallet, no sign-in.
2. Open the pocket. You land on Today, with Bubblegum Chog and one action.
3. Read the mood, then open Traits for the cards.
4. Tap "Set aside 100 $CHOG".
5. Open Streak, tap "Demo: skip to tomorrow", go back to Today, and set some aside again.
6. Open Pets and switch to Laser Wizard. The same streak sounds different.
7. Jar is where you take coins back (it asks first). History lists what happened. Settings has "How this works", the 1 day = 1 minute clock, and "Use my Chog", which opens the wallet screen. Pets shows why the Chog is the pet, and the memory a buyer inherits. The arcade (`/app/arcade`) has six games. A sample Chog can play them. Holding a Chog Genesis doubles the score that feeds the mood, the streak, and the leaderboard. The leaderboard lists streaks and arcade points. `/judges` is the three-step pass. Gallery, Care, and Collection stay in the same look. The steps for each kind of person are in USER_FLOWS.md.

## 60-second demo script

0:00 Open the app, then the pocket. Say: "This is Bubblegum Chog. The pet is the Chog, and these traits make it sweet. It is peckish because nothing is set aside today."

0:12 Tap "Set aside 100 $CHOG". Say: "Feeding is saving. The coins move into the jar. They are still mine. That is day one, so it is nibbling."

0:25 Tap "Demo: skip to tomorrow". Say: "The streak is still alive, and the pet is waiting up. If I skip again without feeding, the streak rests."

0:38 Feed again. Say: "Two days. Now it is cozy."

0:45 Tap Laser Wizard. Say: "Same jar, same streak, different Chog. The laser eyes make it wild, so cozy comes out as fizzing. Remove the Chog and there is no pet."

0:55 If a wallet is connected, tap "Use my Chog" and show the real picture. If not, say: "Demo mode is the full loop. On Monad the pet is the Chog Genesis you hold, and the jar takes real $CHOG."

## What is new, and what is next

People have used NFTs as tickets and profile pictures. Here the NFT is a pet whose character comes from its own traits, and the daily reason to come back is a savings habit in $CHOG, not a coin you burn.

Next: watch a few people keep a streak, and let a household switch which Chog is "out" for the day without moving the savings. No user interviews are in this build yet.

## What the form asks for

| Form item | Where it is |
| --- | --- |
| Project name | Chog Pocket Pet |
| What it does, and what is new | This page, and the README |
| Why the Chog NFT is essential | "How the Chog picture is used". Remove the picture and there is no pet, no trait voice, and no arcade boost. `feed` reverts unless the caller owns that Genesis token. |
| Working demo | https://chog-pocket-pet-teamtitanlink.vercel.app |
| Testing instructions | "How to try it" above. `npm test` and `npm run test:e2e` |
| Tech stack | Next.js, React, TypeScript, Tailwind, wagmi, viem, Solidity, Foundry. Monad chain 143. |
| Pre-existing work | Six arcade games, credited in `licenses/arcade/`. OpenZeppelin in the jar. |
| Banner | `public/brand/banner.png` |
| What's next | The paragraph above |

Still for the form, not stored in this repo: team Discord and X handles, a demo video of up to 3 minutes (YouTube or Google Drive), and the public repository link once the project has one.
