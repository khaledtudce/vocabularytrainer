"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { WordList } from "@/data/wordlists";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Get userName from localStorage
    const storedUserName = localStorage.getItem("userName");
    setUserName(storedUserName || undefined);
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      if (typeof window === "undefined") return;
      
      const userId = localStorage.getItem("userId");
      console.log('[NavBar] fetchProgress userId:', userId);
      if (!userId) {
        console.log('[NavBar] No userId in localStorage');
        setProgress(undefined);
        return;
      }

      try {
        const response = await fetch(`/api/user/${userId}/wordlists`);
        console.log('[NavBar] wordlists response status:', response.status);
        const data = await response.json();
        console.log('[NavBar] wordlists data:', data);
        const knownCount = (data.known || []).length;
        const progressPercent = (knownCount / WordList.length) * 100;
        console.log('[NavBar] Progress calculated:', progressPercent, 'known:', knownCount, 'total:', WordList.length);
        setProgress(progressPercent);
      } catch (error) {
        console.error("[NavBar] Failed to fetch progress:", error);
        setProgress(undefined);
      }
    };

    fetchProgress();
    
    // Refresh progress every 2 seconds
    const interval = setInterval(fetchProgress, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when navigating
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg sticky top-0 z-50">
      <div className="w-full px-3 sm:px-4 py-2.5 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section - Always Visible */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/learning" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-lg shadow-md">
                <img src="/vocab-icon.svg" alt="Vocabulary" width="20" height="20" className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-white">Vocabulary</h1>
              </div>
            </Link>

            {/* Progress Link - Direct to Progress Page */}
            {progress !== undefined && (
              <Link href="/user-details/progress" className="hidden sm:flex items-center gap-2 bg-indigo-600 bg-opacity-50 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white border-opacity-30 hover:bg-opacity-70 hover:bg-green-500 hover:bg-opacity-30 transition-all text-xs sm:text-sm">
                <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center bg-white rounded-full text-xs font-bold text-purple-600">
                  {Math.round(progress * 10) / 10}
                </div>
                <span className="hidden sm:inline text-white font-semibold">
                  % complete
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            <NavLinks closeMenu={closeMenu} progress={progress} userName={userName} />
          </div>

          {/* Mobile Progress Link */}
          {progress !== undefined && (
            <Link href="/user-details/progress" className="md:hidden">
              <div className="text-2xs sm:text-xs font-bold text-white bg-indigo-600 bg-opacity-50 rounded-full px-2 sm:px-3 py-1 border border-white border-opacity-20 hover:bg-opacity-70 transition-all">
                {Math.round(progress * 10) / 10}% complete
              </div>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleNavbar}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X strokeWidth={2.5} size={24} className="sm:size-28" />
              ) : (
                <Menu strokeWidth={2.5} size={24} className="sm:size-28" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 mt-3" : "max-h-0"
          }`}
        >
          <div className="bg-gradient-to-b from-indigo-700 via-purple-700 to-purple-800 backdrop-blur-lg rounded-lg border border-white border-opacity-30 overflow-hidden shadow-xl">
            <div className="flex flex-col gap-1 p-2 sm:p-3">
              <NavLinks closeMenu={closeMenu} mobile={true} progress={progress} userName={userName} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLinks({ closeMenu, mobile = false, progress, userName }: { closeMenu: () => void; mobile?: boolean; progress?: number; userName?: string }) {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      document.cookie = 'userId=; path=/; max-age=0';
      
      // Emit logout event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("userLoggedOut"));
      }
      
      closeMenu();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleDropdown = (menu: string) => {
    setDropdownOpen(dropdownOpen === menu ? null : menu);
  };

  // Close dropdown when clicking outside (for desktop click-based dropdowns)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if clicking outside the nav component on desktop
      if (!mobile && !target.closest('.nav-dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    if (dropdownOpen && !mobile) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen, mobile]);

  if (mobile) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Link
          href="/learning"
          onClick={closeMenu}
          className="w-full text-left px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all"
        >
          📚 Learning
        </Link>

        <button
          onClick={() => toggleDropdown("practising")}
          className="w-full text-left px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all flex justify-between items-center"
        >
          <span>🎯 Practising</span>
          <span className="text-xs">{dropdownOpen === "practising" ? "−" : "+"}</span>
        </button>
        {dropdownOpen === "practising" && <PractiseMenu mobile={true} closeMenu={closeMenu} />}

        <button
          onClick={() => toggleDropdown("test")}
          className="w-full text-left px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all flex justify-between items-center"
        >
          <span>✅ Test</span>
          <span className="text-xs">{dropdownOpen === "test" ? "−" : "+"}</span>
        </button>
        {dropdownOpen === "test" && <TestMenu mobile={true} closeMenu={closeMenu} />}

        <Link
          href="/vocabulary"
          onClick={closeMenu}
          className="w-full text-left px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all"
        >
          📖 Wordlists
        </Link>

        <button
          onClick={() => toggleDropdown("user")}
          className="w-full text-left px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-indigo-600 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all flex justify-between items-center"
        >
          <span>👤 {userName || "User"}</span>
          <span className="text-xs">{dropdownOpen === "user" ? "−" : "+"}</span>
        </button>
        {dropdownOpen === "user" && <UserMenu mobile={true} closeMenu={closeMenu} handleLogout={handleLogout} />}
      </div>
    );
  }

  return (
    <div className="nav-dropdown-container">
      <ul className="flex items-center gap-1 lg:gap-2">
      <li>
        <Link
          href="/learning"
          className="px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-base text-white font-medium rounded-lg transition-all hover:bg-green-500 hover:bg-opacity-30 focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          📚 Learning
        </Link>
      </li>

      <li className="relative">
        <button 
          onClick={() => setDropdownOpen(dropdownOpen === "practising" ? null : "practising")}
          className="px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-base text-white font-medium rounded-lg transition-all hover:bg-green-500 hover:bg-opacity-30 focus:ring-2 focus:ring-white focus:ring-opacity-50">
          🎯 Practising
        </button>
        {dropdownOpen === "practising" && <PractiseMenu />}
      </li>

      <li className="relative">
        <button 
          onClick={() => setDropdownOpen(dropdownOpen === "test" ? null : "test")}
          className="px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-base text-white font-medium rounded-lg transition-all hover:bg-green-500 hover:bg-opacity-30 focus:ring-2 focus:ring-white focus:ring-opacity-50">
          ✅ Test
        </button>
        {dropdownOpen === "test" && <TestMenu />}
      </li>

      <li>
        <Link
          href="/vocabulary"
          className="px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-base text-white font-medium rounded-lg transition-all hover:bg-green-500 hover:bg-opacity-30 focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          📖 Wordlists
        </Link>
      </li>

      <li className="relative">
        <button 
          onClick={() => setDropdownOpen(dropdownOpen === "user" ? null : "user")}
          className="px-3 lg:px-4 py-2 text-xs sm:text-sm lg:text-base text-white font-medium rounded-lg transition-all hover:bg-green-500 hover:bg-opacity-30 focus:ring-2 focus:ring-white focus:ring-opacity-50">
          👤 {userName || "User"}
        </button>
        {dropdownOpen === "user" && <UserMenu handleLogout={handleLogout} />}
      </li>
    </ul>
    </div>
  );
}

function PractiseMenu({ mobile = false, closeMenu }: { mobile?: boolean; closeMenu?: () => void } = {}) {
  if (mobile) {
    return (
      <div className="ml-4 mt-1 bg-indigo-600 bg-opacity-30 rounded-lg p-2 space-y-1">
        <Link
          href="/practising/german-to-meaning"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          🃏 Flashcard: German → Meaning
        </Link>
        <Link
          href="/practising/meaning-to-german"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          🃏 Flashcard: Meaning → German
        </Link>
        <Link
          href="/practising/fill-in-the-blanks"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✏️ Fill in the blanks
        </Link>
        <Link
          href="/practising/mcq-bangla-to-german"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: Bangla → German
        </Link>
        <Link
          href="/practising/mcq-german-to-bangla"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: German → Bangla
        </Link>
        <Link
          href="/practising/mcq-german-to-english"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: German → English
        </Link>
        <Link
          href="/practising/mcq-english-to-german"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: English → German
        </Link>
        <Link
          href="/practising/mcq-meaning-to-german"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: Meaning → German
        </Link>
      </div>
    );
  }

  return (
    <ul className="absolute top-full left-0 mt-1 w-56 bg-gradient-to-b from-indigo-700 to-purple-700 shadow-xl rounded-lg border border-white border-opacity-20 overflow-hidden z-50 backdrop-blur-sm">
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/german-to-meaning"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          🃏 Flashcard: German → Meaning
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/meaning-to-german"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          🃏 Flashcard: Meaning → German
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/fill-in-the-blanks"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✏️ Fill in the blanks
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/mcq-bangla-to-german"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: Bangla → German
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/mcq-german-to-bangla"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: German → Bangla
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/mcq-german-to-english"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: German → English
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/practising/mcq-english-to-german"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: English → German
        </Link>
      </li>
      <li>
        <Link
          href="/practising/mcq-meaning-to-german"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: Meaning → German
        </Link>
      </li>
    </ul>
  );
}

function TestMenu({ mobile = false, closeMenu }: { mobile?: boolean; closeMenu?: () => void } = {}) {
  if (mobile) {
    return (
      <div className="ml-4 mt-1 bg-indigo-600 bg-opacity-30 rounded-lg p-2 space-y-1">
        <Link
          href="/exam/mcq-bangla-to-german"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: Bangla → German
        </Link>
        <Link
          href="/exam/mcq-german-to-bangla"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: German → Bangla
        </Link>
        <Link
          href="/exam/mcq-german-to-english"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: German → English
        </Link>
        <Link
          href="/exam/mcq-meaning-to-german"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✓ MCQ: Meaning → German
        </Link>
        <Link
          href="/exam/fill-in-the-blank"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          ✏️ Fill in the blank
        </Link>
      </div>
    );
  }

  return (
    <ul className="absolute top-full left-0 mt-1 w-56 bg-gradient-to-b from-indigo-700 to-purple-800 shadow-xl rounded-lg border border-white border-opacity-20 overflow-hidden z-50 backdrop-blur-md">
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/exam/mcq-bangla-to-german"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: Bangla → German
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/exam/mcq-german-to-bangla"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: German → Bangla
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/exam/mcq-german-to-english"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: German → English
        </Link>
      </li>
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/exam/mcq-meaning-to-german"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✓ MCQ: Meaning → German
        </Link>
      </li>
      <li>
        <Link
          href="/exam/fill-in-the-blank"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          ✏️ Fill in the blank
        </Link>
      </li>
    </ul>
  );
}

function UserMenu({ mobile = false, closeMenu, handleLogout }: { mobile?: boolean; closeMenu?: () => void; handleLogout: () => void }) {
  if (mobile) {
    return (
      <div className="ml-4 mt-1 bg-indigo-600 bg-opacity-30 rounded-lg p-2 space-y-1">
        <Link
          href="/user-details"
          onClick={closeMenu}
          className="block px-3 py-2 text-xs sm:text-sm text-white bg-indigo-600 bg-opacity-30 hover:bg-opacity-60 rounded-lg transition-all"
        >
          👤 User Details
        </Link>
        <button
          onClick={() => {
            closeMenu?.();
            handleLogout();
          }}
          className="w-full text-left px-3 py-2 text-xs sm:text-sm text-white bg-red-600 bg-opacity-60 hover:bg-opacity-80 rounded-lg transition-all font-medium"
        >
          🚪 Logout
        </button>
      </div>
    );
  }

  return (
    <ul className="absolute top-full left-0 mt-1 w-56 bg-gradient-to-b from-indigo-700 to-purple-800 shadow-xl rounded-lg border border-white border-opacity-20 overflow-hidden z-50 backdrop-blur-md">
      <li className="border-b border-white border-opacity-10">
        <Link
          href="/user-details"
          className="block px-4 py-3 text-sm text-white hover:bg-indigo-600 hover:bg-opacity-60 transition-all"
        >
          👤 User Details
        </Link>
      </li>
      <li>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all font-medium"
        >
          🚪 Logout
        </button>
      </li>
    </ul>
  );
}
