import { ethers, Wallet } from "ethers";
import { readFileSync, writeFileSync } from "fs";
// import { config as dotenvconfig } from "dotenv";
import { HelloWormhole, HelloWormhole__factory } from "./ethers-contracts";


// dotenvconfig()

export interface ChainInfo {
  description: string;
  chainId: number;
  rpc: string;
  tokenBridge: string;
  wormholeRelayer: string;
  wormhole: string;
}

export interface Config {
  chains: ChainInfo[];
}
export interface DeployedAddresses {
  helloWormhole: Record<number, string>;
  erc20s: Record<number, string[]>;
}

export function getHelloWormhole(chainId: number, signer: Wallet) {
  const deployed = loadDeployedAddresses().helloWormhole[chainId];
  if (!deployed) {
    throw new Error(`No deployed hello wormhole on chain ${chainId}`);
  }

  return HelloWormhole__factory.connect(deployed, signer);
  // return HelloWormhole__factory.connect(deployed, getWallet(chainId));
}

export function getChain(chainId: number): ChainInfo {
  const chain = loadConfig().chains.find((c) => c.chainId === chainId)!;
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }
  return chain;
}

// export function getWallet(chainId: number): Wallet {

//   const EVM_PRIVATE_KEY: string = process.env.EVM_PRIVATE_KEY ;
//   const rpc = loadConfig().chains.find((c) => c.chainId === chainId)?.rpc;
//   let provider = new ethers.providers.JsonRpcProvider(rpc);

//   console.log(EVM_PRIVATE_KEY)
//   if (!EVM_PRIVATE_KEY)
//     throw Error(
//       "No private key provided (use the EVM_PRIVATE_KEY environment variable)"
//     );
//   return new Wallet(EVM_PRIVATE_KEY!, provider);
// }

let _config: Config | undefined;
let _deployed: DeployedAddresses | undefined;


const config = {
  "chains": [
    {
      "description": "Avalanche testnet fuji",
      "chainId": 6,
      "rpc": "https://api.avax-test.network/ext/bc/C/rpc",
      "tokenBridge": "0x61E44E506Ca5659E6c0bba9b678586fA2d729756",
      "wormholeRelayer": "0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB",
      "wormhole": "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C"
    },
    {
      "description": "Polygon Testnet",
      "chainId": 5,
      "rpc": "https://polygon-mumbai.g.alchemy.com/v2/zvHiRctLU05rjtA-c4rVIqygGk2NhAu4",
      "tokenBridge": "0x377D55a7928c046E18eEbb61977e714d2a76472a",
      "wormholeRelayer": "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
      "wormhole": "0x0CBE91CF822c73C2315FB05100C2F714765d5c20"
    }
  ]
}

export function loadConfig(): Config {
  // if (!_config) {
  // _config = JSON.parse(
  //   readFileSync("ts-scripts/testnet/config.json", { encoding: "utf-8" })
  // );
  // }
  // return _config!;
  return config;
}

export function loadDeployedAddresses(
  fileMustBePresent?: "fileMustBePresent"
): DeployedAddresses {
  if (!_deployed) {
    try {

      // _deployed = JSON.parse(
      //   readFileSync("ts-scripts/testnet/deployedAddresses.json", {
      //     encoding: "utf-8",
      //   })
      // );
      _deployed = {
        "erc20s": [],
        "helloWormhole": [
          "null",
          "null",
          "null",
          "null",
          "null",
          "0xfe53483A62f197Ff5dCb0Fc86Da235fB78B13613",
          "0x39C6bE1F00F034Dc6d78980bc94087A58b31e690",
          "null",
          "null",
          "null",
          "null",
          "null",
          "null",
          "null",
          "0x07bd3D009ef953dE31e57C2E64CC512DDD71EcbE"
        ]
      }

    }

    catch (e) {
      if (fileMustBePresent) {
        throw e;
      }
    }
    if (!_deployed) {
      _deployed = {
        erc20s: [],
        helloWormhole: [],
      };
    }
  }
  return _deployed!;
}

// export function storeDeployedAddresses(deployed: DeployedAddresses) {
//   writeFileSync(
//     "ts-scripts/testnet/deployedAddresses.json",
//     JSON.stringify(deployed, undefined, 2)
//   );
// }

export function checkSubcommand(patterns: string | string[]) {
  if ("string" === typeof patterns) {
    patterns = [patterns];
  }
  return patterns.includes(process.argv[2]);
}

export function checkFlag(patterns: string | string[]) {
  return getArg(patterns, { required: false, isFlag: true });
}

export function getArg(
  patterns: string | string[],
  {
    isFlag = false,
    required = true,
  }: { isFlag?: boolean; required?: boolean } = {
      isFlag: false,
      required: true,
    }
): string | undefined {
  let idx: number = -1;
  if (typeof patterns === "string") {
    patterns = [patterns];
  }
  for (const pattern of patterns) {
    idx = process.argv.findIndex((x) => x === pattern);
    if (idx !== -1) {
      break;
    }
  }
  if (idx === -1) {
    if (required) {
      throw new Error(
        "Missing required cmd line arg: " + JSON.stringify(patterns)
      );
    }
    return undefined;
  }
  if (isFlag) {
    return process.argv[idx];
  }
  return process.argv[idx + 1];
}

export const deployed = (x: any) => x.deployed();
export const wait = (x: any) => x.wait();

import {
  CONTRACTS,
  relayer,
  ethers_contracts,
  tryNativeToHexString,
  ChainName,
  Network,
  CHAINS,
} from "@certusone/wormhole-sdk";

export const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

// Temporarily here - will move to the typescript SDK soon so it can be directly imported from there!
export async function getDeliveryHash(
  rx: ethers.ContractReceipt,
  sourceChain: ChainName,
  optionalParams?: {
    network?: Network;
    provider?: ethers.providers.Provider;
  }
): Promise<string> {
  const network: Network = optionalParams?.network || "MAINNET";
  const provider: ethers.providers.Provider =
    optionalParams?.provider ||
    relayer.getDefaultProvider(network, sourceChain);
  const wormholeAddress = CONTRACTS[network][sourceChain].core;
  if (!wormholeAddress) {
    throw Error(`No wormhole contract on ${sourceChain} for ${network}`);
  }
  const wormholeRelayerAddress =
    relayer.RELAYER_CONTRACTS[network][sourceChain]?.wormholeRelayerAddress;
  if (!wormholeRelayerAddress) {
    throw Error(
      `No wormhole relayer contract on ${sourceChain} for ${network}`
    );
  }
  const log = rx.logs.find(
    (log) =>
      log.address.toLowerCase() === wormholeAddress.toLowerCase() &&
      log.topics[1].toLowerCase() ===
      "0x" +
      tryNativeToHexString(wormholeRelayerAddress, "ethereum").toLowerCase()
  );
  if (!log) throw Error("No wormhole relayer log found");
  const wormholePublishedMessage =
    ethers_contracts.Implementation__factory.createInterface().parseLog(log);
  const block = await provider.getBlock(rx.blockHash);
  const body = ethers.utils.solidityPack(
    ["uint32", "uint32", "uint16", "bytes32", "uint64", "uint8", "bytes"],

    [
      block.timestamp,
      wormholePublishedMessage.args["nonce"],
      CHAINS[sourceChain],
      log.topics[1],
      wormholePublishedMessage.args["sequence"],
      wormholePublishedMessage.args["consistencyLevel"],
      wormholePublishedMessage.args["payload"],
    ]
  );
  const deliveryHash = ethers.utils.keccak256(ethers.utils.keccak256(body));
  return deliveryHash;
}
