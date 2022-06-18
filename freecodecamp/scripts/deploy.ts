import { ethers } from "ethers";
import * as fs from "fs-extra";

/**
 * Asynchronous functions return a Promise,
 * which can have one of three states:
 * - Pending
 * - Fulfilled
 * - Rejected
 * `await` keyword in front of an async function
 * waits for Promise to be fulfilled or rejected
 */
async function main() {
  /**
   * First step: compile smart contracts
   * 2 Options:
   * - Compile in the script (check solc-js docs)
   * - Compile them separately (as done in tutorial)
   */
  /**
   * Set up provider and wallet - Ethers + Ganache
   */
  let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
  let wallet = new ethers.Wallet(
    "a4c84d68b076a34d018588ccfb4803427c3c68634a9a1865c5388b52dc7abe80",
    provider
  );

  /**
   * Read the compiled contract's ABI and binary files
   */
  const abi = fs.readFileSync(
    "./contracts/artifacts/contracts_SimpleStorage_sol_SimpleStorage.abi",
    "utf8"
  );
  const binary = fs.readFileSync(
    "./contracts/artifacts/contracts_SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );

  /**
   * Deploy contracts
   * Here we will use Ganache to spin up a virtual chain.
   * RPC Server: http://127.0.0.1:7545
   * Later we use the Hardhat virtual testing environment.
   */
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying...");
  const contract = await contractFactory.deploy();
  console.log(contract);
}

/**
 * Using (Learning) Typescript
 * First, it is necessary to have installed node-typescript.
 * We also install @types/fs-extra and @types/node using yarn
 * and we have a new file: tsconfig.json
 * Then, Typescript must be compiled into Javascript using:
 *      >> tsc scripts/deploy.ts
 * Finally, we use Node to run the Javascript using:
 *      >> node scripts/deploy.js
 */
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
