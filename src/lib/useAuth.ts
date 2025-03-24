"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase/fireBaseConfig";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser);

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.push("/auth"); // Redirect to auth page if not signed in
      }

      setLoading(false); // Mark authentication state as loaded
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  const userId = user?.uid || null;

  return { user, userId, loading };
};
