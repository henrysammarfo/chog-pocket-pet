// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ChogPocketJar} from "../contracts/ChogPocketJar.sol";

contract MockChog is ERC20 {
    constructor() ERC20("Chog", "CHOG") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract MockChogNft {
    mapping(uint256 => address) public ownerOf;

    function mint(address to, uint256 tokenId) external {
        ownerOf[tokenId] = to;
    }
}

/// @dev ERC-20 that returns no bool. SafeERC20 must accept it.
contract BareToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external {
        allowance[msg.sender][spender] = amount;
    }

    function transfer(address to, uint256 amount) external {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
    }

    function transferFrom(address from, address to, uint256 amount) external {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
    }
}

/// @dev Delivers 90% of the pulled amount.
contract FeeToken is ERC20 {
    constructor() ERC20("Fee", "FEE") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _spendAllowance(from, _msgSender(), amount);
        _transfer(from, to, amount - amount / 10);
        return true;
    }
}

/// @dev After a successful transferFrom, calls back into the feeder.
contract CallbackToken is ERC20 {
    bool public armed;

    constructor() ERC20("Callback", "CB") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function arm() external {
        armed = true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        bool ok = super.transferFrom(from, to, amount);
        if (armed) {
            armed = false;
            (bool success, bytes memory ret) = from.call(abi.encodeWithSignature("steal()"));
            if (!success) {
                assembly {
                    revert(add(ret, 0x20), mload(ret))
                }
            }
        }
        return ok;
    }
}

contract Feeder {
    function approve(MockChog token, address spender) external {
        token.approve(spender, type(uint256).max);
    }

    function approveCallback(CallbackToken token, address spender) external {
        token.approve(spender, type(uint256).max);
    }

    function feed(ChogPocketJar target, uint256 tokenId, uint256 amount) external {
        target.feed(tokenId, amount);
    }

    function steal() external {
        // The jar address is msg.sender when the token calls back, so the
        // feeder must know the jar. It is stored as the token's caller target
        // via the immutable set in the test by calling setJar first.
        jar.withdraw(stealAmount);
    }

    ChogPocketJar public jar;
    uint256 public stealAmount;

    function setJar(ChogPocketJar next, uint256 amount) external {
        jar = next;
        stealAmount = amount;
    }
}

