// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ChogPocketJar} from "../contracts/ChogPocketJar.sol";

/// @notice Dry-run or broadcast a ChogPocketJar deploy on Monad mainnet (chain id 143).
/// @dev The key is read from PRIVATE_KEY in the environment. Never commit it.
///      This script does not broadcast unless the caller passes --broadcast.
contract Deploy is Script {
    /// @notice $CHOG on Monad. Printed on chog.xyz.
    address internal constant DEFAULT_CHOG = 0x350035555E10d9AfAF1566AaebfCeD5BA6C27777;

    /// @notice Chog Genesis. The picture collection the app uses until the team names another.
    address internal constant DEFAULT_NFT = 0xc96d31F8626c6D03Fae5dCD3d61e3FB9F4a73763;

    /// @notice 50 $CHOG. Matches MIN_FEED in src/lib/savings.ts.
    uint256 internal constant DEFAULT_MIN_FEED = 50 ether;

    /// @notice Deploy the jar. Owner is the address of PRIVATE_KEY.
    /// @return jar The deployed jar.
    function run() external returns (ChogPocketJar jar) {
        uint256 key = vm.envUint("PRIVATE_KEY");
        address token = vm.envOr("CHOG_TOKEN", DEFAULT_CHOG);
        address nft = vm.envOr("CHOG_NFT", DEFAULT_NFT);
        uint256 minimumFeed = vm.envOr("MIN_FEED", DEFAULT_MIN_FEED);
        address owner = vm.addr(key);

        vm.startBroadcast(key);
        jar = new ChogPocketJar(token, nft, minimumFeed, owner);
        vm.stopBroadcast();

        console2.log("jar", address(jar));
        console2.log("owner", owner);
        console2.log("chainId", block.chainid);
    }
}
