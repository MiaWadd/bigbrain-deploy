function DeleteConfirmationModal({ isOpen, onClose, onConfirm, gameName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Delete Game</h2>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-medium text-gray-900">&quot;{gameName}&quot;</span>? 
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          >
            Delete Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal; 