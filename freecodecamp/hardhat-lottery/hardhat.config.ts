import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "hardhat-deploy"
import "solidity-coverage"
import { HardhatUserConfig } from "hardhat/config"

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// const MAINNET_RPC_URL =
//  process.env.MAINNET_RPC_URL ||
//  process.env.ALCHEMY_MAINNET_RPC_URL ||
//  "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
const RINKEBY_RPC_URL =
    process.env.RINKEBY_RPC_URL || "https://eth-rinkeby.alchemyapi.io/v2/your-api-key"
// const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL || "https://eth-kovan.alchemyapi.io/v2/your-api-key"
// const POLYGON_MAINNET_RPC_URL =
//  process.env.POLYGON_MAINNET_RPC_URL || "https://polygon-mainnet.alchemyapi.io/v2/your-api-key"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const REPORT_GAS = process.env.REPORT_GAS == "true" ? true : false || false

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        localhost: {
            chainId: 31337,
        },
        hardhat: {
            chainId: 31337,
        },
        rinkeby: {
            chainId: 4,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            saveDeployments: true,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.4.24",
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    etherscan: {
        // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    mocha: {
        timeout: 400000,
    },
}

export default config
