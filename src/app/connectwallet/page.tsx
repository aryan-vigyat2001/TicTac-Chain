"use client";

import {
  metamaskWallet,
  useAddress,
  useChain,
  useConnect,
  useDisconnect,
  useNetwork,
  useNetworkMismatch,
  useSwitchChain,
} from "@thirdweb-dev/react";
import {useEffect} from "react";
import {Mumbai, AvalancheFuji} from "@thirdweb-dev/chains";
import {useRouter} from "next/navigation";
import {toast} from "@/components/ui/use-toast";
import {Button} from "@/components/ui/button";
import {DBContext} from "@/context/DBContext";
import {useContext} from "react";
const metamaskConfig = metamaskWallet();

export default function ConnectWalletComponent() {
  const walletaddress = useAddress();
  const connect = useConnect();
  const isMismatch = useNetworkMismatch();
  const router = useRouter();
  const chain = useChain();
  const address = useAddress();
  const [, switchNetwork] = useNetwork();

  const {globalChain, setGlobalChain, setGlobalTurn} = useContext(DBContext);
  //
  // useEffect(() => {
  //   if (!isMismatch && walletaddress) {
  //     router.push("/dashboard");
  //   }

  //   // if (walletaddress && isMismatch) {
  //   //   router.push("/switchnetwork");
  //   // }
  // }, [isMismatch, walletaddress]);

  //
  const connectWallet = async () => {
    try {
      const tempChainId =
        globalChain === "avalanche-fuji"
          ? AvalancheFuji.chainId
          : Mumbai.chainId;
      const wallet = await connect(metamaskConfig, {chainId: tempChainId});
      console.log(wallet);
      toast({
        title: "Connected!",
        description: "You are now connected to your wallet.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Couldn't Connect",
      });
    }
  };

  const changeChain = () => {
    console.log("change chain", globalChain);
    if (globalChain === "avalanche-fuji") {
      setGlobalChain("mumbai");
      switchNetwork(Mumbai.chainId);
      setGlobalTurn("x");
    } else {
      setGlobalChain("avalanche-fuji");
      setGlobalTurn("o");
      switchNetwork(AvalancheFuji.chainId);
    }
  };

  useEffect(() => {
    if (chain && chain.chain === "AVAX") {
      setGlobalChain("avalanche-fuji");
    } else if (chain && chain.chain === "Polygon") {
      setGlobalChain("mumbai");
    }
  }, [chain]);

  return (
    <div className="h-screen w-screen ">
      <div className="text-center p-5 h-[10%] w-screen flex flex-col space-y-2">
        <p className="text-lg font-bold">
          Chain:{" "}
          {globalChain === "avalanche-fuji"
            ? "Avalanche Fuji"
            : globalChain === "mumbai"
            ? "Polygon Mumbai"
            : globalChain}
        </p>
        {address && <p className="text-center text-sm">Address: {address}</p>}
      </div>
      <div className="h-[80%] w-screen flex justify-center items-center space-x-5 ">
        {address && <Button onClick={changeChain}>Change Active Chain</Button>}
        {address === undefined ? (
          <Button onClick={connectWallet}>Connect Wallet</Button>
        ) : (
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
