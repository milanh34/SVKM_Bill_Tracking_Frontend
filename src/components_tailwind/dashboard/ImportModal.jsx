import React, { useState } from 'react';
import { Upload, X, AlertTriangle } from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      alert("Please select a valid Excel file (.xlsx)");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    setUploading(true);
    await onImport(selectedFile);
    setUploading(false);
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-400/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Update Bills</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {selectedFile ? selectedFile.name : "Click to upload Excel file"}
              </span>
            </label>
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between bg-blue-50 p-2 rounded">
              <span className="text-sm text-blue-700">{selectedFile.name}</span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-blue-700 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-4 py-2 text-sm text-white rounded ${
                !selectedFile || uploading
                  ? "bg-blue-300"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uploading ? "Updating..." : "Update Bills"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
