"use client";

import { useState, useMemo, useEffect } from "react";
import NavBar from "@/manualcomponent/NavBar";
import AddWordModal from "@/manualcomponent/AddWordModal";

export default function VocabularyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allVocabulary, setAllVocabulary] = useState<any[]>([]);
  const [addedWords, setAddedWords] = useState<any[]>([]);
  const [pageWindow, setPageWindow] = useState(0); // Track which set of 10 pages to display

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load ALL vocabulary on component mount
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const res = await fetch('/api/vocabulary');
        if (res.ok) {
          const vocab = await res.json();
          setAllVocabulary(vocab);
        }
      } catch (err) {
        console.error("Error fetching vocabulary:", err);
      }
    };
    loadVocabulary();
  }, []);

  const filteredItems = useMemo(() => {
    if (!isClient) return [];

    const source = [...allVocabulary, ...addedWords];
    return source.filter((item) => {
      const searchLower = searchTerm.toLowerCase();

      return (
        (item.word || "").toLowerCase().includes(searchLower) ||
        (item.bangla || "").toLowerCase().includes(searchLower) ||
        (item.english || "").toLowerCase().includes(searchLower) ||
        (item.synonym || "").toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, isClient, allVocabulary, addedWords]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleAddWord = (newWord: any) => {
    setAddedWords((prev) => [...prev, newWord]);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar />
      
      {!isClient ? (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Vocabulary List
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-lg text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Vocabulary List
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm sm:text-base"
            >
              + Add Word
            </button>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by German, English, Bangla, or synonym..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Results Count */}
            <div className="mt-4 text-xs sm:text-sm text-gray-600">
              Showing {paginatedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{' '}
              {filteredItems.length} items
            </div>
          </div>

          {/* Vocabulary Cards */}
          <div className="space-y-4">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 text-indigo-800">
                      #{item.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Left Column */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-indigo-600 mb-2">
                        {item.word}
                      </h2>
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">English:</p>
                        <p className="text-base sm:text-lg text-gray-800">{item.english}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Bangla:</p>
                        <p className="text-base sm:text-lg text-gray-800">{item.bangla}</p>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div>
                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Synonym:</p>
                        <p className="text-sm sm:text-base text-gray-700 italic">{item.synonym}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">Example:</p>
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">
                          {item.example}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-lg text-gray-500">
                  No items found matching your search criteria.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mt-6 sm:mt-8">
              <button
                onClick={() => setPageWindow(Math.max(0, pageWindow - 1))}
                disabled={pageWindow === 0}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1">
                {Array.from(
                  { length: Math.min(10, totalPages - pageWindow * 10) },
                  (_, i) => pageWindow * 10 + i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition ${
                      currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPageWindow(pageWindow + 1)}
                disabled={(pageWindow + 1) * 10 >= totalPages}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Word Modal */}
      {showModal && <AddWordModal onClose={() => setShowModal(false)} onAddWord={handleAddWord} />}
    </div>
  );
}
