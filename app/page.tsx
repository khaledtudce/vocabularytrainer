"use client";

import FlashCard from "@/manualcomponent/FlashCard";
import Navbar from "@/manualcomponent/NavBar";
import React, { useState } from "react";

const Home = () => {
  const [selectedWordIdFrom, setSelectedWordIdFrom] = useState(1);
  const [selectedWordIdTo, setSelectedWordIdTo] = useState(30);
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar
        onSelectWordIdFrom={setSelectedWordIdFrom}
        onSelectWordIdTo={setSelectedWordIdTo}
      />
      <FlashCard
        page={"learning"}
        direction={""}
        selectedWordIdFrom={selectedWordIdFrom}
        selectedWordIdTo={selectedWordIdTo}
      />
    </div>
  );
};

export default Home;
