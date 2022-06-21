// async function deploy(hre) {
//   console.log("Deploying...")
// }
// module.exports.default = deploy

// module.exports = async (hre) => {
//   const {getNamedAccounts, deployments} = hre
// }

module.exports = async ({ getNamedAccounts, deployments, network }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    /**
     * Our PriceConverter.sol library contains a hardcoded address that is
     * specific to Rinkeby, because it requires a Chainlink Price Feed.
     * But what if we want to test this on localhost or hardhat network?
     * Solution: use a mock that simulates the behavior of the real object.
     *
     * But what about when we want to switch between chains?
     */
}
