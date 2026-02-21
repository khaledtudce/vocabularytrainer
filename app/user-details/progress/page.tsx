"use client";

import { useEffect, useState } from "react";
import { WordList } from "@/data/wordlists";
import NavBar from "@/manualcomponent/NavBar";
import dynamic from "next/dynamic";
const PieChart = dynamic(() => import("./PieChart"), { ssr: false });

function mapIdsToWords(ids: number[]) {
  return ids
    .map((id) => WordList.find((w) => w.id === id))
    .filter(Boolean);
}

export default function ProgressPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [lists, setLists] = useState<{ known: any[]; unknown: any[]; hard: any[] }>({ known: [], unknown: [], hard: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const uid = localStorage.getItem("userId");
    setUserId(uid);
    if (!uid) {
      setLoading(false);
      return;
    }
    fetch(`/api/user/${uid}/wordlists`)
      .then((r) => r.json())
      .then((data) => {
        setLists({
          known: mapIdsToWords(data.known || []),
          unknown: mapIdsToWords(data.unknown || []),
          hard: mapIdsToWords(data.hard || []),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Progress</h1>
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        ) : !userId ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-lg text-gray-500">No user logged in.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 max-w-md mx-auto">
              <PieChart
                known={lists.known.length}
                unknown={lists.unknown.length}
                hard={lists.hard.length}
                total={WordList.length}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Known Words", key: "known", color: "green" },
                { label: "Unknown Words", key: "unknown", color: "yellow" },
                { label: "Hard Words", key: "hard", color: "red" },
              ].map(({ label, key, color }) => (
                <div key={key} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className={`text-xl font-bold mb-4 text-${color}-700`}>{label} ({lists[key].length})</h2>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {lists[key].length === 0 ? (
                      <p className="text-gray-400 italic">No words.</p>
                    ) : (
                      lists[key].map((item: any) => (
                        <div key={item.id} className="border-b pb-2 mb-2">
                          <span className="font-semibold text-indigo-700">{item.word}</span>
                          <span className="ml-2 text-gray-600">({item.english})</span>
                          <div className="text-sm text-gray-500">{item.bangla}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
