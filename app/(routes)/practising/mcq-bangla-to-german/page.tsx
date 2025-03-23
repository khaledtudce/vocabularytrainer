"use client";

import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const MCQBanglaToGerman = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <MCQCard mcqdirection={"banglaToGerman"} />
    </div>
  );
};

export default MCQBanglaToGerman;
