"use client";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import app from "../../firebase/fireBaseConfig";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    throw error;
  }
};

export const getToken = async () => {
  return auth.currentUser?.getIdToken();
};

// ✅ Initialize Recaptcha
export const initializeRecaptcha = (containerId: string) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        console.log("reCAPTCHA verified");
      },
    });
  }
};
export const signInWithPhoneOTP = async (phoneNumber: string) => {
  try {
    initializeRecaptcha("recaptcha-container");
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
    return confirmationResult;
  } catch (error) {
    throw error;
  }
};

// ✅ Send OTP
export const sendOTP = async (phoneNumber: string) => {
  try {
    initializeRecaptcha("recaptcha-container"); // Ensure Recaptcha is initialized
    const appVerifier = window.recaptchaVerifier;
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );
    return confirmationResult;
  } catch (error) {
    throw error;
  }
};

// ✅ Verify OTP
// export const verifyOTP = async (confirmationResult: any, otp: string) => {
//   return confirmationResult.confirm(otp);
// };
