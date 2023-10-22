"use client";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {toast} from "@/components/ui/use-toast";
import useDB from "@/hooks/useDB";
import {useAddress, useChain} from "@thirdweb-dev/react";
import {useTime} from "framer-motion";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export default function Dashboard() {
  const {db} = useDB();
  const router = useRouter();
  const [gameNo, setGameNo] = useState(0);
  const address = useAddress();
  const chain = useChain();

  useEffect(() => {
    if (!address) {
      router.push("/connectwallet");
    }
  }, [address]);

  const [loading1, setLoading1] = useState(false);

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

  const handleSubmit = async (id: any, index: number) => {
    console.log("handle submit");
    setLoadingStates((prevStates) => {
      prevStates[index] = true; // Set loading state for this button
      return [...prevStates];
    });

    if (id === 0) {
      toast({
        title: "Game Id cannot be empty",
        description: "Please enter a valid game id",
        variant: "destructive",
      });
      setLoadingStates((prevStates) => {
        prevStates[index] = false; // Set loading state for this button
        return [...prevStates];
      });

      return;
    }
    try {
      const stmt = db
        .prepare("SELECT * FROM tictactoegames_11155111_152 WHERE id = ?")
        .bind(id);
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
          router.push(`/game/${id}`);
        } else if (
          result.results[0].player2 &&
          result.results[0].player2.toLowerCase() === address?.toLowerCase()
        ) {
          router.push(`/game/${id}`);
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
          .bind(address, id)
          .run();

        setLoadingStates((prevStates) => {
          prevStates[index] = true; // Reset loading state
          return [...prevStates];
        });

        await update.txn.wait();
        console.log("Success updating data");
        setLoadingStates((prevStates) => {
          prevStates[index] = false; // Reset loading state
          return [...prevStates];
        });

        router.push(`/game/${id}`);
      }
    } catch (err: any) {
      console.log("error occurred ----------");
      console.log(err.message);
    } finally {
      setLoadingStates((prevStates) => {
        prevStates[index] = false; // Reset loading state
        return [...prevStates];
      });
    }
  };

  const [fetchAllGame, setFetchAllGame] = useState([]);
  const [loadingStates, setLoadingStates] = useState(Array(4).fill(false));

  useEffect(() => {
    (async () => {
      try {
        const stmt = db
          .prepare(
            "SELECT * FROM tictactoegames_11155111_152 WHERE player2 IS NOT NULL ORDER BY id DESC LIMIT 5;"
          )
          .bind();
        const data = await stmt.all();
        setFetchAllGame(data && data.results);
        setLoadingStates(Array(data && data.results.length).fill(false));
        console.log(data && data.result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);
  return (
    <div className="flex justify-around items-center min-h-screen w-screen space-x-5">
      <div className="flex flex-col space-y-5 items-center">
        <Badge className="w-fit flex">
          <div
            className={`rounded-full mr-[4px] h-2 w-2 ${
              chain &&
              (chain.chain === "Polygon"
                ? "bg-purple-700"
                : chain.chain === "AVAX"
                ? "bg-red-700"
                : "bg-red-700")
            }`}
          ></div>
          {chain && (chain.chain === "Polygon" ? "Mumbai" : "Avalanche")}
        </Badge>
        {loading1 ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating..
          </Button>
        ) : (
          <Button className="w-[250px]" onClick={createGamefunc}>
            Create Game
          </Button>
        )}
        {/* <div className="flex space-x-3">
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
        </div> */}
      </div>
      <div>
        <p className="text-center p-4 font-semibold text-lg">Recent Games</p>
        <div className="avail-game flex-col h-[500px] w-[390px] p-2 rounded-xl overflow-auto border-[1px] border-gray-500 flex items-center gap-3">
          {fetchAllGame.length !== 0
            ? fetchAllGame.map((data, idx) => (
                <Card className="w-[350px] h-full" key={idx}>
                  <CardHeader>
                    <CardTitle className="text-xl text-center">Game</CardTitle>
                    {/* <CardDescription>
                  Deploy your new project in one-click.
                </CardDescription> */}
                  </CardHeader>
                  <CardContent className="grid place-content-center text-2xl">
                    {data && data.id}
                  </CardContent>
                  <CardFooter className="flex justify-between w-full">
                    {data &&
                    data.player2 &&
                    data.player1 &&
                    (data.player2.toLowerCase() === address.toLowerCase() ||
                      data.player1.toLowerCase() === address.toLowerCase()) ? (
                      !loadingStates[idx] ? (
                        <Button
                          onClick={() => {
                            setLoadingStates((prevStates) => {
                              prevStates[idx] = true; // Set loading state for this button
                              return [...prevStates];
                            });
                            handleSubmit(data.id, idx);
                            handleSubmit(data.id, idx);
                          }}
                          size="sm"
                          className="w-full"
                        >
                          Join left Game
                        </Button>
                      ) : (
                        <Button disabled size="sm" className="w-full">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </Button>
                      )
                    ) : data && data.player2 ? (
                      <Button disabled size={"sm"} className="w-full">
                        Game Full
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handleSubmit(data.id, idx);
                          handleSubmit(data.id, idx);
                        }}
                        size={"sm"}
                        className="w-full"
                      >
                        Join Game
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            : [1, 2, 3, 4].map(() => (
                <Card className="w-[350px] h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">Game</CardTitle>
                    {/* <CardDescription>
                  Deploy your new project in one-click.
                </CardDescription> */}
                  </CardHeader>
                  <CardContent className="grid place-content-center text-2xl">
                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                  </CardContent>
                  <CardFooter className="flex justify-between w-full">
                    <Skeleton className="w-full h-[20px] rounded-full" />
                  </CardFooter>
                </Card>
              ))}
        </div>
      </div>
    </div>
  );
}
