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

      {reason === "practise" && words.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-xs sm:text-sm font-bold text-indigo-600">{index + 1} / {words.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${(index + 1) / words.length * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-white text-xs sm:text-sm font-semibold tracking-widest">WORD {index + 1}</p>
            </div>

            <div className="p-4 sm:p-8 md:p-12 space-y-4 sm:space-y-6">
              {/* Definitions */}
              <div className="text-center">
                <p className="text-sm sm:text-base font-semibold text-indigo-600 mb-2">{words[index]?.bangla}</p>
                <p className="text-sm sm:text-base font-semibold text-gray-700 mb-4">{words[index]?.english}</p>
              </div>

              {/* Letter Grid */}
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl">
                {germanWord.split("").map((letter: string, i: number) => (
                  <div
                    key={i}
                    className={`w-6 h-6 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center border-2 text-sm sm:text-base md:text-lg font-bold rounded-md transition-colors ${
                      input[i] === undefined
                        ? "border-yellow-400 bg-yellow-50"
                        : input[i] === letter
                        ? "border-green-500 bg-green-100 text-green-700"
                        : "border-gray-300 bg-gray-100"
                    }`}
                  >
                    {input[i] || "_"}
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {wrongInput && (
                <div className="p-2 sm:p-3 bg-red-100 border border-red-300 rounded-lg text-center">
                  <p className="text-xs sm:text-sm text-red-700 font-semibold">Wrong Input: {wrongInput}</p>
                </div>
              )}

              {/* Success Message */}
              {completed && (
                <div className="p-3 sm:p-4 bg-green-100 border-2 border-green-500 rounded-lg text-center">
                  <p className="text-sm sm:text-base text-green-700 font-bold">🎉 Well done! 🎉</p>
                </div>
              )}

              {/* Input Field */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <label className="text-xs sm:text-sm font-semibold text-gray-700">Type:</label>
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  disabled={completed}
                  className={`w-32 sm:w-48 px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors text-sm sm:text-base ${
                    wrongInput
                      ? "border-red-500 focus:ring-red-300"
                      : "border-indigo-300 focus:ring-indigo-300"
                  }`}
                  placeholder="Type here..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            <Button
              onClick={revealHint}
              className="w-full sm:flex-1 bg-blue-600 text-white hover:bg-blue-700 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all active:scale-95"
            >
              💡 Hint
            </Button>
            <Button
              onClick={resetGame}
              className="w-full sm:flex-1 bg-red-600 text-white hover:bg-red-700 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all active:scale-95"
            >
              🔄 Reset
            </Button>
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

      {reason === "exam" && !examFinished && words.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
              <span className="text-xs sm:text-sm font-bold text-indigo-600">{index + 1} / {words.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${(index + 1) / words.length * 100}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-white text-xs sm:text-sm font-semibold tracking-widest">WORD {index + 1}</p>
            </div>

            <div className="p-4 sm:p-8 md:p-12 space-y-4 sm:space-y-6">
              {/* Definitions */}
              <div className="text-center">
                <p className="text-sm sm:text-base font-semibold text-indigo-600 mb-2">{words[index]?.bangla}</p>
                <p className="text-sm sm:text-base font-semibold text-gray-700">{words[index]?.english}</p>
              </div>

              {/* Input Field */}
              <div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
                <label className="text-xs sm:text-sm font-semibold text-gray-700">Your answer:</label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={submitted}
                  className="w-32 sm:w-48 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm sm:text-base"
                  placeholder="Type here..."
                />
              </div>

              {/* Submitted Feedback */}
              {submitted && (
                <div className={`p-3 sm:p-4 rounded-lg text-center ${
                  isCorrect
                    ? "bg-green-100 border-2 border-green-500"
                    : "bg-red-100 border-2 border-red-500"
                }`}>
                  <p className={`text-sm sm:text-base font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                    {isCorrect ? "✅ Correct!" : `❌ Incorrect. Answer: ${germanWord}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            {!submitted ? (
              <>
                <Button
                  onClick={() => setInput("")}
                  className="w-full sm:flex-1 bg-red-600 text-white hover:bg-red-700 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg"
                >
                  🔄 Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={words.length === 0}
                  className="w-full sm:flex-1 bg-green-600 text-white hover:bg-green-700 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg"
                >
                  ✓ Submit
                </Button>
              </>
            ) : null}
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
              disabled={index === words.length - 1 || !submitted}
              className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                index === words.length - 1 || !submitted
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-95"
              }`}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {reason === "exam" && examFinished && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Exam Complete! 🎉
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">Here's your test result:</p>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">Total Questions</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-700">{examFillInBlankQuestionInfos.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-green-200">
              <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">Correct Answers</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700">{correctAnswerCount}</p>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {examFillInBlankQuestionInfos.map((item) => (
              <div
                key={item.id}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 ${
                  item.userAnswer === item.correctAnswer
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words">{item.id}. {item.questions}</p>
                  </div>
                  <p className={`text-xs sm:text-sm font-bold whitespace-nowrap ml-2 ${
                    item.userAnswer === item.correctAnswer ? "text-green-700" : "text-red-700"
                  }`}>
                    {item.userAnswer === item.correctAnswer ? "✓" : "✗"}
                  </p>
                </div>
                <p className="text-xs sm:text-sm margin-top mt-1 text-gray-600">Your answer: <span className="font-semibold">{item.userAnswer || "(empty)"}</span></p>
                {item.userAnswer !== item.correctAnswer && (
                  <p className="text-xs sm:text-sm text-gray-600">Correct: <span className="font-semibold">{item.correctAnswer}</span></p>
                )}
              </div>
            ))}
          </div>

          {/* Home Button */}
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg"
          >
            ← Back to Home
          </Button>
        </div>
      )}
    </div>
  );
}
