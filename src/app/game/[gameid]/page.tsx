"use client"
import useDB from '@/hooks/useDB'
import { useAddress } from '@thirdweb-dev/react';
import { Router } from 'lucide-react';
import React from 'react'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GameId = ({ params }) => {
    const { db } = useDB();
    const address = useAddress();

    const router = useRouter();
    useEffect(() => {
        const stmt = db.prepare("SELECT * FROM tictactoegames_11155111_152 WHERE id = ? AND player1 = ?").bind(params.gameid, address);
        const getData = async () => {
            const result = await stmt.all();
            console.log(result)
            if (result.results.length === 0) {
                router.push('/dashboard');
            }
        }
        getData();
        console.log(address);
    }, [db, params.gameid, address]);

    return (
        <div>
            {params.gameid}
        </div>
    )
}

export default GameId
