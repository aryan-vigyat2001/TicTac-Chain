"use client"
import { ReactNode, createContext } from "react"
import { Database } from "@tableland/sdk";
export const DBContext = createContext({})
import { Wallet, getDefaultProvider } from "ethers";
const DBContextProvider = ({ children }: { children: ReactNode }) => {
    const privateKey = "ef8603879b447a3dba4c1b309eede6a0d10a73bb54ad3f19a01eb6b0badb5e50";
    const wallet = new Wallet(privateKey);
    const provider = getDefaultProvider("https://eth-sepolia.g.alchemy.com/v2/M81ns-h41WEoIXkIMvBzNFRDuEgxcfGY");
    const signer2 = wallet.connect(provider);
    // Connect to the database
    const db = new Database({ signer2 });
    return (
        <DBContext.Provider value={{ db }}>
            {children}
        </DBContext.Provider>
    )
}

export default DBContextProvider;
