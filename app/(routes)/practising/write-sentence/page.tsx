"use client";

import Navbar from "@/manualcomponent/NavBar";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import WriteSentenceTest from "@/manualcomponent/WriteSentenceTest";

const WriteSentenceTestPractising = () => {
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Write Sentence
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Practice writing sentences using the given words and get AI-powered feedback
          </p>
        </div>
        <WriteSentenceTest showMeaning={true} />
      </div>
    </div>
  );
};

export default WriteSentenceTestPractising;
