import MCQCard from "@/manualcomponent/MCQCard";
import Navbar from "@/manualcomponent/NavBar";
import React from "react";

const page = () => {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <MCQCard />
    </div>
  );
};

export default page;
