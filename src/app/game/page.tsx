"use client";

import {useSigner} from "@thirdweb-dev/react";
import {CHAIN_ID_TO_NAME} from "@certusone/wormhole-sdk";
// import { describe, expect, test } from "@jest/globals";
import {ethers} from "ethers";
import {
  getHelloWormhole,
  getDeliveryHash,
  sleep,
} from "../../../ts-scripts/utils";
import {Database} from "@tableland/sdk";
import {Wallet, getDefaultProvider} from "ethers";

export default function Game() {
  const sourceChain = 6;
  const targetChain = 5;

  const runHelloWormholeIntegrationTest = async (
    sourceChain: number,
    targetChain: number,
    signer: any
  ) => {
    const arbitraryGreeting = `Hello Jayd ${new Date().getTime()}`;
    const sourceHelloWormholeContract = getHelloWormhole(sourceChain, signer);
    const targetHelloWormholeContract = getHelloWormhole(targetChain, signer);

    const cost = await sourceHelloWormholeContract.quoteCrossChainGreeting(
      targetChain
    );
    console.log(
      `Cost of sending the greeting: ${ethers.utils.formatEther(
        cost
      )} testnet AVAX`
    );

    console.log(`Sending greeting: ${arbitraryGreeting}`);
    const tx = await sourceHelloWormholeContract.sendCrossChainGreeting(
      targetChain,
      targetHelloWormholeContract.address,
      arbitraryGreeting,
      {value: cost}
    );
    console.log(`Transaction hash: ${tx.hash}`);
    const rx = await tx.wait();

    // const sChain = sourceChain;
    const deliveryHash = await getDeliveryHash(
      rx,
      CHAIN_ID_TO_NAME[sourceChain as keyof typeof CHAIN_ID_TO_NAME],
      {network: "TESTNET"}
    );

    console.log("Waiting for delivery...");
    // while (true) {
    //   await sleep(1000);
    //   const completed = await targetHelloWormholeContract.seenDeliveryVaaHashes(deliveryHash);
    //   if (completed) {
    //     break;
    //   }
    // }
    console.log(deliveryHash);
    console.log(`Reading greeting`);
    // const readGreeting = await targetHelloWormholeContract.latestGreeting();
    // console.log(`Latest greeting: ${readGreeting}`);
    // expect(readGreeting).toBe(arbitraryGreeting);
  };

  const signer = useSigner();
  console.log(signer);
  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
  const wallet = new Wallet(privateKey);
  const provider = getDefaultProvider(
    "https://eth-sepolia.g.alchemy.com/v2/M81ns-h41WEoIXkIMvBzNFRDuEgxcfGY"
  );
  const signer2 = wallet.connect(provider);
  // Connect to the database
  const db = new Database({signer2});
  console.log(signer2);
  const stmt = db.prepare("SELECT * from messages_11155111_115");
  const getData = async () => {
    const result = await stmt.all();
    console.log(result);
  };
  getData();

  return (
    <div>
      <button
        onClick={async () =>
          await runHelloWormholeIntegrationTest(
            sourceChain,
            targetChain,
            signer
          )
        }
      >
        run codes
      </button>
    </div>
  );
}
