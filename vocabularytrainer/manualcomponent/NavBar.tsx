"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import QuestionSelection from "./QuestionSelection";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="w-full bg-green-600 p-2 shadow-md">
      <div className="container w-full flex items-center justify-between">
        <div className="hidden w-full sm:flex sm:flex-row justify-between items-center gap-5">
          <Link href="/learning">
            <h1 className="text-white text-xl font-bold">Vocabulary Learner</h1>
          </Link>
          <NavLinks />
          <QuestionSelection />
        </div>
        <div className="w-full sm:hidden">
          <span className="w-full">
            <span className="w-full justify-end flex" onClick={toggleNavbar}>
              {isOpen ? <X /> : <Menu />}
            </span>
            <span>
              {isOpen ? (
                <div className="w-full flex flex-col justify-between items-center gap-3">
                  <Link href="/learning">
                    <h1 className="text-white text-2xl font-bold p-2">
                      Vocabulary Learner
                    </h1>
                  </Link>
                  <NavLinks />
                  <QuestionSelection />
                </div>
              ) : (
                ""
              )}
            </span>
          </span>
        </div>
      </div>
    </nav>
  );
}

function NavLinks() {
  const [dropdown, setDropdown] = useState("null");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      document.cookie = 'userId=; path=/; max-age=0';
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ul className="flex space-x-2 sm:space-x-6">
      <li className="mt-2">
        <Link
          href="/learning"
          className="border text-white px-3 py-2 rounded-lg transition duration-600 focus:ring-2 hover:bg-green-700"
        >
          Learning
        </Link>
      </li>
      <li
        className="relative"
        onMouseEnter={() => setDropdown("Practising")}
        onMouseLeave={() => setDropdown("")}
      >
        <button className="border text-white px-3 py-2 rounded-lg transition duration-600 focus:ring-2 hover:bg-green-700">
          Practising
        </button>
        {dropdown === "Practising" && <PractiseMenu />}
      </li>
      <li
        className="relative"
        onMouseEnter={() => setDropdown("Test")}
        onMouseLeave={() => setDropdown("")}
      >
        <button className="border text-white px-3 py-2 rounded-lg transition duration-600 focus:ring-2 hover:bg-green-700">
          Test
        </button>
        {dropdown === "Test" && <TestMenu />}
      </li>
      <li className="mt-2">
        <Link
          href="/vocabulary"
          className="border text-white px-3 py-2 rounded-lg transition duration-600 focus:ring-2 hover:bg-green-700"
        >
          Wordlists
        </Link>
      </li>
      <li
        className="relative"
        onMouseEnter={() => setDropdown("User")}
        onMouseLeave={() => setDropdown("")}
      >
        <button className="border text-white px-3 py-2 rounded-lg transition duration-600 focus:ring-2 hover:bg-green-700">
          User
        </button>
        {dropdown === "User" && <UserMenu handleLogout={handleLogout} />}
      </li>
    </ul>
  );
}

function PractiseMenu() {
  return (
    <ul className="text-sm text-white absolute right-0 w-56 shadow-lg rounded-lg z-1000">
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/german-to-meaning"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          Flashcard:German to Meaning
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/meaning-to-german"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          Flashcard:Meaning to German
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/fill-in-the-blanks"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          Fill in the blanks
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/mcq-bangla-to-german"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:Bangla to German
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/mcq-german-to-bangla"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:German to Bangla
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/mcq-german-to-english"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:German to English
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/mcq-english-to-german"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:English to German
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/practising/mcq-meaning-to-german"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:Meaning to German
        </Link>
      </li>
    </ul>
  );
}

function TestMenu() {
  return (
    <ul className="text-sm text-white absolute right-0 w-48 shadow-lg z-1000">
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/exam/mcq-bangla-to-german"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:Bangla to German
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/exam/mcq-german-to-bangla"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:German to Bangla
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/exam/mcq-german-to-english"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:German to English
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/exam/mcq-meaning-to-german"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          MCQ:Meaning to German
        </Link>
      </li>
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/exam/fill-in-the-blank"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          Fill in the blank
        </Link>
      </li>
    </ul>
  );
}

function UserMenu({ handleLogout }: { handleLogout: () => void }) {
  return (
    <ul className="text-sm text-white absolute right-0 w-48 shadow-lg rounded-lg z-1000">
      <li className="mt-0.5 bg-green-500 hover:bg-green-700 rounded-lg">
        <Link
          href="/user-details"
          className="block px-4 py-2 hover:bg-green-700 rounded-lg"
        >
          User Details
        </Link>
      </li>
      <li className="mt-0.5 bg-red-500 hover:bg-red-700 rounded-lg">
        <button
          onClick={handleLogout}
          className="w-full text-left block px-4 py-2 hover:bg-red-700 rounded-lg font-medium"
        >
          Logout
        </button>
      </li>
    </ul>
  );
}
