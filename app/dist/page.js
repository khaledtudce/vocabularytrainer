"use strict";
exports.__esModule = true;
var FlashCard_1 = require("@/manualcomponent/FlashCard");
var NavBar_1 = require("@/manualcomponent/NavBar");
function Home() {
    return (React.createElement("div", { className: "bg-bgcolor h-screen" },
        React.createElement(NavBar_1["default"], null),
        React.createElement(FlashCard_1["default"], null)));
}
exports["default"] = Home;
