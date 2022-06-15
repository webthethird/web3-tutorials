// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "./PriceConverter.sol";

contract FundMe {
    // Goals:
    // 1. Get funds from users
    // 2. Withdraw funds (only owner)
    // 3. Set minimum funding value in USD (using Chainlink)
    using PriceConverter for uint256;

    // Minimum funding value (in USD)
    uint256 public minimumUSD = 50;

    address[] public funders;
    mapping(address => uint256) public fundedByAddress;

    constructor() {

    }

    function fund() public payable {
        // require(getConversionRate(msg.value) >= minimumUSD * 1e18, "Below minimum funding value!");
        require(msg.value.getConversionRate() >= minimumUSD * 1e18, "Below minimum funding value!");
        funders.push(msg.sender);
        fundedByAddress[msg.sender] += msg.value;
    }

    function withdraw() public {

    }

}
