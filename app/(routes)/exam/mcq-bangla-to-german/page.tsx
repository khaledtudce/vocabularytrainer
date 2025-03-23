"use client";

import ExamMCQCard from "@/manualcomponent/ExamMCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const ExamMCQBanglaToGerman = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <ExamMCQCard mcqdirection="banglaToGerman" />
    </div>
  );
};

export default ExamMCQBanglaToGerman;
