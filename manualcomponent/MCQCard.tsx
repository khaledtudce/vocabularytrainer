"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { WordList } from "@/data/wordlists";

type MCQCardType = {
  selectedWordIdFrom: number;
  selectedWordIdTo: number;
};

const MCQCard = ({ selectedWordIdFrom, selectedWordIdTo }: MCQCardType) => {
  const [index, setIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [options, setOptions] = useState([]);
  const currentWord = WordList[index];

  useEffect(() => {
    setIndex(selectedWordIdFrom - 1);
  }, [selectedWordIdFrom]);

  useEffect(() => {
    setSelectedAnswer("");
    // Generate new options when the question changes
    const getRandomOptions = () => {
      const correctAnswer = currentWord?.bangla;
      const wrongAnswers = WordList.filter((w) => w?.word !== currentWord?.word)
        .map((w) => w?.bangla)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
    };

    setOptions(getRandomOptions());
  }, [index, currentWord]);

  const handleAnswerClick = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const prevWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev === selectedWordIdFrom) {
        return selectedWordIdFrom;
      } else {
        return (prev - 1) % WordList.length;
      }
    });
  };

  const nextWord = () => {
    // it goes to minus!!!!
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev === selectedWordIdTo) {
        return selectedWordIdTo;
      } else {
        return (prev + 1) % WordList.length;
      }
    });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <div className="">
        <Button className="mt-6 bg-lime-700" onClick={prevWord}>
          Previous
        </Button>
      </div>
      <div className="px-8">
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
          <h2 className="text-lg font-bold mb-4">
            Select the correct Bangla meaning:
          </h2>
          <h3 className="text-3xl font-semibold mb-4">
            {currentWord?.id}. {currentWord?.word}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-md border border-amber-400 ${
                  selectedAnswer === option
                    ? option === currentWord?.bangla
                      ? "bg-green-400"
                      : "bg-red-400"
                    : "bg-gray-200"
                }`}
                onClick={() => handleAnswerClick(option)}
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
                className="bg-gray-500"
                onClick={() => {
                  setSelectedAnswer("");
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>
        <Button className="mt-6 bg-lime-600" onClick={nextWord}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default MCQCard;
