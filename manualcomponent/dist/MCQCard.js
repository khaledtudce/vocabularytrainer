"use client";
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var button_1 = require("@/components/ui/button");
var react_1 = require("react");
var wordlists_1 = require("@/data/wordlists");
var MCQCard = function () {
    var _a = react_1.useState(0), index = _a[0], setIndex = _a[1];
    var _b = react_1.useState(""), selectedAnswer = _b[0], setSelectedAnswer = _b[1];
    var _c = react_1.useState([]), options = _c[0], setOptions = _c[1];
    var currentWord = wordlists_1.WordList[index];
    console.log(currentWord);
    react_1.useEffect(function () {
        // Generate new options when the question changes
        var getRandomOptions = function () {
            var correctAnswer = currentWord === null || currentWord === void 0 ? void 0 : currentWord.bangla;
            var wrongAnswers = wordlists_1.WordList.filter(function (w) { return (w === null || w === void 0 ? void 0 : w.word) !== (currentWord === null || currentWord === void 0 ? void 0 : currentWord.word); })
                .map(function (w) { return w === null || w === void 0 ? void 0 : w.bangla; })
                .sort(function () { return 0.5 - Math.random(); })
                .slice(0, 3);
            return __spreadArrays(wrongAnswers, [correctAnswer]).sort(function () { return 0.5 - Math.random(); });
        };
        setOptions(getRandomOptions());
    }, [index, currentWord]);
    var handleAnswerClick = function (answer) {
        setSelectedAnswer(answer);
    };
    var prevWord = function () {
        setSelectedAnswer("");
        setIndex(function (prev) {
            if (prev === 0) {
                return prev;
            }
            else {
                return (prev - 1) % wordlists_1.WordList.length;
            }
        });
    };
    var nextWord = function () {
        setSelectedAnswer("");
        setIndex(function (prev) {
            if (prev === wordlists_1.WordList.length - 1) {
                return 0;
            }
            else {
                return (prev + 1) % wordlists_1.WordList.length;
            }
        });
    };
    return (react_1["default"].createElement("div", { className: "flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md w-full" },
        react_1["default"].createElement("div", { className: "" },
            react_1["default"].createElement(button_1.Button, { className: "mt-6 bg-lime-700", onClick: prevWord }, "Previous")),
        react_1["default"].createElement("div", { className: "px-8" },
            react_1["default"].createElement("div", { className: "p-6 max-w-md mx-auto bg-white rounded-lg shadow-md text-center" },
                react_1["default"].createElement("h2", { className: "text-lg font-bold mb-4" }, "Select the correct Bangla meaning:"),
                react_1["default"].createElement("h3", { className: "text-3xl font-semibold mb-4" }, currentWord === null || currentWord === void 0 ? void 0 : currentWord.word),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" }, options.map(function (option, index) { return (react_1["default"].createElement("button", { key: index, className: "px-4 py-2 rounded-md border " + (selectedAnswer === option
                        ? option === (currentWord === null || currentWord === void 0 ? void 0 : currentWord.bangla)
                            ? "bg-green-400"
                            : "bg-red-400"
                        : "bg-gray-200"), onClick: function () { return handleAnswerClick(option); } }, option)); })),
                selectedAnswer && (react_1["default"].createElement("p", { className: "mt-4 font-semibold" }, selectedAnswer === (currentWord === null || currentWord === void 0 ? void 0 : currentWord.bangla)
                    ? "Correct! ✅"
                    : "Wrong ❌")))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement(button_1.Button, { className: "mt-6 bg-lime-600", onClick: nextWord }, "Next"))));
};
exports["default"] = MCQCard;
