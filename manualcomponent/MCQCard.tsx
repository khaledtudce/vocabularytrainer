"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { WordList } from "@/data/wordlists";

type MCQCardType = {
  selectedWordIdFrom: number;
  selectedWordIdTo: number;
  mcqdirection: string;
};

const MCQCard = ({
  selectedWordIdFrom,
  selectedWordIdTo,
  mcqdirection,
}: MCQCardType) => {
  const [index, setIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const currentWord = WordList[index];

  useEffect(() => {
    setIndex(selectedWordIdFrom - 1);
  }, [selectedWordIdFrom]);

  useEffect(() => {
    setSelectedAnswer("");
    if (mcqdirection === "germanToBangla") {
      const getRandomBanglaOptionsForGerman = () => {
        const correctAnswer = currentWord?.bangla;
        const wrongAnswers = WordList.filter(
          (w) => w?.word !== currentWord?.word
        )
          .map((w) => w?.bangla)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomBanglaOptionsForGerman());
    } else if (
      mcqdirection === "banglaToGerman" ||
      mcqdirection === "meaningToGerman"
    ) {
      const getRandomGermanOptionsForBangla = () => {
        const correctAnswer = currentWord?.word;
        const wrongAnswers = WordList.filter(
          (w) => w?.bangla !== currentWord?.bangla
        )
          .map((w) => w?.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomGermanOptionsForBangla());
    } else if (mcqdirection === "germanToEnglish") {
      const getRandomEnglishOptionsForGerman = () => {
        const correctAnswer = currentWord?.english;
        const wrongAnswers = WordList.filter(
          (w) => w?.word !== currentWord?.word
        )
          .map((w) => w?.english)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomEnglishOptionsForGerman());
    } else if (mcqdirection === "englishToGerman") {
      const getRandomGermanOptionsForEnglish = () => {
        const correctAnswer = currentWord?.word;
        const wrongAnswers = WordList.filter(
          (w) => w?.english !== currentWord?.english
        )
          .map((w) => w?.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomGermanOptionsForEnglish());
    }
  }, [index, currentWord, mcqdirection]);

  const prevWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev <= selectedWordIdFrom) {
        return selectedWordIdFrom - 1;
      } else {
        return (prev - 1) % WordList.length;
      }
    });
  };

  const nextWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev >= selectedWordIdTo - 1) {
        return selectedWordIdTo - 1;
      } else {
        return (prev + 1) % WordList.length;
      }
    });
  };

  return (
    <div className="w-full h-[83vh] flex flex-col items-center p-1 bg-gray-100 rounded-lg shadow-md gap-2">
      <div className="flex py-5 items-center gap-20">
        <Button className="bg-lime-700" onClick={prevWord}>
          Previous
        </Button>
        <Button className="bg-lime-700" onClick={nextWord}>
          Next
        </Button>
      </div>

      <div className="p-1 sm:p-3 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
        {mcqdirection === "germanToBangla" && (
          <>
            <h3 className="text-xl sm:text-2xl font-semibold mb-5">
              {currentWord?.id}. {currentWord?.word}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.bangla
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => {
                    setSelectedAnswer(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">
                  {selectedAnswer === currentWord?.bangla
                    ? "Correct! ✅"
                    : "Wrong ❌"}
                </p>
                <Button
                  className="bg-gray-400"
                  onClick={() => {
                    setSelectedAnswer("");
                  }}
                >
                  Clear
                </Button>
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
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.word
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => {
                    setSelectedAnswer(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">
                  {selectedAnswer === currentWord?.word
                    ? "Correct! ✅"
                    : "Wrong ❌"}
                </p>
                <Button
                  className="bg-gray-500"
                  onClick={() => {
                    setSelectedAnswer("");
                  }}
                >
                  Clear
                </Button>
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
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.english
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => {
                    setSelectedAnswer(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">
                  {selectedAnswer === currentWord?.english
                    ? "Correct! ✅"
                    : "Wrong ❌"}
                </p>
                <Button
                  className="bg-gray-500"
                  onClick={() => {
                    setSelectedAnswer("");
                  }}
                >
                  Clear
                </Button>
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
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.word
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => {
                    setSelectedAnswer(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">
                  {selectedAnswer === currentWord?.word
                    ? "Correct! ✅"
                    : "Wrong ❌"}
                </p>
                <Button
                  className="bg-gray-500"
                  onClick={() => {
                    setSelectedAnswer("");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </>
        )}
        {mcqdirection === "meaningToGerman" && (
          <>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              {currentWord?.id}. {currentWord?.bangla}
            </h1>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              {currentWord?.english}
            </h1>
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">
              {currentWord?.synonym}
            </h1>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`p-2 rounded-md border border-fuchsia-700 ${
                    selectedAnswer === option
                      ? option === currentWord?.word
                        ? "bg-lime-400 ring-2"
                        : "bg-red-400 ring-2"
                      : "bg-fuchsia-50"
                  }`}
                  onClick={() => {
                    setSelectedAnswer(option);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {selectedAnswer && (
              <div className="mt-4 font-semibold flex items-center justify-center gap-5">
                <p className="font-semibold">
                  {selectedAnswer === currentWord?.word
                    ? "Correct! ✅"
                    : "Wrong ❌"}
                </p>
                <Button
                  className="bg-gray-500"
                  onClick={() => {
                    setSelectedAnswer("");
                  }}
                >
                  Clear
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MCQCard;
