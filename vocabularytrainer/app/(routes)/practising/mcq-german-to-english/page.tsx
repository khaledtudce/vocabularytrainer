"use client";

import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const MCQGermanToEnglish = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <MCQCard mcqdirection={"germanToEnglish"} />
    </div>
  );
};

export default MCQGermanToEnglish;
