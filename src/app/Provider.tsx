"use client";

// import {ModeToggle} from "@/components/Toggletheme";
import {
  ConnectWallet,
  ThirdwebProvider,
  coinbaseWallet,
  metamaskWallet,
  phantomWallet,
  rainbowWallet,
  safeWallet,
  walletConnect,
} from "@thirdweb-dev/react";
// import * as React from "react";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import {ReactNode, useContext, useEffect, useState} from "react";
import {type ThemeProviderProps} from "next-themes/dist/types";
import {AvalancheFuji, Mumbai} from "@thirdweb-dev/chains";
import DBContextProvider, {DBContext} from "@/context/DBContext";

export function ThemeProvider({children, ...props}: ThemeProviderProps) {
  const {globalChain, setGlobalChain} = useContext(DBContext);
  const [arr, setArr] = useState([AvalancheFuji, Mumbai]);

  useEffect(() => {
    if (globalChain) {
      setArr([Mumbai, AvalancheFuji]);
    }
  }, [globalChain]);
  return (
    <ThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_CLIENT_ID}
      activeChain={globalChain || "avalanche-fuji"}
      supportedChains={arr}
      supportedWallets={[
        metamaskWallet({recommended: true}),
        coinbaseWallet(),
        walletConnect(),
        safeWallet({
          personalWallets: [
            metamaskWallet(),
            coinbaseWallet(),
            walletConnect(),
          ],
        }),
        rainbowWallet(),
        phantomWallet(),
      ]}
    >
      <DBContextProvider>
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </DBContextProvider>
    </ThirdwebProvider>
  );
}
