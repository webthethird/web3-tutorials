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
    "fa3ab1f9da733df326ab484fd49ff991f667c673d15c5b1c428e0867564511e3",
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
  // const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  // console.log("Deploying...");
  // const contract = await contractFactory.deploy();
  // const transactionReceipt = await contract.deployTransaction.wait(1);
  // console.log("Deployment Transaction:");
  // console.log(contract.deployTransaction);
  // console.log("Transaction Receipt (after one confirmation):");
  // console.log(transactionReceipt);

  /**
   * Deploy contract again, but as a raw transaction
   */
  console.log("Deploy w/ only transaction data:");
  let nonce = await wallet.getTransactionCount();
  let tx = {
    nonce: nonce,
    gasPrice: 20000000000,
    gasLimit: 1000000,
    to: undefined,
    value: 0,
    data: "0x608060405234801561001057600080fd5b50610977806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80632e64cec11461005c5780634847e01b1461007a5780636057361d146100965780639e7a13ad146100b2578063e9a03be2146100e4575b600080fd5b610064610114565b6040516100719190610711565b60405180910390f35b610094600480360381019061008f919061058b565b61011d565b005b6100b060048036038101906100ab9190610616565b6101ed565b005b6100cc60048036038101906100c79190610616565b6101f7565b6040516100db9392919061072c565b60405180910390f35b6100fe60048036038101906100f9919061050a565b610341565b60405161010b9190610711565b60405180910390f35b60008054905090565b6001604051806060016040528083815260200185815260200184815250908060018154018082558091505060019003906000526020600020906003020160009091909190915060008201518160000155602082015181600101908051906020019061018992919061038c565b5060408201518160020190805190602001906101a692919061038c565b505050806002836040516101ba91906106fa565b9081526020016040518091039020846040516101d691906106fa565b908152602001604051809103902081905550505050565b8060008190555050565b6001818154811061020757600080fd5b90600052602060002090600302016000915090508060000154908060010180546102309061083a565b80601f016020809104026020016040519081016040528092919081815260200182805461025c9061083a565b80156102a95780601f1061027e576101008083540402835291602001916102a9565b820191906000526020600020905b81548152906001019060200180831161028c57829003601f168201915b5050505050908060020180546102be9061083a565b80601f01602080910402602001604051908101604052809291908181526020018280546102ea9061083a565b80156103375780601f1061030c57610100808354040283529160200191610337565b820191906000526020600020905b81548152906001019060200180831161031a57829003601f168201915b5050505050905083565b6000600283836040516103559291906106e1565b908152602001604051809103902085856040516103739291906106e1565b9081526020016040518091039020549050949350505050565b8280546103989061083a565b90600052602060002090601f0160209004810192826103ba5760008555610401565b82601f106103d357805160ff1916838001178555610401565b82800160010185558215610401579182015b828111156104005782518255916020019190600101906103e5565b5b50905061040e9190610412565b5090565b5b8082111561042b576000816000905550600101610413565b5090565b600061044261043d84610796565b610771565b90508281526020810184848401111561045e5761045d61090a565b5b6104698482856107f8565b509392505050565b60008083601f84011261048757610486610900565b5b8235905067ffffffffffffffff8111156104a4576104a36108fb565b5b6020830191508360018202830111156104c0576104bf610905565b5b9250929050565b600082601f8301126104dc576104db610900565b5b81356104ec84826020860161042f565b91505092915050565b6000813590506105048161092a565b92915050565b6000806000806040858703121561052457610523610914565b5b600085013567ffffffffffffffff8111156105425761054161090f565b5b61054e87828801610471565b9450945050602085013567ffffffffffffffff8111156105715761057061090f565b5b61057d87828801610471565b925092505092959194509250565b6000806000606084860312156105a4576105a3610914565b5b600084013567ffffffffffffffff8111156105c2576105c161090f565b5b6105ce868287016104c7565b935050602084013567ffffffffffffffff8111156105ef576105ee61090f565b5b6105fb868287016104c7565b925050604061060c868287016104f5565b9150509250925092565b60006020828403121561062c5761062b610914565b5b600061063a848285016104f5565b91505092915050565b600061064f83856107e3565b935061065c8385846107f8565b82840190509392505050565b6000610673826107c7565b61067d81856107d2565b935061068d818560208601610807565b61069681610919565b840191505092915050565b60006106ac826107c7565b6106b681856107e3565b93506106c6818560208601610807565b80840191505092915050565b6106db816107ee565b82525050565b60006106ee828486610643565b91508190509392505050565b600061070682846106a1565b915081905092915050565b600060208201905061072660008301846106d2565b92915050565b600060608201905061074160008301866106d2565b81810360208301526107538185610668565b905081810360408301526107678184610668565b9050949350505050565b600061077b61078c565b9050610787828261086c565b919050565b6000604051905090565b600067ffffffffffffffff8211156107b1576107b06108cc565b5b6107ba82610919565b9050602081019050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b6000819050919050565b82818337600083830152505050565b60005b8381101561082557808201518184015260208101905061080a565b83811115610834576000848401525b50505050565b6000600282049050600182168061085257607f821691505b602082108114156108665761086561089d565b5b50919050565b61087582610919565b810181811067ffffffffffffffff82111715610894576108936108cc565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b610933816107ee565b811461093e57600080fd5b5056fea2646970667358221220de922eae76452b47a7e91da310e2a4eb3a586ac1f40b5697b7645ac531aaa81064736f6c63430008070033",
    chainId: 1337,
  };
  let sentTxResponse = await wallet.sendTransaction(tx);
  console.log(sentTxResponse);
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
