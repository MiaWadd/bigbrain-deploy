import React, { useState } from 'react';

function SessionPopup({ sessionId, onClose }) {
  const [copySuccess, setCopySuccess] = useState('');
  
  // Generate the play URL with the session ID
  const playUrl = `${window.location.origin}/join?sessionId=${sessionId || ''}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(playUrl);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  if (!sessionId) {
    return null; // Don't show popup if no session ID
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Game Session Started</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session ID
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sessionId}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Play URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={playUrl}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {copySuccess || 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionPopup; 