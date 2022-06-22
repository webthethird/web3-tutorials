const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// async function deploy(hre) {
//   console.log("Deploying...")
// }
// module.exports.default = deploy

// module.exports = async (hre) => {
//   const {getNamedAccounts, deployments} = hre
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    /**
     * Our PriceConverter.sol library contains a hardcoded address that is
     * specific to Rinkeby, because it requires a Chainlink Price Feed.
     * But what if we want to test this on localhost or hardhat network?
     * Solution: use a mock that simulates the behavior of the real object.
     *
     * But what about when we want to switch between chains?
     * We still can't use a hardcoded address, because they may be different.
     * Solution: pass an address into the constructor rather than hardcoding it.
     */

    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [
        /* Price feed address */
        ethUsdPriceFeedAddress,
    ]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    /**
     * Auto-verify on Etherscan
     */
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("-------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
