// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

// Goals:
// 1. enter the lottery (by paying some amount)
// 2. Pick a random winner (verifiably random)
// 3. Select winner periodically in a completely automated way

// Chainlink Oracle -> Randomness, Automated Execution (Keepers)

error Raffle__NotEnoughETHToEnter();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    /* State Variables */
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_entranceFee;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    address payable[] private s_players;
    address payable private s_recentWinner;

    /* Events */
    event RaffleEnter(
        address indexed entrant,
        uint256 indexed entryValue,
        uint256 totalEntrants
    );

    event RequestedRaffleWinner(uint256 indexed requestId);

    event WinnerPicked(address indexed winner);

    constructor(
        address _vrfCoordinator,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHToEnter();
        }
        s_players.push(payable(msg.sender));

        // Emit an event whenever we modify a state variable in storage
        emit RaffleEnter(msg.sender, msg.value, s_players.length);
    }

    function pickRandomWinner() external {
        // 1. Request random number (here)
        // 2. Once we get it, do something with it (in fulfillRandomWords)
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gas lane
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /* requestId */  // <-- tells compiler that this parameter will not be used 
        uint256[] memory randomWords
    ) internal override {
        address payable recentWinner = s_players[
            randomWords[0] % s_players.length
        ];
        s_recentWinner = recentWinner;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /* View / Pure Functions */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 playerIndex) public view returns (address) {
        return s_players[playerIndex];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
}
