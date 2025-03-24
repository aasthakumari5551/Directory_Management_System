// components/FileUpload.tsx
"use client";

import { useState } from "react";

interface FileUploadProps {
    directoryId: string;
    userId :string  // ID of the directory where the file will be uploaded
}

export default function FileUpload({ directoryId ,userId }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
        formData.append("directoryId", directoryId);
        if (userId) {
        formData.append("userId", userId);
      } 

      const response = await fetch("/api/file/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to upload file.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("An error occurred while uploading the file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg mt-4 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Upload File</h2>

      {/* File Input */}
      <input type="file" onChange={handleFileChange} className="mb-4" />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* Success or Error Message */}
      {success && (
        <p className="mt-2 text-green-500">File uploaded successfully!</p>
      )}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
