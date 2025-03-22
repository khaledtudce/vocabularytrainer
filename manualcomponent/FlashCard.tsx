"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WordList } from "@/data/wordlists";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type PageType = {
  page: string;
  direction: string;
  selectedWordIdFrom: number;
  selectedWordIdTo: number;
};

const FlashCard = ({
  page: page,
  direction,
  selectedWordIdFrom,
  selectedWordIdTo,
}: PageType) => {
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);

  useEffect(() => {
    setIndex(selectedWordIdFrom - 1);
  }, [selectedWordIdFrom]);

  const prevWord = () => {
    setShowMeaning(true);
    setIndex((prev) => {
      if (prev <= selectedWordIdFrom) {
        return selectedWordIdFrom - 1;
      } else {
        return (prev - 1) % WordList.length;
      }
    });
  };

  const nextWord = () => {
    setShowMeaning(true);
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
        <Button className="bg-lime-600" onClick={nextWord}>
          Next
        </Button>
      </div>
      {page === "learning" && (
        <div className="p-2 border border-amber-500 bg-cyan-200 ring-2">
          <div className="py-3 text-xl sm:text-3xl font-bold">
            {WordList[index]?.id}. {WordList[index]?.word}
          </div>
          <div className="flex flex-col gap-3">
            <span>{WordList[index]?.bangla}</span>
            <span>{WordList[index]?.english}</span>
            <span>{WordList[index]?.synonym}</span>
            <span>{WordList[index]?.example}</span>
            {WordList[index]?.picture && (
              <Image src={WordList[index].picture} alt="img" />
            )}
          </div>
        </div>
      )}
      {page === "practising" && direction === "german_to_meaning" && (
        <div className="px-8">
          <div className="text-center">
            Please click on flashcard to switch it!
          </div>
          <Card
            className="mt-6 p-6 cursor-pointer"
            onClick={() => setShowMeaning(!showMeaning)}
          >
            <CardContent>
              <div className="text-xl font-semibold">
                {showMeaning ? (
                  <div className="py-4 text-3xl font-bold">
                    {WordList[index]?.id}. {WordList[index]?.word}
                  </div>
                ) : (
                  <div className="border flex flex-col gap-1">
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.bangla}
                    </span>
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.english}
                    </span>
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.synonym}
                    </span>
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.example}
                    </span>
                    {WordList[index]?.picture && (
                      <Image src={WordList[index]?.picture} alt="img" />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {page === "practising" && direction === "meaning_to_german" && (
        <div className="px-8">
          <div className="text-center">
            Please click on flashcard to switch it!
          </div>
          <Card
            className="mt-6 p-6 cursor-pointer"
            onClick={() => setShowMeaning(!showMeaning)}
          >
            <CardContent>
              <div className="text-xl font-semibold">
                {showMeaning ? (
                  <div className="border flex flex-col gap-1">
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.id}. {WordList[index]?.bangla}
                    </span>
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.english}
                    </span>
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.synonym}
                    </span>
                    <span
                      className="p-2
           border border-amber-400"
                    >
                      {WordList[index]?.example}
                    </span>
                    {WordList[index]?.picture && (
                      <Image src={WordList[index].picture} alt="img" />
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-3xl font-bold">
                    {WordList[index]?.word}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      
    </div>
  );
};

export default FlashCard;
