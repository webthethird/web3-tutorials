// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

// Goals:
// 1. enter the lottery (by paying some amount)
// 2. Pick a random winner (verifiably random)
// 3. Select winner periodically in a completely automated way

// Chainlink Oracle -> Randomness, Automated Execution (Keepers)

error Raffle__NotEnoughETHToEnter();

contract Raffle {
    /* State Variables */
    uint256 private immutable __entranceFee;
    address payable[] private _players;

    constructor(uint256 entranceFee) {
        __entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        if (msg.value < __entranceFee) {
            revert Raffle__NotEnoughETHToEnter();
        }
        _players.push(payable(msg.sender));
    }

    // function pickRandomWinner() {}

    function getEntranceFee() public view returns (uint256) {
        return __entranceFee;
    }

    function getPlayer(uint256 playerIndex) public view returns (address) {
        return _players[playerIndex];
    }
}
