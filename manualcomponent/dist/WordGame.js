"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var WordList = [
    {
        id: 1,
        word: "übergegriffen",
        bangla: "ছড়িয়ে পড়েছে (আগুন, অসন্তোষ, সহিংসতা), প্রসারিত হয়েছে"
    },
    { id: 2, word: "Umfangreich", bangla: "বড়, ব্যাপক, সামগ্রিক, সর্বোপরি" },
    {
        id: 3,
        word: "Beeinträchtigung",
        bangla: "বাধা, প্রতিবন্ধকতা, প্রভাবিতকরণ"
    },
    { id: 4, word: "Unaufhaltsam", bangla: "অপ্রতিরোধ্য, অবিরাম" },
    { id: 5, word: "Beschleunigung", bangla: "ত্বরণ, গতি বৃদ্ধি" },
    { id: 6, word: "fassen", bangla: "ধরা, পড়া, বুঝা, ধারণ করা" },
    { id: 7, word: "Rastlosigkeit", bangla: "থামেনা, চলতে থাকে" },
];
function MCQGame() {
    var _a = react_1.useState(0), currentIndex = _a[0], setCurrentIndex = _a[1];
    var _b = react_1.useState(null), selectedAnswer = _b[0], setSelectedAnswer = _b[1];
    var currentWord = WordList[currentIndex];
    // Generate 3 random wrong answers
    var getRandomOptions = function () {
        var options = [currentWord.bangla];
        var wrongAnswers = WordList.filter(function (w) { return w.word !== currentWord.word; })
            .map(function (w) { return w.bangla; })
            .sort(function () { return 0.5 - Math.random(); })
            .slice(0, 3);
        return __spreadArrays(options, wrongAnswers).sort(function () { return 0.5 - Math.random(); });
    };
    var options = getRandomOptions();
    var handleAnswerClick = function (answer) {
        setSelectedAnswer(answer);
    };
    var nextQuestion = function () {
        if (currentIndex < WordList.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
        }
    };
    return (React.createElement("div", { className: "p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center" },
        React.createElement("h2", { className: "text-lg font-bold mb-4" }, "Select the correct Bangla meaning:"),
        React.createElement("h3", { className: "text-xl font-semibold mb-4" }, currentWord.word),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" }, options.map(function (option, index) { return (React.createElement("button", { key: index, className: "px-4 py-2 rounded-md border " + (selectedAnswer === option
                ? option === currentWord.bangla
                    ? "bg-green-400"
                    : "bg-red-400"
                : "bg-gray-200"), onClick: function () { return handleAnswerClick(option); } }, option)); })),
        selectedAnswer && (React.createElement("p", { className: "mt-4 font-semibold" }, selectedAnswer === currentWord.bangla ? "Correct! ✅" : "Wrong ❌")),
        React.createElement("button", { onClick: nextQuestion, disabled: currentIndex === WordList.length - 1, className: "mt-4 px-6 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400" }, "Next")));
}
exports["default"] = MCQGame;
