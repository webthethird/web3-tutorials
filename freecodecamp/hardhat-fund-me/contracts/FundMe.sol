// SPDX-License-Identifier: MIT

/** Solidity Style Guide:
 *  Overall file layout (in order):
 *  1. Pragma
 *  2. Imports
 *    (Error codes)
 *  3. Interfaces
 *  4. Libraries
 *  5. Contracts
 */
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Error code
error FundMe__NotOwner();

/** @title FundMe: crowdfunding contract
 *  @author William E Bodell III
 *  @notice This contract is part of the tutorial by Patrick Collins
 *  @dev Uses Chainlink price feeds along with our library
 */
contract FundMe {
    /** Solidity Style Guide:
     *  Contract layout (in order):
     *  1. Type declarations
     *  2. State vatiables
     *  3. Events
     *  4. Modifiers
     *  5. Functions
     */

    // Type declarations
    using PriceConverter for uint256;

    // State Variables
    AggregatorV3Interface private _priceFeed;
    mapping(address => uint256) private _addressToAmountFunded;
    address[] private _funders;
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;

    // Events

    // Modifiers
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    /** Solidity Style Guide:
     *  Function declaration order:
     *  constructor
     *  receive
     *  fallback
     *  external
     *  public
     *  internal
     *  private
     *  view / pure
     */
    constructor(address priceFeed) {
        i_owner = msg.sender;
        _priceFeed = AggregatorV3Interface(priceFeed);
    }

    /**
     *  @notice This function funds the contract
     *  @dev Compares the amount sent with a fixed minimum value in USD, and reverts if too low
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        _addressToAmountFunded[msg.sender] += msg.value;
        _funders.push(msg.sender);
    }

    /**
     *  @notice This function withdraws funds from the contract
     *  @dev Only allows withdrawals by the owner
     */
    function withdraw() public payable onlyOwner {
        address[] memory funders = _funders;
        uint256 total = 0;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            total += _addressToAmountFunded[funder];
            _addressToAmountFunded[funder] = 0;
        }
        _funders = new address[](0);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(i_owner).call{value: total}("");
        require(callSuccess, "Call failed");
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return _funders[index];
    }

    function getAmountFunded(address funder) public view returns (uint256) {
        return _addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return _priceFeed;
    }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
