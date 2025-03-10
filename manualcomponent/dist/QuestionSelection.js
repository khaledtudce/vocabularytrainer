"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
function DifficultySelector() {
    var _a = react_1.useState("Medium"), difficulty = _a[0], setDifficulty = _a[1];
    var _b = react_1.useState({ from: 1, to: 1600 }), range = _b[0], setRange = _b[1];
    return (React.createElement("div", { className: "p-4 flex bg-gray-100 rounded-lg shadow-md " + (difficulty === "Custom" ? "w-72" : "w-44") },
        React.createElement("select", { className: "w-full rounded border", value: difficulty, onChange: function (e) { return setDifficulty(e.target.value); } },
            React.createElement("option", { value: "Medium" }, "Medium"),
            React.createElement("option", { value: "Hard" }, "Hard"),
            React.createElement("option", { value: "Custom" }, "Select range")),
        difficulty === "Custom" && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "flex pl-2 pt-2 w-full" },
                React.createElement("span", null, "from"),
                React.createElement("select", { className: "w-full rounded border", value: range.from, onChange: function (e) {
                        return setRange(__assign(__assign({}, range), { from: Number(e.target.value) }));
                    } }, Array.from({ length: 1600 }, function (_, i) { return i + 1; }).map(function (num) { return (React.createElement("option", { key: num, value: num }, num)); })),
                React.createElement("span", null, "to"),
                React.createElement("select", { className: "w-full rounded border", value: range.to, onChange: function (e) {
                        return setRange(__assign(__assign({}, range), { to: Number(e.target.value) }));
                    } }, Array.from({ length: 1599 }, function (_, i) { return i + 1; }).map(function (num) { return (React.createElement("option", { key: num, value: num }, num)); })))))));
}
exports["default"] = DifficultySelector;
