import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useActiveWords from "@/lib/useActiveWords";

type ExamMCQCardType = {
  mcqdirection: string;
};

type ExamQuestionInfo = {
  id: number;
  questions: string;
  seletedAnswer: string;
  correctAnswer: string;
};

const ExamMCQCard = ({ mcqdirection }: ExamMCQCardType) => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [examQuestionInfos, setExamQuestionInfo] = useState<ExamQuestionInfo[]>(
    []
  );
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const { words, range } = useActiveWords();
  const currentWord = words[index];

  useEffect(() => {
    setIndex(0);
  }, [words]);

  useEffect(() => {
    if (
      mcqdirection === "banglaToGerman" ||
      mcqdirection === "meaningToGerman"
    ) {
      const getRandomGermanOptionsForBangla = () => {
        const correctAnswer = currentWord?.word;
        const wrongAnswers = words
          .filter((w) => w?.bangla !== currentWord?.bangla)
          .map((w) => w?.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomGermanOptionsForBangla());
    } else if (mcqdirection === "germanToBangla") {
      const getRandomBanglaOptionsForGerman = () => {
        const correctAnswer = currentWord?.bangla;
        const wrongAnswers = words
          .filter((w) => w?.word !== currentWord?.word)
          .map((w) => w?.bangla)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomBanglaOptionsForGerman());
    } else if (mcqdirection === "germanToEnglish") {
      const getRandomBanglaOptionsForGerman = () => {
        const correctAnswer = currentWord?.english;
        const wrongAnswers = words
          .filter((w) => w?.word !== currentWord?.word)
          .map((w) => w?.english)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomBanglaOptionsForGerman());
    }
  }, [currentWord, mcqdirection]);

  const prevWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  const saveCurrentQuestionInfo = () => {
    let newQuestion: ExamQuestionInfo;
    if (mcqdirection === "banglaToGerman") {
      newQuestion = {
        id: currentWord?.id,
        questions: currentWord?.bangla,
        seletedAnswer: selectedAnswer,
        correctAnswer: currentWord?.word,
      };
    } else if (mcqdirection === "germanToBangla") {
      newQuestion = {
        id: currentWord?.id,
        questions: currentWord?.word,
        seletedAnswer: selectedAnswer,
        correctAnswer: currentWord?.bangla,
      };
    } else if (mcqdirection === "germanToEnglish") {
      newQuestion = {
        id: currentWord?.id,
        questions: currentWord?.word,
        seletedAnswer: selectedAnswer,
        correctAnswer: currentWord?.english,
      };
    } else if (mcqdirection === "meaningToGerman") {
      newQuestion = {
        id: currentWord?.id,
        questions: currentWord?.bangla + ", " + currentWord?.english,
        seletedAnswer: selectedAnswer,
        correctAnswer: currentWord?.word,
      };
    }
    setExamQuestionInfo((prev) => [...prev, newQuestion]);
  };

  const nextWord = async () => {
    await saveCurrentQuestionInfo();
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev >= (words.length - 1 || 0)) {
        setExamFinished(true);
        return words.length - 1 || 0;
      } else {
        return prev + 1;
      }
    });
  };

  const submitExam = async () => {
    await saveCurrentQuestionInfo();
    setSubmitClicked(true);
    setExamFinished(true);
  };

  const saveExamResultsToWordlists = async () => {
    try {
      const userId = localStorage.getItem("userId");
      console.log("[MCQ Exam] Saving exam results for userId:", userId);
      console.log("[MCQ Exam] Total questions answered:", examQuestionInfos.length);
      if (!userId) {
        console.error("[MCQ Exam] No userId found");
        return;
      }

      // Get current wordlists
      const response = await fetch(`/api/user/${userId}/wordlists`);
      if (!response.ok) {
        console.error("[MCQ Exam] Failed to fetch wordlists:", response.status, response.statusText);
        return;
      }
      const currentLists = await response.json();
      console.log("[MCQ Exam] Current wordlists fetched");

      const known = new Set(currentLists.known || []);
      const hard = new Set(currentLists.hard || []);
      const unknown = new Set(currentLists.unknown || []);

      // Process exam results
      examQuestionInfos.forEach((item) => {
        console.log(`[MCQ Exam] Word #${item.id}: selected='${item.seletedAnswer}' correct='${item.correctAnswer}'`);
        if (item.seletedAnswer === item.correctAnswer) {
          // Correct answer: add to known
          known.add(item.id);
          hard.delete(item.id);
          unknown.delete(item.id);
          console.log(`[MCQ Exam] ✅ #${item.id} moved to known`);
        } else if (item.seletedAnswer === "") {
          // No attempt: add to hard
          hard.add(item.id);
          known.delete(item.id);
          unknown.delete(item.id);
          console.log(`[MCQ Exam] ❌ #${item.id} (no attempt) moved to hard`);
        } else {
          // Wrong answer: add to hard
          hard.add(item.id);
          known.delete(item.id);
          unknown.delete(item.id);
          console.log(`[MCQ Exam] ❌ #${item.id} (wrong) moved to hard`);
        }
      });

      // Add untouched words to unknown
      words.forEach((word) => {
        const wasAnswered = examQuestionInfos.some(
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
      console.log("[MCQ Exam] Saving to API with counts:", {known: payload.known.length, hard: payload.hard.length, unknown: payload.unknown.length});
      
      // Update database asynchronously (fire and forget)
      fetch(`/api/user/${userId}/wordlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(() => {
          // Cache the updated wordlists
          localStorage.setItem(`wordlists_${userId}`, JSON.stringify(payload));
          console.log("[MCQ Exam] ✅ Results saved and cached");
          
          // Emit cache refresh event to notify other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cacheRefreshed', { detail: { count: payload.known.length } }));
          }
        })
        .catch((error) => {
          console.error("[MCQ Exam] Failed to save wordlists:", error);
        });
    } catch (error) {
      console.error("[MCQ Exam] Error saving exam results:", error);
    }
  };

  useEffect(() => {
    if (examFinished && examQuestionInfos.length > 0) {
      saveExamResultsToWordlists();
    }
  }, [examFinished]);

  const correctAnswerCount = examQuestionInfos.filter((item) => item.seletedAnswer === item.correctAnswer).length;
  const progressPercent = words.length > 0 ? ((index + 1) / words.length) * 100 : 0;

  const getQuestion = () => {
    if (mcqdirection === "germanToBangla") return currentWord?.word;
    if (mcqdirection === "banglaToGerman") return currentWord?.bangla;
    if (mcqdirection === "germanToEnglish") return currentWord?.word;
    if (mcqdirection === "meaningToGerman") {
      return `${currentWord?.bangla} • ${currentWord?.english}`;
    }
    return "";
  };

  const getCorrectAnswer = () => {
    if (mcqdirection === "germanToBangla") return currentWord?.bangla;
    if (mcqdirection === "banglaToGerman") return currentWord?.word;
    if (mcqdirection === "germanToEnglish") return currentWord?.english;
    if (mcqdirection === "meaningToGerman") return currentWord?.word;
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
          <p className="text-sm sm:text-base text-gray-600">Select words to start the exam</p>
        </div>
      )}

      {words.length > 0 && !examFinished && (
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
            {index === words.length - 1 ? (
              <Button
                onClick={submitExam}
                disabled={submitClicked || selectedAnswer === ""}
                className={`w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 ${
                  submitClicked || selectedAnswer === ""
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg active:scale-95"
                }`}
              >
                Submit Exam ✓
              </Button>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {examFinished && (
        <div className="space-y-6">
          {/* Results Summary */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-4 sm:px-6 py-4 sm:py-6">
              <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">Exam Completed! 🎉</h2>
            </div>

            <div className="p-4 sm:p-8 md:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 text-center border border-blue-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Total Questions</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">{words.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-6 text-center border border-green-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Correct Answers</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{correctAnswerCount}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 text-center border border-purple-200">
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Score</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600">{Math.round((correctAnswerCount / words.length) * 100)}%</p>
                </div>
              </div>

              {/* Results List */}
              <div className="max-h-96 overflow-y-auto space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {examQuestionInfos.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-3 sm:p-4 rounded-lg border-2 ${
                      item.seletedAnswer === item.correctAnswer
                        ? "bg-green-50 border-green-300"
                        : "bg-red-50 border-red-300"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className={`text-lg sm:text-xl font-bold mt-0.5 ${
                        item.seletedAnswer === item.correctAnswer ? "text-green-600" : "text-red-600"
                      }`}>
                        {item.seletedAnswer === item.correctAnswer ? "✓" : "✕"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 break-words mb-2">
                          Q{idx + 1}: {item.questions}
                        </p>
                        <div className="text-xs sm:text-sm space-y-1">
                          <p className={item.seletedAnswer === item.correctAnswer ? "text-green-700" : "text-red-700"}>
                            Your Answer: <span className="font-semibold">{item.seletedAnswer || "(No answer)"}</span>
                          </p>
                          {item.seletedAnswer !== item.correctAnswer && (
                            <p className="text-gray-700">
                              Correct Answer: <span className="font-semibold text-green-700">{item.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={() => router.push("/")}
                  className="w-full sm:flex-1 py-2.5 sm:py-3 text-sm sm:text-base font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamMCQCard;
