import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { student } from "./mock-data";

export interface StudentProfileData {
  fullName: string;
  age: number;
  city: string;
  gender?: string;
  weight?: number; // in kg
  height?: number; // in cm
  waterTarget?: number;
  stepsTarget?: number;
  sleepTarget?: number;
  email?: string;
  updatedAt?: any;
}

interface FirebaseAuthContextType {
  user: User | null;
  profileData: StudentProfileData | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    profile: { fullName: string; age: number; city: string; gender?: string; weight?: number; height?: number }
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileData: (data: Partial<StudentProfileData>) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

const GUEST_PROFILE_KEY = "syncare_profile_data_v1";

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<StudentProfileData | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(GUEST_PROFILE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.warn("Could not read profile from localStorage:", err);
      }
    }
    return {
      fullName: student.name,
      age: student.age,
      city: student.city,
      gender: (student as any).gender || "Not specified",
      weight: (student as any).weight || 65,
      height: (student as any).height || 170,
      waterTarget: student.targets.water,
      stepsTarget: student.targets.steps,
      sleepTarget: student.targets.sleep,
      email: "",
    };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as StudentProfileData;
            setProfileData(data);
            if (typeof window !== "undefined") {
              localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(data));
            }
          } else {
            // Initialize user doc using current profile or student defaults
            const currentGuest = profileData || {
              fullName: currentUser.displayName || student.name,
              age: student.age,
              city: student.city,
              gender: "Not specified",
              weight: 65,
              height: 170,
              waterTarget: student.targets.water,
              stepsTarget: student.targets.steps,
              sleepTarget: student.targets.sleep,
              email: currentUser.email || "",
            };
            const initialData: StudentProfileData = {
              fullName: currentUser.displayName || currentGuest.fullName || student.name,
              age: currentGuest.age || student.age,
              city: currentGuest.city || student.city,
              gender: currentGuest.gender || "Not specified",
              weight: currentGuest.weight || 65,
              height: currentGuest.height || 170,
              waterTarget: currentGuest.waterTarget || student.targets.water,
              stepsTarget: currentGuest.stepsTarget || student.targets.steps,
              sleepTarget: currentGuest.sleepTarget || student.targets.sleep,
              email: currentUser.email || "",
              updatedAt: serverTimestamp(),
            };
            await setDoc(userDocRef, initialData);
            setProfileData(initialData);
            if (typeof window !== "undefined") {
              localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(initialData));
            }
          }
        } catch (err) {
          console.warn("Could not fetch user document from Firestore:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const sanitizeText = (text: string, maxLen = 100): string => {
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim()
      .slice(0, maxLen);
  };

  const clampNumber = (num: number, min: number, max: number, defaultVal: number): number => {
    if (typeof num !== "number" || isNaN(num)) return defaultVal;
    return Math.min(Math.max(Math.round(num), min), max);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    profile: { fullName: string; age: number; city: string; gender?: string; weight?: number; height?: number }
  ) => {
    const cleanName = sanitizeText(profile.fullName, 100);
    const cleanCity = sanitizeText(profile.city, 100);
    const cleanAge = clampNumber(profile.age, 13, 100, 19);
    const cleanGender = profile.gender ? sanitizeText(profile.gender, 30) : "Not specified";
    const cleanWeight = profile.weight && profile.weight > 0 ? Number(profile.weight) : 65;
    const cleanHeight = profile.height && profile.height > 0 ? Number(profile.height) : 170;

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName });
      }
      try {
        const userDocRef = doc(db, "users", cred.user.uid);
        const data: StudentProfileData = {
          fullName: cleanName || student.name,
          age: cleanAge,
          city: cleanCity || student.city,
          gender: cleanGender,
          weight: cleanWeight,
          height: cleanHeight,
          waterTarget: student.targets.water,
          stepsTarget: student.targets.steps,
          sleepTarget: student.targets.sleep,
          email,
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, data);
        setProfileData(data);
      } catch (err) {
        console.warn("Could not save initial user doc to Firestore:", err);
      }
    }
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      try {
        const userDocRef = doc(db, "users", result.user.uid);
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const initialData: StudentProfileData = {
            fullName: sanitizeText(result.user.displayName || student.name, 100),
            age: student.age,
            city: student.city,
            waterTarget: student.targets.water,
            stepsTarget: student.targets.steps,
            sleepTarget: student.targets.sleep,
            email: result.user.email || "",
            updatedAt: serverTimestamp(),
          };
          await setDoc(userDocRef, initialData);
          setProfileData(initialData);
        }
      } catch (err) {
        console.warn("Could not sync Google user profile with Firestore:", err);
      }
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/auth`,
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfileData = async (data: Partial<StudentProfileData>) => {
    // Strict whitelist and bounds validation
    const cleanData: Partial<StudentProfileData> = {};
    if (data.fullName !== undefined) cleanData.fullName = sanitizeText(data.fullName, 100);
    if (data.city !== undefined) cleanData.city = sanitizeText(data.city, 100);
    if (data.age !== undefined) cleanData.age = clampNumber(data.age, 13, 100, 19);
    if (data.waterTarget !== undefined) cleanData.waterTarget = clampNumber(data.waterTarget, 500, 10000, 2500);
    if (data.stepsTarget !== undefined) cleanData.stepsTarget = clampNumber(data.stepsTarget, 1000, 100000, 10000);
    if (data.sleepTarget !== undefined) cleanData.sleepTarget = clampNumber(data.sleepTarget, 3, 14, 8);

    setProfileData((prev) => {
      const merged: StudentProfileData = {
        fullName: cleanData.fullName ?? prev?.fullName ?? student.name,
        age: cleanData.age ?? prev?.age ?? student.age,
        city: cleanData.city ?? prev?.city ?? student.city,
        waterTarget: cleanData.waterTarget ?? prev?.waterTarget ?? student.targets.water,
        stepsTarget: cleanData.stepsTarget ?? prev?.stepsTarget ?? student.targets.steps,
        sleepTarget: cleanData.sleepTarget ?? prev?.sleepTarget ?? student.targets.sleep,
        email: prev?.email ?? "",
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(merged));
        } catch (err) {
          console.warn("Could not save profile to localStorage:", err);
        }
      }
      return merged;
    });

    if (user) {
      try {
        if (cleanData.fullName && cleanData.fullName !== user.displayName) {
          await updateProfile(user, { displayName: cleanData.fullName }).catch(() => {});
        }
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          ...cleanData,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Could not update user doc in Firestore:", err);
      }
    }
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        profileData,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        logout,
        updateUserProfileData,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}
