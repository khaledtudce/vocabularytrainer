"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var wordlists_1 = require("@/data/wordlists");
var image_1 = require("next/image");
var FlashCard = function () {
    var _a = react_1.useState(0), index = _a[0], setIndex = _a[1];
    var prevWord = function () {
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
            react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, wordlists_1.WordList[index].word),
            react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].bangla),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].english),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].synonym),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, wordlists_1.WordList[index].example),
                wordlists_1.WordList[index].picture && (react_1["default"].createElement(image_1["default"], { src: wordlists_1.WordList[index].picture, alt: "img" })))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement(button_1.Button, { className: "mt-6 bg-lime-600", onClick: nextWord }, "Next"))));
};
exports["default"] = FlashCard;
