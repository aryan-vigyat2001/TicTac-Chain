"use client";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col space-y-10">
      <p className="font-bold text-6xl m-4">Tic-TacChain</p>
      <p className="text-2xl m-4">
        Bridging the Blockchain Divide, One Move at a Time
      </p>
      <Button onClick={() => router.push("/connectwallet")}>Get Started</Button>
    </div>
  );
}
