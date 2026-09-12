import {
  Activity,
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  MoonStar,
  type LucideIcon,
} from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  target: string;
  progress: number;
  trend: string;
  tone: "blue" | "green" | "yellow" | "coral";
  icon: LucideIcon;
};

export const student = { name: "Rxnmenn", city: "SRM Kattankulathur", age: 19, initials: "RN" };

export const metrics: Metric[] = [
  { label: "Water", value: "1.8 L", target: "2.5 L goal", progress: 72, trend: "+0.3 L today", tone: "blue", icon: Droplets },
  { label: "Steps", value: "7,240", target: "10,000 goal", progress: 72, trend: "+12% this week", tone: "green", icon: Activity },
  { label: "Sleep", value: "6h 40m", target: "8h goal", progress: 83, trend: "20m less than usual", tone: "yellow", icon: MoonStar },
  { label: "Exercise", value: "45 min", target: "60 min goal", progress: 75, trend: "3 sessions this week", tone: "coral", icon: Dumbbell },
  { label: "Stress", value: "Moderate", target: "Aim for low", progress: 58, trend: "Steady since morning", tone: "yellow", icon: Brain },
  { label: "Study time", value: "3h 20m", target: "4h focus goal", progress: 83, trend: "2 strong focus blocks", tone: "blue", icon: BookOpen },
];

export const weeklyData = [
  { day: "Mon", score: 72, sleep: 7.2, water: 1.9, steps: 6200, exercise: 30, stress: 62 },
  { day: "Tue", score: 76, sleep: 7.5, water: 2.2, steps: 7800, exercise: 45, stress: 55 },
  { day: "Wed", score: 74, sleep: 6.8, water: 1.8, steps: 7100, exercise: 20, stress: 64 },
  { day: "Thu", score: 81, sleep: 7.3, water: 2.5, steps: 9100, exercise: 55, stress: 47 },
  { day: "Fri", score: 79, sleep: 6.7, water: 2.1, steps: 8400, exercise: 45, stress: 52 },
  { day: "Sat", score: 84, sleep: 8.1, water: 2.6, steps: 10400, exercise: 70, stress: 38 },
  { day: "Sun", score: 78, sleep: 6.7, water: 1.8, steps: 7240, exercise: 45, stress: 55 },
];

export const locations = [
  { name: "SRM General Hospital", type: "Hospital", distance: "0.4 km", open: true, address: "GST Road, SRM Nagar, Kattankulathur", x: "32%", y: "30%" },
  { name: "SRM Student Health Centre", type: "Clinic", distance: "0.2 km", open: true, address: "University Campus, Near Tech Park", x: "65%", y: "26%" },
  { name: "Apollo Pharmacy Potheri", type: "Pharmacy", distance: "0.6 km", open: true, address: "Potheri Station Road, Kattankulathur", x: "44%", y: "65%" },
  { name: "SRM Immunization & Triage", type: "Vaccination", distance: "0.5 km", open: false, address: "Medical College Block, Kattankulathur", x: "78%", y: "68%" },
];

export const healthHelp = {
  "Hair fall": { factors: "Stress, nutrition changes, tight hairstyles, or seasonal shedding.", tips: "Eat protein-rich meals, avoid harsh heat styling, and use a gentle shampoo." },
  Headache: { factors: "Dehydration, skipped meals, eye strain, poor sleep, or tension.", tips: "Drink water, rest your eyes for 20 minutes, and eat a light balanced snack." },
  Fatigue: { factors: "Irregular sleep, low iron intake, dehydration, or prolonged study sessions.", tips: "Take a short walk, hydrate, and protect a consistent bedtime tonight." },
  Dehydration: { factors: "Heat, exercise, illness, or simply forgetting to drink regularly.", tips: "Sip water steadily and consider an oral rehydration drink after heavy sweating." },
  Stress: { factors: "Deadlines, social pressure, uncertainty, or too few recovery breaks.", tips: "Try slow breathing for two minutes, name the next small task, and talk to someone you trust." },
  "Muscle soreness": { factors: "New activity, harder workouts, poor warm-up, or limited recovery.", tips: "Choose gentle movement, hydrate, and allow the area time to recover." },
  "Skin concerns": { factors: "Heat, sweat, product sensitivity, hormones, or poor sleep.", tips: "Keep your routine gentle, avoid picking, and use non-comedogenic sun protection." },
  Fever: { factors: "A fever commonly accompanies infections and needs careful monitoring.", tips: "Rest, drink fluids, check your temperature, and avoid strenuous activity." },
};

export type HealthTopic = keyof typeof healthHelp;