# Design

Chog Pocket is one navy, neon, and peach system. The marketing pages and the pocket use the same colours, type, and corners. A phone shows one bottom row. A wide screen shows the sidebar.

## Colour

| Token | Hex | Use |
| --- | --- | --- |
| Navy | `#010828` | Page background |
| Navy raised | `#071033` | Sidebar, sheets, game boards |
| Neon | `#6FFF00` | Primary action, active tab, scores, links |
| Cream | `#EFF4FF` | Body text |
| Peach | `#F4845F` | Warm accent, a second block colour, snacks |
| Gold | `#F5B942` | A doubled score, the 2048 coin |
| Muted cream | `#EFF4FF` at 70% | Inactive tab labels |

Neon text on navy is the bright pair. Navy text on neon is the button pair. Do not put neon text on a neon fill. Do not invent a new green.

## Type

| Role | Face | Where |
| --- | --- | --- |
| Display | Anton | Page titles, tab labels, scores |
| Kicker | Condiment | The script line above a title |
| Body | Inter | Sentences |
| Marketing serif | Fraunces, DM Serif Display | Landing and care headlines only |
| Soft | Nunito | Marketing body where the template uses it |

Titles are uppercase Anton. Kickers are neon Condiment. Body stays sentence case. Tab labels are 11px Anton. A phone title can wrap. It does not end in an ellipsis if the name still fits on two lines.

## Spacing

The scale is `--space-1` through `--space-9`: 4, 8, 12, 16, 24, 32, 48, 64, 96px. Page padding is 16px. Gaps inside a page are 16px. Do not invent a one-off 13px gap.

## Radius

| Token | Size | Use |
| --- | --- | --- |
| `--radius-12` | 12px | Thumbnails, tiles |
| `--radius-18` | 18px | Rows, the game board |
| `--radius-24` | 24px | Cards, the More sheet top |
| `--radius-pill` | 999px | Buttons and the active tab |

A control that is meant to be a pill uses `rounded-full`. Other buttons keep the corner of their card.

## Shadow and surface

Cards can use the liquid-glass hairline. A raised sheet uses `0 -24px 80px rgba(0, 0, 0, 0.45)`. A hero, when it needs lift, uses `0 24px 80px rgba(0, 0, 0, 0.35)`. Shadows are soft and dark. They are not coloured glows around every box.

## Motion

Short and physical. Tile slides are about 140ms. A score blink is 180ms. A sheet rises in 220ms. A Chog reveal is about 420ms. The jar fill is about 1.15s. `prefers-reduced-motion: reduce` turns these animations off. Canvas games keep their physics. They do not depend on the CSS animation to be playable.

## Navigation

Mobile is one row, stuck to the bottom, with safe-area padding. Five items, each an icon plus a short label, each at least 44px tall:

1. Today
2. Jar
3. Arcade, in the centre, with a slightly larger icon and neon even when it is not the current page
4. Board
5. More

The current item is a neon pill with navy text and icon. More uses that same pill when the open page lives in the sheet, and while the sheet is open.

More opens a bottom sheet. The sheet has a drag handle, a blurred navy backdrop, and rows at least 44px tall: Streak, Traits, History, Pets, Settings, Gallery, For judges, Connect wallet. Drag the handle down, tap the backdrop, or press Escape to close it. The sheet is not a second tab row.

Desktop, from the large breakpoint up, keeps the sidebar with every pocket page. The bottom row is hidden there. The sidebar label for the wallet stays "Connect a wallet".

While a game is in play, or on its game-over card, the bottom row hides. The phone header becomes one compact row: back to the arcade, the game name, and the score. The sidebar stays on desktop.

## Layout

One job per page. Today feeds the pet. Jar moves coins. A game plays. Do not put the whole product on one screen.

The primary action sits above the fold. On a phone that is the feed button, the set-aside, or the game canvas, without scrolling past a second hero.

A hero on an inner page stays under about 35% of the viewport. Game pages use a compact header: a small pet thumb, the kicker, the title, and a way back. They do not repeat the large peach hero.

## Games

The canvas is full width on a phone and fills the space under the compact header, about 70% of the viewport or more, down to the safe area. Sprites keep their shape: extra height is sky, not a stretch. Chog 2048 stays a square at full width. The licence line sits below the fold. The six games keep the feel of the open-source originals and the navy, neon, and peach pictures in `public/arcade/`. Upstream sprites are not shipped.

Screenshots of a game are taken mid-play: the crane has swung, the slab is off centre, the Chog is in the air, the pipes are on screen, the coins have merged, the snacks are flying. An empty start overlay is not a game screenshot.

A finished game shows the score, the line "points landed on your Chog", Share on X as a button, and Play again. A Chog Genesis doubles that score. A sample Chog can still play.

## Accessibility

Body text on navy meets WCAG AA. The neon button uses navy text, not white. Inactive labels can be quieter. They are not the only way to tell pages apart: the current page also has the pill and `aria-current`.

Tap targets are at least 44px. The pocket control size is 48px, and 44px from the small breakpoint up. Focus is a 2px neon outline with a 3px offset.

Pictures that are decoration have an empty alt. The pet name and the score are text, not only colour. Reduced motion is respected for CSS. Sound has a mute toggle, stored on this phone.

## Pre-ship checklist

- Mobile nav is one row of five. More opens the sheet and lists Streak, Traits, History, Pets, Settings, Gallery, For judges, and Connect wallet.
- A game in play hides that row and shows back, the name, and the score.
- Desktop still shows the sidebar.
- Each inner page has one job. The primary action is above the fold. The hero is under about 35% of the viewport.
- Each game canvas is above the fold on a phone. New game shots are mid-play, desktop and mobile.
- Contrast, 44px targets, and reduced motion still hold.
- Unit tests and Playwright pass. Demo mode works with no wallet.
- No secrets in the commit. The jar contract is untouched. Do not claim the jar is deployed or safe.
