"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useActiveWords from "@/lib/useActiveWords";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type PageType = {
  page: string;
  direction: string;
};

const FlashCard = ({ page, direction }: PageType) => {
  const { words } = useActiveWords();
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);

  useEffect(() => {
    setIndex(0);
  }, [words]);

  const prevWord = () => {
    setShowMeaning(true);
    setIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  const nextWord = () => {
    setShowMeaning(true);
    setIndex((prev) => (prev >= (words.length - 1 || 0) ? (words.length - 1 || 0) : prev + 1));
  };

  const getCurrentWord = () => words[index];
  const progressPercent = words.length > 0 ? ((index + 1) / words.length) * 100 : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-0 sm:px-0">
      {words.length === 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100 mx-0">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 3 9.5 3 13.757c0 4.257 3 6.5 9 9.5m0-13c5.5-3 9-1.243 9-9.5 0-4.257-3-7.504-9-7.504z" />
              </svg>
            </div>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Words Available</p>
          <p className="text-sm sm:text-base text-gray-600">Select words to start learning</p>
        </div>
      )}
      
      {page === "learning" && words.length > 0 && (
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

          {/* Flashcard */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-shadow duration-300 mx-0">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-white text-xs sm:text-sm font-semibold tracking-widest">WORD {index + 1}</p>
            </div>

            <div className="p-4 sm:p-8 md:p-12 space-y-4 sm:space-y-6">
              {/* Word */}
              <div className="text-center">
                <p className="text-gray-500 text-xs sm:text-sm font-medium mb-2">German Word</p>
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-indigo-700 break-words leading-tight">
                  {getCurrentWord()?.word}
                </p>
              </div>

              {/* Meanings */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 mx-0">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Bengali</p>
                  <p className="text-base sm:text-lg md:text-lg text-gray-800 font-medium break-words">{getCurrentWord()?.bangla}</p>
                </div>
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">English</p>
                  <p className="text-base sm:text-lg md:text-lg text-gray-800 font-medium break-words">{getCurrentWord()?.english}</p>
                </div>
                {getCurrentWord()?.synonym && (
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Synonym</p>
                    <p className="text-base sm:text-lg md:text-lg text-gray-800 font-medium break-words">{getCurrentWord()?.synonym}</p>
                  </div>
                )}
              </div>

              {/* Example */}
              {getCurrentWord()?.example && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Example</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 italic break-words">{getCurrentWord()?.example}</p>
                </div>
              )}

              {/* Picture */}
              {getCurrentWord()?.picture && (
                <div className="rounded-lg sm:rounded-xl overflow-hidden border border-gray-200">
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                    <Image
                      src={getCurrentWord().picture}
                      alt={getCurrentWord()?.word}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-lg"
                    />
                  </div>
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
            <div className="text-xs sm:text-sm text-gray-600 font-medium px-3 py-2 bg-gray-100 rounded-lg">
              {index + 1} of {words.length}
            </div>
            <Button
              onClick={nextWord}
              disabled={index === words.length - 1}
              className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                index === words.length - 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
              }`}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {page === "practising" && direction === "german_to_meaning" && words.length > 0 && (
        <div className="space-y-4 sm:space-y-6 mx-0">
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

          <div className="text-center mb-4 text-xs sm:text-sm text-gray-600 bg-blue-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border border-blue-100">
            Click the card to reveal the answer
          </div>

          <Card
            className="cursor-pointer rounded-xl sm:rounded-2xl border-2 border-indigo-200 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-100 sm:hover:scale-105 transform mx-0"
            onClick={() => setShowMeaning(!showMeaning)}
          >
            <CardContent className="p-4 sm:p-8 md:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-64 sm:min-h-80 flex items-center justify-center">
              {showMeaning ? (
                <div className="text-center px-2">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-3 sm:mb-4">German Word</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 break-words leading-tight">
                    {getCurrentWord()?.word}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 w-full px-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Bengali</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 break-words">{getCurrentWord()?.bangla}</p>
                  </div>
                  <div className="border-t border-gray-300 pt-3 sm:pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">English</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 break-words">{getCurrentWord()?.english}</p>
                  </div>
                  <div className="border-t border-gray-300 pt-3 sm:pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Synonym</p>
                    <p className="text-base sm:text-lg md:text-xl text-gray-800 break-words">{getCurrentWord()?.synonym}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
              disabled={index === words.length - 1}
              className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                index === words.length - 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
              }`}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {page === "practising" && direction === "meaning_to_german" && words.length > 0 && (
        <div className="space-y-4 sm:space-y-6 mx-0">
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

          <div className="text-center mb-4 text-xs sm:text-sm text-gray-600 bg-blue-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg border border-blue-100">
            Click the card to reveal the German word
          </div>

          <Card
            className="cursor-pointer rounded-xl sm:rounded-2xl border-2 border-indigo-200 shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-100 sm:hover:scale-105 transform mx-0"
            onClick={() => setShowMeaning(!showMeaning)}
          >
            <CardContent className="p-4 sm:p-8 md:p-12 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-64 sm:min-h-80 flex items-center justify-center">
              {showMeaning ? (
                <div className="space-y-3 sm:space-y-4 w-full px-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Bengali</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 break-words">{getCurrentWord()?.bangla}</p>
                  </div>
                  <div className="border-t border-gray-300 pt-3 sm:pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">English</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 break-words">{getCurrentWord()?.english}</p>
                  </div>
                  <div className="border-t border-gray-300 pt-3 sm:pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Synonym</p>
                    <p className="text-base sm:text-lg md:text-xl text-gray-800 break-words">{getCurrentWord()?.synonym}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center px-2">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-3 sm:mb-4">German Word</p>
                  <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-indigo-700 break-words leading-tight">
                    {getCurrentWord()?.word}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
              disabled={index === words.length - 1}
              className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                index === words.length - 1
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

export default FlashCard;
