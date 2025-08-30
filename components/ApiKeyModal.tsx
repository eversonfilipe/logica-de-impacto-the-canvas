
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enter Your Gemini API Key</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          To use the AI features, please provide your Google Gemini API key. Your key is stored only in your browser for this session and is never sent to our servers.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your API Key"
          />
          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-400"
            disabled={!key.trim()}
          >
            Save and Continue
          </button>
        </form>
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          You can get your API key from Google AI Studio.
        </p>
      </div>
    </div>
  );
};
