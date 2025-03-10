"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var wordlists_1 = require("@/data/wordlists");
var image_1 = require("next/image");
var card_1 = require("@/components/ui/card");
var FlashCard = function (_a) {
    var page = _a.page, direction = _a.direction;
    var _b = react_1.useState(0), index = _b[0], setIndex = _b[1];
    var _c = react_1.useState(true), showMeaning = _c[0], setShowMeaning = _c[1];
    var prevWord = function () {
        setShowMeaning(true);
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
        setShowMeaning(true);
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
        page === "practising" && direction === "german_to_meaning" && (react_1["default"].createElement("div", { className: "px-8" },
            react_1["default"].createElement(card_1.Card, { className: "mt-6 p-6 cursor-pointer", onClick: function () { return setShowMeaning(!showMeaning); } },
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-xl font-semibold" }, showMeaning ? (react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, wordlists_1.WordList[index].word)) : (react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].bangla),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].english),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].synonym),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].example),
                        wordlists_1.WordList[index].picture && (react_1["default"].createElement(image_1["default"], { src: wordlists_1.WordList[index].picture, alt: "img" }))))))))),
        page === "practising" && direction === "meaning_to_german" && (react_1["default"].createElement("div", { className: "px-8" },
            react_1["default"].createElement(card_1.Card, { className: "mt-6 p-6 cursor-pointer", onClick: function () { return setShowMeaning(!showMeaning); } },
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-xl font-semibold" }, showMeaning ? (react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].bangla),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].english),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].synonym),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].example),
                        wordlists_1.WordList[index].picture && (react_1["default"].createElement(image_1["default"], { src: wordlists_1.WordList[index].picture, alt: "img" })))) : (react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, wordlists_1.WordList[index].word))))))),
        page === "learning" && (react_1["default"].createElement("div", { className: "px-8" },
            react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, wordlists_1.WordList[index].word),
            react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].bangla),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].english),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].synonym),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].example),
                wordlists_1.WordList[index].picture && (react_1["default"].createElement(image_1["default"], { src: wordlists_1.WordList[index].picture, alt: "img" }))))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement(button_1.Button, { className: "mt-6 bg-lime-600", onClick: nextWord }, "Next"))));
};
exports["default"] = FlashCard;
