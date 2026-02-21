"use client";

import ExamMCQCard from "@/manualcomponent/ExamMCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const ExamMCQMeaningToGerman = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <ExamMCQCard mcqdirection="meaningToGerman" />
    </div>
  );
};

export default ExamMCQMeaningToGerman;
