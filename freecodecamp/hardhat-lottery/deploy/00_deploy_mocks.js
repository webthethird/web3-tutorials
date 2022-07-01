const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

// Constructor arguments for VRFCoordinatorV2Mock
const BASE_FEE = ethers.utils.parseEther("0.25") // The "premium" for VRF is 0.25 LINK
const GAS_PRICE_LINK = 1e9 // calculated value based on gas price of the chain

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected, deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Mocks deployed!")
        log("--------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
