'use client';

import { useState, useEffect } from 'react';
import { WordList } from '@/data/wordlists';

interface AddWordModalProps {
  onClose: () => void;
  onAddWord: (word: any) => void;
}

export default function AddWordModal({ onClose, onAddWord }: AddWordModalProps) {
  const [formData, setFormData] = useState({
    word: '',
    bangla: '',
    english: '',
    synonym: '',
    example: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordExists, setWordExists] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check if German word already exists when typing in the word field
    if (name === 'word') {
      if (value.trim()) {
        const exists = WordList.some(
          (item) => item.word.toLowerCase() === value.toLowerCase()
        );
        setWordExists(exists);
      } else {
        setWordExists(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newWord = await response.json();
        onAddWord(newWord);
        setFormData({
          word: '',
          bangla: '',
          english: '',
          synonym: '',
          example: '',
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add word');
      }
    } catch (error) {
      console.error('Error adding word:', error);
      setError('Error adding word. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Add New Word</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Server Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
              <span className="text-red-600 text-xl font-bold">⚠</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* German Word */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              German Word *
            </label>
            <input
              type="text"
              name="word"
              value={formData.word}
              onChange={handleChange}
              required
              placeholder="Enter German word..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                wordExists
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
            />
            {wordExists && (
              <div className="mt-2 text-red-600 text-sm flex items-center gap-2">
                <span className="text-lg">⚠</span>
                <span>This word already exists in the vocabulary list!</span>
              </div>
            )}
          </div>

          {/* English Translation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English Translation *
            </label>
            <input
              type="text"
              name="english"
              value={formData.english}
              onChange={handleChange}
              required
              placeholder="Enter English translation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Bangla Translation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bangla Translation *
            </label>
            <input
              type="text"
              name="bangla"
              value={formData.bangla}
              onChange={handleChange}
              required
              placeholder="Enter Bangla translation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Synonym */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Synonym
            </label>
            <input
              type="text"
              name="synonym"
              value={formData.synonym}
              onChange={handleChange}
              placeholder="Enter synonyms..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Example */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Example
            </label>
            <textarea
              name="example"
              value={formData.example}
              onChange={handleChange}
              placeholder="Enter example usage..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || wordExists}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? 'Adding...' : 'Add Word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
