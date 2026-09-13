/**
 * Dynamic Home Remedies & Clinical Escalation Engine
 * Provides targeted, evidence-based home remedies for student wellness inquiries,
 * followed by an authoritative recommendation to consult a doctor or the Campus Triage Desk.
 */

export function getDynamicHomeRemedies(input: string, topic?: string, campus = "SRM Kattankulathur"): string {
  const query = (input + " " + (topic || "")).toLowerCase().trim();

  // 1. Hair Loss & Scalp Health
  if (
    query.includes("hair") ||
    query.includes("scalp") ||
    query.includes("dandruff") ||
    query.includes("bald") ||
    query.includes("thin") ||
    query.includes("fall") ||
    query.includes("shed")
  ) {
    return `🌿 Supportive Home Care for Hair & Scalp Health:
• Nutritional Support: Prioritize dietary protein, iron, and zinc (include eggs, lentils, almonds, pumpkin seeds, and green leafy vegetables in your daily meals).
• Scalp Massage: Gently massage your scalp for 4–5 minutes using warm coconut, almond, or rosemary-infused oil to stimulate microcirculation around hair follicles.
• Gentle Hair Washing: Use lukewarm or cool water with a mild, sulfate-free shampoo. Avoid hot water, aggressive towel rubbing, and tight hairstyles that cause traction strain.
• Stress Management: Academic cortisol is one of the primary drivers of temporary hair shedding (telogen effluvium). Practice regular sleep cycles and take daily screen-free breaks.
• Hydration: Drink 2.5–3 liters of water daily to maintain scalp skin hydration and follicle health.

⚠️ Important Clinical Guidance:
Home remedies support general hair health, but persistent or sudden hair loss can indicate nutritional deficiencies (such as iron/ferritin or Vitamin D/B12), thyroid fluctuations, or hormonal imbalances. If hair thinning continues, appears in distinct patches, or is accompanied by scalp burning or severe itching, we strongly recommend visiting a dermatologist or the ${campus} Triage Desk for blood work and a professional medical evaluation.`;
  }

  // 2. Headache, Migraine & Screen Fatigue
  if (
    query.includes("headache") ||
    query.includes("head ache") ||
    query.includes("migraine") ||
    query.includes("temple") ||
    query.includes("forehead") ||
    query.includes("eye strain") ||
    query.includes("screen")
  ) {
    return `🌿 Immediate Home Relief for Headache & Eye Strain:
• Hydration Protocol: Drink 400–500 ml of cool water immediately. Mild dehydration is the most common student trigger for frontal headaches.
• Sensory Rest: Dim the lights, turn off all screens, and rest with your eyes closed in a quiet, cool room for 15–20 minutes.
• Temperature Therapy: Apply a cool, damp washcloth or wrapped ice pack across your forehead and temples, or gently massage peppermint balm into your temples.
• Ergonomics & Posture: Practice the 20-20-20 rule during study blocks (every 20 minutes, look at an object 20 feet away for 20 seconds). Perform gentle neck rolls and shoulder shrugs.

⚠️ Important Clinical Guidance:
If your headache is sudden, unusually severe ("thunderclap"), accompanied by nausea, visual disturbances, a stiff neck, high fever, or numbness, please do not rely on home remedies. Visit an emergency clinic or the ${campus} Triage Desk immediately for an urgent evaluation.`;
  }

  // 3. Cold, Cough, Sore Throat & Congestion
  if (
    query.includes("cold") ||
    query.includes("cough") ||
    query.includes("throat") ||
    query.includes("flu") ||
    query.includes("fever") ||
    query.includes("sneeze") ||
    query.includes("congestion") ||
    query.includes("phlegm") ||
    query.includes("runny nose")
  ) {
    return `🌿 Supportive Home Care for Cold, Cough & Throat Irritation:
• Warm Saline Gargle: Dissolve 1/2 teaspoon of salt in a glass of warm water and gargle 3–4 times daily to reduce mucosal swelling and clear throat bacteria.
• Soothing Herbal Drinks: Sip warm water, ginger-honey-tulsi tea, or clear vegetable/chicken broth throughout the day to keep airways lubricated.
• Steam Inhalation: Inhale warm steam for 5–10 minutes before bedtime to loosen nasal congestion and relieve sinus pressure.
• Elevated Sleep Position: Prop your head up with an extra pillow to prevent post-nasal drip from triggering coughing fits during the night.

⚠️ Important Clinical Guidance:
These home remedies help relieve symptomatic discomfort. However, if your fever exceeds 101°F (38.3°C), you experience chest pain, difficulty breathing, or symptoms worsen after 5–7 days, please consult a physician or visit the ${campus} Triage Desk for an in-person clinical checkup.`;
  }

  // 4. Stomach Ache, Acidity, Nausea & Digestion
  if (
    query.includes("stomach") ||
    query.includes("acid") ||
    query.includes("nausea") ||
    query.includes("digest") ||
    query.includes("bloat") ||
    query.includes("diarrhea") ||
    query.includes("vomit") ||
    query.includes("belly") ||
    query.includes("cramp") ||
    query.includes("gas") ||
    query.includes("reflux")
  ) {
    return `🌿 Gentle Home Remedies for Digestive Discomfort:
• Fluid Management: Sip warm water, diluted oral rehydration salts (ORS), or tender coconut water in small, frequent sips to prevent dehydration.
• Bland Nutrition (BRAT Diet): Consume gentle foods like plain rice with curd, bananas, plain toast, or light khichdi. Avoid spicy, oily, fried, or highly acidic foods.
• Herbal Calming: Sip warm ginger, mint, or chamomile tea to relax digestive tract spasms and settle queasiness.
• Upright Posture: Avoid lying flat immediately after eating. Remain seated or take a gentle 5-minute stroll to prevent acid reflux.

⚠️ Important Clinical Guidance:
If you experience intense localized abdominal pain (especially on the lower right side), persistent vomiting, inability to retain fluids for 24 hours, or black/bloody stools, seek immediate medical attention at the ${campus} Triage Desk or an emergency room.`;
  }

  // 5. Sleep, Insomnia & Chronic Fatigue
  if (
    query.includes("sleep") ||
    query.includes("insomnia") ||
    query.includes("tired") ||
    query.includes("fatigue") ||
    query.includes("exhaust") ||
    query.includes("wake") ||
    query.includes("drowsy")
  ) {
    return `🌿 Natural Home Strategies for Restful Sleep & Energy:
• Digital Sunset: Turn off smartphones, tablets, and laptops at least 45 minutes before sleep to allow your brain to synthesize natural melatonin.
• Room Optimization: Keep your sleeping space as dark, quiet, and cool as possible. Use an eye mask or earplugs if living in a shared student hostel.
• Wind-Down Routine: Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s) or read a physical book. Avoid heavy meals or caffeine past 2:00 PM.
• Fixed Awakening Time: Wake up at the exact same hour every day, even on weekends, and get 10 minutes of direct morning sunlight to anchor your circadian rhythm.

⚠️ Important Clinical Guidance:
If persistent daytime fatigue, sleep apnea (gasping for air), or chronic sleeplessness lasts for more than 2 weeks and impairs your cognitive performance, please visit a doctor or the student health clinic at the ${campus} Triage Desk for a comprehensive wellness review.`;
  }

  // 6. Stress, Anxiety & Mental Overwhelm
  if (
    query.includes("stress") ||
    query.includes("anxiety") ||
    query.includes("panic") ||
    query.includes("overwhelm") ||
    query.includes("nervous") ||
    query.includes("exam") ||
    query.includes("burnout") ||
    query.includes("focus")
  ) {
    return `🌿 Grounding Self-Care for Academic Stress & Overwhelm:
• 5-4-3-2-1 Grounding: Slowly name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste to reset your sympathetic nervous system.
• Box Breathing: Inhale for 4 counts, hold for 4, exhale for 4, and hold empty for 4. Repeat for 3–5 cycles to slow an elevated heart rate.
• Green Space Reset: Take a 10–15 minute brisk walk outdoors across campus greenery without your phone to dissipate built-up cortisol.
• Chunk Your Work: Break study goals into small 25-minute Pomodoro sessions, followed by mandatory 5-minute physical breaks.

⚠️ Important Clinical Guidance:
Academic stress is normal, but severe panic, persistent dread, heart palpitations, or feelings of despair deserve professional support. Please connect with campus mental health counselors, student health services, or visit the ${campus} Triage Desk for confidential, compassionate care.`;
  }

  // 7. Skin, Acne, Rashes & Irritation
  if (
    query.includes("skin") ||
    query.includes("acne") ||
    query.includes("pimple") ||
    query.includes("rash") ||
    query.includes("itch") ||
    query.includes("allergy") ||
    query.includes("redness")
  ) {
    return `🌿 Gentle Home Care for Skin Comfort:
• Cleanse Delicately: Wash your face or affected area twice daily with a mild, fragrance-free cleanser. Pat dry gently with a fresh towel; never scrub.
• Soothing Application: Apply pure aloe vera gel or a cold compress to soothe localized irritation and redness. Do not squeeze, pick, or scratch blemishes.
• Pillowcase Hygiene: Change your pillowcase every 2–3 days and disinfect your smartphone screen regularly to prevent bacterial transfer.
• Internal Hydration: Drink plenty of water and limit high-glycemic sugary snacks and dairy if they correlate with breakout flares.

⚠️ Important Clinical Guidance:
If you develop a rapidly spreading rash, facial swelling, blisters, or skin that feels hot, painful, or tender to the touch, please visit the ${campus} Triage Desk or a clinical dermatologist promptly.`;
  }

  // 8. Muscle Aches, Back Pain & Posture
  if (
    query.includes("muscle") ||
    query.includes("back pain") ||
    query.includes("neck") ||
    query.includes("shoulder") ||
    query.includes("posture") ||
    query.includes("sprain") ||
    query.includes("cramp") ||
    query.includes("joint")
  ) {
    return `🌿 Home Relief for Muscle Tension & Postural Strain:
• Alternate Heat & Cold: Apply an ice pack (wrapped in a towel) for 15 minutes to reduce acute inflammation, or use a warm heating pad to loosen chronic tight muscles.
• Posture Reset: Ensure your computer screen is level with your eyes and your feet rest flat. Avoid studying for long hours slumped on a bed.
• Gentle Spinal Mobility: Perform gentle cat-cow stretches, thoracic twists, and chest openers every 45 minutes of sedentary study.
• Electrolyte Balance: Consume magnesium-rich foods (bananas, nuts) and stay well-hydrated to prevent nocturnal muscle cramping.

⚠️ Important Clinical Guidance:
If muscle pain is accompanied by numbness, tingling, radiating sharp pain down the legs or arms, or persists past 3–4 days without improvement, consult a medical doctor or visit the ${campus} Triage Desk for an examination.`;
  }

  // 9. Universal Contextual Wellness Fallback
  return `🌿 Essential Home Care & Wellness Steps:
• Consistent Hydration: Keep a water bottle at your desk and sip 2.5–3.0 liters of water daily to maintain metabolic balance and mental alertness.
• Balanced Nourishment: Prioritize fresh meals with whole grains, lean protein, and fruits. Avoid skipping breakfast or relying exclusively on instant caffeinated drinks.
• Active Micro-Breaks: Step away from screens every 45–60 minutes for a short stroll and gentle stretching to reset circulation.
• Restorative Sleep: Protect a consistent 7–8 hour sleep schedule to allow your immune system and memory consolidation to function at their best.

⚠️ Important Clinical Guidance:
Home self-care strategies support general wellbeing, but cannot replace a comprehensive medical examination. If you are experiencing persistent discomfort, unusual weakness, or worsening symptoms, please visit a doctor or the ${campus} Triage Desk for personalized medical advice.`;
}
