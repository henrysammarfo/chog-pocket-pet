# ChogPocketJar — security review

Internal review of `contracts/ChogPocketJar.sol` for Monad mainnet (chain id 143). This is not a third-party audit firm sign-off. The jar was later broadcast by the deployer. Do not treat this note as a promise that the jar is safe beyond the findings and tests below.

Deployed jar: [`0xf8Ae354fa05f315B81F2296D541021068CbbECde`](https://monadscan.com/address/0xf8Ae354fa05f315B81F2296D541021068CbbECde). Transaction: [`0x1a101535d455ac9a20970fd643ea6e566140778cd25da1020e5b919210ec732c`](https://monadscan.com/tx/0x1a101535d455ac9a20970fd643ea6e566140778cd25da1020e5b919210ec732c). Sourcify reports an exact match for that address on chain 143.

Reviewed code uses OpenZeppelin v5.2.0 (`SafeERC20`, `Ownable2Step`, `Pausable`, `ReentrancyGuard`), Solidity 0.8.24, optimizer 200 runs.

## Findings

| ID | Severity | Status | Issue | Fix |
| --- | --- | --- | --- | --- |
| J-1 | Low | Fixed | `feed` pulled tokens before writing the pocket (checks-effects-interactions miss). The hand-rolled lock did run first, so a callback could not re-enter, but the order was still wrong. | State and the `Fed` event are written first. `safeTransferFrom` runs after. `nonReentrant` stays on `feed` and `withdraw`. A callback that tries to withdraw is rejected and the whole feed reverts. |
| J-2 | Low | Fixed | `transfer` / `transferFrom` were checked as bool returns. A token that returns no data would look like a failure, and a token that returns `false` without reverting depends on the caller remembering to check. | `SafeERC20` accepts a bool or empty success data and reverts on failure. Covered by `BareToken` in the tests. |
| J-3 | Medium | Fixed | The constructor accepted a zero token, a zero NFT, a zero minimum, and had no owner check. A bad deploy would brick feeds or count a zero-value feed. | `ZeroAddress` for token, NFT, and owner. `AmountTooSmall` when `minFeed` is 0. |
| J-4 | Low | Fixed | Accounting used the balance delta, so a fee-on-transfer token could be handled, but a rebasing or short delivery could also desync `saved` from the real balance once other wallets share the contract. | The jar credits `amount` only. After the pull it reverts unless the contract balance rose by at least `amount`. A 10% fee token cannot open a pocket. $CHOG is assumed to be a standard token (no fee, no rebase). |
| J-5 | Info | Fixed | There was no way to stop a broken feed path without redeploying, and there was no owner at all. | `Ownable2Step`. `pause` / `unpause` are `onlyOwner` and apply to `feed` only. `withdraw` is not pausable, so the owner cannot trap funds. There is no function that moves another wallet's `saved` balance. Ownership changes only after `acceptOwnership`. |
| J-6 | Info | Accepted | Same-day feeds increase `saved` and leave the streak unchanged. | This matches `src/lib/streak.ts`. It is the product rule, not a bug. |
| J-7 | Info | Accepted | On UTC day 0, `lastFeedDay == 0` means both "never" and "fed today", so a first feed on day 0 would keep streak 0. | Day 0 is 1 January 1970. Monad timestamps are not in that day. The formula is intentionally identical to `nextStreak`, including "day 0 is not the day before day 1". |
| J-8 | Info | Accepted | The pocket is keyed by wallet. `withdraw` does not check that the caller still holds the Chog. | Selling the picture must not trap the coins. The app's token memory is a separate phone record. |
| J-9 | Info | Accepted | The streak uses `block.timestamp / 1 days`. | A validator can nudge a timestamp by a short bound. That can move a feed across a UTC midnight. Accepted for a daily streak. Slither's timestamp and strict-equality notes point at these day comparisons. |
| J-10 | Info | Accepted | `receive` and `fallback` revert, so normal ETH transfers fail. A selfdestruct or coinbase payment can still force a balance, and there is no ETH withdraw. | Forced ETH would sit stuck. The contract does not rely on an ETH balance. Slither's locked-ether note is this case. |
| J-11 | Info | Accepted | Slither also reports OpenZeppelin items: `transferOwnership(0)` clears the pending owner (intended in v5), assembly inside `SafeERC20`, unused `Context` helpers, and unindexed `Paused` / `Unpaused` addresses. | Left as upstream code. |

No critical or high issue remained in the original jar once the reentrancy lock was taken into account. Nothing in this review moves user funds to the owner.

## What the owner can and cannot do

Can: pause new feeds, unpause, and start a two-step ownership handoff.

Cannot: withdraw someone else's $CHOG, change `minFeed`, change the token or the NFT, upgrade the code, or pause withdrawals.

## Checks

- Foundry: 27 tests passed, including 3 fuzz tests at 256 runs each. `ChogPocketJar.sol` coverage is 100% lines (51/51), statements (60/60), branches (11/11), and functions (10/10). The deploy script is excluded from that figure because it is not exercised by the unit suite.
- Slither 0.11.6 on `contracts/ChogPocketJar.sol` with OpenZeppelin remapped. No high or medium detector fired on the jar. The informational detectors are J-9, J-10, and J-11.
- Deploy gas was estimated with `forge script` against `https://rpc.monad.xyz` (chain 143) **without** `--broadcast`. Estimated total gas for the one create transaction: **1,262,530**. A local `create` of the same bytecode used 996,151 gas inside the call. Neither figure is a mainnet deployment.

## Residual assumptions

- $CHOG (`0x350035555E10d9AfAF1566AaebfCeD5BA6C27777`) does not take a fee and does not rebase. A rebase that drops the contract balance below the sum of `saved` would make the last withdrawers fail.
- The Chog NFT `ownerOf` view is honest. A malicious NFT could lie about ownership; the configured collection is Chog Genesis, not an arbitrary token.
- The owner key is a real trust assumption for pausing feeds. It is not a custody assumption for the $CHOG.
- The jar is deployed at `0xf8Ae354fa05f315B81F2296D541021068CbbECde`. The app defaults `NEXT_PUBLIC_JAR_ADDRESS` to that address.

## Recheck after deploy

A second pass over the deployed source, focused on reentrancy, access control, pause, withdrawals, and events. No new defect turned up.

- Reentrancy: `feed` and `withdraw` are `nonReentrant`. Both write the pocket and emit before `safeTransfer` / `safeTransferFrom`. A token callback that calls back into the jar hits the guard and the whole transaction reverts. `feed` then checks that the jar balance rose by at least `amount`, so a short transfer cannot leave `saved` ahead of the tokens.
- Access control: `pause` and `unpause` are `onlyOwner`. Ownership moves only through `Ownable2Step` (`transferOwnership` then `acceptOwnership`). There is no function that sets another wallet's `saved` balance.
- Pause: `whenNotPaused` is only on `feed`. `withdraw` stays open, so a pause cannot trap funds.
- Withdraw only your own: `withdraw` reads `pockets[msg.sender]`, subtracts from that `saved`, and sends the tokens to `msg.sender`. Amount `0` or more than `saved` reverts `BadAmount`.
- Genesis gate: `feed` reverts `NotYourChog` unless `nft.ownerOf(tokenId) == msg.sender`. Holding some other NFT, or naming a Chog you do not hold, does not feed.
- Events: `Fed` is emitted with the feeder, token id, amount, streak, and day before the pull. `Withdrawn` is emitted with the saver, amount, and remaining balance before the send. Pause and ownership use the OpenZeppelin events.

The owner can still pause new feeds and hand the role on in two steps. The owner cannot withdraw someone else's $CHOG, change `minFeed`, change the token or the NFT, or upgrade the code.
