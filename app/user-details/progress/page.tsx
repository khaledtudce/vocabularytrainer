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

// Calculate statistics based on date tracking
function calculateStats(data: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  let learnedToday = 0;
  let learnedThisWeek = 0;
  let learnedThisMonth = 0;

  if (data.wordProgress && Array.isArray(data.wordProgress)) {
    data.wordProgress.forEach((item: any) => {
      if (item.movedToKnown) {
        const itemDate = new Date(item.movedToKnown);
        itemDate.setHours(0, 0, 0, 0);

        if (itemDate.getTime() === today.getTime()) {
          learnedToday++;
        }
        if (itemDate >= weekStart && itemDate <= today) {
          learnedThisWeek++;
        }
        if (itemDate >= monthStart && itemDate <= today) {
          learnedThisMonth++;
        }
      }
    });
  }

  return { learnedToday, learnedThisWeek, learnedThisMonth };
}

export default function ProgressPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [lists, setLists] = useState<{ known: any[]; unknown: any[]; hard: any[] }>({ known: [], unknown: [], hard: [] });
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({ learnedToday: 0, learnedThisWeek: 0, learnedThisMonth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const uid = localStorage.getItem("userId");
    setUserId(uid);
    if (!uid) {
      setLoading(false);
      return;
    }

    // Fetch wordlists
    fetch(`/api/user/${uid}/wordlists`)
      .then((r) => r.json())
      .then((data) => {
        setLists({
          known: mapIdsToWords(data.known || []),
          unknown: mapIdsToWords(data.unknown || []),
          hard: mapIdsToWords(data.hard || []),
        });
      })
      .catch(() => {});

    // Fetch user data for progress tracking
    fetch(`/api/user/${uid}/data`)
      .then((r) => r.json())
      .then((data) => {
        setUserData(data);
        setStats(calculateStats(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const moveWord = async (wordId: number, fromCategory: "known" | "unknown" | "hard", toCategory: "known" | "unknown" | "hard") => {
    if (fromCategory === toCategory) return;

    const newLists = {
      known: lists.known.filter(w => w.id !== wordId),
      unknown: lists.unknown.filter(w => w.id !== wordId),
      hard: lists.hard.filter(w => w.id !== wordId),
    };

    // Get the word object from current category
    const wordObject = lists[fromCategory].find(w => w.id === wordId);
    if (!wordObject) return;

    newLists[toCategory] = [...newLists[toCategory], wordObject];

    setLists(newLists);

    // Update via API
    if (userId) {
      try {
        await fetch(`/api/user/${userId}/wordlists`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            known: newLists.known.map(w => w.id),
            hard: newLists.hard.map(w => w.id),
            unknown: newLists.unknown.map(w => w.id),
          }),
        });
      } catch (error) {
        console.error("Failed to update wordlists:", error);
        // Revert on error
        setLists(lists);
      }
    }
  };

  const statsData = [
    { label: "Total Known", value: lists.known.length, color: "bg-green-100 border-green-400" },
    { label: "Total Unknown", value: lists.unknown.length, color: "bg-gray-100 border-gray-400" },
    { label: "Total Hard", value: lists.hard.length, color: "bg-red-100 border-red-400" },
    { label: "Learned Today", value: stats.learnedToday, color: "bg-blue-100 border-blue-400" },
    { label: "Learned This Week", value: stats.learnedThisWeek, color: "bg-purple-100 border-purple-400" },
    { label: "Learned This Month", value: stats.learnedThisMonth, color: "bg-orange-100 border-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Learning Progress</h1>
        
        {/* Percentage Summary */}
        {!loading && userId && (
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Known</p>
                <p className="text-lg sm:text-2xl font-bold text-green-700">{lists.known.length} / {WordList.length} ({((lists.known.length / WordList.length) * 100).toFixed(1)}%)</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Hard</p>
                <p className="text-lg sm:text-2xl font-bold text-red-700">{lists.hard.length} / {WordList.length} ({((lists.hard.length / WordList.length) * 100).toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        )}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Stats Table on the Left */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 h-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Statistics</h2>
                <div className="space-y-2 sm:space-y-4">
                  {statsData.map((stat, index) => (
                    <div key={index} className={`border-l-4 ${stat.color} p-2 sm:p-4 rounded text-xs sm:text-base`}>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-500">Total Words: <span className="font-bold text-gray-700">{WordList.length}</span></p>
                </div>
              </div>
            </div>

            {/* Pie Chart on the Right */}
            <div>
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 h-full flex flex-col">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Word Distribution</h2>
                <div className="flex items-center justify-center flex-1 min-h-[60vh] sm:min-h-[80vh]">
                  <PieChart
                    known={lists.known.length}
                    unknown={lists.unknown.length}
                    hard={lists.hard.length}
                    total={WordList.length}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Word Lists Below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-8">
            {[
              { label: "Known Words", key: "known" as const, color: "green" },
              { label: "Unknown Words", key: "unknown" as const, color: "gray" },
              { label: "Hard Words", key: "hard" as const, color: "red" },
            ].map(({ label, key, color }) => (
              <div key={key} className="bg-white rounded-lg shadow-md p-3 sm:p-6">
                <h2 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-${color}-700`}>{label} ({lists[key].length})</h2>
                <div className="space-y-1 sm:space-y-2 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
                  {lists[key].length === 0 ? (
                    <p className="text-gray-400 italic text-xs sm:text-base">No words.</p>
                  ) : (
                    lists[key].map((item: any) => {
                      const otherCategories = (["known", "unknown", "hard"] as const).filter(cat => cat !== key);
                      return (
                        <div key={item.id} className="border-b pb-1 sm:pb-2 mb-1 sm:mb-2 flex justify-between items-start gap-1 sm:gap-2 text-xs sm:text-base">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-indigo-700 break-words">#{item.id} {item.word}</span>
                            <span className="ml-1 sm:ml-2 text-gray-600 text-xs sm:text-sm">({item.english})</span>
                            <div className="text-xs text-gray-500 break-words line-clamp-2">{item.bangla}</div>
                          </div>
                          <div className="flex gap-0.5 sm:gap-1 flex-col justify-end flex-shrink-0">
                            {otherCategories.map(category => (
                              <button
                                key={category}
                                onClick={() => moveWord(item.id, key as "known" | "unknown" | "hard", category)}
                                className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium transition-colors whitespace-nowrap ${
                                  category === "known" ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                  category === "unknown" ? "bg-gray-200 text-gray-700 hover:bg-gray-300" :
                                  "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                              >
                                → {category === "known" ? "Known" : category === "unknown" ? "Unknown" : "Hard"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
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
