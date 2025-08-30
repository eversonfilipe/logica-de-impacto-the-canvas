import React, { useState } from 'react';
import { AiSparklesIcon, DocumentTextIcon, ChatBubbleIcon, LoadingSpinner, AddNoteIcon } from '../../components/icons';

interface AiPanelProps {
  onSummarize: () => void;
  onGenerateBrief: () => void;
  onChat: (message: string) => void;
  onAddAiResponseToCanvas: (content: string) => void;
  isLoading: boolean;
  aiResponse: string;
}

const AiPanel: React.FC<AiPanelProps> = ({ onSummarize, onGenerateBrief, onChat, onAddAiResponseToCanvas, isLoading, aiResponse }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      onChat(chatMessage);
      setChatMessage('');
    }
  };

  // Helper to check if the AI response is a structured brief (JSON)
  const isProjectBrief = (response: string): boolean => {
    try {
        const parsed = JSON.parse(response);
        return typeof parsed === 'object' && parsed !== null && ('projectName' in parsed || 'summary' in parsed);
    } catch {
        return false;
    }
  }


  if (!isPanelOpen) {
    return (
      <button 
        onClick={() => setIsPanelOpen(true)}
        className="fixed top-4 right-4 z-30 p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-blue-100 dark:hover:bg-gray-600 transition-transform duration-300 hover:scale-110"
        aria-label="Open AI Panel"
      >
        <AiSparklesIcon className="w-6 h-6 text-blue-500" />
      </button>
    )
  }

  return (
    <div className="fixed top-4 right-4 bottom-4 z-30 w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
            <AiSparklesIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Assistant</h2>
        </div>
        <button onClick={() => setIsPanelOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
      </div>

      <div className="p-4 space-y-4">
        <button onClick={onSummarize} disabled={isLoading} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition disabled:bg-gray-400">
          <DocumentTextIcon className="w-5 h-5" />
          <span>Summarize Canvas</span>
        </button>
        <button onClick={onGenerateBrief} disabled={isLoading} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition disabled:bg-gray-400">
          <DocumentTextIcon className="w-5 h-5" />
          <span>Generate Project Brief</span>
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner className="w-8 h-8 text-blue-500" /></div>}
        {!isLoading && aiResponse && (
            <div>
                 <div className="prose prose-sm dark:prose-invert bg-gray-100 dark:bg-gray-700 rounded-md p-3 whitespace-pre-wrap">{aiResponse}</div>
                 {/* Show 'Add to Canvas' button if the response is a project brief */}
                 {isProjectBrief(aiResponse) && (
                     <button
                        onClick={() => onAddAiResponseToCanvas(aiResponse)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 mt-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition"
                     >
                        <AddNoteIcon className="w-5 h-5" />
                        <span>Add Brief to Canvas</span>
                     </button>
                 )}
            </div>
        )}
         {!isLoading && !aiResponse && (
          <div className="text-center text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
            <p>AI responses will appear here.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleChatSubmit} className="flex items-center space-x-2">
          <ChatBubbleIcon className="w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask about the canvas..."
            className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            disabled={isLoading}
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400" disabled={isLoading || !chatMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiPanel;