"use client";

import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const MCQEnglishToGerman = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <MCQCard mcqdirection={"englishToGerman"} />
    </div>
  );
};

export default MCQEnglishToGerman;
