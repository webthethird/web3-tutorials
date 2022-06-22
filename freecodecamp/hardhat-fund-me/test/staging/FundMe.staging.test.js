const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.05")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("Should fail if you don't send enough ETH", async function () {
              // Use expect rather than assert if the transaction should revert
              await expect(fundMe.fund()).to.be.revertedWith(
                  "You need to spend more ETH!"
              )
          })
          it("Can withdraw ETH from a single founder", async function () {
              // Arrange
              await fundMe.fund({ value: sendValue })
              const startingFundBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const startingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )
              // Act
              const txResponse = await fundMe.withdraw()
              const txReceipt = await txResponse.wait(1)
              /// Extract gas cost from the transaction receipt
              const { gasUsed, effectiveGasPrice } = txReceipt
              const gasCost = gasUsed.mul(effectiveGasPrice)
              const endingFundBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )
              const startingTotalBalance = startingFundBalance
                  .add(startingDeployerBalance)
                  .toString()
              const endingDeployerBalancePlusGas = endingDeployerBalance
                  .add(gasCost)
                  .toString()
              // Assert
              assert.equal(endingFundBalance, 0)
              assert.equal(startingTotalBalance, endingDeployerBalancePlusGas)
          })
      })
