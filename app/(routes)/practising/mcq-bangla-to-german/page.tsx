"use client";

import { WordList } from "@/data/wordlists";
import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React, { useState } from "react";

const MCQBanglaToGerman = () => {
  const [selectedWordIdFrom, setSelectedWordIdFrom] = useState(1);
  const [selectedWordIdTo, setSelectedWordIdTo] = useState(WordList.length);

  return (
    <div className="bg-bgcolor h-screen">
      <Navbar
        onSelectWordIdFrom={setSelectedWordIdFrom}
        onSelectWordIdTo={setSelectedWordIdTo}
      />
      <MCQCard
        selectedWordIdFrom={selectedWordIdFrom}
        selectedWordIdTo={selectedWordIdTo}
        mcqdirection={"banglaToGerman"}
      />
    </div>
  );
};

export default MCQBanglaToGerman;
