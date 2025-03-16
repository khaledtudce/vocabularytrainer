import { Button } from "@/components/ui/button";
import { WordList } from "@/data/wordlists";
import React, { useEffect, useState } from "react";

type ExamMCQCardType = {
  selectedWordIdFrom: number;
  selectedWordIdTo: number;
  mcqdirection: string;
};
type ExamQuestionInfo = {
  id: number;
  questions: string;
  questionOptions: string[];
  seletedAnswer: string;
  correctAnswer: string;
};

const ExamMCQCard = ({
  selectedWordIdFrom,
  selectedWordIdTo,
  mcqdirection,
}: ExamMCQCardType) => {
  const [index, setIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [examQuestionInfos, setExamQuestionInfo] = useState<ExamQuestionInfo[]>(
    []
  );
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const currentWord = WordList[index];

  useEffect(() => {
    setIndex(selectedWordIdFrom - 1);
  }, [selectedWordIdFrom]);

  useEffect(() => {
    if (mcqdirection === "banglaToGerman") {
      const getRandomGermanOptionsForBangla = () => {
        const correctAnswer = currentWord?.word;
        const wrongAnswers = WordList.filter(
          (w) => w?.bangla !== currentWord?.bangla
        )
          .map((w) => w?.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
      };
      setOptions(getRandomGermanOptionsForBangla());
    }
  }, [currentWord, mcqdirection]);

  const prevWord = () => {
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev <= selectedWordIdFrom) {
        return selectedWordIdFrom - 1;
      } else {
        return (prev - 1) % selectedWordIdFrom;
      }
    });
  };

  const saveCurrentQuestionInfo = () => {
    const newQuestion: ExamQuestionInfo = {
      id: currentWord?.id,
      questions: currentWord?.bangla,
      questionOptions: options,
      seletedAnswer: selectedAnswer,
      correctAnswer: currentWord?.word,
    };
    setExamQuestionInfo((prev) => [...prev, newQuestion]);
    console.log(examQuestionInfos);
  };

  const nextWord = async () => {
    if (!examFinished) await saveCurrentQuestionInfo();
    setSelectedAnswer("");
    setIndex((prev) => {
      if (prev >= selectedWordIdTo - 1) {
        setExamFinished(true);
        return selectedWordIdTo - 1;
      } else {
        return (prev + 1) % selectedWordIdTo;
      }
    });
  };

  const correctAnswerCount = examQuestionInfos.filter(
    (item) => item.seletedAnswer === item.correctAnswer
  ).length;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md w-full">
      {!examFinished && (
        <>
          <div className="">
            <Button className="mt-6 bg-lime-700" onClick={prevWord}>
              Previous
            </Button>
          </div>
          <div className="px-8">
            <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
              {mcqdirection === "banglaToGerman" && (
                <>
                  <h3 className="text-3xl font-semibold mb-4">
                    {currentWord?.id}. {currentWord?.bangla}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {options.map((option, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 rounded-md border border-amber-400 ${
                          selectedAnswer === option
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                        onClick={() => {
                          setSelectedAnswer(option);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div>
            <Button className="mt-6 bg-lime-600" onClick={nextWord}>
              Next
            </Button>
          </div>
        </>
      )}
      {examFinished && (
        <div className="flex items-center justify-center p-3 h-full w-full">
          <div className="p-2 flex flex-col items-center">
            <span className="text-2xl font-bold">
              Congratulation! you have finised the test! Here is your result:
            </span>
            <span>
              Total Questions: {selectedWordIdTo - selectedWordIdFrom}
            </span>
            <span>Correct Answer: {correctAnswerCount}</span>
            <ul className="mt-2">
              {examQuestionInfos.map((item) => (
                <li
                  key={item.id}
                  className={`p-2 border rounded mb-2 ${
                    item.seletedAnswer === item.correctAnswer
                      ? "bg-green-200"
                      : "bg-red-200"
                  }`}
                >
                  <strong>
                    {item.id}. {item.questions}
                  </strong>{" "}
                  <br />
                  Your Answer:{" "}
                  <span
                    className={
                      item.seletedAnswer === item.correctAnswer
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {item.seletedAnswer}
                  </span>{" "}
                  <br />
                  Correct Answer:{" "}
                  <span className="font-bold">{item.correctAnswer}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-2 bg-gray-500"
              onClick={() => {
                setExamQuestionInfo([]);
                setOptions([]);
                setIndex(selectedWordIdFrom - 1);
                setExamFinished(false);
              }}
            >
              Back to Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamMCQCard;
