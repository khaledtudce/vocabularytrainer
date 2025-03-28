"use client";

import FlashCard from "@/manualcomponent/FlashCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const PractisingGermanToMeaning = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <FlashCard page={"practising"} direction={"german_to_meaning"} />
    </div>
  );
};

export default PractisingGermanToMeaning;
