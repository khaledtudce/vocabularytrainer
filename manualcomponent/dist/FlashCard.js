"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var wordlists_1 = require("@/data/wordlists");
var image_1 = require("next/image");
var card_1 = require("@/components/ui/card");
var FlashCard = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var page = _a.page, direction = _a.direction;
    var _w = react_1.useState(0), index = _w[0], setIndex = _w[1];
    var _x = react_1.useState(true), showMeaning = _x[0], setShowMeaning = _x[1];
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
            react_1["default"].createElement("div", { className: "text-center" }, "Please click on flashcard to switch it!"),
            react_1["default"].createElement(card_1.Card, { className: "mt-6 p-6 cursor-pointer", onClick: function () { return setShowMeaning(!showMeaning); } },
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-xl font-semibold" }, showMeaning ? (react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, (_b = wordlists_1.WordList[index]) === null || _b === void 0 ? void 0 : _b.word)) : (react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_c = wordlists_1.WordList[index]) === null || _c === void 0 ? void 0 : _c.bangla),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_d = wordlists_1.WordList[index]) === null || _d === void 0 ? void 0 : _d.english),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_e = wordlists_1.WordList[index]) === null || _e === void 0 ? void 0 : _e.synonym),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_f = wordlists_1.WordList[index]) === null || _f === void 0 ? void 0 : _f.example),
                        ((_g = wordlists_1.WordList[index]) === null || _g === void 0 ? void 0 : _g.picture) && (react_1["default"].createElement(image_1["default"], { src: (_h = wordlists_1.WordList[index]) === null || _h === void 0 ? void 0 : _h.picture, alt: "img" }))))))))),
        page === "practising" && direction === "meaning_to_german" && (react_1["default"].createElement("div", { className: "px-8" },
            react_1["default"].createElement("div", { className: "text-center" }, "Please click on flashcard to switch it!"),
            react_1["default"].createElement(card_1.Card, { className: "mt-6 p-6 cursor-pointer", onClick: function () { return setShowMeaning(!showMeaning); } },
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-xl font-semibold" }, showMeaning ? (react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_j = wordlists_1.WordList[index]) === null || _j === void 0 ? void 0 : _j.bangla),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_k = wordlists_1.WordList[index]) === null || _k === void 0 ? void 0 : _k.english),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_l = wordlists_1.WordList[index]) === null || _l === void 0 ? void 0 : _l.synonym),
                        react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_m = wordlists_1.WordList[index]) === null || _m === void 0 ? void 0 : _m.example),
                        ((_o = wordlists_1.WordList[index]) === null || _o === void 0 ? void 0 : _o.picture) && (react_1["default"].createElement(image_1["default"], { src: wordlists_1.WordList[index].picture, alt: "img" })))) : (react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, (_p = wordlists_1.WordList[index]) === null || _p === void 0 ? void 0 : _p.word))))))),
        page === "learning" && (react_1["default"].createElement("div", { className: "px-8" },
            react_1["default"].createElement("div", { className: "py-4 text-3xl font-bold" }, (_q = wordlists_1.WordList[index]) === null || _q === void 0 ? void 0 : _q.word),
            react_1["default"].createElement("div", { className: "border flex flex-col gap-1" },
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_r = wordlists_1.WordList[index]) === null || _r === void 0 ? void 0 : _r.bangla),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_s = wordlists_1.WordList[index]) === null || _s === void 0 ? void 0 : _s.english),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_t = wordlists_1.WordList[index]) === null || _t === void 0 ? void 0 : _t.synonym),
                react_1["default"].createElement("span", { className: "p-2\r\n           border border-amber-400" }, (_u = wordlists_1.WordList[index]) === null || _u === void 0 ? void 0 : _u.example),
                ((_v = wordlists_1.WordList[index]) === null || _v === void 0 ? void 0 : _v.picture) && (react_1["default"].createElement(image_1["default"], { src: wordlists_1.WordList[index].picture, alt: "img" }))))),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement(button_1.Button, { className: "mt-6 bg-lime-600", onClick: nextWord }, "Next"))));
};
exports["default"] = FlashCard;
