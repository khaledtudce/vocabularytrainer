"use strict";
exports.__esModule = true;
var FlashCard_1 = require("@/manualcomponent/FlashCard");
var NavBar_1 = require("@/manualcomponent/NavBar");
var react_1 = require("react");
var page = function () {
    return (react_1["default"].createElement("div", { className: "bg-bgcolor h-screen" },
        react_1["default"].createElement(NavBar_1["default"], null),
        react_1["default"].createElement(FlashCard_1["default"], { page: "learning", direction: "" })));
};
exports["default"] = page;
