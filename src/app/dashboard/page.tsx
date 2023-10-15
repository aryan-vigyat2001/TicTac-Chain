"use client";

import { ModeToggle } from "@/components/Toggletheme";
import { Button } from "@/components/ui/button";
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

export default function Dashboard() {
  const chain = useChain();
  const router = useRouter();
  const address = useAddress();
  const isMismatch = useNetworkMismatch();
  const disconnect = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [words, setWords] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [wordToGuess, setWordToGuess] = useState<any>("");
  const [currentGuess, setCurrentGuess] = useState("");
  const [turn, setTurn] = useState(0);
  const [winner, setWinner] = useState<String | null>(null);
  const [ans, setAns] = useState<any>("");

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

  const createBoxes = (word: any) => {
    const boxArray = word.split("").map((letter: any) => ({
      letter,
      isRevealed: false,
    }));
    setBoxes(boxArray);
  };

  const startNewGame = () => {
    const randomWord = generate();
    setAns(randomWord);
    // console.log(randomWord, "randomWord");
    setWordToGuess(randomWord);
    setCurrentGuess("");
    setTurn(0);
    setWinner(null);
    createBoxes(randomWord);
  };

  const handleGuess = () => {
    const isCorrect = currentGuess === wordToGuess;
    if (isCorrect) {
      setWinner(turn);
      setBoxes((prevBoxes: any) =>
        prevBoxes.map((box: any) => ({ ...box, isRevealed: true }))
      );
    } else {
      setBoxes((prevBoxes) =>
        prevBoxes.map((box) => ({ ...box, isRevealed: false }))
      );
      setTurn(turn === 0 ? 1 : 0);
    }
  };

  // prevents hydration error
  useEffect(() => {
    setMounted(true);
    startNewGame();
  }, []);
  if (!mounted) return null;

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
      <div>Ans: {ans}</div>

      {winner !== null ? (
        <div className="text-xl">
          <p className="mb-2">
            Player {winner + 1} wins! The word was: {wordToGuess}
          </p>
          <button
            onClick={startNewGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Start New Game
          </button>
        </div>
      ) : (
        <div className="text-xl">
          <p className="mb-2">Player {turn + 1}'s turn</p>
          <input
            type="text"
            placeholder="Enter your guess"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            className="rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGuess}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ml-2"
          >
            Guess
          </button>
        </div>
      )}
    </div>
  );
}
