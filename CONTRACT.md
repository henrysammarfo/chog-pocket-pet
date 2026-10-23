# ChogPocketJar

Monad mainnet, chain id 143. Source: `contracts/ChogPocketJar.sol`. Solidity 0.8.24. OpenZeppelin v5.2.0.

The contract is **deployed** on Monad mainnet.

| | |
| --- | --- |
| Jar | [`0xf8Ae354fa05f315B81F2296D541021068CbbECde`](https://monadscan.com/address/0xf8Ae354fa05f315B81F2296D541021068CbbECde) |
| Deploy transaction | [`0x1a101535d455ac9a20970fd643ea6e566140778cd25da1020e5b919210ec732c`](https://monadscan.com/tx/0x1a101535d455ac9a20970fd643ea6e566140778cd25da1020e5b919210ec732c) |
| Sourcify | Exact match on chain 143 |
| App | [chog-pocket-pet-teamtitanlink.vercel.app](https://chog-pocket-pet-teamtitanlink.vercel.app) |

The gas number below is the dry-run estimate from before that broadcast. It is not a second deployment.

## Roles

| Role | Who | What they can do |
| --- | --- | --- |
| Feeder | Any wallet that holds the Chog it names | `feed`. Pulls $CHOG into that wallet's pocket. |
| Saver | The wallet that fed | `withdraw` its own `saved` balance. Does not need to still hold the Chog. |
| Owner | Deployer, then whoever accepts a handoff | `pause`, `unpause`, `transferOwnership`. Cannot move user funds. Cannot pause `withdraw`. |
| Pending owner | The address named in `transferOwnership` | `acceptOwnership` only. Cannot pause until it accepts. |

There is no fee collector and no upgrade admin.

## Config

| Parameter | Deploy default |
| --- | --- |
| Chain | Monad mainnet, id 143, RPC `https://rpc.monad.xyz` |
| $CHOG | `0x350035555E10d9AfAF1566AaebfCeD5BA6C27777` |
| Chog NFT | `0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763` (Chog Genesis, not printed on chog.xyz) |
| `minFeed` | 50 $CHOG (`50000000000000000000`), matching `MIN_FEED` in `src/lib/savings.ts` |
| Owner | Address of `PRIVATE_KEY` |

Override `CHOG_TOKEN`, `CHOG_NFT`, or `MIN_FEED` in the environment if you must. Do not put `PRIVATE_KEY` in a file that gets committed.

## Functions

| Function | Access | Notes |
| --- | --- | --- |
| `constructor(chogToken, chogNft, minimumFeed, initialOwner)` | Deploy | Reverts on a zero address or a zero minimum. |
| `chog()` | View | $CHOG token. Immutable. |
| `nft()` | View | Picture collection. Immutable. |
| `minFeed()` | View | Smallest feed that counts. |
| `today()` | View | `block.timestamp / 1 days`. |
| `pockets(account)` | View | Saved amount, last feed day, streak, last withdraw day, active token id, has-pet flag. |
| `getPocket(account)` | View | Same pocket as one struct. |
| `feed(tokenId, amount)` | Holder, not paused | Requires `ownerOf(tokenId) == msg.sender` and `amount >= minFeed`. Updates the streak, then pulls tokens. |
| `withdraw(amount)` | Saver | `amount` must be non-zero and no more than `saved`. Not pausable. |
| `pause()` / `unpause()` | Owner | Feeds only. |
| `transferOwnership(newOwner)` / `acceptOwnership()` | Owner / pending | Two-step. From OpenZeppelin `Ownable2Step`. |
| `owner()` / `pendingOwner()` / `paused()` | View | From OpenZeppelin. |
| `receive()` / `fallback()` | Anyone | Revert `EthNotAccepted`. |

## Streak

Same rules as `src/lib/streak.ts`. A day is a UTC day.

- First feed, or any gap longer than one day: streak becomes 1.
- Next UTC day: streak increases by 1.
- Same UTC day: streak stays, `saved` still increases.
- `lastFeedDay == 0` means never, and it is not "yesterday" when today is day 1.

## Events and errors

Events: `Fed`, `Withdrawn`, plus OpenZeppelin `Paused`, `Unpaused`, `OwnershipTransferred`, `OwnershipTransferStarted`.

Custom errors: `ZeroAddress`, `NotYourChog`, `AmountTooSmall`, `BadAmount`, `EthNotAccepted`. OpenZeppelin adds its own (`EnforcedPause`, `OwnableUnauthorizedAccount`, `ReentrancyGuardReentrantCall`, and others).

## Deploy

Install Foundry, then from the repo root:

```bash
forge test
export PRIVATE_KEY=...          # shell only
forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.monad.xyz
```

That command simulates. It does not deploy. Add `--broadcast` only when you intend to send the transaction.

The app defaults `NEXT_PUBLIC_JAR_ADDRESS` to `0xf8Ae354fa05f315B81F2296D541021068CbbECde`. The `feed` and `withdraw` selectors are unchanged. `feed` still requires the caller to own the named Chog Genesis token.

## Gas (dry run, not a deployment)

`forge script script/Deploy.s.sol:Deploy --rpc-url https://rpc.monad.xyz` on chain 143, one create transaction, no `--broadcast`:

**Estimated total gas: 1,262,530** (`0x1343c2`).

The simulation printed a max fee of 202 gwei and a base fee of 100 gwei, and an estimated cost of 0.25503106 MON at that quote. Fees move. The gas units are the figure to keep.

A unit test that `create`s the same bytecode inside a call measured 996,151 gas. That number excludes the outer transaction. Use 1,262,530 as the deploy estimate.