contract ChogPocketJarTest is Test {
    MockChog internal token;
    MockChogNft internal nft;
    ChogPocketJar internal jar;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant MIN = 50 ether;
    uint256 internal constant DAY = 1 days;

    function setUp() public {
        token = new MockChog();
        nft = new MockChogNft();
        jar = new ChogPocketJar(address(token), address(nft), MIN, owner);
        nft.mint(alice, 1);
        nft.mint(bob, 2);
        token.mint(alice, 10_000 ether);
        token.mint(bob, 10_000 ether);
        vm.prank(alice);
        token.approve(address(jar), type(uint256).max);
        vm.prank(bob);
        token.approve(address(jar), type(uint256).max);
        vm.warp(2_000 * DAY + 123);
    }

    function _next(uint64 last, uint32 streak, uint64 day) internal pure returns (uint32) {
        if (last == day) return streak;
        if (last != 0 && last + 1 == day) return streak + 1;
        return 1;
    }

    function _feed(address who, uint256 tokenId, uint256 amount) internal {
        vm.prank(who);
        jar.feed(tokenId, amount);
    }

    function test_constructorRejectsZeroToken() public {
        vm.expectRevert(ChogPocketJar.ZeroAddress.selector);
        new ChogPocketJar(address(0), address(nft), MIN, owner);
    }

    function test_constructorRejectsZeroNft() public {
        vm.expectRevert(ChogPocketJar.ZeroAddress.selector);
        new ChogPocketJar(address(token), address(0), MIN, owner);
    }

    function test_constructorRejectsZeroOwner() public {
        vm.expectRevert(ChogPocketJar.ZeroAddress.selector);
        new ChogPocketJar(address(token), address(nft), MIN, address(0));
    }

    function test_constructorRejectsZeroMinFeed() public {
        vm.expectRevert(abi.encodeWithSelector(ChogPocketJar.AmountTooSmall.selector, 0, 1));
        new ChogPocketJar(address(token), address(nft), 0, owner);
    }

    function test_firstFeedSetsStreakToOne() public {
        _feed(alice, 1, MIN);
        ChogPocketJar.Pocket memory pocket = jar.getPocket(alice);
        assertEq(pocket.saved, MIN);
        assertEq(pocket.streak, 1);
        assertEq(pocket.lastFeedDay, jar.today());
        assertEq(pocket.activeTokenId, 1);
        assertTrue(pocket.hasPet);
        assertEq(token.balanceOf(address(jar)), MIN);
    }

    function test_dayZeroIsNotTheDayBeforeDayOne() public {
        vm.warp(1 * DAY + 10);
        _feed(alice, 1, MIN);
        assertEq(jar.getPocket(alice).streak, 1);
    }

    function test_sameDayFeedKeepsStreakAndAddsSaved() public {
        _feed(alice, 1, MIN);
        _feed(alice, 1, 100 ether);
        ChogPocketJar.Pocket memory pocket = jar.getPocket(alice);
        assertEq(pocket.streak, 1);
        assertEq(pocket.saved, MIN + 100 ether);
    }

    function test_nextDayIncrementsStreak() public {
        _feed(alice, 1, MIN);
        vm.warp(block.timestamp + DAY);
        _feed(alice, 1, MIN);
        assertEq(jar.getPocket(alice).streak, 2);
    }

    function test_gapResetsStreak() public {
        _feed(alice, 1, MIN);
        vm.warp(block.timestamp + 3 * DAY);
        _feed(alice, 1, MIN);
        assertEq(jar.getPocket(alice).streak, 1);
        assertEq(jar.getPocket(alice).saved, MIN * 2);
    }

    function test_notYourChog() public {
        vm.prank(bob);
        vm.expectRevert(ChogPocketJar.NotYourChog.selector);
        jar.feed(1, MIN);
    }

    function test_amountTooSmall() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(ChogPocketJar.AmountTooSmall.selector, MIN - 1, MIN));
        jar.feed(1, MIN - 1);
    }

    function test_withdrawPartialAndFull() public {
        _feed(alice, 1, 200 ether);
        vm.prank(alice);
        jar.withdraw(50 ether);
        assertEq(jar.getPocket(alice).saved, 150 ether);
        assertEq(jar.getPocket(alice).withdrewOnDay, jar.today());
        assertEq(token.balanceOf(alice), 10_000 ether - 150 ether);

        vm.prank(alice);
        jar.withdraw(150 ether);
        assertEq(jar.getPocket(alice).saved, 0);
        assertEq(token.balanceOf(address(jar)), 0);
        assertEq(jar.getPocket(alice).streak, 1);
    }

    function test_withdrawDoesNotRequireNft() public {
        _feed(alice, 1, MIN);
        nft.mint(bob, 1);
        vm.prank(alice);
        jar.withdraw(MIN);
        assertEq(jar.getPocket(alice).saved, 0);
    }

    function test_withdrawZeroAndTooMuch() public {
        _feed(alice, 1, MIN);
        vm.prank(alice);
        vm.expectRevert(ChogPocketJar.BadAmount.selector);
        jar.withdraw(0);
        vm.prank(alice);
        vm.expectRevert(ChogPocketJar.BadAmount.selector);
        jar.withdraw(MIN + 1);
    }

    function test_pauseBlocksFeedNotWithdraw() public {
        _feed(alice, 1, 100 ether);
        vm.prank(owner);
        jar.pause();
        assertTrue(jar.paused());

        vm.prank(alice);
        vm.expectRevert();
        jar.feed(1, MIN);

        vm.prank(alice);
        jar.withdraw(40 ether);
        assertEq(jar.getPocket(alice).saved, 60 ether);

        vm.prank(owner);
        jar.unpause();
        _feed(alice, 1, MIN);
        assertEq(jar.getPocket(alice).saved, 110 ether);
    }

    function test_strangerCannotPause() public {
        vm.prank(alice);
        vm.expectRevert();
        jar.pause();
    }

    function test_twoStepOwnership() public {
        address next = makeAddr("next");
        vm.prank(owner);
        jar.transferOwnership(next);
        assertEq(jar.owner(), owner);
        vm.prank(next);
        vm.expectRevert();
        jar.pause();
        vm.prank(next);
        jar.acceptOwnership();
        assertEq(jar.owner(), next);
        vm.prank(next);
        jar.pause();
        assertTrue(jar.paused());
    }

    function test_reentrancyOnWithdrawIsRejected() public {
        CallbackToken bad = new CallbackToken();
        MockChogNft pics = new MockChogNft();
        ChogPocketJar hooked = new ChogPocketJar(address(bad), address(pics), MIN, owner);
        Feeder feeder = new Feeder();
        pics.mint(address(feeder), 7);
        bad.mint(address(feeder), 1_000 ether);
        feeder.approveCallback(bad, address(hooked));
        feeder.setJar(hooked, MIN);
        bad.arm();
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        feeder.feed(hooked, 7, MIN);
        assertEq(hooked.getPocket(address(feeder)).saved, 0);
        assertEq(bad.balanceOf(address(hooked)), 0);
    }

    function test_feeOnTransferFeedReverts() public {
        FeeToken fee = new FeeToken();
        ChogPocketJar strict = new ChogPocketJar(address(fee), address(nft), MIN, owner);
        fee.mint(alice, 1_000 ether);
        vm.startPrank(alice);
        fee.approve(address(strict), type(uint256).max);
        vm.expectRevert(abi.encodeWithSelector(ChogPocketJar.AmountTooSmall.selector, MIN - MIN / 10, MIN));
        strict.feed(1, MIN);
        vm.stopPrank();
        assertEq(strict.getPocket(alice).saved, 0);
    }

    function test_bareTokenFeedAndWithdraw() public {
        BareToken bare = new BareToken();
        ChogPocketJar plain = new ChogPocketJar(address(bare), address(nft), MIN, owner);
        bare.mint(alice, 1_000 ether);
        vm.startPrank(alice);
        bare.approve(address(plain), type(uint256).max);
        plain.feed(1, MIN);
        plain.withdraw(MIN);
        vm.stopPrank();
        assertEq(plain.getPocket(alice).saved, 0);
        assertEq(bare.balanceOf(alice), 1_000 ether);
    }

    function test_ethAndUnknownCallsRevert() public {
        vm.deal(address(this), 1 ether);
        (bool ok,) = address(jar).call{value: 1 ether}("");
        assertFalse(ok);
        (bool okData,) = address(jar).call{value: 1 ether}(hex"1234");
        assertFalse(okData);
        assertEq(address(jar).balance, 0);
    }

    function test_pocketsGetterMatchesGetPocket() public {
        _feed(alice, 1, MIN);
        (
            uint256 saved,
            uint64 lastFeedDay,
            uint32 streak,
            uint64 withdrewOnDay,
            uint256 activeTokenId,
            bool hasPet
        ) = jar.pockets(alice);
        ChogPocketJar.Pocket memory pocket = jar.getPocket(alice);
        assertEq(saved, pocket.saved);
        assertEq(lastFeedDay, pocket.lastFeedDay);
        assertEq(streak, pocket.streak);
        assertEq(withdrewOnDay, pocket.withdrewOnDay);
        assertEq(activeTokenId, pocket.activeTokenId);
        assertEq(hasPet, pocket.hasPet);
    }

    function test_walletsAreIsolated() public {
        _feed(alice, 1, MIN);
        _feed(bob, 2, 80 ether);
        assertEq(jar.getPocket(alice).saved, MIN);
        assertEq(jar.getPocket(bob).saved, 80 ether);
        assertEq(token.balanceOf(address(jar)), MIN + 80 ether);
    }

    function testFuzz_feedSequenceMatchesStreak(uint8 steps, uint256 salt) public {
        steps = uint8(bound(steps, 1, 24));
        uint64 day = 10;
        uint64 last = 0;
        uint32 streak = 0;
        uint256 saved = 0;
        for (uint256 i = 0; i < steps; i++) {
            uint64 jump = uint64(uint256(keccak256(abi.encode(salt, i))) % 4);
            day += jump;
            vm.warp(uint256(day) * DAY + 50);
            uint256 amount = MIN + (uint256(keccak256(abi.encode(salt, i, "amt"))) % 20 ether);
            _feed(alice, 1, amount);
            streak = _next(last, streak, day);
            last = day;
            saved += amount;
            ChogPocketJar.Pocket memory pocket = jar.getPocket(alice);
            assertEq(pocket.streak, streak);
            assertEq(pocket.saved, saved);
            assertEq(pocket.lastFeedDay, day);
        }
        assertEq(token.balanceOf(address(jar)), saved);
    }

    function testFuzz_withdrawNeverExceedsSaved(uint96 feedAmt, uint96 take) public {
        uint256 amount = bound(feedAmt, MIN, 5_000 ether);
        token.mint(alice, amount);
        _feed(alice, 1, amount);
        uint256 requested = bound(take, 0, amount * 2);
        if (requested == 0 || requested > amount) {
            vm.prank(alice);
            vm.expectRevert(ChogPocketJar.BadAmount.selector);
            jar.withdraw(requested);
            assertEq(jar.getPocket(alice).saved, amount);
        } else {
            vm.prank(alice);
            jar.withdraw(requested);
            assertEq(jar.getPocket(alice).saved, amount - requested);
            assertEq(token.balanceOf(address(jar)), amount - requested);
        }
    }

    function testFuzz_streakFormula(uint64 last, uint32 streak, uint64 day) public pure {
        last = uint64(bound(last, 0, 20_000));
        day = uint64(bound(day, 0, 20_000));
        streak = uint32(bound(streak, 0, 1_000_000));
        uint32 got = _next(last, streak, day);
        if (last == day) assertEq(got, streak);
        else if (last != 0 && last + 1 == day) assertEq(got, streak + 1);
        else assertEq(got, 1);
    }

    function test_deployGas() public {
        bytes memory initCode = abi.encodePacked(
            type(ChogPocketJar).creationCode,
            abi.encode(address(token), address(nft), MIN, owner)
        );
        uint256 gasStart = gasleft();
        address deployed;
        assembly {
            deployed := create(0, add(initCode, 0x20), mload(initCode))
        }
        uint256 used = gasStart - gasleft();
        assertTrue(deployed != address(0));
        console2.log("creation gas", used);
        assertLt(used, 3_000_000);
    }
}
