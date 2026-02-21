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

  return (
    <div className="w-full h-[83vh] flex flex-col items-center p-1 bg-gray-100 rounded-lg shadow-md gap-2">
      {page === "learning" && (
        <div className="mt-5 p-2 border border-amber-500 bg-cyan-200 ring-2 rounded-md">
            <div className="py-3 text-xl sm:text-3xl font-bold">
            {words[index]?.id}. {words[index]?.word}
          </div>
          <div className="flex flex-col gap-1">
                    <span>{words[index]?.bangla}</span>
                    <span>{words[index]?.english}</span>
                    <span>{words[index]?.synonym}</span>
                    <span>{words[index]?.example}</span>
                    {words[index]?.picture && (
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                        <Image src={words[index].picture} className="rounded-md" alt="Responsive Image" fill style={{ objectFit: "cover" }} />
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
                    {words[index]?.id}. {words[index]?.word}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-sm sm:text-xl font-semibold">
                    <span>{words[index]?.bangla}</span>
                    <span>{words[index]?.english}</span>
                    <span>{words[index]?.synonym}</span>
                    <span>{words[index]?.example}</span>
                    {words[index]?.picture && <Image src={words[index].picture} alt="img" />}
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
                      {words[index]?.id}. {words[index]?.bangla}
                    </span>
                    <span>{words[index]?.english}</span>
                    <span>{words[index]?.synonym}</span>
                    <span>{words[index]?.example}</span>
                    {words[index]?.picture && <Image src={words[index].picture} alt="img" />}
                  </div>
                ) : (
                  <div className="py-3 text-xl sm:text-3xl font-bold">
                    {words[index]?.word}
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
