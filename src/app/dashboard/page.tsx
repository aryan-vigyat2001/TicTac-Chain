"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import useDB from "@/hooks/useDB";
import {useAddress} from "@thirdweb-dev/react";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function Dashboard() {
  const {db} = useDB();
  const router = useRouter();
  const [gameNo, setGameNo] = useState(0);
  const address = useAddress();
  const createGamefunc = async () => {
    try {
      // insert data
      const insertData = async () => {
        const stmt = db.prepare(
          "SELECT COUNT(*) FROM tictactoegames_11155111_152"
        );
        const result = await stmt.all();
        console.log(result.results[0]["count(*)"]);
        const count = result.results[0]["count(*)"];
        const newGameNo = count + 1;

        setGameNo(newGameNo);
        setGameNo((prevGameNo) => {
          console.log("id of the state", prevGameNo);
          const insertNewGame = db
            .prepare(
              `INSERT INTO tictactoegames_11155111_152 (id, player1, date) VALUES (?, ?, ?);`
            )
            .bind(prevGameNo, address, new Date().toISOString());
          const res = insertNewGame.run();
          console.log(res, "success inserting data");
          router.push(`/game/${prevGameNo}`);
          return prevGameNo; // Return the updated state
        });

        // const insertNewGame = db
        //   .prepare(
        //     `INSERT INTO tictactoegames_11155111_152 (id, player1, date) VALUES (?, ?, ?);`
        //   )
        //   .bind(gameNo, address, new Date().toISOString());
        // const res = await insertNewGame.run();
        // console.log(res, "success inserting data");
        // router.push(`/game/${gameNo}`);
      };
      insertData();
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const [gameId, setGameId] = useState(0);

  const handleSubmit = async () => {
    try {
      const stmt = db
        .prepare("SELECT * FROM tictactoegames_11155111_152 WHERE id = ?")
        .bind(gameId);
      const result = await stmt.all();
      console.log("-----");
      console.log(result.results[0]);
      const count = result.results.length;
      if (count === 0) {
        alert("Game not found");
        return;
      } else {
        // console.log("gameId", gameId);
        // console.log("address here", address);
        const {meta: update} = await db
          .prepare(
            `UPDATE tictactoegames_11155111_152 SET player2 = ? WHERE id = ?`
          )
          .bind(address, gameId)
          .run();

        await update.txn.wait();
        router.push(`/game/${gameId}`);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };
  return (
    <div className="grid place-items-center min-h-screen w-screen">
      <div className="flex flex-col space-y-5">
        <Button onClick={createGamefunc}>Create Game</Button>
        <div className="flex space-x-3">
          <Input
            placeholder="Enter Game Id..."
            name="gameno"
            onChange={(e) => {
              setGameId(parseInt(e.target.value));
            }}
          />
          <Button onClick={handleSubmit}>Join Game</Button>
        </div>
      </div>
    </div>
  );
}
