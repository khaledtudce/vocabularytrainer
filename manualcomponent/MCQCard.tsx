"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import useActiveWords from "@/lib/useActiveWords";

type MCQCardType = {
  mcqdirection: string;
};

const MCQCard = ({ mcqdirection }: MCQCardType) => {
  const { words } = useActiveWords();
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const currentWord = words?.[index];

  useEffect(() => {
    setIndex(0);
  }, [words]);

  useEffect(() => {
    setSelectedAnswer("");

    if (!currentWord) return;

    const shuffle = <T,>(arr: T[]) => arr.sort(() => 0.5 - Math.random());

    if (mcqdirection === "germanToBangla") {
      const correct = currentWord?.bangla;
      const wrong = words
        .filter((w) => w?.word !== currentWord?.word)
        .map((w) => w?.bangla)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setOptions(shuffle([...wrong, correct]));
    } else if (mcqdirection === "banglaToGerman" || mcqdirection === "meaningToGerman") {
      const correct = currentWord?.word;
      const wrong = words
        .filter((w) => w?.bangla !== currentWord?.bangla)
        .map((w) => w?.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setOptions(shuffle([...wrong, correct]));
    } else if (mcqdirection === "germanToEnglish") {
      const correct = currentWord?.english;
      const wrong = words
        .filter((w) => w?.word !== currentWord?.word)
        .map((w) => w?.english)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setOptions(shuffle([...wrong, correct]));
    } else if (mcqdirection === "englishToGerman") {
      const correct = currentWord?.word;
      const wrong = words
        .filter((w) => w?.english !== currentWord?.english)
        .map((w) => w?.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setOptions(shuffle([...wrong, correct]));
    }
  }, [index, currentWord, mcqdirection, words]);

  const prevWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  const nextWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => (prev >= (words?.length - 1 || 0) ? (words?.length - 1 || 0) : prev + 1));
  };

  return (
    <div className="w-full h-[83vh] flex flex-col items-center p-1 bg-gray-100 rounded-lg shadow-md gap-2">
      {words.length === 0 && (
        <div className="mt-5 p-1 sm:p-3 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold text-gray-600">No words available</p>
        </div>
      )}
      {words.length > 0 && (
        <>
          <div className="mt-5 p-1 sm:p-3 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
        {mcqdirection === "germanToBangla" && (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold mb-5">
              {currentWord?.id}. {currentWord?.word}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.bangla
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">{selectedAnswer === currentWord?.bangla ? "Correct! ✅" : "Wrong ❌"}</p>
                <Button className="bg-gray-400" onClick={() => setSelectedAnswer("")}>Clear</Button>
              </div>
            )}
          </>
        )}

        {mcqdirection === "banglaToGerman" && (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold mb-5">
              {currentWord?.id}. {currentWord?.bangla}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.word
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">{selectedAnswer === currentWord?.word ? "Correct! ✅" : "Wrong ❌"}</p>
                <Button className="bg-gray-500" onClick={() => setSelectedAnswer("")}>Clear</Button>
              </div>
            )}
          </>
        )}

        {mcqdirection === "germanToEnglish" && (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold mb-5">
              {currentWord?.id}. {currentWord?.word}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.english
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">{selectedAnswer === currentWord?.english ? "Correct! ✅" : "Wrong ❌"}</p>
                <Button className="bg-gray-500" onClick={() => setSelectedAnswer("")}>Clear</Button>
              </div>
            )}
          </>
        )}

        {mcqdirection === "englishToGerman" && (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold mb-5">
              {currentWord?.id}. {currentWord?.english}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.word
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">{selectedAnswer === currentWord?.word ? "Correct! ✅" : "Wrong ❌"}</p>
                <Button className="bg-gray-500" onClick={() => setSelectedAnswer("")}>Clear</Button>
              </div>
            )}
          </>
        )}

        {mcqdirection === "meaningToGerman" && (
          <>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">{currentWord?.id}. {currentWord?.bangla}</h1>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">{currentWord?.english}</h1>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">{currentWord?.synonym}</h1>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.word
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">{selectedAnswer === currentWord?.word ? "Correct! ✅" : "Wrong ❌"}</p>
                <Button className="bg-gray-500" onClick={() => setSelectedAnswer("")}>Clear</Button>
              </div>
            )}
          </>
        )}
      </div>
        </>
      )}
      <div className="flex py-5 items-center gap-20">
        <Button className="bg-lime-700" onClick={prevWord} disabled={words.length === 0 || index === 0}>Previous</Button>
        <Button className="bg-lime-700" onClick={nextWord} disabled={words.length === 0 || index === words.length - 1 || selectedAnswer === ""}>Next</Button>
      </div>
    </div>
  );
};

export default MCQCard;
