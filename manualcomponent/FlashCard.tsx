"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WordList } from "@/data/wordlists";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type PageType = {
  page: string;
  direction: string;
};

const FlashCard = ({ page, direction }: PageType) => {
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [selectedWordIdFrom, setSelectedWordIdFrom] = useState(1);
  const [selectedWordIdTo, setSelectedWordIdTo] = useState(30);

  // Load from localStorage on mount
  useEffect(() => {
    const storedRange = localStorage.getItem("wordRange");
    if (storedRange) {
      const parsedRange = JSON.parse(storedRange);
      setSelectedWordIdFrom(parsedRange.from);
      setSelectedWordIdTo(parsedRange.to);
    }
  }, []);

  useEffect(() => {
    const handleRangeUpdate = (event: any) => {
      console.log(event);
      setSelectedWordIdFrom(event.detail.from);
      setSelectedWordIdTo(event.detail.to);
    };
    window.addEventListener("wordRangeUpdated", handleRangeUpdate);
    return () =>
      window.removeEventListener("wordRangeUpdated", handleRangeUpdate);
  }, []);

  useEffect(() => {
    setIndex(selectedWordIdFrom - 1);
  }, [selectedWordIdFrom]);

  const prevWord = () => {
    setShowMeaning(true);
    setIndex((prev) => {
      if (prev <= selectedWordIdFrom) {
        return selectedWordIdFrom - 1;
      } else {
        return prev - 1;
      }
    });
  };

  const nextWord = () => {
    setShowMeaning(true);
    setIndex((prev) => {
      if (prev >= selectedWordIdTo - 1) {
        return selectedWordIdTo - 1;
      } else {
        return prev + 1;
      }
    });
  };

  return (
    <div className="w-full h-[83vh] flex flex-col items-center p-1 bg-gray-100 rounded-lg shadow-md gap-2">
      {page === "learning" && (
        <div className="mt-5 p-2 border border-amber-500 bg-cyan-200 ring-2 rounded-md">
          <div className="py-3 text-xl sm:text-3xl font-bold">
            {WordList[index]?.id}. {WordList[index]?.word}
          </div>
          <div className="flex flex-col gap-1">
            <span>{WordList[index]?.bangla}</span>
            <span>{WordList[index]?.english}</span>
            <span>{WordList[index]?.synonym}</span>
            <span>{WordList[index]?.example}</span>
            {WordList[index]?.picture && (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                }}
              >
                <Image
                  src={WordList[index].picture}
                  className="rounded-md"
                  alt="Responsive Image"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {page === "practising" && direction === "german_to_meaning" && (
        <div className="mt-5 p-1">
          <div className="text-center">
            Please click on flashcard to switch it!
          </div>
          <Card
            className="mt-5 cursor-pointer border border-amber-500 bg-cyan-200 ring-2"
            onClick={() => setShowMeaning(!showMeaning)}
          >
            <CardContent>
              <div className="text-xl font-semibold">
                {showMeaning ? (
                  <div className="py-3 text-xl sm:text-3xl font-bold">
                    {WordList[index]?.id}. {WordList[index]?.word}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-sm sm:text-xl font-semibold">
                    <span>{WordList[index]?.bangla}</span>
                    <span>{WordList[index]?.english}</span>
                    <span>{WordList[index]?.synonym}</span>
                    <span>{WordList[index]?.example}</span>
                    {WordList[index]?.picture && (
                      <Image src={WordList[index].picture} alt="img" />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {page === "practising" && direction === "meaning_to_german" && (
        <div className="mt-5 p-1">
          <div className="text-center">
            Please click on flashcard to switch it!
          </div>
          <Card
            className="mt-5 cursor-pointer border border-amber-500 bg-cyan-200 ring-2"
            onClick={() => setShowMeaning(!showMeaning)}
          >
            <CardContent>
              <div className="text-xl font-semibold">
                {showMeaning ? (
                  <div className="flex flex-col gap-4 text-sm sm:text-xl font-semibold">
                    <span>
                      {WordList[index]?.id}. {WordList[index]?.bangla}
                    </span>
                    <span>{WordList[index]?.english}</span>
                    <span>{WordList[index]?.synonym}</span>
                    <span>{WordList[index]?.example}</span>
                    {WordList[index]?.picture && (
                      <Image src={WordList[index].picture} alt="img" />
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-xl sm:text-3xl font-bold">
                    {WordList[index]?.word}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="flex py-5 items-center gap-20">
        <Button className="bg-lime-700" onClick={prevWord}>
          Previous
        </Button>
        <Button className="bg-lime-700" onClick={nextWord}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default FlashCard;
