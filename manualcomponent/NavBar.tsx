"use client";

import Link from "next/link";
import { useState } from "react";
import QuestionSelection from "./QuestionSelection";

export default function Navbar() {
  const [active, setActive] = useState("");
  const [dropdown, setDropdown] = useState("null");

  return (
    <nav className="w-full bg-blue-600 p-2 shadow-md">
      <div className="container flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Vocabulary Learner</h1>
        <ul className="flex space-x-6">
          <li className="mt-2">
            <Link
              href="/learning"
              className={`border text-white px-4 py-2 rounded-lg transition duration-600 ${
                active === "Learning" ? "bg-blue-800" : "hover:bg-blue-700"
              }`}
              onClick={() => setActive("Learning")}
            >
              Learning
            </Link>
          </li>
          <li
            className="relative"
            onMouseEnter={() => setDropdown("Practising")}
            onMouseLeave={() => setDropdown("")}
          >
            <button
              className={`border text-white px-4 py-2 rounded-lg transition duration-600 ${
                active === "Practising" ? "bg-blue-800" : "hover:bg-blue-700"
              }`}
            >
              Practising
            </button>
            {dropdown === "Practising" && (
              <ul className="text-white absolute right-0 w-48 shadow-lg rounded-lg">
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/practising/german-to-meaning"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    German to Meaning
                  </Link>
                </li>
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/practising/meaning-to-german"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    Meaning to German
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li
            className="relative"
            onMouseEnter={() => setDropdown("Test")}
            onMouseLeave={() => setDropdown("")}
          >
            <button
              className={`border text-white px-4 py-2 rounded-lg transition duration-600 ${
                active === "Test" ? "bg-blue-500" : "hover:bg-blue-700"
              }`}
            >
              Test
            </button>
            {dropdown === "Test" && (
              <ul className="text-sm text-white absolute right-0 w-48 shadow-lg">
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/exam/mcq-bangla-to-german"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    MCQ:Bangla to German
                  </Link>
                </li>
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/exam/mcq-german-to-bangla"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    MCQ:German to Bangla
                  </Link>
                </li>
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/exam/mcq-german-to-english"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    MCQ:German to English
                  </Link>
                </li>
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/exam/mcq-meaning-to-german"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    MCQ:Meaning to German
                  </Link>
                </li>
                <li className="mt-0.5 bg-blue-500 hover:bg-blue-700 rounded-lg">
                  <Link
                    href="/exam/fill-in-the-blank"
                    className="block px-4 py-2 hover:bg-blue-700 rounded-lg"
                  >
                    Fill in the blank
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
        <QuestionSelection />
      </div>
    </nav>
  );
}
