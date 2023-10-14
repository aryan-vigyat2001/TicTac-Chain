'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">
      <p className="font-bold text-6xl m-4">Thirdweb Auth</p>
      <Button onClick={() => router.push("/connectwallet")}>Get Started</Button>
    </div>
  )
}
