"use client";

import { Button } from "@/components/ui/button";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useActiveWords from "@/lib/useActiveWords";

type PractiseByBlanksType = {
  reason: string;
};

type ExamFillInBlankQuestionInfo = {
  id: number;
  questions: string;
  userAnswer: string;
  correctAnswer: string;
};

export default function PractiseByBlanks({ reason }: PractiseByBlanksType) {
  const router = useRouter();
  const { words } = useActiveWords();
  const [index, setIndex] = useState(0);
  const germanWord = words[index]?.word || "";
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [wrongInput, setWrongInput] = useState("");
  const [examFillInBlankQuestionInfos, setExamFillInBlankQuestionInfo] =
    useState<ExamFillInBlankQuestionInfo[]>([]);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [words]);

  const prevWord = () => setIndex((p) => (p <= 0 ? 0 : p - 1));

  const saveCurrentQuestionInfo = () => {
    const newQuestion: ExamFillInBlankQuestionInfo = {
      id: words[index]?.id,
      questions: (words[index]?.bangla || "") + " " + (words[index]?.english || ""),
      userAnswer: input,
      correctAnswer: words[index]?.word,
    };
    setExamFillInBlankQuestionInfo((prev) => [...prev, newQuestion]);
  };

  const nextWord = async () => {
    if (reason === "exam") await saveCurrentQuestionInfo();
    setInput("");
    setSubmitted(false);
    setIsCorrect(false);
    setIndex((p) => {
      if (p >= (words.length - 1 || 0)) {
        setExamFinished(true);
        return words.length - 1 || 0;
      }
      return p + 1;
    });
  };

  useEffect(() => {
    if (examFinished && reason === "exam" && examFillInBlankQuestionInfos.length > 0) {
      saveExamResultsToWordlists();
    }
  }, [examFinished]);

  const correctAnswerCount = examFillInBlankQuestionInfos.filter(
    (item) => item.userAnswer === item.correctAnswer
  ).length;

  const saveExamResultsToWordlists = async () => {
    if (reason !== "exam") return;
    
    try {
      const userId = localStorage.getItem("userId");
      console.log("[Fill-in-blank] Saving exam results for userId:", userId);
      if (!userId) {
        console.error("[Fill-in-blank] No userId found");
        return;
      }

      // Get current wordlists
      const response = await fetch(`/api/user/${userId}/wordlists`);
      if (!response.ok) {
        console.error("[Fill-in-blank] Failed to fetch wordlists:", response.status, response.statusText);
        return;
      }
      const currentLists = await response.json();
      console.log("[Fill-in-blank] Current wordlists fetched", currentLists);

      const known = new Set(currentLists.known || []);
      const hard = new Set(currentLists.hard || []);
      const unknown = new Set(currentLists.unknown || []);

      // Process exam results
      examFillInBlankQuestionInfos.forEach((item) => {
        console.log(`[Fill-in-blank] Word #${item.id}: user='${item.userAnswer}' correct='${item.correctAnswer}'`);
        if (item.userAnswer === item.correctAnswer) {
          // Correct answer: add to known
          known.add(item.id);
          hard.delete(item.id);
          unknown.delete(item.id);
          console.log(`[Fill-in-blank] ✅ #${item.id} moved to known`);
        } else if (item.userAnswer === "") {
          // No attempt: add to hard
          hard.add(item.id);
          known.delete(item.id);
          unknown.delete(item.id);
          console.log(`[Fill-in-blank] ❌ #${item.id} (no attempt) moved to hard`);
        } else {
          // Wrong answer: add to hard
          hard.add(item.id);
          known.delete(item.id);
          unknown.delete(item.id);
          console.log(`[Fill-in-blank] ❌ #${item.id} (wrong) moved to hard`);
        }
      });

      // Add untouched words to unknown
      words.forEach((word) => {
        const wasAnswered = examFillInBlankQuestionInfos.some(
          (item) => item.id === word.id
        );
        if (!wasAnswered) {
          unknown.add(word.id);
          known.delete(word.id);
          hard.delete(word.id);
        }
      });

      // Save updated lists (sorted in ascending order)
      const payload = {
        known: (Array.from(known) as number[]).sort((a, b) => a - b),
        hard: (Array.from(hard) as number[]).sort((a, b) => a - b),
        unknown: (Array.from(unknown) as number[]).sort((a, b) => a - b),
      };
      console.log("[Fill-in-blank] Saving to API:", payload);
      
      const saveResponse = await fetch(`/api/user/${userId}/wordlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error("[Fill-in-blank] Failed to save wordlists:", saveResponse.status, errorText);
        return;
      }
      console.log("[Fill-in-blank] ✅ Results saved successfully");
    } catch (error) {
      console.error("[Fill-in-blank] Error saving exam results:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > germanWord.length) return;
    const correctPart = germanWord.slice(0, value.length);
    if (value === correctPart) {
      setInput(value);
      setWrongInput("");
      if (value === germanWord) setCompleted(true);
    } else {
      setWrongInput(value);
      setTimeout(() => {
        setWrongInput("");
        setInput((prev) => prev);
      }, 2000);
    }
  };

  const revealHint = () => {
    if (input.length < germanWord.length) setInput((prev) => prev + germanWord[input.length]);
  };

  const handleSubmit = () => {
    const correct = input.toLowerCase() === germanWord.toLowerCase();
    setIsCorrect(correct);
    setSubmitted(true);
    
    // Save to wordlists immediately in exam mode
    if (reason === "exam") {
      saveSubmittedAnswerToWordlists(correct);
    }
  };

  const saveSubmittedAnswerToWordlists = async (correct: boolean) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`/api/user/${userId}/wordlists`);
      const currentLists = await response.json();

      const known = new Set(currentLists.known || []);
      const hard = new Set(currentLists.hard || []);
      const unknown = new Set(currentLists.unknown || []);

      const wordId = words[index]?.id;

      if (correct) {
        // Correct answer: add to known
        known.add(wordId);
        hard.delete(wordId);
        unknown.delete(wordId);
      } else {
        // Wrong answer: add to hard
        hard.add(wordId);
        known.delete(wordId);
        unknown.delete(wordId);
      }

      await fetch(`/api/user/${userId}/wordlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          known: (Array.from(known) as number[]).sort((a, b) => a - b),
          unknown: (Array.from(unknown) as number[]).sort((a, b) => a - b),
          hard: (Array.from(hard) as number[]).sort((a, b) => a - b),
        }),
      });
    } catch (error) {
      console.error("Error saving submitted answer:", error);
    }
  };

  const resetGame = () => {
    setInput("");
    setCompleted(false);
    setWrongInput("");
  };

  return (
    <div className="w-full h-[83vh] flex flex-col items-center p-1 bg-gray-100 rounded-lg shadow-md gap-2">
      {words.length === 0 && (
        <div className="mt-5 p-4 text-center text-gray-600">
          <p className="text-lg font-semibold">No words available</p>
        </div>
      )}
      {reason === "practise" && words.length > 0 && (
        <div className="p-2 w-full flex flex-col items-center justify-center gap-1 bg-gray-100">
          <h1 className="text-md text-center sm:text-xl font-bold">
            <span>
              {words[index]?.id}. {words[index]?.bangla}
            </span>
          </h1>
          <h1 className="text-md sm:text-xl text-center font-bold mb-6">
            <span>{words[index]?.english}</span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {germanWord.split("").map((letter: string, i: number) => (
              <span
                key={i}
                className={`w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center border-2 text-lg font-semibold rounded-md shadow-md ${
                  input[i] === undefined
                    ? "border-yellow-500"
                    : input[i] === letter
                    ? "border-green-500 text-green-700"
                    : "border-gray-300"
                }`}
              >
                {input[i] || "_"}
              </span>
            ))}
          </div>
          {wrongInput && <p className="text-red-600 font-bold mt-2">Wrong Input: {wrongInput}</p>}
          <div className="mt-1 flex flex-col sm:flex-row items-center justify-center gap-1">
            <h1 className="font-semibold mt-2">Please write here: </h1>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={completed}
              className={`mt-2 p-1 border border-blue-500 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 ${wrongInput ? "border-red-500" : ""}`}
            />
          </div>
          {completed && <p className="text-green-600 font-bold mt-2">🎉 Well done! You completed the word! 🎉</p>}
          <div className="mt-7 flex gap-5">
            <button onClick={revealHint} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Help Guess!</button>
            <button onClick={resetGame} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reset</button>
          </div>
        </div>
      )}

      {reason === "exam" && !examFinished && words.length > 0 && (
        <div className="p-2 w-full flex flex-col items-center justify-center gap-1 bg-gray-100">
          <h1 className="text-md text-center sm:text-xl font-bold">
            <span>
              {words[index]?.id}. {words[index]?.bangla}
            </span>
          </h1>
          <h1 className="text-md sm:text-xl text-center font-bold mb-6">
            <span>{words[index]?.english}</span>
          </h1>

          <div className="mt-1 flex flex-col sm:flex-row items-center justify-center gap-1">
            <h1 className="font-semibold mt-2">Please write here: </h1>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={submitted} className={"mt-2 p-1 border border-blue-500 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"} />
          </div>
          {submitted && (
            <div>
              <p className={`font-bold mt-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                {isCorrect ? "✓ Your answer was correct!" : `✗ Incorrect. The correct answer is: ${germanWord}`}
              </p>
              {!isCorrect && (
                <div className="flex justify-center mt-2">
                  <button onClick={() => { setInput(""); setSubmitted(false); setIsCorrect(false); }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reset</button>
                </div>
              )}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {!submitted ? (
              <>
                <button onClick={() => setInput("")} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reset</button>
                <button onClick={handleSubmit} disabled={words.length === 0} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Submit</button>
              </>
            ) : null}
          </div>
        </div>
      )}

      {reason === "exam" && examFinished && (
        <div className="flex items-center justify-center w-full">
          <div className="p-1 flex flex-col items-center">
            <span className="mt-5 text-2xl font-bold text-center">Congratulation! Here is your test result:</span>
            <span>Total Questions: {examFillInBlankQuestionInfos.length}</span>
            <span>Correct Answer: {correctAnswerCount}</span>
            <Button className="mt-2 bg-green-600 text-white" onClick={() => router.push("/")}>Back</Button>
            <ul className="mt-3 w-full">
              {examFillInBlankQuestionInfos.map((item) => (
                <li key={item.id} className={`p-2 border rounded mb-2 ${item.userAnswer === item.correctAnswer ? "bg-green-300" : "bg-red-300"}`}>
                  <span className="flex flex-col">
                    <span className="flex flex-wrap"><strong>{item.id}. {item.questions}</strong></span>
                    <span className="p-1 flex gap-1"><span>Your Answer:</span><span className={item.userAnswer === item.correctAnswer ? "text-green-700" : "text-red-700"}>{item.userAnswer}</span></span>
                    <span className="p-1 flex gap-1"><span>Correct Answer:</span><span className="font-bold">{item.correctAnswer}</span></span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!examFinished && (
        <div className="flex py-5 items-center gap-20">
          <Button className="bg-lime-700" onClick={prevWord} disabled={words.length === 0 || index === 0}>Previous</Button>
          <Button className="bg-lime-700" onClick={nextWord} disabled={words.length === 0 || index === words.length - 1 || (reason === "exam" && !submitted)}>Next</Button>
        </div>
      )}
    </div>
  );
}
