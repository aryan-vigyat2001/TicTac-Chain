"use client";

import {Button} from "@/components/ui/button";
import {
  useAddress,
  useNetwork,
  useNetworkMismatch,
  useSwitchChain,
} from "@thirdweb-dev/react";
import {Mumbai} from "@thirdweb-dev/chains";
import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function SwitchNetwork() {
  const switchChain = useSwitchChain();
  const address = useAddress();
  const router = useRouter();
  const isMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  useEffect(() => {
    if (!address) {
      router.push("/connectwallet");
    }
    if (!isMismatch && address) {
      router.push("/dashboard");
    }
  }, [address, isMismatch, router]);

  return (
    <div className="flex justify-center items-center flex-col h-screen w-screen">
      <div>
        <Button onClick={() => switchNetwork(Mumbai.chainId)}>
          Switch Network
        </Button>
      </div>
    </div>
  );
}
