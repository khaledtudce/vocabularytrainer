import FlashCard from "@/manualcomponent/FlashCard";
import Navbar from "@/manualcomponent/NavBar";

export default function Home() {
  return (
    <div className="bg-bgcolor h-screen">
      <Navbar />
      <FlashCard />
    </div>
  );
}
