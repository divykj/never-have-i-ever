import marked from "marked";
import Head from "next/head";
import { useCallback, useState } from "react";
import MultiSelect from "react-multi-select-component";

const categories = [
  { label: "Discord 🔵", value: "discord" },
  { label: "Embarassing 😳", value: "embarassing" },
  { label: "Food 🍲", value: "food" },
  { label: "Funny 😂", value: "funny" },
  { label: "Games 🎮", value: "games" },
  { label: "Gross 🤢", value: "gross" },
  { label: "Random 🎲", value: "random" },
  { label: "Rules 📄", value: "rules" },
  { label: "Couples 👫🔞", value: "nsfw/couples" },
  { label: "Dirty 💦🔞", value: "nsfw/dirty" },
  { label: "Girls 👩🔞", value: "nsfw/girls" },
  { label: "Guys 👨🔞", value: "nsfw/guys" },
];

function popRandomElement(array) {
  const index = Math.floor(Math.random() * array.length);
  return [array[index], array.filter((value) => value !== array[index])];
}

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [statements, setStatements] = useState([]);
  const [selectedStatement, setSelectedStatement] = useState();

  const selectNextStatement = useCallback(() => {
    const [newSelectedStatement, newStatements] = popRandomElement(statements);
    setSelectedStatement(newSelectedStatement);
    setStatements(newStatements);
  }, [statements]);

  const startGame = useCallback(async () => {
    setGameLoading(true);

    const responses = await Promise.all(
      selectedCategories.map(({ value }) => fetch(`data/${value}.txt`))
    );

    const texts = await Promise.all(
      responses.map((response) => response.text())
    );

    const statements = texts
      .map((text) => text.split("\n"))
      .reduce((a, b) => [...a, ...b], []);

    const [newSelectedStatement, newStatements] = popRandomElement(statements);
    setSelectedStatement(newSelectedStatement);
    setStatements(newStatements);
    setGameStarted(true);
    setGameLoading(false);
  }, [selectedCategories]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setGameLoading(false);
    setSelectedStatement(null);
    setStatements([]);
  }, []);

  return (
    <>
      <Head>
        <title>Never Have I Ever</title>
      </Head>
      {!gameStarted ? (
        <div className="min-h-screen p-8 bg-indigo-200 min-w-screen">
          <div className="flex flex-col items-center max-w-xl p-6 mx-auto space-y-8 bg-white rounded-lg shadow-lg">
            <h1 className="mt-6 text-5xl font-bold">Never Have I Ever</h1>
            <div className="w-full space-y-2">
              <h3 className="text-xl font-semibold">Select Categories</h3>
              <MultiSelect
                className="w-full"
                options={categories}
                value={selectedCategories}
                onChange={setSelectedCategories}
                labelledBy="Select"
              />
              <button
                disabled={selectedCategories.length === 0}
                className={
                  "w-full p-2 text-2xl text-white transition-all duration-150 rounded-md " +
                  (selectedCategories.length > 0 && !gameLoading
                    ? "shadow-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer"
                    : "bg-gray-300 cursor-not-allowed")
                }
                onClick={selectedCategories.length > 0 && startGame}
              >
                {gameLoading ? (
                  <div className="flex items-center justify-center p-1">
                    <div
                      className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin"
                      style={{ borderTopColor: "black" }}
                    ></div>
                  </div>
                ) : (
                  "Let's Play"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen p-8 bg-indigo-200 min-w-screen">
          <div className="flex flex-col items-center flex-1 max-w-xl p-6 mx-auto space-y-8 bg-white rounded-lg shadow-lg">
            <h1 className="mt-6 text-5xl font-bold">Never Have I Ever</h1>
            <h3
              className="flex items-center flex-1 p-8 mb-4 text-3xl font-semibold text-center bg-gray-100 rounded-lg shadow-inner"
              dangerouslySetInnerHTML={{
                __html: selectedStatement && marked(selectedStatement),
              }}
            />
            <p className="font-bold text-gray-500">{statements.length} left</p>
            <button
              disabled={selectedCategories.length === 0}
              className={
                "w-full p-2 text-2xl text-white transition-all duration-150 rounded-md " +
                (selectedCategories.length > 0 && !gameLoading
                  ? "shadow-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed")
              }
              onClick={statements.length > 0 ? selectNextStatement : resetGame}
            >
              {statements.length > 0 ? "Next" : "New Game"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
