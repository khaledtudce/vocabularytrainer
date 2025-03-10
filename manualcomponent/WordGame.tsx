"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialWords = [
  { word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing" },
  { word: "Meticulous", meaning: "Showing great attention to detail" },
  { word: "Ephemeral", meaning: "Lasting for a very short time" },
  { word: "Cacophony", meaning: "A harsh discordant mixture of sounds" },
];

export default function WordGame() {
  const [wordList, setWordList] = useState(initialWords);
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [mode, setMode] = useState("flashcard");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  const nextWord = () => {
    setIndex((prev) => (prev + 1) % wordList.length);
    setShowMeaning(false);
    setAnswer("");
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (answer.toLowerCase() === wordList[index].meaning.toLowerCase()) {
      setFeedback("Correct!");
    } else {
      setFeedback(`Try Again! Correct answer: ${wordList[index].meaning}`);
    }
  };

  const generateMCQOptions = () => {
    const correct = wordList[index].meaning;
    let options = wordList.map((w) => w.meaning).filter((m) => m !== correct);
    options = options.sort(() => 0.5 - Math.random()).slice(0, 3);
    options.push(correct);
    return options.sort(() => 0.5 - Math.random());
  };

  const [mcqOptions, setMcqOptions] = useState(generateMCQOptions());

  const checkMCQAnswer = (selected) => {
    if (selected === wordList[index].meaning) {
      setFeedback("Correct!");
    } else {
      setFeedback(`Wrong! Correct answer: ${wordList[index].meaning}`);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">Word Practicing Game</h1>
      <div className="flex gap-4 mt-4">
        <Button onClick={() => setMode("flashcard")}>Flashcard</Button>
        <Button
          onClick={() => {
            setMode("multiple-choice");
            setMcqOptions(generateMCQOptions());
          }}
        >
          MCQ
        </Button>
        <Button onClick={() => setMode("writing")}>Writing</Button>
      </div>

      {mode === "flashcard" && (
        <Card
          className="mt-6 p-6 cursor-pointer"
          onClick={() => setShowMeaning(!showMeaning)}
        >
          <CardContent>
            <p className="text-xl font-semibold">
              {showMeaning ? wordList[index].meaning : wordList[index].word}
            </p>
          </CardContent>
        </Card>
      )}

      {mode === "multiple-choice" && (
        <div className="mt-6">
          <p className="text-xl font-semibold">{wordList[index].word}</p>
          <div className="mt-4 space-y-2">
            {mcqOptions.map((option, idx) => (
              <Button
                key={idx}
                className="block w-full"
                onClick={() => checkMCQAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
          {feedback && <p className="mt-2 font-bold">{feedback}</p>}
        </div>
      )}

      {mode === "writing" && (
        <div className="mt-6">
          <p className="text-xl font-semibold">{wordList[index].word}</p>
          <input
            type="text"
            className="border p-2 mt-2"
            placeholder="Type the meaning"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <Button className="mt-2" onClick={checkAnswer}>
            Check
          </Button>
          {feedback && <p className="mt-2 font-bold">{feedback}</p>}
        </div>
      )}

      <Button className="mt-6" onClick={nextWord}>
        Next Word
      </Button>
    </div>
  );
}
