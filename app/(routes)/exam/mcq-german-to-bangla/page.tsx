"use client";

import ExamMCQCard from "@/manualcomponent/ExamMCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const ExamMCQGermanToBangla = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <ExamMCQCard mcqdirection="germanToBangla" />
    </div>
  );
};

export default ExamMCQGermanToBangla;
