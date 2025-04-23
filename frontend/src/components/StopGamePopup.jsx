import React from 'react';

function StopGamePopup({ onClose, onViewResults }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Game Session Stopped</h2>
          <p className="mt-2 text-gray-600">
            The game session has been stopped. All players will be directed to the results screen.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
          <button
            onClick={onViewResults}
            className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default StopGamePopup; 