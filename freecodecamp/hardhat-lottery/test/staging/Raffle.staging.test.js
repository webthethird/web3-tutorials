const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

////  To run staging tests on a testnet:
// 1. Get our SubId for Chainlink VRF  (can be done programmatically or at https://vrf.chain.link/)
// 2. Deploy our contract using the SubId
// 3. Register the contract and its SubId with Chainlink VRF
// 4. Register the contract with Chainlink Keepers
// 5. Run staging tests

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Tests", function () {
          let deployer, raffle, entranceFee
          //   const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              entranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("Works with live Chainlink Keepers and VRF to get a random", async () => {
                  const startingTimestamp = await raffle.getLastTimestamp()
                  const accounts = await ethers.getSigners()

                  // Set up listener before entering the raffle,
                  // in case the blockchain moves too fast
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              // add asserts here
                              console.log("Getting winner address...")
                              const recentWinner = await raffle.getRecentWinner()
                              console.log(
                                  `The winner is ${recentWinner.toString()}! \nGetting raffle state...`
                              )
                              const raffleState = await raffle.getRaffleState()
                              console.log(
                                  `Raffle state is ${raffleState.toString()}. \nGetting ending balance...`
                              )
                              const winnerEndingBalance = await accounts[0].getBalance()
                              console.log(
                                  `Ending balance is ${winnerEndingBalance.toString()}. \nGetting ending timestamp...`
                              )
                              const endingTimestamp = await raffle.getLastTimestamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState.toString(), "0")
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(entranceFee).toString()
                              )
                              assert(endingTimestamp > startingTimestamp)

                              resolve()
                          } catch (error) {
                              console.error(error)
                              reject(error)
                          }
                      })
                      // Enter the raffle
                      console.log("Entering the raffle...")
                      await raffle.enterRaffle({ value: entranceFee })
                      console.log("Entered the raffle! Getting starting balance...")
                      const winnerStartingBalance = await accounts[0].getBalance()
                  })
              })
          })
      })
