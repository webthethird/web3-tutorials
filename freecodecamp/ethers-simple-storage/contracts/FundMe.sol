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

  address payable public owner;
  address[] public funders;
  mapping(address => uint256) public fundedByAddress;

  constructor() {
    owner = payable(msg.sender);
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Only the contract owner can withdraw funds!");
    _;
  }

  function fund() public payable {
    // require(getConversionRate(msg.value) >= minimumUSD * 1e18, "Below minimum funding value!");
    require(
      msg.value.getConversionRate() >= minimumUSD * 1e18,
      "Below minimum funding value!"
    );
    funders.push(msg.sender);
    fundedByAddress[msg.sender] += msg.value;
  }

  function withdraw() public onlyOwner {
    for (uint256 i = 0; i < funders.length; i++) {
      fundedByAddress[funders[i]] = 0;
    }
    // reset the array
    funders = new address[](0);

    // withdraw the funds
    // three ways to send ETH
    // 1: transfer (2300 gas, throws error on failure)
    // owner.transfer(address(this).balance);
    // 2: send (2300 gas, returns bool)
    // bool sendSuccess = owner.send(address(this).balance);
    // require(sendSuccess, "Send failed");
    // 3: call (forward all gas or set gas, returns bool plus any return data)
    //    this is currently the recommended way to send ETH
    (bool callSuccess, bytes memory dataReturned) = owner.call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }
}
