import { Button } from "@/components/ui/button";
import { WordList } from "@/data/wordlists";
import { ChangeEvent, useEffect, useState } from "react";

type PractiseByBlanksType = {
  selectedWordIdFrom: number;
  selectedWordIdTo: number;
  reason: string;
};

type ExamFillInBlankQuestionInfo = {
  id: number;
  questions: string;
  userAnswer: string;
  correctAnswer: string;
};

export default function PractiseByBlanks({
  selectedWordIdFrom,
  selectedWordIdTo,
  reason,
}: PractiseByBlanksType) {
  const [index, setIndex] = useState(1);
  const germanWord = WordList[index]?.word;
  const [input, setInput] = useState("");
  const [completed, setCompleted] = useState(false);
  const [wrongInput, setWrongInput] = useState("");
  const [examFillInBlankQuestionInfos, setExamFillInBlankQuestionInfo] =
    useState<ExamFillInBlankQuestionInfo[]>([]);
  const [examFinished, setExamFinished] = useState<boolean>(false);

  useEffect(() => {
    setIndex(selectedWordIdFrom - 1);
  }, [selectedWordIdFrom]);

  const prevWord = () => {
    setIndex((prev) => {
      if (prev <= selectedWordIdFrom) {
        return selectedWordIdFrom - 1;
      } else {
        return (prev - 1) % selectedWordIdFrom;
      }
    });
  };

  const saveCurrentQuestionInfo = () => {
    const newQuestion: ExamFillInBlankQuestionInfo = {
      id: WordList[index]?.id,
      questions: WordList[index]?.bangla + " " + WordList[index]?.english,
      userAnswer: input,
      correctAnswer: WordList[index]?.word,
    };
    setExamFillInBlankQuestionInfo((prev) => [...prev, newQuestion]);
  };

  const nextWord = async () => {
    // insert data into setExamFillInBlankQuestionInfo, in case of exam
    if (reason === "exam") await saveCurrentQuestionInfo();
    setInput("");
    setIndex((prev) => {
      if (prev >= selectedWordIdTo - 1) {
        setExamFinished(true);
        return selectedWordIdTo - 1;
      } else {
        return (prev + 1) % selectedWordIdTo;
      }
    });
  };

  const correctAnswerCount = examFillInBlankQuestionInfos.filter(
    (item) => item.userAnswer === item.correctAnswer
  ).length;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length > germanWord.length) return; // Prevent extra input
    const correctPart = germanWord.slice(0, value.length);
    if (value === correctPart) {
      setInput(value);
      setWrongInput("");
      if (value === germanWord) {
        setCompleted(true);
      }
    } else {
      setWrongInput(value);
      setTimeout(() => {
        setWrongInput("");
        setInput(input); // Keep the correct part only
      }, 2000);
    }
  };

  const revealHint = () => {
    if (input.length < germanWord.length) {
      setInput(input + germanWord[input.length]);
    }
  };

  const resetGame = () => {
    setInput("");
    setCompleted(false);
    setWrongInput("");
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <div className="">
        <Button className="mt-6 bg-lime-700" onClick={prevWord}>
          Previous
        </Button>
      </div>
      {reason === "practise" && (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-5">
          <h1 className="text-xl font-bold">
            <span className="text-blue-500">
              {WordList[index]?.id}. {WordList[index]?.bangla}
            </span>
          </h1>
          <h1 className="text-xl font-bold mb-4">
            English:{" "}
            <span className="text-blue-500">{WordList[index]?.english}</span>
          </h1>
          <div className="flex flex-wrap gap-2">
            {germanWord.split("").map((letter, index) => (
              <span
                key={index}
                className={`w-10 h-10 flex items-center justify-center border-2 text-lg font-semibold rounded-md shadow-md ${
                  input[index] === undefined
                    ? "border-yellow-500"
                    : input[index] === letter
                    ? "border-green-500 text-green-700"
                    : "border-gray-300"
                }`}
              >
                {input[index] || "_"}
              </span>
            ))}
          </div>
          {wrongInput && (
            <p className="text-red-600 font-bold mt-2">
              Wrong Input: {wrongInput}
            </p>
          )}
          <div className="flex items-center justify-center gap-1">
            <h1 className="font-semibold mt-2">Please write here: </h1>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={completed}
              className={`mt-4 p-2 border border-blue-500 rounded w-64 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                wrongInput ? "border-red-500" : ""
              }`}
            />
          </div>
          {completed && (
            <p className="text-green-600 font-bold mt-2">
              🎉 Well done! You completed the word! 🎉
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={revealHint}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Help
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      {reason === "exam" && !examFinished && (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-5">
          <h1 className="text-xl font-bold">
            <span className="text-blue-500">
              {WordList[index]?.id}. {WordList[index]?.bangla}
            </span>
          </h1>
          <h1 className="text-xl font-bold mb-4">
            English:{" "}
            <span className="text-blue-500">{WordList[index]?.english}</span>
          </h1>

          <div className="flex items-center justify-center gap-1">
            <h1 className="font-semibold mt-2">Please write here: </h1>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={
                "mt-4 p-2 border border-blue-500 rounded w-64 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              }
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setInput("")}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      {reason === "exam" && examFinished && (
        <div className="flex items-center justify-center p-3 h-full w-full">
          <div className="p-2 flex flex-col items-center">
            <span className="text-2xl font-bold">
              Congratulation! you have finised the test! Here is your result:
            </span>
            <span>
              Total Questions: {1 + (selectedWordIdTo - selectedWordIdFrom)}
            </span>
            <span>Correct Answer: {correctAnswerCount}</span>
            <Button
              className="mt-2 bg-gray-500"
              onClick={() => {
                setExamFillInBlankQuestionInfo([]);
                setIndex(selectedWordIdFrom - 1);
                setExamFinished(false);
              }}
            >
              Back to question again
            </Button>
            <ul className="mt-2">
              {examFillInBlankQuestionInfos.map((item) => (
                <li
                  key={item.id}
                  className={` p-2 border rounded mb-2 ${
                    item.userAnswer === item.correctAnswer
                      ? "bg-green-200"
                      : "bg-red-200"
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="flex flex-wrap">
                      <strong>
                        {item.id}. {item.questions}
                      </strong>
                    </span>
                    <span className="p-1 flex gap-1">
                      <span>Your Answer:</span>
                      <span
                        className={
                          item.userAnswer === item.correctAnswer
                            ? "text-green-700"
                            : "text-red-700"
                        }
                      >
                        {item.userAnswer}
                      </span>
                    </span>
                    <span className="p-1 flex gap-1">
                      <span>Correct Answer:</span>
                      <span className="font-bold">{item.correctAnswer}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div>
        <Button className="mt-6 bg-lime-600" onClick={nextWord}>
          Next
        </Button>
      </div>
    </div>
  );
}
