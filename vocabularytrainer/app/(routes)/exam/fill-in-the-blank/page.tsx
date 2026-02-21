"use client";

import Navbar from "@/manualcomponent/NavBar";
import PractiseByBlanks from "@/manualcomponent/PractiseByBlanks";
import React from "react";

const ExamFillInTheBlanks = () => {
  return (
    <div>
      <Navbar />
      <PractiseByBlanks reason="exam" />
    </div>
  );
};

export default ExamFillInTheBlanks;
