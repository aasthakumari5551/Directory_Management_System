// app/root/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import DirectoryCard from "@/components/DirectoryCard";
import CreateDirectory from "@/components/CreateDire";

interface File {
  id: string;
  name: string;
  extension: string;
  fileUrl: string;
}

interface Directory {
  id: string;
  name: string;
}

export default function RootDirectoryPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [rootdirid, setrootdirid] = useState<string>("");
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [isLoading, setLoading] = useState(true); // Loading state for data fetching
  const [error, setError] = useState<string | null>(null);
  const { user, userId, loading: authLoading } = useAuth(); // Destructure `loading` as `authLoading`

  useEffect(() => {
    const fetchRootDirectory = async () => {
      try {
        // If authentication is still loading, wait until it resolves
        if (authLoading) {
          return;
        }

        // Ensure userId is available
        if (!userId) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch root directory contents from the API
        const response = await fetch("/api/root-dir", {
          headers: {
            "x-user-id": userId, // Use the userId from useAuth
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch root directory");
          return;
        }

        const data = await response.json();
        setFiles(data.files);
        setDirectories(data.directories);
        setrootdirid(data.rootdir);
      } catch (err) {
        setError("An error occurred while fetching the root directory");
      } finally {
        setLoading(false);
      }
    };

    fetchRootDirectory();
  }, [userId, authLoading]);

  // Show a loading message while authentication state is resolving
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading authentication state...
      </div>
    );
  }

  // Handle unauthenticated users
  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please sign in to view your root directory.
      </div>
    );
  }

  // Show a loading message while fetching data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading root directory...
      </div>
    );
  }

  // Handle errors
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-800 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Root Directory</h1>

      {/* Files Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Files</h2>
        {files.length > 0 ? (
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center space-x-2 p-2 bg-white rounded shadow-sm"
              >
                {/* File Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {/* File Name and Link */}
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No files found.</p>
        )}
      </section>

      {/* Directories Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Directories</h2>
        {directories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {directories.map((dir) => (
              <DirectoryCard key={dir.id} id={dir.id} name={dir.name} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No directories found.</p>
        )}
      </section>
      <CreateDirectory directoryId = {rootdirid} userId={userId} />
    </div>
  );
}
