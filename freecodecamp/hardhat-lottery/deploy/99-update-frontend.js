const { readFileSync, writeFileSync } = require("fs")
const { network } = require("hardhat")

const FRONTEND_ADDRESSES_FILE = "../nextjs-lottery/constants/contractAddresses.json"
const FRONTEND_ABI_FILE = "../nextjs-lottery/constants/abi.json"

async function updateContractAddresses() {
    const raffle = await ethers.getContract("Raffle")
    const currentAddresses = JSON.parse(readFileSync(FRONTEND_ADDRESSES_FILE, "utf8"))
    const chainId = network.config.chainId.toString()
    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(raffle.address)) {
            currentAddresses[chainId].push(raffle.address)
        }
    } else {
        currentAddresses[chainId] = [raffle.address]
    }
    writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

async function updateABI() {
    const raffle = await ethers.getContract("Raffle")
    writeFileSync(FRONTEND_ABI_FILE, raffle.interface.format(ethers.utils.FormatTypes.json))
}

module.exports = async function () {
    if (process.env.UPDATE_FRONTEND) {
        console.log("Updating front end...")
        updateContractAddresses()
        updateABI()
        console.log("Frontend updated")
    }
}

module.exports.tags = ["all", "frontend"]
