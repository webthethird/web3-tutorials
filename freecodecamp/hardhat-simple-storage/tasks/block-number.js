const { task } = require("hardhat/config")

/**
 * My first Hardhat task!
 */
task("block-number", "Prints the current block number").setAction(
  // Called an "anonymous function" in Javascript
  async (taskargs, hre) => {
    /**
     * hre: Hardhat runtime environment
     */
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    console.log(`Current block number: ${blockNumber}`)
  }
)

module.exports = {}
