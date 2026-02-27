"use client";

import ExamMCQCard from "@/manualcomponent/ExamMCQCard";
import Navbar from "@/manualcomponent/NavBar";
import QuestionSelection from "@/manualcomponent/QuestionSelection";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const ExamMCQBanglaToGerman = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-8">
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              Bangla to German
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Translate Bangla words to German in exam mode</p>
          </div>
          <QuestionSelection />
        </div>
        <ExamMCQCard mcqdirection="banglaToGerman" />
      </div>
    </div>
  );
};

export default ExamMCQBanglaToGerman;
