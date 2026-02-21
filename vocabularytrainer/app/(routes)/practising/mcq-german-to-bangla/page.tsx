"use client";

import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const MCQGermanToBangla = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <MCQCard mcqdirection={"germanToBangla"} />
    </div>
  );
};

export default MCQGermanToBangla;
