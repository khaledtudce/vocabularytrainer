"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import useActiveWords from "@/lib/useActiveWords";
import QuestionSelection from "@/manualcomponent/QuestionSelection";

type ValidationResult = {
  isValid: boolean;
  baseOnWord: boolean;
  correctedSentence: string;
  grammarErrors: Array<{
    original: string;
    corrected: string;
    errorType: string;
    explanation: string;
  }>;
  feedback: string;
};

type WriteSentenceTestProps = {
  showMeaning?: boolean;
};

const WriteSentenceTest = ({ showMeaning = true }: WriteSentenceTestProps) => {
  const { words } = useActiveWords();
  const [currentWord, setCurrentWord] = useState<any>(null);
  const [userSentence, setUserSentence] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [changingWord, setChangingWord] = useState(false);
  const [wordResults, setWordResults] = useState<{ id: number; isCorrect: boolean }[]>([]);
  const [bengaliTranslation, setBengaliTranslation] = useState("");
  const [translationLoading, setTranslationLoading] = useState(false);

  // Pick a random word - only runs on client side
  const getRandomWord = useCallback(() => {
    if (words && words.length > 0) {
      const random = Math.floor(Math.random() * words.length);
      setCurrentWord(words[random]);
      setUserSentence("");
      setValidationResult(null);
      setSubmitted(false);
      setError("");
      setBengaliTranslation("");
    }
  }, [words]);

  // Initialize on client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pick a word after mounting
  useEffect(() => {
    if (mounted && words && words.length > 0) {
      getRandomWord();
    }
  }, [mounted, words, getRandomWord]);

  // Clear changing word state after state updates complete
  useEffect(() => {
    if (changingWord && currentWord) {
      const timer = setTimeout(() => {
        setChangingWord(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [changingWord, currentWord]);

  // Save word results to Known/Hard/Unknown lists
  const saveWordResultsToWordlists = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("[WriteSentenceTest] No userId found");
        return;
      }

      if (wordResults.length === 0) {
        console.log("[WriteSentenceTest] No word results to save");
        return;
      }

      // Get current wordlists
      const response = await fetch(`/api/user/${userId}/wordlists`);
      if (!response.ok) {
        console.error("[WriteSentenceTest] Failed to fetch wordlists:", response.status);
        return;
      }
      const currentLists = await response.json();
      console.log("[WriteSentenceTest] Current wordlists fetched");

      const known = new Set(currentLists.known || []);
      const hard = new Set(currentLists.hard || []);
      const unknown = new Set(currentLists.unknown || []);

      // Process word results
      wordResults.forEach((result) => {
        console.log(`[WriteSentenceTest] Word #${result.id}: isCorrect=${result.isCorrect}`);
        if (result.isCorrect) {
          // Correct answer: add to known
          known.add(result.id);
          hard.delete(result.id);
          unknown.delete(result.id);
          console.log(`[WriteSentenceTest] ✅ #${result.id} moved to known`);
        } else {
          // Wrong/Invalid answer: add to hard
          hard.add(result.id);
          known.delete(result.id);
          unknown.delete(result.id);
          console.log(`[WriteSentenceTest] ❌ #${result.id} moved to hard`);
        }
      });

      // Save updated lists (sorted in ascending order)
      const payload = {
        known: (Array.from(known) as number[]).sort((a, b) => a - b),
        hard: (Array.from(hard) as number[]).sort((a, b) => a - b),
        unknown: (Array.from(unknown) as number[]).sort((a, b) => a - b),
      };
      console.log("[WriteSentenceTest] Saving to API with counts:", {known: payload.known.length, hard: payload.hard.length, unknown: payload.unknown.length});
      
      // Update database asynchronously
      fetch(`/api/user/${userId}/wordlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("[WriteSentenceTest] Failed to save wordlists:", err));
    } catch (err) {
      console.error("[WriteSentenceTest] Error saving word results:", err);
    }
  };

  const validateSentence = async () => {
    if (!userSentence.trim()) {
      setError("Please write a sentence first");
      return;
    }

    setLoading(true);
    setError("");
    setValidationResult(null);

    try {
      console.log('[WriteSentenceTest] Sending validation request...');
      const requestBody = {
        sentence: userSentence,
        word: currentWord.word,
        wordEnglish: currentWord.english,
      };
      console.log('[WriteSentenceTest] Request body:', requestBody);

      const response = await fetch("/api/validate-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[WriteSentenceTest] Response status:', response.status);
      const responseText = await response.text();
      console.log('[WriteSentenceTest] Response text:', responseText);

      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        console.error('[WriteSentenceTest] API Error:', errorData);
        setError(`API Error: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const result: ValidationResult = JSON.parse(responseText);
      console.log('[WriteSentenceTest] Validation result:', result);
      setValidationResult(result);
      setSubmitted(true);
      
      // Track word result: correct if both valid and word is properly used
      const isCorrect = result.isValid && result.baseOnWord;
      setWordResults((prev) => [...prev, { id: currentWord.id, isCorrect }]);
      console.log("[WriteSentenceTest] Word result added:", { id: currentWord.id, isCorrect });

      // Translate corrected sentence to Bengali
      translateSentenceToBengali(result.correctedSentence);
    } catch (err) {
      console.error('[WriteSentenceTest] Error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const translateSentenceToBengali = async (sentence: string) => {
    try {
      setTranslationLoading(true);
      console.log('[WriteSentenceTest] Translating sentence to Bengali...');
      
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sentence,
          targetLanguage: "bn",
        }),
      });

      if (!response.ok) {
        console.error('[WriteSentenceTest] Translation API error:', response.status);
        return;
      }

      const data = await response.json();
      setBengaliTranslation(data.translation || "");
      console.log('[WriteSentenceTest] Translation successful');
    } catch (err) {
      console.error('[WriteSentenceTest] Translation error:', err);
    } finally {
      setTranslationLoading(false);
    }
  };

  const retryWithSameWord = () => {
    setUserSentence("");
    setValidationResult(null);
    setSubmitted(false);
    setError("");
    setBengaliTranslation("");
  };

  const changeWord = async () => {
    // Save current word result before moving to next word
    if (submitted && validationResult) {
      await saveWordResultsToWordlists();
      // Clear the results after saving
      setWordResults([]);
    }
    setChangingWord(true);
    getRandomWord();
  };

  if (!mounted || !currentWord || changingWord) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading words...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" suppressHydrationWarning>
      {/* Question Selection */}
      <div className="mb-6 flex justify-end">
        <QuestionSelection />
      </div>

      {/* Word Display Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-indigo-200" suppressHydrationWarning>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Word to Use
          </h2>
          <div className="flex items-baseline gap-2 mb-3 flex-wrap">
            <p className="text-3xl md:text-4xl font-bold text-indigo-600">{currentWord.word}</p>
            <div className="flex gap-2">
              {currentWord.wordType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {currentWord.wordType}
                </span>
              )}
              {currentWord.wordType === 'Nomen' && currentWord.gender && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  currentWord.gender === 'der' ? 'bg-orange-100 text-orange-800' :
                  currentWord.gender === 'die' ? 'bg-red-100 text-red-800' :
                  'bg-cyan-100 text-cyan-800'
                }`}>
                  {currentWord.gender}
                </span>
              )}
            </div>
            {showMeaning && <p className="text-lg text-gray-600">({currentWord.english})</p>}
          </div>
        </div>
        {showMeaning && currentWord.bangla && (
          <p className="text-sm text-gray-500 mt-3">{currentWord.bangla}</p>
        )}
        {showMeaning && currentWord.example && (
          <p className="text-sm text-gray-600 mt-2 italic">
            <span className="font-semibold">Example: </span>{typeof currentWord.example === 'string' ? currentWord.example.split("|")[0] : String(currentWord.example)}
          </p>
        )}
      </div>

      {/* Input Section */}
      {!submitted && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6" suppressHydrationWarning>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Write a sentence using this word
          </label>
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder="Type your sentence here..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={4}
            disabled={loading}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <Button
              onClick={validateSentence}
              disabled={loading || !userSentence.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? "Validating..." : "Submit"}
            </Button>
            <Button
              onClick={changeWord}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium"
            >
              Skip Word
            </Button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {submitted && validationResult && (
        <div className="space-y-6" suppressHydrationWarning>
          {/* Validity Status - Only show if there's an issue */}
          {(!validationResult.isValid || !validationResult.baseOnWord) && (
            <div
              className={`rounded-lg shadow-md p-6 border-l-4 ${
                validationResult.isValid
                  ? "bg-orange-50 border-orange-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <h3 className="text-lg font-semibold mb-2">
                {!validationResult.isValid ? "⚠️ Grammar Issues Found" : "⚠️ Word Usage Note"}
              </h3>
              <p className={`text-sm ${validationResult.isValid ? "text-orange-700" : "text-red-700"}`}>
                {!validationResult.baseOnWord
                  ? "Note: Your sentence may not clearly use the given word."
                  : "Your sentence has some grammar issues that need fixing."}
              </p>
            </div>
          )}

          {/* Your Original Sentence */}
          <div className="rounded-lg shadow-md p-6 border-2 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 Your Sentence</h3>
            <p className="text-lg p-4 rounded-lg bg-white border-l-4 border-blue-500 text-gray-800">
              {userSentence}
            </p>
          </div>

          {/* Corrected Sentence */}
          <div className={`rounded-lg shadow-md p-6 border-2 ${
            validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-300 bg-red-50"
          }`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {validationResult.isValid && validationResult.baseOnWord ? "✓ Perfect Sentence!" : "📝 Corrected Sentence"}
            </h3>
            <p className={`text-lg p-4 rounded-lg bg-white border-l-4 ${
              validationResult.isValid ? "border-green-500 text-green-800" : "border-red-500 text-red-800"
            }`}>
              {validationResult.correctedSentence}
            </p>
          </div>

          {/* Bengali Translation */}
          <div suppressHydrationWarning className="rounded-lg shadow-md p-6 border-2 border-blue-200 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🇧🇩 Bengali Translation</h3>
            {translationLoading ? (
              <p className="text-lg p-4 rounded-lg bg-white border-l-4 border-blue-500 text-gray-600">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></span>
                Translating...
              </p>
            ) : bengaliTranslation ? (
              <p className="text-lg p-4 rounded-lg bg-white border-l-4 border-blue-500 text-gray-800">
                {bengaliTranslation}
              </p>
            ) : (
              <p className="text-lg p-4 rounded-lg bg-white border-l-4 border-blue-500 text-gray-500">
                Translation will appear here...
              </p>
            )}
          </div>

          {/* Grammar Errors */}
          {validationResult.grammarErrors.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Grammar Issues Found</h3>
              <div className="space-y-3">
                {validationResult.grammarErrors.map((error, idx) => (
                  <div key={idx} className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <span className="inline-badge bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium mr-2">
                          {error.errorType}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold text-red-700">Incorrect: </span>
                          <span className="line-through text-red-600">{error.original}</span>
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-semibold text-green-700">Correct: </span>
                          <span className="text-green-700 font-medium">{error.corrected}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">{error.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {validationResult.feedback && (
            <div className="bg-indigo-50 rounded-lg shadow-md p-6 border-2 border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Feedback</h3>
              <p className="text-gray-700">{validationResult.feedback}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={retryWithSameWord}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex-1"
            >
              Try Another Sentence
            </Button>
            <Button
              onClick={changeWord}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex-1"
            >
              Next Word
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WriteSentenceTest;
