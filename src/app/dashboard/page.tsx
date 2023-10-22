"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {toast} from "@/components/ui/use-toast";
import useDB from "@/hooks/useDB";
import {useAddress} from "@thirdweb-dev/react";
import {useTime} from "framer-motion";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function Dashboard() {
  const {db} = useDB();
  const router = useRouter();
  const [gameNo, setGameNo] = useState(0);
  const address = useAddress();

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const createGamefunc = async () => {
    try {
      // insert data
      // const insertData = async () => {
      const stmt = db.prepare(
        "SELECT COUNT(*) FROM tictactoegames_11155111_152"
      );
      const result = await stmt.all();
      console.log(result.results[0]["count(*)"]);
      const count = result.results[0]["count(*)"];
      const newGameNo = count + 1;
      console.log("new game no", newGameNo);
      const insertNewGame = db
        .prepare(
          `INSERT INTO tictactoegames_11155111_152 (id, player1, date) VALUES (?, ?, ?);`
        )
        .bind(newGameNo, address, new Date().toISOString())
        .run();

      setLoading1(true);
      insertNewGame
        .then(({meta: update}) => {
          update.txn
            .wait()
            .then(() => {
              console.log("Success inserting data");
              router.push(`/game/${newGameNo}`);
            })
            .catch((err) => {
              console.log("Error while waiting for the transaction:", err);
            });
        })
        .catch((err) => {
          console.log("Error inserting data:", err);
        });

      setTimeout(() => {
        router.push(`/game/${newGameNo}`);
        setLoading1(false);
      }, 20000);

      // setGameNo(newGameNo);
      // setGameNo((prevGameNo) => {
      //   console.log("id of the state", prevGameNo);

      //   console.log("preparation done---")

      //   return prevGameNo; // Return the updated state
      // });

      // const insertNewGame = db
      //   .prepare(
      //     `INSERT INTO tictactoegames_11155111_152 (id, player1, date) VALUES (?, ?, ?);`
      //   )
      //   .bind(gameNo, address, new Date().toISOString());
      // const res = await insertNewGame.run();
      // console.log(res, "success inserting data");
      // router.push(`/game/${gameNo}`);
      // };
      // insertData();
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const [gameId, setGameId] = useState(0);

  const handleSubmit = async () => {
    console.log("handle submit");
    setLoading2(true);
    if (gameId === 0) {
      toast({
        title: "Game Id cannot be empty",
        description: "Please enter a valid game id",
        variant: "destructive",
      });
      setLoading2(false);
      return;
    }
    try {
      const stmt = db
        .prepare("SELECT * FROM tictactoegames_11155111_152 WHERE id = ?")
        .bind(gameId);
      const result = await stmt.all();
      console.log("-----");
      console.log(result.results[0]);
      const count = result.results.length;

      if (count > 0) {
        console.log(address, "address", address?.toLowerCase());
        if (
          result.results[0].player1 &&
          result.results[0].player1.toLowerCase() === address?.toLowerCase()
        ) {
          router.push(`/game/${gameId}`);
        } else if (
          result.results[0].player2 &&
          result.results[0].player2.toLowerCase() === address?.toLowerCase()
        ) {
          router.push(`/game/${gameId}`);
        } else if (
          result.results[0].player2 &&
          result.results[0].player1 &&
          result.results[0].player2.toLowerCase() !== address?.toLowerCase() &&
          result.results[0].player2.toLowerCase() !== ""
        ) {
          alert("Game already full");
          return;
        }
      }

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

        setLoading2(true);
        await update.txn.wait();
        console.log("Success updating data");
        setLoading2(false);
        router.push(`/game/${gameId}`);
      }
    } catch (err: any) {
      console.log("error occurred ----------");
      console.log(err.message);
    } finally {
      setLoading2(false);
    }
  };
  return (
    <div className="grid place-items-center min-h-screen w-screen">
      <div className="flex flex-col space-y-5">
        <div>{address}</div>
        {loading1 ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating..
          </Button>
        ) : (
          <Button onClick={createGamefunc}>Create Game</Button>
        )}
        <div className="flex space-x-3">
          <Input
            placeholder="Enter Game Id..."
            name="gameno"
            onChange={(e) => {
              setGameId(parseInt(e.target.value));
            }}
          />
          {!loading2 ? (
            <Button
              onClick={() => {
                handleSubmit();
                handleSubmit();
              }}
            >
              Join Game
            </Button>
          ) : (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
