import FlashCard from "@/manualcomponent/FlashCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const page = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <FlashCard page={"learning"} direction={""} />
    </div>
  );
};

export default page;
