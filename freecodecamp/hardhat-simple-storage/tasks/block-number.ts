import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * My first Hardhat task!
 */
export default task("block-number", "Prints the current block number").setAction(
  // Called an "anonymous function" in Javascript
  async (taskargs: any[], hre: HardhatRuntimeEnvironment) => {
    /**
     * hre: Hardhat runtime environment
     */
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    console.log(`Current block number: ${blockNumber}`)
  }
)


