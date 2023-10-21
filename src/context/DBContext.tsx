"use client";
import { ReactNode, createContext, useState } from "react";
import { Database } from "@tableland/sdk";
import { NonceManager } from "@ethersproject/experimental";
export const DBContext = createContext({});
import { Wallet, getDefaultProvider } from "ethers";
const DBContextProvider = ({ children }: { children: ReactNode }) => {
  const privateKey =
    "ef8603879b447a3dba4c1b309eede6a0d10a73bb54ad3f19a01eb6b0badb5e50";
  const wallet = new Wallet(privateKey);
  const provider = getDefaultProvider(
    "https://eth-sepolia.g.alchemy.com/v2/M81ns-h41WEoIXkIMvBzNFRDuEgxcfGY"
  );
  const baseSigner = wallet.connect(provider);
  // const signer2 = wallet.connect(provider);
  const signer = new NonceManager(baseSigner);
  const db = new Database({ signer });

  const [globalChain, setGlobalChain] = useState("avalanche-fuji");
  const [globalTurn, setGlobalTurn] = useState("o");
  // Connect to the database
  return (
    <DBContext.Provider
      value={{ db, globalChain, setGlobalChain, globalTurn, setGlobalTurn }}
    >
      {children}
    </DBContext.Provider>
  );
};

export default DBContextProvider;
