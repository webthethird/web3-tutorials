// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    // Goals:
    // 1. Get funds from users
    // 2. Withdraw funds (only owner)
    // 3. Set minimum funding value in USD (using Chainlink)

    // Chainlink price feed
    AggregatorV3Interface internal priceFeed;

    // Minimum funding value (in USD)
    uint256 public minimumUSD = 50;

    address[] public funders;
    mapping(address => uint256) public fundedByAddress;

    /**
     * Network: Rinkeby
     * Aggregator: ETH/USD
     * Address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
     */
    constructor() {
        priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    }

    function fund() public payable {
        require(getConversionRate(msg.value) >= minimumUSD * 1e18, "Below minimum funding value!");
        funders.push(msg.sender);
        fundedByAddress[msg.sender] += msg.value;
    }

    function withdraw() public {

    }

    function getPrice() public view returns (uint256) {
        // Need: ABI and address of contract
        // Get address from Chainlink docs
        // Imported AggregatorV3Interface gives us ABI
        (,int256 price,,,) = priceFeed.latestRoundData();
        // ETH to USD
        return uint256(price * 1e10);
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.version();
    }

    function getConversionRate(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getPrice();
        return (ethPrice * ethAmount) / 1e18;
    }

}
