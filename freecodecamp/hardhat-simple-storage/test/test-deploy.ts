import { ethers } from "hardhat"
import { expect, assert } from "chai"
import { SimpleStorage, SimpleStorage__factory, StorageFactory, StorageFactory__factory } from "../typechain-types"
import "dotenv/config"

describe("SimpleStorage", function () {
  let simpleStorageFactory: SimpleStorage__factory
  let simpleStorage: SimpleStorage

  beforeEach(async function () {
    simpleStorageFactory = (await ethers.getContractFactory("SimpleStorage")) as SimpleStorage__factory
    simpleStorage = await simpleStorageFactory.deploy()
  })

  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve()
    const expectedValue = "0"
    assert.equal(currentValue.toString(), expectedValue)
  })
  it("Should update when we call store", async function () {
    const expectedValue = "5"
    const transactionResponse = await simpleStorage.store(expectedValue)
    await transactionResponse.wait(1)
    const currentValue = await simpleStorage.retrieve()
    assert.equal(currentValue.toString(), expectedValue)
  })
})

describe("StorageFactory", function () {
  let simpleStorageFactory: SimpleStorage__factory
  let simpleStorage: SimpleStorage
  let storageFactory: StorageFactory
  let storageFactoryFactory: StorageFactory__factory
  let simpleStorageAddress: string

  beforeEach(async function () {
    storageFactoryFactory = (await ethers.getContractFactory("StorageFactory")) as StorageFactory__factory
    simpleStorageFactory = (await ethers.getContractFactory("SimpleStorage")) as SimpleStorage__factory
    storageFactory = await storageFactoryFactory.deploy()
    await storageFactory.createSimpleStorage()
    simpleStorageAddress = await storageFactory.sfGetAddress(0)
    simpleStorage = simpleStorageFactory.attach(simpleStorageAddress)
  })

  it("Should deploy a SimpleStorage contract and return its address", async function () {
    assert.notEqual(simpleStorageAddress, "0")
    assert.notEqual(simpleStorageAddress, "0x0")
  })
  it("Should retrieve value of 0 from SimpleStorage", async function () {
    const currentValue = await storageFactory.sfGetNumber(0)
    const expectedValue = "0"
    assert.equal(currentValue.toString(), expectedValue)
  })
  it("Should update the value in SimpleStorage when we call StorageFactory.sfStoreNumber", async function () {
    const expectedValue = "5"
    const transactionResponse = await storageFactory.sfStoreNumber(
      "0",
      expectedValue
    )
    await transactionResponse.wait(1)
    const currentValue = await storageFactory.sfGetNumber(0)
    assert.equal(currentValue.toString(), expectedValue)
  })
})

describe("StorageFactory + Person", async function () {
  let simpleStorageFactory: SimpleStorage__factory
  let simpleStorage: SimpleStorage
  let storageFactory: StorageFactory
  let storageFactoryFactory: StorageFactory__factory

  beforeEach(async function () {
    storageFactoryFactory = (await ethers.getContractFactory("StorageFactory")) as StorageFactory__factory
    simpleStorageFactory = (await ethers.getContractFactory("SimpleStorage")) as SimpleStorage__factory
    storageFactory = await storageFactoryFactory.deploy()
    await storageFactory.createSimpleStorage()
    const simpleStorageAddress = await storageFactory.sfGetAddress(0)
    simpleStorage = simpleStorageFactory.attach(simpleStorageAddress)
    const transactionResponse = await storageFactory.sfStorePerson(
      "0",
      "Vitalik",
      "Buterin",
      "42"
    )
    await transactionResponse.wait(1)
  })

  it("Should return 42 when queried for Vitalik's favorite number", async function () {
    const expectedValue = "42"
    const currentValue = await storageFactory.sfGetPersonsNumber(
      "0",
      "Vitalik",
      "Buterin"
    )
    assert.equal(currentValue.toString(), expectedValue)
  })
  it("Should return 69 after we've updated Vitalik's favorite number", async function () {
    const expectedValue = "69"
    const transactionResponse = await simpleStorage.changePersonsFavoriteNumber(
      "Vitalik",
      "Buterin",
      expectedValue
    )
    await transactionResponse.wait(1)
    const currentValue = await simpleStorage.nameToFavoriteNumber(
      "Vitalik",
      "Buterin"
    )
    assert.equal(currentValue.toString(), expectedValue)
  })
  it("Should retrieve the same person by index and by name", async function () {
    const expectedValue = "Vitalik,Buterin,42"
    const valueByIndex = await storageFactory.sfGetPerson(0, 0)
    const valueByName = await storageFactory.sfGetPersonByName(
      "0",
      "Vitalik",
      "Buterin"
    )
    assert.equal(valueByIndex.toString(), expectedValue)
    assert.equal(valueByName.toString(), expectedValue)
  })
})
