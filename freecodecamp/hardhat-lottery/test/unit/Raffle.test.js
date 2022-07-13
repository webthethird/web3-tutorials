const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let deployer, raffle, vrfCoordinatorV2Mock, entranceFee, interval, callbackGasLimit
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              entranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
              callbackGasLimit = await raffle.getCallbackGasLimit()
          })

          describe("constructor", function () {
              it("Initializes the raffle state correctly", async function () {
                  // Note: ideally our tests should have just one assert per "it"
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "0")
              })
              it("Initializes the interval correctly", async function () {
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
              it("Initializes the entrance fee correctly", async function () {
                  assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
              })
              it("Initializes the gas lane correctly", async function () {
                  const gasLane = await raffle.getGasLane()
                  assert.equal(gasLane.toString(), networkConfig[chainId]["gasLane"])
              })
              it("Initializes the callback gas limit correctly", async function () {
                  assert.equal(
                      callbackGasLimit.toString(),
                      networkConfig[chainId]["callbackGasLimit"]
                  )
              })
          })

          describe("enterRaffle", function () {
              it("Reverts when msg.value is too low", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHToEnter"
                  )
              })
              it("Records players when they enter", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  const player = await raffle.getPlayer(0)
                  assert.equal(player, deployer)
              })
              it("Emits an Event when a player enters", async function () {
                  await expect(raffle.enterRaffle({ value: entranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("Doesn't allow entrance when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  // Pretend to be a Chainlink Keeper
                  await raffle.performUpkeep([])
                  await expect(raffle.enterRaffle({ value: entranceFee })).to.be.revertedWith(
                      "Raffle__RaffleIsNotOpen"
                  )
              })
          })

          describe("checkUpkeep", function () {
              it("Returns false when nobody has entered the raffle", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("Returns false if raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep("0x")
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
              })
              it("Returns false when not enough time has passed", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
              it("Returns true if raffle has players, ETH, is open, and enough time has passed", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(upkeepNeeded)
              })
          })

          describe("performUpkeep", function () {
              it("Can only run if checkUpkeep returns true", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep([])
                  assert(tx)
              })
              it("Reverts when checkUpkeep returns false", async function () {
                  // The Raffle__UpkeepNotNeeded error includes 3 arguments:
                  //      address(this).balance,
                  //      s_players.length,
                  //      uint256(s_raffleState)
                  // It is not necessary to include these in the statement below to make it work
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 10])
                  await network.provider.send("evm_mine", [])
                  const numPlayers = await raffle.getNumPlayers()
                  const raffleState = await raffle.getRaffleState()
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      `Raffle__UpkeepNotNeeded(${entranceFee.toString()}, ${numPlayers.toString()}, ${raffleState.toString()})`
                  )
              })
              it("Changes the raffle state to calculating", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([])
                  const raffleState = await raffle.getRaffleState()
                  assert.equal(raffleState.toString(), "1")
              })
              it("Calls the VRFCoordinatorV2.requestRandomWords function", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await expect(raffle.performUpkeep([])).to.emit(
                      vrfCoordinatorV2Mock,
                      "RandomWordsRequested"
                  )
              })
              it("Emits an Event once it requests a random number", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await expect(raffle.performUpkeep([])).to.emit(raffle, "RequestedRaffleWinner")
              })
          })

          describe("fulfillRandomWords", function () {
              beforeEach(async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
              })

              it("Can only be called after a request is made", async function () {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })

              describe("Picks a winner, sends them money and resets the lottery", function () {
                  let accounts,
                      startingTimestamp,
                      endingTimestamp,
                      winnerStartingBalance,
                      winnerEndingBalance
                  const additionalEntrants = 3
                  const startingAccountIndex = 1
                  beforeEach(async function () {
                      accounts = await ethers.getSigners()
                      for (
                          let i = startingAccountIndex;
                          i < startingAccountIndex + additionalEntrants;
                          i++
                      ) {
                          await raffle.connect(accounts[i]).enterRaffle({ value: entranceFee })
                      }
                      startingTimestamp = await raffle.getLastTimestamp()
                  })

                  it("Picks a winner", async function () {
                      await new Promise(async (resolve, reject) => {
                          // Setting up the listener
                          raffle.once("WinnerPicked", async () => {
                              try {
                                  const recentWinner = await raffle.getRecentWinner()
                                  assert.equal(recentWinner.toString(), accounts[1].address)
                              } catch (e) {
                                  reject(e)
                              }
                              resolve()
                          })
                          // Fire the event, so the listener will pick it up and resolve
                          const tx = await raffle.performUpkeep([])
                          const txReceipt = await tx.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                      })
                  })
                  it("Emits an Event when a winner is picked", async function () {
                      const tx = await raffle.performUpkeep([])
                      const txReceipt = await tx.wait(1)
                      await expect(
                          vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                      ).to.emit(raffle, "WinnerPicked")
                  })
                  it("Resets the raffle state to open", async function () {
                      await new Promise(async (resolve, reject) => {
                          // Setting up the listener
                          raffle.once("WinnerPicked", async () => {
                              try {
                                  const raffleState = await raffle.getRaffleState()
                                  assert.equal(raffleState.toString(), "0")
                              } catch (e) {
                                  reject(e)
                              }
                              resolve()
                          })
                          // Fire the event, so the listener will pick it up and resolve
                          const tx = await raffle.performUpkeep([])
                          const txReceipt = await tx.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                      })
                  })
                  it("Updates the last timestamp", async function () {
                      await new Promise(async (resolve, reject) => {
                          // Setting up the listener
                          raffle.once("WinnerPicked", async () => {
                              try {
                                  endingTimestamp = await raffle.getLastTimestamp()
                                  assert(endingTimestamp > startingTimestamp)
                              } catch (e) {
                                  reject(e)
                              }
                              resolve()
                          })
                          // Fire the event, so the listener will pick it up and resolve
                          const tx = await raffle.performUpkeep([])
                          const txReceipt = await tx.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                      })
                  })
                  it("Resets the list of players", async function () {
                      await new Promise(async (resolve, reject) => {
                          // Setting up the listener
                          raffle.once("WinnerPicked", async () => {
                              try {
                                  const numPlayers = await raffle.getNumPlayers()
                                  assert.equal(numPlayers.toString(), "0")
                              } catch (e) {
                                  reject(e)
                              }
                              resolve()
                          })
                          // Fire the event, so the listener will pick it up and resolve
                          const tx = await raffle.performUpkeep([])
                          const txReceipt = await tx.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                      })
                  })
                  it("Transfers the winner all the funds", async function () {
                      await new Promise(async (resolve, reject) => {
                          // Setting up the listener
                          raffle.once("WinnerPicked", async () => {
                              try {
                                  winnerEndingBalance = await accounts[1].getBalance()
                                  assert.equal(
                                      winnerEndingBalance.toString(),
                                      winnerStartingBalance
                                          .add(entranceFee.mul(additionalEntrants).add(entranceFee))
                                          .toString()
                                  )
                              } catch (e) {
                                  reject(e)
                              }
                              resolve()
                          })
                          // Fire the event, so the listener will pick it up and resolve
                          const tx = await raffle.performUpkeep([])
                          const txReceipt = await tx.wait(1)
                          winnerStartingBalance = await accounts[1].getBalance()
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              raffle.address
                          )
                      })
                  })
              })
              //   it("Picks a winner, sends them money and resets the lottery", async function () {
              //       const additionalEntrants = 3
              //       const startingAccountIndex = 1
              //       const accounts = await ethers.getSigners()
              //       for (
              //           let i = startingAccountIndex;
              //           i < startingAccountIndex + additionalEntrants;
              //           i++
              //       ) {
              //           const accountConnectedRaffle = raffle.connect(accounts[i])
              //           await accountConnectedRaffle.enterRaffle({ value: entranceFee })
              //       }
              //       const startingTimestamp = await raffle.getLastTimestamp()

              //       // performUpkeep (pretend to be a Chainlink Keeper)
              //       // fulfillRandomWords (pretend to be the Chainlink VRF)
              //       // wait for the fulfillRandomWords to be called
              //       await new Promise(async (resolve, reject) => {
              //           // Setting up the listener
              //           raffle.once("WinnerPicked", async () => {
              //               console.log("Found the event!")
              //               try {
              //                   const recentWinner = await raffle.getRecentWinner()
              //                   const winnerEndingBalance = await accounts[1].getBalance()
              //                   const raffleState = await raffle.getRaffleState()
              //                   const endingTimestamp = await raffle.getLastTimestamp()
              //                   const numPlayers = await raffle.getNumPlayers()
              //                   assert.equal(numPlayers.toString(), raffleState.toString())
              //                   assert(endingTimestamp > startingTimestamp)
              //                   assert.equal(recentWinner.toString(), accounts[1].address)
              //                   assert.equal(
              //                       winnerEndingBalance.toString(),
              //                       winnerStartingBalance
              //                           .add(entranceFee.mul(additionalEntrants).add(entranceFee))
              //                           .toString()
              //                   )
              //               } catch (e) {
              //                   reject(e)
              //               }
              //               resolve()
              //           })
              //           // Fire the event, so the listener will pick it up and resolve
              //           const tx = await raffle.performUpkeep([])
              //           const txReceipt = await tx.wait(1)
              //           const winnerStartingBalance = await accounts[1].getBalance()
              //           await vrfCoordinatorV2Mock.fulfillRandomWords(
              //               txReceipt.events[1].args.requestId,
              //               raffle.address
              //           )
              //       })
              //   })
          })
      })
