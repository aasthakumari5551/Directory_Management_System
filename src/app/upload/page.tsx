"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user, userId, loading } = useAuth();

 

  // If still loading authentication state, show a loading message
  if (loading) {
    return <div>Loading authentication state...</div>;
  }

  // If user is not authenticated, redirect or show a message
  if (!userId) {
    return <div>Please sign in to upload files.</div>;
  }

  console.log("userId", userId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Append the userId to the FormData
      if (userId) {
        formData.append("userId", userId);
      } else {
        alert("User not authenticated.");
        return;
      }

      // Use fetch API to send file and userId to the backend API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert("File uploaded successfully!");
      } else {
        alert(result.message || "Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-700">
      <h1>Upload a File</h1>
      <button className="bg-blue-600 p-6 mr-4 rounded-lg">
        <input type="file" onChange={handleFileChange} />
      </button>
      <button
        className="bg-white rounded-lg p-4 text-black"
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
