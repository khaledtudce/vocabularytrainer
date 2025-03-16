"use client";

import ExamMCQCard from "@/manualcomponent/ExamMCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React, { useState } from "react";

const ExamMCQBanglaToGerman = () => {
  const [selectedWordIdFrom, setSelectedWordIdFrom] = useState(1);
  const [selectedWordIdTo, setSelectedWordIdTo] = useState(7);

  return (
    <div className="bg-bgcolor h-screen">
      <Navbar
        onSelectWordIdFrom={setSelectedWordIdFrom}
        onSelectWordIdTo={setSelectedWordIdTo}
      />
      <ExamMCQCard
        selectedWordIdFrom={selectedWordIdFrom}
        selectedWordIdTo={selectedWordIdTo}
        mcqdirection="banglaToGerman"
      />
    </div>
  );
};

export default ExamMCQBanglaToGerman;
