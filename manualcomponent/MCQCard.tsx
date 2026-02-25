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

  const progressPercent = words.length > 0 ? ((index + 1) / words.length) * 100 : 0;
  const getCorrectAnswer = () => {
    if (mcqdirection === "germanToBangla") return currentWord?.bangla;
    if (mcqdirection === "banglaToGerman") return currentWord?.word;
    if (mcqdirection === "germanToEnglish") return currentWord?.english;
    if (mcqdirection === "englishToGerman") return currentWord?.word;
    if (mcqdirection === "meaningToGerman") return currentWord?.word;
    return "";
  };

  const getQuestion = () => {
    if (mcqdirection === "germanToBangla") return currentWord?.word;
    if (mcqdirection === "banglaToGerman") return currentWord?.bangla;
    if (mcqdirection === "germanToEnglish") return currentWord?.word;
    if (mcqdirection === "englishToGerman") return currentWord?.english;
    if (mcqdirection === "meaningToGerman") {
      return `${currentWord?.bangla} • ${currentWord?.english} • ${currentWord?.synonym}`;
    }
    return "";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-0">
      {words.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 3 9.5 3 13.757c0 4.257 3 6.5 9 9.5m0-13c5.5-3 9-1.243 9-9.5 0-4.257-3-7.504-9-7.504z" />
              </svg>
            </div>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Words Available</p>
          <p className="text-sm sm:text-base text-gray-600">Select words to start practicing</p>
        </div>
      )}

      {words.length > 0 && (
        <div className="space-y-4 sm:space-y-6 mx-0">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-xs sm:text-sm font-bold text-indigo-600">{index + 1} / {words.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* MCQ Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-white text-xs sm:text-sm font-semibold tracking-widest">QUESTION {index + 1}</p>
            </div>

            <div className="p-4 sm:p-8 md:p-12 space-y-4 sm:space-y-6">
              {/* Question */}
              <div className="text-center">
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-3">Translate or choose:</p>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-700 break-words leading-tight">
                  {getQuestion()}
                </p>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                {options.map((option, idx) => {
                  const isCorrect = option === getCorrectAnswer();
                  const isSelected = selectedAnswer === option;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedAnswer(option)}
                      className={`px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base border-2 transition-all duration-200 break-words ${
                        isSelected
                          ? isCorrect
                            ? "bg-green-400 border-green-600 text-white shadow-lg"
                            : "bg-red-400 border-red-600 text-white shadow-lg"
                          : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 text-gray-800 hover:border-indigo-400 hover:shadow-md"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {selectedAnswer && (
                <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl font-semibold text-center ${
                  selectedAnswer === getCorrectAnswer()
                    ? "bg-green-100 border-2 border-green-500 text-green-700"
                    : "bg-red-100 border-2 border-red-500 text-red-700"
                }`}>
                  <p className="text-sm sm:text-base">
                    {selectedAnswer === getCorrectAnswer() ? "✅ Correct!" : "❌ Wrong"}
                  </p>
                  {selectedAnswer !== getCorrectAnswer() && (
                    <p className="text-xs sm:text-sm mt-1">Correct answer: <span className="font-bold">{getCorrectAnswer()}</span></p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <Button
              onClick={prevWord}
              disabled={index === 0}
              className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                index === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
              }`}
            >
              ← Previous
            </Button>
            <Button
              onClick={nextWord}
              disabled={index === words.length - 1 || selectedAnswer === ""}
              className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                index === words.length - 1 || selectedAnswer === ""
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
              }`}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MCQCard;
