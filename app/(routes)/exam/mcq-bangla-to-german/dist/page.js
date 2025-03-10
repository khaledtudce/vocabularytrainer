"use strict";
exports.__esModule = true;
var MCQCard_1 = require("@/manualcomponent/MCQCard");
var NavBar_1 = require("@/manualcomponent/NavBar");
var react_1 = require("react");
var page = function () {
    return (react_1["default"].createElement("div", { className: "bg-bgcolor h-screen" },
        react_1["default"].createElement(NavBar_1["default"], null),
        react_1["default"].createElement(MCQCard_1["default"], null)));
};
exports["default"] = page;
