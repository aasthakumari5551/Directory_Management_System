// app/directory/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function CreateDirectoryPage() {
  const [directoryName, setDirectoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { userId, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    if (!directoryName.trim()) {
      setError("Directory name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/root-dir/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, directoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create directory");
      } else {
        // Redirect to the root directory page after successful creation
        router.push("/root-dir");
      }
    } catch (err) {
      setError("An error occurred while creating the directory");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading authentication state...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please sign in to create a directory.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Create New Directory</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="directoryName"
            className="block text-sm font-medium text-gray-200"
          >
            Directory Name
          </label>
          <input
            type="text"
            id="directoryName"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter directory name"
            required
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? "Creating..." : "Create Directory"}
        </button>
      </form>
    </div>
  );
}
