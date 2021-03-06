const { ethers } = require("hardhat")

const networkConfig = {
    1: {
        name: "mainnet",
        vrfCoordinator: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    },
    4: {
        name: "rinkeby",
        vrfCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        entranceFee: ethers.utils.parseEther("0.1"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        subscriptionId: "7712",
        callbackGasLimit: "500000",
        interval: "30",
    },
    137: {
        name: "polygon",
        vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEther("0.01"),
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        callbackGasLimit: "500000",
        interval: "30",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
