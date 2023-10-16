"use client";

import { ModeToggle } from "@/components/Toggletheme";
import { Button } from "@/components/ui/button";


import { useSigner } from "@thirdweb-dev/react";
import { CHAIN_ID_TO_NAME } from "@certusone/wormhole-sdk";
// import { describe, expect, test } from "@jest/globals";
import { ethers } from "ethers";
import { getHelloWormhole, getDeliveryHash, sleep } from "../../../ts-scripts/utils"

import {
  useAddress,
  useChain,
  useDisconnect,
  useNetworkMismatch,
} from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { generate } from "random-words";
import Square from "../../components/Square";
import { AnimatePresence, motion } from "framer-motion";

export default function Dashboard() {
  const chain = useChain();
  const router = useRouter();
  const address = useAddress();
  const isMismatch = useNetworkMismatch();
  const disconnect = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!address) {
      router.push("/connectwallet");
    }
    if (address && isMismatch) {
      router.push("/switchnetwork");
    }
  }, [address, isMismatch, router]);

  const Disconnect = async () => {
    await disconnect();
    router.push("/connectwallet");
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("x");
  const [winner, setWinner] = useState(null);

  const checkEndTheGame = () => {
    for (let square of squares) {
      if (!square) return false;
    }
    return true;
  };

  const checkWinner = () => {
    const combos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combo of combos) {
      const [a, b, c] = combo;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  };

  const updateSquares = (ind) => {
    if (squares[ind] || winner) {
      return;
    }
    const s = squares;
    s[ind] = turn;
    setSquares(s);
    setTurn(turn === "x" ? "o" : "x");
    const W = checkWinner();
    if (W) {
      setWinner(W);
    } else if (checkEndTheGame()) {
      setWinner("x | o");
    }
  };

  const resetGame = () => {
    setSquares(Array(9).fill(""));
    setTurn("x");
    setWinner(null);
  };

  const [sourceChain, setSourceChain] = useState<number>(6);
  const [targetChain, setTargetChain] = useState<number>(5);


  const signer = useSigner();
  useEffect(() => {

    if (chain?.chain === "polygon") {
      setSourceChain(5);
      setTargetChain(6);
    }

  }, [chain])


  // prevents hydration error
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;


  const runHelloWormholeIntegrationTest = async () => {

    if (!signer) {
      return;
    }

    const arbitraryGreeting = `TIC TAC TOE ${new Date().getTime()}`;
    const sourceHelloWormholeContract = getHelloWormhole(sourceChain, signer);
    const targetHelloWormholeContract = getHelloWormhole(targetChain, signer);

    const cost = await sourceHelloWormholeContract.quoteCrossChainGreeting(targetChain);
    console.log(`Cost of sending the greeting: ${ethers.utils.formatEther(cost)} testnet AVAX`);

    console.log(`Sending greeting: ${arbitraryGreeting}`);
    const tx = await sourceHelloWormholeContract.sendCrossChainGreeting(
      targetChain,
      targetHelloWormholeContract.address,
      arbitraryGreeting,
      { value: cost }
    );
    console.log(`Transaction hash: ${tx.hash}`);
    const rx = await tx.wait();

    // const sChain = sourceChain;
    const deliveryHash = await getDeliveryHash(rx, CHAIN_ID_TO_NAME[sourceChain as keyof typeof CHAIN_ID_TO_NAME], { network: "TESTNET" });

    console.log("Waiting for delivery...");

    console.log(deliveryHash)
    console.log(`Reading greeting`);
  };


  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">
      <p>{chain && chain.chain}</p>
      <div className="absolute top-5 right-10">
        <div className="flex space-x-5">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline">
                {address && address.slice(0, 5) + "...." + address.slice(-4)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={Disconnect}>
                <p className="text-red-400">Disconnect</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ModeToggle />
        </div>
      </div>


      <div className="tic-tac-toe">
        <h1> TIC-TAC-TOE </h1>
        <button onClick={() => resetGame()}>New Game</button>
        <div className="game">
          {Array.from("012345678").map((ind) => (
            <Square
              key={ind}
              ind={ind}
              updateSquares={updateSquares}
              clsName={squares[ind]}
            />
          ))}
        </div>
        <div className={`turn ${turn === "x" ? "left" : "right"}`}>
          <Square clsName="x" />
          <Square clsName="o" />
        </div>
        <AnimatePresence>
          {winner && (
            <motion.div
              key={"parent-box"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="winner"
            >
              <motion.div
                key={"child-box"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text"
              >
                <motion.h2
                  initial={{ scale: 0, y: 100 }}
                  animate={{
                    scale: 1,
                    y: 0,
                    transition: {
                      y: { delay: 0.7 },
                      duration: 0.7,
                    },
                  }}
                >
                  {winner === "x | o" ? "No Winner :/" : "Win !! :)"}
                </motion.h2>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: {
                      delay: 1.3,
                      duration: 0.2,
                    },
                  }}
                  className="win"
                >
                  {winner === "x | o" ? (
                    <>
                      <Square clsName="x" />
                      <Square clsName="o" />
                    </>
                  ) : (
                    <>
                      <Square clsName={winner} />
                    </>
                  )}
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: { delay: 1.5, duration: 0.3 },
                  }}
                >
                  <button onClick={() => resetGame()}>New Game</button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
