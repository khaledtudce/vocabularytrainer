"use client";

import ExamMCQCard from "@/manualcomponent/ExamMCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const ExamMCQGermanToEnglish = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <ExamMCQCard mcqdirection="germanToEnglish" />
    </div>
  );
};

export default ExamMCQGermanToEnglish;
