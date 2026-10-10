// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PayLink} from "../src/PayLink.sol";

/// @notice Deploys PayLink and prints the address in a greppable line.
/// Usage:
///   forge script script/DeployPayLink.s.sol:DeployPayLink --rpc-url bot_testnet --broadcast --private-key $PRIVATE_KEY
contract DeployPayLink is Script {
    function run() external returns (PayLink payLink) {
        vm.startBroadcast();
        payLink = new PayLink();
        vm.stopBroadcast();

        console.log("PayLink deployed at:", address(payLink));
    }
}