const { ethers, run, network } = require("hardhat")

async function main() {
  /**
   * Note:
   * This ContractFactory object should not be confused
   * with the factory contract SimpleStorageFactory.sol!
   * To deploy the factory contract, I suppose we'd call it
   * SimpleStorageFactoryFactory...
   */
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log(`Deployed contract to: ${simpleStorage.address}`)

  // Only attempt to verify on Etherscan if the network is Rinkeby and API key is in .env
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 6 confirmations before verification...")
    // Wait a few blocks before verifying to give Etherscan time to update
    await simpleStorage.deployTransaction.wait(6)

    await verify(simpleStorage.address, [])
    console.log("Verified contract!")
  }

  // Get current value from contract, which is initialized to 0
  let currentValue = await simpleStorage.retrieve()
  console.log(`Current value is: ${currentValue}`)

  // Update the value
  const transactionResponse = await simpleStorage.store(5)
  await transactionResponse.wait(1)

  // Get the updated value to verify that it was changed
  currentValue = await simpleStorage.retrieve()
  console.log(`Updated value is: ${currentValue}`)
}

async function verify(contractAddress, args) {
  console.log("Verifying contract...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (err) {
    if (err.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.error(err)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
