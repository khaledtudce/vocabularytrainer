"use client";

import { WordList } from "@/data/wordlists";
import Navbar from "@/manualcomponent/NavBar";
import PractiseByBlanks from "@/manualcomponent/PractiseByBlanks";
import React, { useState } from "react";

const ExamFillInTheBlanks = () => {
  const [selectedWordIdFrom, setSelectedWordIdFrom] = useState(1);
  const [selectedWordIdTo, setSelectedWordIdTo] = useState(WordList.length);
  return (
    <div>
      <Navbar
        onSelectWordIdFrom={setSelectedWordIdFrom}
        onSelectWordIdTo={setSelectedWordIdTo}
      />
      <PractiseByBlanks
        selectedWordIdFrom={selectedWordIdFrom}
        selectedWordIdTo={selectedWordIdTo}
        reason="exam"
      />
    </div>
  );
};

export default ExamFillInTheBlanks;
