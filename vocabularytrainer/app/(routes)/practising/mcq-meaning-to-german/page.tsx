"use client";

import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const MCQMeaningToGerman = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <MCQCard mcqdirection={"meaningToGerman"} />
    </div>
  );
};

export default MCQMeaningToGerman;
