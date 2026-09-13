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

export const student = {
  name: "Student",
  city: "SRM Kattankulathur",
  age: 19,
  gender: "Not specified",
  weight: 65,
  height: 170,
  initials: "ST",
  targets: {
    water: 2500,
    steps: 10000,
    sleep: 8,
    exercise: 60,
    study: 4,
  },
};

export const metrics: Metric[] = [
  { label: "Water", value: "0.0 L", target: "2.5 L goal", progress: 0, trend: "No water logged yet", tone: "blue", icon: Droplets },
  { label: "Steps", value: "0", target: "10,000 goal", progress: 0, trend: "No steps recorded yet", tone: "green", icon: Activity },
  { label: "Sleep", value: "0h", target: "8h goal", progress: 0, trend: "No sleep logged yet", tone: "yellow", icon: MoonStar },
  { label: "Exercise", value: "0 min", target: "60 min goal", progress: 0, trend: "No workouts recorded", tone: "coral", icon: Dumbbell },
  { label: "Stress", value: "Moderate", target: "Aim for low", progress: 50, trend: "Awaiting check-in", tone: "yellow", icon: Brain },
  { label: "Study time", value: "0h", target: "4h focus goal", progress: 0, trend: "No focus blocks yet", tone: "blue", icon: BookOpen },
];

export const weeklyData = [
  { day: "Mon", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
  { day: "Tue", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
  { day: "Wed", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
  { day: "Thu", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
  { day: "Fri", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
  { day: "Sat", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
  { day: "Sun", score: 0, sleep: 0, water: 0, steps: 0, exercise: 0, stress: 0 },
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