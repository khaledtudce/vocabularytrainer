import FlashCard from "@/manualcomponent/FlashCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const LearningPage = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <FlashCard page={"learning"} direction={""} />
    </div>
  );
};

export default LearningPage;
