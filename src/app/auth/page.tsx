"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle } from "../../lib/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../../../firebase/fireBaseConfig";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    // Ensure reCAPTCHA loads after the component mounts
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (!recaptchaContainer) {
      const div = document.createElement("div");
      div.id = "recaptcha-container";
      document.body.appendChild(div);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });
    return () => unsubscribe();
  }, [router, auth]); // Include `auth` in the dependency array

  const handleGoogleSignIn = async () => {
    console.log("handleGoogleSignIn triggered");
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      if (!user) throw new Error("Google sign-in failed.");

      const token = await user.getIdToken();
      const name = user.displayName || "Unknown";
      const phone = user.phoneNumber || "";
      const image = user.photoURL || "";

      console.log("Sending data to /api/auth:", { token, name, phone, image });

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          name,

          image,
        }),
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        throw new Error(`API error: ${responseData.error}`);
      }

      alert(`Signed in as ${name}`);
      router.push("/");
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2 text-center">
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="bg-red-500 rounded-lg text-white p-2"
      >
        {isLoading ? "Signing in..." : "Sign In with Google"}
      </button>
    </div>
  );
}

{
  /* <div id="recaptcha-container"></div>

      <input
        type="text"
        placeholder="Phone Number (+91XXXXXXXXXX)"
        className="border rounded-lg text-black p-2 m-2"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={handleSendOTP}
        className="bg-blue-500 rounded-lg text-white p-2 m-2"
      >
        Send OTP
      </button>

      <input
        type="text"
        placeholder="Enter OTP"
        className="border rounded-lg text-black p-2 m-2"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button
        onClick={handleVerifyOTP}
        className="bg-green-500 rounded-lg text-white p-2 m-2"
      >
        Verify OTP
      </button> */
}
