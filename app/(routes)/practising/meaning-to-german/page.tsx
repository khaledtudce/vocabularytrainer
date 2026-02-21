"use client";

import FlashCard from "@/manualcomponent/FlashCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const PractiseMeaningToGerman = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <FlashCard page={"practising"} direction={"meaning_to_german"} />
    </div>
  );
};

export default PractiseMeaningToGerman;
