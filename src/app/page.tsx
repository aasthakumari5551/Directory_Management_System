"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading } = useAuth(); // Use loading state from useAuth
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [mostAccessedDirectory, setMostAccessedDirectory] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for authentication to resolve

    if (!user) {
      setLoading(true);
    } else {
      setLoading(false);
      const fetchMostAccessedDirectory = async () => {
        const response = await fetch("/api/getMostAccessedDirectory");
        const data = await response.json();
        setMostAccessedDirectory(data.directory);
      };
      fetchMostAccessedDirectory();
    }
  }, [user, authLoading]);

  useEffect(() => {
    async function fetchInsights() {
      if (!user?.uid) {
        setInsightsError("User ID is not available.");
        setInsightsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/getMetadata?userId=${user.uid}`); // Use dynamic userId
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch insights.");
        }

        setInsightsData(result);
      } catch (err) {
        console.error(err);
        setInsightsError(err.message);
      } finally {
        setInsightsLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchInsights();
    }
  }, [user, authLoading]);

  const updateAccessCount = async () => {
    if (!mostAccessedDirectory?.id) {
      console.error("No directory ID available to update access count.");
      return;
    }
    setIsUpdating(true);
    try {
      await fetch("/api/updateDirectoryAccess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directoryId: mostAccessedDirectory.id }),
      });
    } catch (error) {
      console.error("Failed to update access count:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) return null;

  return (
    <>
      <h1 className="text-2xl font-semibold">
        Welcome back, {user?.email || "User"}!
      </h1>
      <p className="mt-4">You are now signed in.</p>

      {mostAccessedDirectory ? (
        <div className="p-4 bg-white rounded-lg shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-2">Most Accessed Directory</h2>
          <Link
            href={`/directory/${mostAccessedDirectory.id}`}
            className={`text-lg text-blue-500 hover:underline ${
              isUpdating ? "pointer-events-none text-gray-400" : ""
            }`}
            onClick={updateAccessCount}
          >
            {mostAccessedDirectory.name}
          </Link>
        </div>
      ) : (
        <p className="text-gray-500 mt-6">No directory data available.</p>
      )}

      {/* Insights Section */}
      <div className="insights mt-8">
        <h1 className="text-xl font-semibold">Metadata Insights</h1>
        {insightsLoading && <p>Loading insights...</p>}
        {insightsError && <p>Error: {insightsError}</p>}
        {insightsData && (
          <>
            <div className="metadata mt-4">
              <h2 className="text-lg font-semibold">Metadata</h2>
              <ul>
                {insightsData.metadata.map((file: any, index: number) => (
                  <li key={index}>
                    <strong>{file.name}</strong> ({file.extension}) - Created at:{" "}
                    {new Date(file.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
            <div className="analysis mt-4">
              <h2 className="text-lg font-semibold">Analysis</h2>
              <p>
                {insightsData.insights.choices[0]?.message?.content ||
                  "No insights available."}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 space-y-4">
        <button
          onClick={() => router.push("/root-dir")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Go to Root Directory
        </button>
        <button
          onClick={() => router.push("/upload")}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Upload to Root Directory
        </button>
      </div>
    </>
  );
}
