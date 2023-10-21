"use client";

import { ModeToggle } from "@/components/Toggletheme";
import { Button } from "@/components/ui/button";

import { useSigner } from "@thirdweb-dev/react";
import { CHAIN_ID_TO_NAME, cosmos } from "@certusone/wormhole-sdk";
// import { describe, expect, test } from "@jest/globals";
import { Wallet, ethers } from "ethers";
import {
  getHelloWormhole,
  getDeliveryHash,
  sleep,
} from "../../../ts-scripts/utils";

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
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("x");
  const [winner, setWinner] = useState<any>(null);
  const [sourceChain, setSourceChain] = useState<number>(6);
  const [targetChain, setTargetChain] = useState<number>(5);
  const signer = useSigner();
  const [sourceHelloWormholeContract, setSourceHelloWormholeContract] =
    useState<any>();
  const [targetHelloWormholeContract, setTargetHelloWormholeContract] =
    useState<any>();

  useEffect(() => {
    if (!address) {
      router.push("/connectwallet");
    }
    // if (address && isMismatch) {
    //   router.push("/switchnetwork");
    // }
  }, [address, isMismatch, router]);

  const Disconnect = async () => {
    await disconnect();
    router.push("/connectwallet");
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

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

  const updateSquares = (ind: any) => {
    try {
      if (squares[ind] || winner) {
        return;
      }
      const s = squares;
      s[ind] = turn;

      const msg = {
        payload: squares,
        game: "ads",
      };
      console.log(msg, "msg");
      const msgString = convertJsonToString(msg);
      // console.log(JSON.stringify(msg), 'msg --')
      // const mess: string = JSON.stringify(msg);
      // const mess = "-X-------_1234"

      runHelloWormholeIntegrationTest(msgString);
      setSquares(s);
      setTurn(turn === "x" ? "o" : "x");
      const W = checkWinner();
      if (W) {
        setWinner(W);
      } else if (checkEndTheGame()) {
        setWinner("x | o");
      }
    } catch (err) {
      // if error, return to original situation
      setSquares(squares);
      console.log(err);
    }
  };

  const resetGame = () => {
    setSquares(Array(9).fill(""));
    setTurn("x");
    setWinner(null);
  };

  const convertStringToJson = (inputString: string) => {
    const [payloadString, gameId] = inputString.split("_");
    console.log(payloadString, "payloadString");
    console.log(gameId, "gameId");
    const arr = Array(9).fill("");

    for (let i = 0; i < payloadString.length; i++) {
      if (payloadString[i] === "x" || payloadString[i] === "o") {
        arr[i] = payloadString[i];
      }
    }

    // Create the object
    const resultObject = {
      payload: arr,
      game: gameId,
    };

    console.log(resultObject);
    return resultObject;
  };

  const convertJsonToString = (inputJson: any) => {
    const { payload, game, turn } = inputJson;
    const payloadString = payload
      .map((char: any) => (char === "x" || char === "o" ? char : "-"))
      .join("");
    const resultString = `${payloadString}_${game}_${turn}`;
    console.log("result String ", resultString);
    return resultString;
  };

  // const [signer, setSigner] = useState<Wallet>();

  useEffect(() => {
    console.log(chain?.chain);
    if (chain?.chain === "Polygon") {
      setSourceChain(5);
      setTargetChain(2);
    }
  }, []);

  useEffect(() => {
    if (!signer) {
      return;
    }
    const sourceContract = getHelloWormhole(sourceChain, signer as Wallet);
    const targetContract = getHelloWormhole(targetChain, signer as Wallet);
    setSourceHelloWormholeContract(sourceContract);
    setTargetHelloWormholeContract(targetContract);
  }, [signer]);

  useEffect(() => {
    console.log(
      sourceHelloWormholeContract?.latestGreeting,
      "sourceHelloWormholeContract"
    );
    console.log(
      targetHelloWormholeContract?.latestGreeting,
      "targetHelloWormholeContract"
    );
  }, [sourceHelloWormholeContract, targetHelloWormholeContract]);
  // smart contract events

  useEffect(() => {
    const hello = (greeting: string, senderChain: number, sender: string) => {
      console.log("Source Triggered:", greeting, senderChain, sender);
    };

    // sourceHelloWormholeContract.on();
    console.log(sourceHelloWormholeContract, "sourceHelloWormholeContract");
    if (sourceHelloWormholeContract) {
      sourceHelloWormholeContract.on(
        "GreetingReceived",
        (greeting: string, senderChain: number, sender: string) => {
          console.log("Source Triggered:", greeting, senderChain, sender);

          console.log(greeting, "greeting");
          // get json from string greeting
          // const msg = JSON.parse(greeting);
          const msg = convertStringToJson(greeting);
          setSquares(msg.payload);
          console.log(turn, "at source");
          turn === "x" ? setTurn("o") : setTurn("x");
        }
      );
    } else {
      console.log("loading...");
    }

    return () => {
      if (sourceHelloWormholeContract) {
        sourceHelloWormholeContract.removeAllListeners("GreetingReceived");
      }
    };
  }, [sourceHelloWormholeContract, signer]);

  useEffect(() => {
    console.log(targetHelloWormholeContract, "targethelloworldcontract");

    if (targetHelloWormholeContract) {
      targetHelloWormholeContract.on(
        "GreetingReceived",
        (greeting: string, senderChain: number, sender: string) => {
          // console.log('Target Triggered:', greeting, senderChain, sender);

          console.log(greeting, "greeting");
          const msg = convertStringToJson(greeting);

          setSquares(msg.payload);
          console.log(turn, "at dest");
          turn === "x" ? setTurn("o") : setTurn("x");
        }
      );
    } else {
      console.log("loading...");
    }

    return () => {
      if (targetHelloWormholeContract) {
        targetHelloWormholeContract.removeAllListeners("GreetingReceived");
      }
    };
  }, [targetHelloWormholeContract, signer]);

  const runHelloWormholeIntegrationTest = async (message: string) => {
    try {
      console.log("message ", message);
      if (!signer) {
        return;
      }

      const sourceHelloWormholeContract = getHelloWormhole(
        sourceChain,
        signer as Wallet
      );
      const targetHelloWormholeContract = getHelloWormhole(
        targetChain,
        signer as Wallet
      );

      const cost = await sourceHelloWormholeContract.quoteCrossChainGreeting(
        targetChain
      );
      console.log(
        `Cost of sending the greeting: ${ethers.utils.formatEther(
          cost
        )} testnet AVAX`
      );

      console.log(`Sending greeting: ${message}`);
      const tx = await sourceHelloWormholeContract.sendCrossChainGreeting(
        targetChain,
        targetHelloWormholeContract.address,
        message,
        { value: cost }
      );
      console.log(`Transaction hash: ${tx.hash}`);
      const rx = await tx.wait();

      // const sChain = sourceChain;
      const deliveryHash = await getDeliveryHash(
        rx,
        CHAIN_ID_TO_NAME[sourceChain as keyof typeof CHAIN_ID_TO_NAME],
        { network: "TESTNET" }
      );

      console.log("Waiting for delivery...");

      console.log(deliveryHash);
      console.log(`Reading greeting`);
    } catch (err) {
      setSquares(squares);
    }
  };

  // prevents hydration error
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen w-screen flex justify-center items-center flex-col">
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

        {/* <button onClick={() => runHelloWormholeIntegrationTest("hello")}>
          Send Message
        </button>
        <button onClick={() => convertStringToJson("-X-------_1234")}>
          Get greeting
        </button> */}
        {/* <button
          onClick={() =>
            convertJsonToString({
              payload: ["X", "", "", "", "", "", "", "", ""],
              game: "1234",
            })
          }
        >
          Get greeting
        </button> */}
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
