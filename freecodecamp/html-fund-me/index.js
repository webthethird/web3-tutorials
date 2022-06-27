// in nodejs
// require() for imports

// in front-end javascript you can't use require
// so we use the import keyword (which is better anyway)
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const withdrawButton = document.getElementById("withdrawButton")
const balanceButton = document.getElementById("balanceButton")
const balanceBox = document.getElementById("balanceBox")
connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdraw
balanceButton.onclick = getBalance

async function connect() {
    if (typeof window.ethereum != "undefined") {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
        } catch (err) {
            console.log(err)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

// intentionally not async
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // listen for the transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve() // Only resolve the Promise after the listener is triggered
        })
    })
}

// get balance function

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        balanceBox.value = ethers.utils.formatEther(balance)
    }
}

// fund function

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)

    if (typeof window.ethereum !== "undefined") {
        // need: provider / connection to blockchain
        //       signer / wallet (with gas)
        //       contract to interact with
        //       ^ ABI and address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        console.log(contract)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // listen for the tx to be mined, or
            // listen for an event <- not covered yet
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done funding")
        } catch (err) {
            console.error(err)
        }
    }
}

// withdraw

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing funds...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done withdrawing")
        } catch (error) {
            console.error(error)
        }
    }
}
