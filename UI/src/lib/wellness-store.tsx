import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import {
  Activity,
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  MoonStar,
} from "lucide-react";
import { db } from "./firebase";
import { useFirebaseAuth } from "./firebase-auth";
import { student, weeklyData, type Metric } from "./mock-data";

export interface DailyWellnessLog {
  date: string; // YYYY-MM-DD
  water: number; // in ml, e.g. 1800
  steps: number; // e.g. 7240
  sleep: number; // in hours, e.g. 6.67
  exercise: number; // in minutes, e.g. 45
  stress: "Low" | "Moderate" | "High";
  study: number; // in hours, e.g. 3.33
  mood: string; // "Energized", "Calm", "Focused", "Tired"
  meals: string[];
  precautions: string[]; // e.g. ["hydration", "clothing"]
  updatedAt?: any;
}

export interface HealthRecord {
  id: string;
  name: string;
  date: string;
  status: "Valid" | "Pending" | "Expired";
}

export interface WellnessTargets {
  water: number;
  steps: number;
  sleep: number;
  exercise: number;
  study: number;
}

export interface OnboardingMetrics {
  water: number;
  steps: number;
  sleep: number;
  exercise: number;
  mood: string;
  gender?: string;
  weight?: number;
  height?: number;
  study?: number;
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

export type FirestoreStatus = "ready" | "pending_setup" | "offline" | "syncing";

interface WellnessContextType {
  todayLog: DailyWellnessLog;
  targets: WellnessTargets;
  wellnessScore: number;
  metrics: Metric[];
  completedMilestones: Record<number, boolean>;
  weeklyTelemetry: typeof weeklyData;
  healthRecords: HealthRecord[];
  isSyncing: boolean;
  firestoreStatus: FirestoreStatus;
  userName: string;
  userInitials: string;
  userCity: string;
  userGender: string;
  userWeight: number;
  userHeight: number;
  bmi: number;
  bmiCategory: string;
  updateBodyMetrics: (metrics: { gender?: string; weight?: number; height?: number }) => Promise<void>;
  requiresOnboarding: boolean;
  completeOnboarding: (metrics: OnboardingMetrics) => Promise<void>;
  setUserCity: (city: string) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  logSteps: (count: number) => Promise<void>;
  logSleep: (hours: number) => Promise<void>;
  logExercise: (minutes: number) => Promise<void>;
  logMood: (mood: string) => Promise<void>;
  logMeal: (meal: string) => Promise<void>;
  togglePrecaution: (precautionId: string) => Promise<void>;
  toggleMilestone: (id: number) => Promise<void>;
  addHealthRecord: (record: { name: string; date: string; status: "Valid" | "Pending" | "Expired" }) => Promise<void>;
  parseAndLog: (actionName: string, rawInput: string) => Promise<{ success: boolean; message: string }>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STORAGE_PREFIX = "syncare_wellness_telemetry_v3";
const MILESTONES_PREFIX = "syncare_milestones_v3";
const HEALTH_RECORDS_PREFIX = "syncare_health_records_v3";

export const DEFAULT_LOG: DailyWellnessLog = {
  date: getTodayDateKey(),
  water: 0,
  steps: 0,
  sleep: 0,
  exercise: 0,
  stress: "Moderate",
  study: 0,
  mood: "Neutral",
  meals: [],
  precautions: [],
};

export const DEFAULT_HEALTH_RECORDS: HealthRecord[] = [
  { id: "covid19", name: "COVID-19 Booster", date: "Verified Oct 2025", status: "Valid" },
  { id: "tdap", name: "Tetanus Toxoid (Tdap)", date: "Valid until 2029", status: "Valid" },
  { id: "hepb", name: "Hepatitis B (3/3)", date: "Fully immunized", status: "Valid" },
];

function sanitizeLog(raw: any, dateKey: string): DailyWellnessLog {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_LOG, date: dateKey };
  return {
    date: dateKey,
    water: Math.min(Math.max(Number(raw.water) || 0, 0), 15000),
    steps: Math.min(Math.max(Number(raw.steps) || 0, 0), 150000),
    sleep: Math.min(Math.max(Number(raw.sleep) || 0, 0), 24),
    exercise: Math.min(Math.max(Number(raw.exercise) || 0, 0), 720),
    stress: ["Low", "Moderate", "High"].includes(raw.stress) ? raw.stress : "Moderate",
    study: Math.min(Math.max(Number(raw.study) || 0, 0), 24),
    mood: typeof raw.mood === "string" && raw.mood ? raw.mood.slice(0, 50) : "Neutral",
    meals: Array.isArray(raw.meals) ? raw.meals.map((m: any) => String(m).slice(0, 80)).slice(0, 20) : [],
    precautions: Array.isArray(raw.precautions) ? raw.precautions.map((p: any) => String(p).slice(0, 50)).slice(0, 20) : [],
  };
}

export function WellnessProvider({ children }: { children: ReactNode }) {
  const { user, profileData, updateUserProfileData } = useFirebaseAuth();
  const todayKey = getTodayDateKey();

  const [todayLog, setTodayLog] = useState<DailyWellnessLog>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}_${todayKey}`);
        if (stored) {
          return sanitizeLog(JSON.parse(stored), todayKey);
        }
      } catch (err) {
        console.warn("Could not load from localStorage:", err);
      }
    }
    return { ...DEFAULT_LOG, date: todayKey };
  });

  const [historicalLogs, setHistoricalLogs] = useState<Record<string, DailyWellnessLog>>({});
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);

  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(MILESTONES_PREFIX);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return { 1: true };
  });

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(HEALTH_RECORDS_PREFIX);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return DEFAULT_HEALTH_RECORDS;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreStatus>("offline");

  const [customCity, setCustomCity] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("syncare_user_city");
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return "";
  });

  const userGender = profileData?.gender || "Not specified";
  const userWeight = profileData?.weight && profileData.weight > 0 ? profileData.weight : 65;
  const userHeight = profileData?.height && profileData.height > 0 ? profileData.height : 170;

  // Body Mass Index (BMI) calculation
  const bmi = useMemo(() => {
    if (!userWeight || !userHeight) return 0;
    const h = userHeight / 100;
    return Number((userWeight / (h * h)).toFixed(1));
  }, [userWeight, userHeight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return "Not calibrated";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal / Optimal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }, [bmi]);

  // Targets physiologically calibrated by weight & gender or explicit profile overrides
  const targets: WellnessTargets = useMemo(() => {
    let calibratedWater = profileData?.waterTarget;
    if (!calibratedWater) {
      if (userGender === "Male") calibratedWater = Math.round(userWeight * 35);
      else if (userGender === "Female") calibratedWater = Math.round(userWeight * 31);
      else calibratedWater = Math.round(userWeight * 33);
    }

    return {
      water: calibratedWater || student.targets.water,
      steps: profileData?.stepsTarget || student.targets.steps,
      sleep: profileData?.sleepTarget || student.targets.sleep,
      exercise: 60,
      study: 4,
    };
  }, [profileData, userGender, userWeight]);

  const updateBodyMetrics = useCallback(
    async (m: { gender?: string; weight?: number; height?: number }) => {
      await updateUserProfileData({
        ...(m.gender ? { gender: m.gender } : {}),
        ...(m.weight && m.weight > 0 ? { weight: Number(m.weight) } : {}),
        ...(m.height && m.height > 0 ? { height: Number(m.height) } : {}),
      });
    },
    [updateUserProfileData]
  );

  // Load from Firestore when user authenticates
  useEffect(() => {
    let isCancelled = false;

    async function loadFirestoreData() {
      if (!user) {
        setFirestoreStatus("offline");
        setRequiresOnboarding(false);
        return;
      }

      try {
        setIsSyncing(true);
        setFirestoreStatus("syncing");

        // 1. Fetch all Daily Logs to perform Empty-State check
        const logsCol = collection(db, "users", user.uid, "daily_logs");
        const allLogsSnap = await getDocs(logsCol);

        if (!isCancelled) {
          if (allLogsSnap.empty) {
            // Brand new account: No logs in Firestore -> Trigger onboarding modal
            setRequiresOnboarding(true);
            setTodayLog({ ...DEFAULT_LOG, date: todayKey });
            setHistoricalLogs({});
            setFirestoreStatus("ready");
            setIsSyncing(false);
            return;
          }

          // Existing account: Onboarding already satisfied
          setRequiresOnboarding(false);
          const historyMap: Record<string, DailyWellnessLog> = {};
          let foundToday = false;

          allLogsSnap.forEach((docSnap) => {
            const data = sanitizeLog(docSnap.data(), docSnap.id);
            historyMap[docSnap.id] = data;
            if (docSnap.id === todayKey) {
              foundToday = true;
              setTodayLog(data);
              localStorage.setItem(`${STORAGE_PREFIX}_${todayKey}`, JSON.stringify(data));
            }
          });

          if (!foundToday) {
            // User has history, but has not logged metrics for today yet
            setTodayLog({ ...DEFAULT_LOG, date: todayKey });
          }

          setHistoricalLogs(historyMap);
          setFirestoreStatus("ready");
        }

        // 2. Fetch User Milestones
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (!isCancelled && userSnap.exists()) {
          const uData = userSnap.data();
          if (uData.completedMilestones && typeof uData.completedMilestones === "object") {
            setCompletedMilestones(uData.completedMilestones);
            localStorage.setItem(MILESTONES_PREFIX, JSON.stringify(uData.completedMilestones));
          }
        }

        // 3. Fetch Health Records Subcollection
        try {
          const healthCol = collection(db, "users", user.uid, "health_records");
          const healthSnap = await getDocs(healthCol);
          if (!isCancelled && !healthSnap.empty) {
            const records: HealthRecord[] = [];
            healthSnap.forEach((docSnap) => {
              const d = docSnap.data();
              records.push({
                id: docSnap.id,
                name: String(d.name || "Vaccination Record"),
                date: String(d.date || "Verified"),
                status: ["Valid", "Pending", "Expired"].includes(d.status) ? d.status : "Valid",
              });
            });
            setHealthRecords(records);
            localStorage.setItem(HEALTH_RECORDS_PREFIX, JSON.stringify(records));
          } else if (!isCancelled) {
            // Seed default health records to Firestore if empty
            for (const item of DEFAULT_HEALTH_RECORDS) {
              await setDoc(doc(db, "users", user.uid, "health_records", item.id), {
                id: item.id,
                name: item.name,
                date: item.date,
                status: item.status,
                updatedAt: serverTimestamp(),
              }, { merge: true });
            }
          }
        } catch (hrErr) {
          console.warn("Could not fetch health_records subcollection:", hrErr);
        }
      } catch (err: any) {
        console.warn("Firestore connection check:", err?.message || err);
        if (err?.code === "not-found" || err?.message?.includes("NOT_FOUND")) {
          setFirestoreStatus("pending_setup");
        } else {
          setFirestoreStatus("offline");
        }
      } finally {
        if (!isCancelled) setIsSyncing(false);
      }
    }

    loadFirestoreData();

    return () => {
      isCancelled = true;
    };
  }, [user, todayKey]);

  // Persistence handler for daily telemetry
  const persistLog = useCallback(
    async (newLog: DailyWellnessLog) => {
      const clean = sanitizeLog(newLog, todayKey);
      setTodayLog(clean);

      // Resilient local storage persistence
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}_${todayKey}`, JSON.stringify(clean));
        } catch (err) {
          console.warn("Could not save to localStorage:", err);
        }
      }

      // Firestore persistence if authenticated
      if (user) {
        try {
          setIsSyncing(true);
          const logDocRef = doc(db, "users", user.uid, "daily_logs", todayKey);
          await setDoc(
            logDocRef,
            {
              ...clean,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
          setFirestoreStatus("ready");
        } catch (err: any) {
          console.warn("Could not sync log to Firestore (offline fallback active):", err?.message || err);
          if (err?.code === "not-found" || err?.message?.includes("NOT_FOUND")) {
            setFirestoreStatus("pending_setup");
          }
        } finally {
          setIsSyncing(false);
        }
      }
    },
    [user, todayKey]
  );

  const completeOnboarding = useCallback(
    async (initialMetrics: OnboardingMetrics) => {
      let stress: "Low" | "Moderate" | "High" = "Moderate";
      if (initialMetrics.mood === "Energized" || initialMetrics.mood === "Calm") stress = "Low";
      else if (initialMetrics.mood === "Tired") stress = "High";

      if (initialMetrics.gender || (initialMetrics.weight && initialMetrics.weight > 0) || (initialMetrics.height && initialMetrics.height > 0)) {
        await updateBodyMetrics({
          gender: initialMetrics.gender,
          weight: initialMetrics.weight,
          height: initialMetrics.height,
        });
      }

      const newLog: DailyWellnessLog = {
        date: todayKey,
        water: Math.max(0, initialMetrics.water),
        steps: Math.max(0, initialMetrics.steps),
        sleep: Math.max(0, initialMetrics.sleep),
        exercise: Math.max(0, initialMetrics.exercise),
        study: Math.max(0, initialMetrics.study || 0),
        stress,
        mood: initialMetrics.mood || "Focused",
        meals: ["Healthy Meal"],
        precautions: ["hydration"],
      };

      setTodayLog(newLog);
      setHistoricalLogs((prev) => ({ ...prev, [todayKey]: newLog }));
      setRequiresOnboarding(false);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}_${todayKey}`, JSON.stringify(newLog));
        } catch (err) {
          console.warn("Could not save to localStorage:", err);
        }
      }

      if (user) {
        try {
          setIsSyncing(true);
          const logDocRef = doc(db, "users", user.uid, "daily_logs", todayKey);
          await setDoc(
            logDocRef,
            {
              ...newLog,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
          setFirestoreStatus("ready");
        } catch (err) {
          console.warn("Could not sync onboarding log to Firestore:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    },
    [todayKey, user]
  );

  // Persistence handler for milestones
  const persistMilestones = useCallback(
    async (newMilestones: Record<number, boolean>) => {
      setCompletedMilestones(newMilestones);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(MILESTONES_PREFIX, JSON.stringify(newMilestones));
        } catch {
          // ignore
        }
      }

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(userDocRef, { completedMilestones: newMilestones }, { merge: true });
        } catch (err) {
          console.warn("Could not sync milestones to Firestore:", err);
        }
      }
    },
    [user]
  );

  // Discrete action methods
  const logWater = useCallback(
    async (amountMl: number) => {
      const updated = {
        ...todayLog,
        water: Math.min(todayLog.water + amountMl, 15000),
      };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const logSteps = useCallback(
    async (count: number) => {
      const updated = {
        ...todayLog,
        steps: Math.min(todayLog.steps + count, 150000),
      };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const logSleep = useCallback(
    async (hours: number) => {
      const updated = {
        ...todayLog,
        sleep: Math.min(Math.max(hours, 0), 24),
      };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const logExercise = useCallback(
    async (minutes: number) => {
      const updated = {
        ...todayLog,
        exercise: Math.min(todayLog.exercise + minutes, 720),
      };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const logMood = useCallback(
    async (mood: string) => {
      let stress: "Low" | "Moderate" | "High" = "Moderate";
      if (mood === "Energized" || mood === "Calm") stress = "Low";
      else if (mood === "Tired") stress = "High";

      const updated = {
        ...todayLog,
        mood,
        stress,
      };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const logMeal = useCallback(
    async (meal: string) => {
      const cleanMeal = meal.trim().slice(0, 80);
      if (!cleanMeal) return;
      const updated = {
        ...todayLog,
        meals: [cleanMeal, ...todayLog.meals.filter((m) => m !== cleanMeal)].slice(0, 20),
      };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const togglePrecaution = useCallback(
    async (precautionId: string) => {
      const current = todayLog.precautions || [];
      const updatedPrecautions = current.includes(precautionId)
        ? current.filter((id) => id !== precautionId)
        : [...current, precautionId];
      const updated = { ...todayLog, precautions: updatedPrecautions };
      await persistLog(updated);
    },
    [todayLog, persistLog]
  );

  const toggleMilestone = useCallback(
    async (id: number) => {
      const updated = { ...completedMilestones, [id]: !completedMilestones[id] };
      await persistMilestones(updated);
    },
    [completedMilestones, persistMilestones]
  );

  const addHealthRecord = useCallback(
    async (record: { name: string; date: string; status: "Valid" | "Pending" | "Expired" }) => {
      const newId = `rec_${Date.now().toString(36)}`;
      const cleanRecord: HealthRecord = {
        id: newId,
        name: record.name.trim().slice(0, 100),
        date: record.date.trim().slice(0, 50),
        status: record.status,
      };
      const updatedList = [cleanRecord, ...healthRecords];
      setHealthRecords(updatedList);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(HEALTH_RECORDS_PREFIX, JSON.stringify(updatedList));
        } catch {
          // ignore
        }
      }

      if (user) {
        try {
          const recDoc = doc(db, "users", user.uid, "health_records", newId);
          await setDoc(recDoc, { ...cleanRecord, updatedAt: serverTimestamp() });
        } catch (err) {
          console.warn("Could not save health record to Firestore:", err);
        }
      }
    },
    [healthRecords, user]
  );

  // Universal parser for Quick Log modals
  const parseAndLog = useCallback(
    async (actionName: string, rawInput: string): Promise<{ success: boolean; message: string }> => {
      const text = rawInput.trim();
      if (!text) return { success: false, message: "Please enter a value." };

      const lowerAction = actionName.toLowerCase();

      if (lowerAction.includes("water")) {
        const literMatch = text.match(/([0-9.]+)\s*(?:l|liter|litres)/i);
        let ml = 0;
        if (literMatch) {
          ml = Math.round(parseFloat(literMatch[1]) * 1000);
        } else {
          const numMatch = text.match(/[+-]?\s*([0-9,]+)/);
          if (numMatch) {
            ml = parseInt(numMatch[1].replace(/,/g, ""), 10);
          }
        }
        if (isNaN(ml) || ml <= 0) return { success: false, message: "Enter a valid water amount (e.g. +500 ml)." };
        await logWater(ml);
        return { success: true, message: `Added +${ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} ml`} water!` };
      }

      if (lowerAction.includes("step")) {
        const numMatch = text.match(/[+-]?\s*([0-9,]+)/);
        if (!numMatch) return { success: false, message: "Enter a valid number of steps (e.g. +2,500)." };
        const steps = parseInt(numMatch[1].replace(/,/g, ""), 10);
        if (isNaN(steps) || steps <= 0) return { success: false, message: "Enter a positive step count." };
        await logSteps(steps);
        return { success: true, message: `Recorded +${steps.toLocaleString()} steps!` };
      }

      if (lowerAction.includes("sleep")) {
        const numMatch = text.match(/([0-9.]+)/);
        if (!numMatch) return { success: false, message: "Enter valid sleep hours (e.g. 7.5 hrs)." };
        const hours = parseFloat(numMatch[1]);
        if (isNaN(hours) || hours <= 0 || hours > 24) {
          return { success: false, message: "Enter a realistic sleep duration (1 to 24 hrs)." };
        }
        await logSleep(hours);
        return { success: true, message: `Updated sleep to ${hours} hours!` };
      }

      if (lowerAction.includes("exercise") || lowerAction.includes("workout")) {
        const numMatch = text.match(/([0-9]+)/);
        if (!numMatch) return { success: false, message: "Enter workout minutes (e.g. 30 min)." };
        const mins = parseInt(numMatch[1], 10);
        if (isNaN(mins) || mins <= 0) return { success: false, message: "Enter valid exercise minutes." };
        await logExercise(mins);
        return { success: true, message: `Logged +${mins} minutes of exercise!` };
      }

      if (lowerAction.includes("mood")) {
        await logMood(text);
        return { success: true, message: `Mood set to "${text}"!` };
      }

      if (lowerAction.includes("meal")) {
        await logMeal(text);
        return { success: true, message: `Meal "${text}" logged!` };
      }

      return { success: false, message: "Unknown action type." };
    },
    [logWater, logSteps, logSleep, logExercise, logMood, logMeal]
  );

  // Dynamic wellness score computed directly from real logs vs targets
  const wellnessScore = useMemo(() => {
    if (todayLog.water === 0 && todayLog.steps === 0 && todayLog.sleep === 0 && todayLog.exercise === 0) {
      return 0;
    }
    const waterScore = Math.min(1, todayLog.water / Math.max(targets.water, 1)) * 25;
    const stepsScore = Math.min(1, todayLog.steps / Math.max(targets.steps, 1)) * 30;
    const sleepScore = Math.min(1, todayLog.sleep / Math.max(targets.sleep, 1)) * 25;
    const exerciseScore = Math.min(1, todayLog.exercise / Math.max(targets.exercise, 1)) * 20;

    return Math.round(waterScore + stepsScore + sleepScore + exerciseScore);
  }, [todayLog, targets]);

  // Dynamic metrics formatted for MetricCard
  const metrics: Metric[] = useMemo(() => {
    // Water
    const waterLiters = (todayLog.water / 1000).toFixed(1);
    const waterTargetL = (targets.water / 1000).toFixed(1);
    const waterProgress = Math.min(100, Math.round((todayLog.water / targets.water) * 100));
    const waterTrend = todayLog.water >= targets.water
      ? "Daily goal met!"
      : todayLog.water > 0
      ? `+${waterLiters} L logged today`
      : "No water logged today";

    // Steps
    const stepsProgress = Math.min(100, Math.round((todayLog.steps / targets.steps) * 100));
    const stepsTrend = todayLog.steps >= targets.steps
      ? "Goal completed!"
      : todayLog.steps > 0
      ? `${stepsProgress}% of daily goal`
      : "No steps recorded today";

    // Sleep
    const sleepHours = Math.floor(todayLog.sleep);
    const sleepMins = Math.round((todayLog.sleep - sleepHours) * 60);
    const sleepDisplay = todayLog.sleep > 0 ? `${sleepHours}h ${sleepMins > 0 ? `${sleepMins}m` : ""}`.trim() : "0h";
    const sleepProgress = Math.min(100, Math.round((todayLog.sleep / targets.sleep) * 100));
    const sleepTrend = todayLog.sleep >= targets.sleep
      ? "Full rest achieved"
      : todayLog.sleep > 0
      ? `${(targets.sleep - todayLog.sleep).toFixed(1)}h less than target`
      : "No sleep logged today";

    // Exercise
    const exerciseProgress = Math.min(100, Math.round((todayLog.exercise / targets.exercise) * 100));
    const exerciseTrend = todayLog.exercise >= targets.exercise
      ? "Activity target met!"
      : todayLog.exercise > 0
      ? `${todayLog.exercise} min logged`
      : "No workout logged today";

    // Stress
    const stressScoreMap = { Low: 85, Moderate: 58, High: 32 };
    const stressTone: "green" | "yellow" | "coral" = todayLog.stress === "Low" ? "green" : todayLog.stress === "Moderate" ? "yellow" : "coral";

    // Study
    const studyHours = Math.floor(todayLog.study);
    const studyMins = Math.round((todayLog.study - studyHours) * 60);
    const studyDisplay = todayLog.study > 0 ? `${studyHours}h ${studyMins > 0 ? `${studyMins}m` : ""}`.trim() : "0h";
    const studyProgress = Math.min(100, Math.round((todayLog.study / targets.study) * 100));

    return [
      {
        label: "Water",
        value: `${waterLiters} L`,
        target: `${waterTargetL} L goal`,
        progress: waterProgress,
        trend: waterTrend,
        tone: "blue",
        icon: Droplets,
      },
      {
        label: "Steps",
        value: todayLog.steps.toLocaleString(),
        target: `${targets.steps.toLocaleString()} goal`,
        progress: stepsProgress,
        trend: stepsTrend,
        tone: "green",
        icon: Activity,
      },
      {
        label: "Sleep",
        value: sleepDisplay,
        target: `${targets.sleep}h goal`,
        progress: sleepProgress,
        trend: sleepTrend,
        tone: "yellow",
        icon: MoonStar,
      },
      {
        label: "Exercise",
        value: `${todayLog.exercise} min`,
        target: `${targets.exercise} min goal`,
        progress: exerciseProgress,
        trend: exerciseTrend,
        tone: "coral",
        icon: Dumbbell,
      },
      {
        label: "Stress",
        value: todayLog.stress,
        target: "Aim for low",
        progress: stressScoreMap[todayLog.stress] || 58,
        trend: todayLog.mood !== "Neutral" ? `Mood: ${todayLog.mood}` : "Awaiting check-in",
        tone: stressTone,
        icon: Brain,
      },
      {
        label: "Study time",
        value: studyDisplay,
        target: `${targets.study}h focus goal`,
        progress: studyProgress,
        trend: todayLog.study > 0 ? "Active focus tracking" : "No study blocks logged",
        tone: "blue",
        icon: BookOpen,
      },
    ];
  }, [todayLog, targets]);

  // Synchronized weekly telemetry calculated dynamically from current week's real logs
  const weeklyTelemetry = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return dayNames.map((dayName, idx) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + idx);
      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;

      let logForDay: DailyWellnessLog | undefined;
      if (dateStr === todayKey) {
        logForDay = todayLog;
      } else if (historicalLogs[dateStr]) {
        logForDay = historicalLogs[dateStr];
      }

      if (logForDay && (logForDay.water > 0 || logForDay.steps > 0 || logForDay.sleep > 0 || logForDay.exercise > 0)) {
        const waterScore = Math.min(1, logForDay.water / Math.max(targets.water, 1)) * 25;
        const stepsScore = Math.min(1, logForDay.steps / Math.max(targets.steps, 1)) * 30;
        const sleepScore = Math.min(1, logForDay.sleep / Math.max(targets.sleep, 1)) * 25;
        const exerciseScore = Math.min(1, logForDay.exercise / Math.max(targets.exercise, 1)) * 20;
        const score = Math.round(waterScore + stepsScore + sleepScore + exerciseScore);

        return {
          day: dayName,
          score,
          sleep: Number(logForDay.sleep.toFixed(1)),
          water: Number((logForDay.water / 1000).toFixed(1)),
          steps: logForDay.steps,
          exercise: logForDay.exercise,
          stress: logForDay.stress === "Low" ? 30 : logForDay.stress === "Moderate" ? 50 : 75,
        };
      }

      // Day with no log entered yet
      return {
        day: dayName,
        score: 0,
        sleep: 0,
        water: 0,
        steps: 0,
        exercise: 0,
        stress: 0,
      };
    });
  }, [todayKey, todayLog, historicalLogs, targets]);

  const userName = profileData?.fullName || user?.displayName || (user?.email ? user.email.split("@")[0] : "") || "Student";
  const userCity = customCity || profileData?.city || "SRM Kattankulathur";
  const userInitials = (userName || "ST")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "SC";

  const setUserCity = useCallback(
    async (newCity: string) => {
      const clean = newCity.trim().slice(0, 100);
      if (!clean) return;
      setCustomCity(clean);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("syncare_user_city", clean);
        } catch (err) {
          console.warn("Could not save city to localStorage:", err);
        }
      }
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          await setDoc(
            userDocRef,
            { city: clean, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } catch (err) {
          console.warn("Could not sync city to Firestore:", err);
        }
      }
    },
    [user]
  );

  return (
    <WellnessContext.Provider
      value={{
        todayLog,
        targets,
        wellnessScore,
        metrics,
        completedMilestones,
        weeklyTelemetry,
        healthRecords,
        isSyncing,
        firestoreStatus,
        userName,
        userInitials,
        userCity,
        userGender,
        userWeight,
        userHeight,
        bmi,
        bmiCategory,
        updateBodyMetrics,
        requiresOnboarding,
        completeOnboarding,
        setUserCity,
        logWater,
        logSteps,
        logSleep,
        logExercise,
        logMood,
        logMeal,
        togglePrecaution,
        toggleMilestone,
        addHealthRecord,
        parseAndLog,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellnessStore() {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error("useWellnessStore must be used within a WellnessProvider");
  }
  return context;
}
