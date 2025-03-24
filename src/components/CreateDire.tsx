// components/CreateDirectory.tsx
"use client";

import { useState } from "react";

interface CreateDirectoryProps {
  directoryId: string; // ID of the parent directory where the subdirectory will be created
  userId: string;
}

export default function CreateDirectory({ directoryId }: CreateDirectoryProps) {
  const [directoryName, setDirectoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directoryName.trim()) {
      setError("Directory name cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/directory/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: directoryId,
          name: directoryName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create directory");
        return;
      }

      setDirectoryName(""); // Clear the input field
      setSuccess(true);
    } catch (err) {
      console.error("Error creating directory:", err);
      setError("An error occurred while creating the directory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-700 mt-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Create Subdirectory</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input for Directory Name */}
        <input
          type="text"
          value={directoryName}
          onChange={(e) => setDirectoryName(e.target.value)}
          placeholder="Enter directory name"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Directory"}
        </button>
      </form>

      {/* Success or Error Message */}
      {success && (
        <p className="mt-2 text-green-500">Directory created successfully!</p>
      )}
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
