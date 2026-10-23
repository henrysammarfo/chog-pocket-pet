// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Chog Pocket Jar
/// @author Chog Pocket
/// @notice Personal $CHOG savings jar for Monad mainnet (chain id 143).
/// @dev Pockets are keyed by wallet, not by token id. Selling the Chog does not
///      trap the coins: withdraw does not check the NFT. Streak math matches
///      src/lib/streak.ts exactly. Same UTC day keeps the streak, the next day
///      adds one, and any gap or the first feed sets it to 1. lastFeedDay 0
///      means "never" and is not the day before day 1.
///
///      $CHOG is assumed to be a standard ERC-20: it returns a success bool,
///      takes no fee, and does not rebase. A feed credits `amount` only after
///      the contract's balance rises by at least that much, so a fee-on-transfer
///      token cannot create an unbacked balance. The whole transaction reverts
///      if the transfer fails.
///
///      The owner can pause new feeds and hand over the owner role in two steps.
///      The owner cannot move a user's saved $CHOG and cannot pause withdrawals,
///      so a pause cannot trap funds. There is no upgrade switch.
contract ChogPocketJar is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice $CHOG token held by the jar.
    IERC20 public immutable chog;

    /// @notice Chog picture collection. feed requires msg.sender to own the token.
    IERC721 public immutable nft;

    /// @notice Smallest feed that counts, in token base units.
    uint256 public immutable minFeed;

    /// @notice One wallet's jar.
    /// @param saved $CHOG this wallet can withdraw.
    /// @param lastFeedDay UTC day of the last feed. 0 means never.
    /// @param streak Consecutive feed days, using the rules in the contract notice.
    /// @param withdrewOnDay UTC day of the last withdrawal. 0 means never.
    /// @param activeTokenId Chog used on the most recent feed.
    /// @param hasPet True after the first successful feed.
    struct Pocket {
        uint256 saved;
        uint64 lastFeedDay;
        uint32 streak;
        uint64 withdrewOnDay;
        uint256 activeTokenId;
        bool hasPet;
    }

    /// @notice Jar state for each wallet.
    mapping(address => Pocket) public pockets;

    /// @notice Emitted when a feed is recorded.
    /// @param owner Wallet that set $CHOG aside.
    /// @param tokenId Chog that was held for the feed.
    /// @param amount Amount credited to the jar.
    /// @param streak Streak stored after this feed.
    /// @param day UTC day of the feed.
    event Fed(address indexed owner, uint256 indexed tokenId, uint256 amount, uint32 streak, uint64 day);

    /// @notice Emitted when saved $CHOG is sent back to its owner.
    /// @param owner Wallet that withdrew.
    /// @param amount Amount sent.
    /// @param remaining Amount still saved after the withdrawal.
    event Withdrawn(address indexed owner, uint256 amount, uint256 remaining);

    /// @notice An address argument was the zero address.
    error ZeroAddress();

    /// @notice msg.sender does not own this Chog.
    error NotYourChog();

    /// @notice The amount is below the minimum that counts, or the token delivered less.
    /// @param received Amount offered or actually delivered.
    /// @param minimum Minimum that would have counted.
    error AmountTooSmall(uint256 received, uint256 minimum);

    /// @notice Withdrawal amount was zero or more than this wallet's saved balance.
    error BadAmount();

    /// @notice Plain ETH and unknown calls are refused.
    error EthNotAccepted();

    /// @notice Deploy the jar.
    /// @param chogToken $CHOG token. Must not be zero.
    /// @param chogNft Chog picture collection. Must not be zero.
    /// @param minimumFeed Smallest feed that counts. Must not be zero.
    /// @param initialOwner Account that may pause feeds and start an ownership handoff.
    constructor(address chogToken, address chogNft, uint256 minimumFeed, address initialOwner)
        Ownable(_nonZero(initialOwner))
    {
        if (chogToken == address(0) || chogNft == address(0)) revert ZeroAddress();
        if (minimumFeed == 0) revert AmountTooSmall(0, 1);
        chog = IERC20(chogToken);
        nft = IERC721(chogNft);
        minFeed = minimumFeed;
    }

    /// @notice Current UTC day, `block.timestamp / 1 days`.
    /// @return day Day index used by the streak.
    function today() public view returns (uint64 day) {
        day = uint64(block.timestamp / 1 days);
    }

    /// @notice Read one wallet's jar in a single call.
    /// @param account Wallet to read.
    /// @return pocket The stored pocket.
    function getPocket(address account) external view returns (Pocket memory pocket) {
        pocket = pockets[account];
    }

    /// @notice Set $CHOG aside for a Chog you currently hold.
    /// @dev Checks, then effects, then the token transfer, then a balance post-check.
    ///      Reentrancy into feed or withdraw reverts. Same-day feeds add to `saved`
    ///      and leave the streak unchanged. That matches src/lib/streak.ts.
    /// @param tokenId Chog the caller must own.
    /// @param amount $CHOG to pull. Must be at least `minFeed`.
    function feed(uint256 tokenId, uint256 amount) external nonReentrant whenNotPaused {
        if (amount < minFeed) revert AmountTooSmall(amount, minFeed);
        if (nft.ownerOf(tokenId) != msg.sender) revert NotYourChog();

        Pocket storage pocket = pockets[msg.sender];
        uint64 day = today();
        uint32 streak;
        if (pocket.lastFeedDay == day) {
            streak = pocket.streak;
        } else if (pocket.lastFeedDay != 0 && pocket.lastFeedDay + 1 == day) {
            streak = pocket.streak + 1;
        } else {
            streak = 1;
        }

        pocket.saved += amount;
        pocket.lastFeedDay = day;
        pocket.streak = streak;
        pocket.activeTokenId = tokenId;
        pocket.hasPet = true;

        emit Fed(msg.sender, tokenId, amount, streak, day);

        uint256 beforeBal = chog.balanceOf(address(this));
        chog.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = chog.balanceOf(address(this)) - beforeBal;
        if (received < amount) revert AmountTooSmall(received, amount);
    }

    /// @notice Send some of your own saved $CHOG back to you.
    /// @dev Effects are written before the transfer. Pause does not block this,
    ///      and the caller does not need to still hold the Chog.
    /// @param amount Amount to withdraw. Must be non-zero and no more than `saved`.
    function withdraw(uint256 amount) external nonReentrant {
        Pocket storage pocket = pockets[msg.sender];
        if (amount == 0 || amount > pocket.saved) revert BadAmount();
        pocket.saved -= amount;
        pocket.withdrewOnDay = today();
        uint256 remaining = pocket.saved;
        emit Withdrawn(msg.sender, amount, remaining);
        chog.safeTransfer(msg.sender, amount);
    }

    /// @notice Stop new feeds. Withdrawals stay open.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Allow feeds again.
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Refuse plain ETH transfers.
    receive() external payable {
        revert EthNotAccepted();
    }

    /// @notice Refuse unknown calls, including calls that carry ETH.
    fallback() external payable {
        revert EthNotAccepted();
    }

    /// @notice Revert when `account` is the zero address.
    /// @param account Address to check.
    /// @return account The same address, when it is not zero.
    function _nonZero(address account) private pure returns (address) {
        if (account == address(0)) revert ZeroAddress();
        return account;
    }
}
