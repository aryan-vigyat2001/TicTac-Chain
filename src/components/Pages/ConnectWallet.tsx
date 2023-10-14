"use client";

import {
  metamaskWallet,
  useAddress,
  useChain,
  useConnect,
  useDisconnect,
  useNetworkMismatch,
  useSwitchChain,
} from "@thirdweb-dev/react";
import {useEffect} from "react";
import {Button} from "../ui/button";
import {toast} from "../ui/use-toast";
import {Mumbai} from "@thirdweb-dev/chains";
import {useRouter} from "next/navigation";

const metamaskConfig = metamaskWallet();

export default function ConnectWalletComponent() {
  const walletaddress = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const chain = useChain();
  const isMismatch = useNetworkMismatch();
  const switchChain = useSwitchChain();
  const router = useRouter();
  //
  useEffect(() => {
    if (!isMismatch && walletaddress) {
      router.push("/dashboard");
    }

    if (walletaddress && isMismatch) {
      router.push("/switchnetwork");
    }
  }, [isMismatch, walletaddress]);

  //
  const connectWallet = async () => {
    try {
      const wallet = await connect(metamaskConfig, {chainId: 80001});
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
        description: err.message,
      });
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">
      <Button onClick={connectWallet}>Connect Wallet</Button>
    </div>
  );
}
