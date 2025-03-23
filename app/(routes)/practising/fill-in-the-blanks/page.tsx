"use client";

import Navbar from "@/manualcomponent/NavBar";
import PractiseByBlanks from "@/manualcomponent/PractiseByBlanks";
import React from "react";

const PractiseFillInTheBlanks = () => {
  return (
    <div>
      <Navbar />
      <PractiseByBlanks reason="practise" />
    </div>
  );
};

export default PractiseFillInTheBlanks;
