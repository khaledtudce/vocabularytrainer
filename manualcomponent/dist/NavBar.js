"use client";
"use strict";
exports.__esModule = true;
var link_1 = require("next/link");
var react_1 = require("react");
var QuestionSelection_1 = require("./QuestionSelection");
function Navbar() {
    var _a = react_1.useState(""), active = _a[0], setActive = _a[1];
    var _b = react_1.useState("null"), dropdown = _b[0], setDropdown = _b[1];
    return (React.createElement("nav", { className: "w-full bg-blue-600 p-2 shadow-md" },
        React.createElement("div", { className: "container flex justify-between items-center" },
            React.createElement("h1", { className: "text-white text-xl font-bold" }, "Vocabulary Learner"),
            React.createElement("ul", { className: "flex space-x-6" },
                React.createElement("li", { className: "mt-2" },
                    React.createElement(link_1["default"], { href: "/learning", className: "border text-white px-4 py-2 rounded-lg transition duration-600 " + (active === "Learning" ? "bg-blue-800" : "hover:bg-blue-700"), onClick: function () { return setActive("Learning"); } }, "Learning")),
                React.createElement("li", { className: "relative", onMouseEnter: function () { return setDropdown("Practising"); }, onMouseLeave: function () { return setDropdown(""); } },
                    React.createElement("button", { className: "border text-white px-4 py-2 rounded-lg transition duration-600 " + (active === "Practising" ? "bg-blue-800" : "hover:bg-blue-700") }, "Practising"),
                    dropdown === "Practising" && (React.createElement("ul", { className: "text-white absolute right-0 w-48 shadow-lg rounded-lg" },
                        React.createElement("li", { className: "mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg" },
                            React.createElement(link_1["default"], { href: "/practising/german-to-meaning", className: "block px-4 py-2 hover:bg-blue-700 rounded-lg" }, "German to Meaning")),
                        React.createElement("li", { className: "mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg" },
                            React.createElement(link_1["default"], { href: "/practising/meaning-to-german", className: "block px-4 py-2 hover:bg-blue-700 rounded-lg" }, "Meaning to German"))))),
                React.createElement("li", { className: "relative", onMouseEnter: function () { return setDropdown("Test"); }, onMouseLeave: function () { return setDropdown(""); } },
                    React.createElement("button", { className: "border text-white px-4 py-2 rounded-lg transition duration-600 " + (active === "Test" ? "bg-blue-500" : "hover:bg-blue-700") }, "Test"),
                    dropdown === "Test" && (React.createElement("ul", { className: "text-white absolute right-0 w-48 shadow-lg" },
                        React.createElement("li", { className: "mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg" },
                            React.createElement(link_1["default"], { href: "/exam/mcq-questions", className: "block px-4 py-2 hover:bg-blue-700 rounded-lg" }, "MCQ")),
                        React.createElement("li", { className: "mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg" },
                            React.createElement(link_1["default"], { href: "/exam/fill-blanks", className: "block px-4 py-2 hover:bg-blue-700 rounded-lg" }, "Fill in the Blank")))))),
            React.createElement(QuestionSelection_1["default"], null))));
}
exports["default"] = Navbar;
