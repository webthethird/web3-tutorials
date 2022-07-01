// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

// Goals:
// 1. enter the lottery (by paying some amount)
// 2. Pick a random winner (verifiably random)
// 3. Select winner periodically in a completely automated way

// Chainlink Oracle -> Randomness, Automated Execution (Keepers)

/* Error Codes */
error Raffle__NotEnoughETHToEnter();
error Raffle__TransferFailed();
error Raffle__RaffleIsNotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**
 * @title A sample Raffle contract
 * @author William E Bodell III
 * @notice A tamperproof, decentralized raffle smart contract
 * @dev Implements Chainlink Keepers and Chainlink VRF
 */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Type Declarations */
    enum RaffleState {
        OPEN,
        CALCULTING
    }

    /* State Variables */
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    uint256 private immutable i_entranceFee;
    uint256 private immutable i_interval;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    address payable[] private s_players;
    address payable private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimestamp;

    /* Events */
    event RaffleEnter(address indexed entrant, uint256 indexed entryValue, uint256 totalEntrants);

    event RequestedRaffleWinner(uint256 indexed requestId);

    event WinnerPicked(address indexed winner);

    /**
     * @param vrfCoordinator    The address for the Chainlink VRFCoordinator contract
     * @param entranceFee       The minimum value that must be sent to `enterRaffle()`
     * @param gasLane           The key hash for the gas limit setting for our VRF call
     * @param subscriptionId    The subscription ID created at https://vrf.chain.link
     * @param callbackGasLimit  The gas limit for the callback request to `fullfilRandomWords()`
     * @param interval          The time interval between calling `fullfilRandomWords()` and
     *                          `checkUpkeep()` returning true, triggering another request
     */
    constructor(
        address vrfCoordinator,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_interval = interval;
        s_raffleState = RaffleState.OPEN;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHToEnter();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleIsNotOpen();
        }
        s_players.push(payable(msg.sender));

        // Emit an event whenever we modify a state variable in storage
        emit RaffleEnter(msg.sender, msg.value, s_players.length);
    }

    /**
     * @dev Called (off-chain) by Chainlink Keeper nodes to check if upkeep is needed.
     * @notice The following should be true in order to return upkeepNeeded = True:
     * 1. The time interval should have passed
     * 2. The raffle should have at least one entrant and some ETH
     * 3. Chainlink subscription is funded with LINK
     * 4. Should be in an "open" state
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool timePassed = (block.timestamp - s_lastTimestamp) > i_interval;
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = isOpen && timePassed && hasPlayers && hasBalance;
    }

    /**
     * @dev Called by a Chainlink Keeper node once `checkUpkeep` returns `true`.
     * @notice Kicks off Chainlink VRF call to get a random number
     */
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        // 1. Request random number (here)
        // 2. Once we get it, do something with it (in fulfillRandomWords)
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULTING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // gas lane
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    /**
     * @dev Called by Chainlink VRFCoordinatorV2 in response to asynchronous requestRandomWords call
     * @notice Uses a verifiably random number to pick a winner and send them the funds
     */
    function fulfillRandomWords(
        uint256, /* requestId */ // <-- tells compiler that this parameter will not be used
        uint256[] memory randomWords
    ) internal override {
        address payable recentWinner = s_players[randomWords[0] % s_players.length];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimestamp = block.timestamp;
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

    function getNumPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getLastTimestamp() public view returns (uint256) {
        return s_lastTimestamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
