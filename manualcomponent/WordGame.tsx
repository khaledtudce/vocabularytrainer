import { useState, useEffect } from "react";

const WordList = [
  { id: 1, word: "übergegriffen", bangla: "ছড়িয়ে পড়েছে (আগুন, অসন্তোষ, সহিংসতা), প্রসারিত হয়েছে" },
  { id: 2, word: "Umfangreich", bangla: "বড়, ব্যাপক, সামগ্রিক, সর্বোপরি" },
  { id: 3, word: "Beeinträchtigung", bangla: "বাধা, প্রতিবন্ধকতা, প্রভাবিতকরণ" },
  { id: 4, word: "Unaufhaltsam", bangla: "অপ্রতিরোধ্য, অবিরাম" },
  { id: 5, word: "Beschleunigung", bangla: "ত্বরণ, গতি বৃদ্ধি" },
  { id: 6, word: "fassen", bangla: "ধরা, পড়া, বুঝা, ধারণ করা" },
  { id: 7, word: "Rastlosigkeit", bangla: "থামেনা, চলতে থাকে" },
];

export default function MCQGame() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const currentWord = WordList[currentIndex];

  useEffect(() => {
    // Generate new options when the question changes
    const getRandomOptions = () => {
      let correctAnswer = currentWord.bangla;
      let wrongAnswers = WordList.filter((w) => w.word !== currentWord.word)
        .map((w) => w.bangla)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      return [...wrongAnswers, correctAnswer].sort(() => 0.5 - Math.random());
    };

    setOptions(getRandomOptions());
  }, [currentIndex]);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
  };

  const nextQuestion = () => {
    if (currentIndex < WordList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center">
      <h2 className="text-lg font-bold mb-4">Select the correct Bangla meaning:</h2>
      <h3 className="text-xl font-semibold mb-4">{currentWord.word}</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-md border ${
              selectedAnswer === option
                ? option === currentWord.bangla
                  ? "bg-green-400"
                  : "bg-red-400"
                : "bg-gray-200"
            }`}
            onClick={() => handleAnswerClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {selectedAnswer && (
        <p className="mt-4 font-semibold">
          {selectedAnswer === currentWord.bangla ? "Correct! ✅" : "Wrong ❌"}
        </p>
      )}
      <button
        onClick={nextQuestion}
        disabled={currentIndex === WordList.length - 1}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
      >
        Next
      </button>
    </div>
  );
}
