# VitaStudent frontend build

## Goal
Create a polished, responsive student wellness companion with a dashboard-first experience, realistic sample data, complete supporting pages, and an account flow ready to store student profiles.

## What I’ll build
- A friendly visual system with crisp typography, soft neutral surfaces, purposeful green/coral accents, restrained motion, and consistent compact cards.
- A responsive app shell with a desktop sidebar, mobile bottom navigation, page headers, notifications, and student profile access.
- Home dashboard with wellness score, six daily metric cards, today’s insight, quick logging controls, and a floating Quick Health Help panel with static guidance and safety messaging.
- Health page with category search, a realistic mock map, nearby care locations, emergency information, vaccination records, and reminders.
- Weather & Environment page with current conditions, air and UV readings, daily precautions, and practical hydration, clothing, outdoor, and sun guidance.
- Weekly Report page with wellness summary, readable charts for sleep, water, steps, exercise, and stress, plus review and next-week recommendations.
- Profile page with editable student information, goals, notification controls, units, privacy settings, and logout.
- Login, signup, forgot-password, and password-reset screens; signup will capture profile details and the data layer will be separated so the UI can later connect to Firebase or other services cleanly.
- Loading, empty, validation, and error presentations for key screen patterns.

## Technical approach
- Use TanStack routes for each major page and shared React components for navigation, cards, charts, forms, and panels.
- Keep realistic fixtures in a mock-data module and define typed service interfaces for future Groq, weather, map, and persistence integrations.
- Use Lovable Cloud for authentication and profile storage while leaving wellness, weather, map, and recommendation data mocked for this phase.
- Use semantic design tokens in the global stylesheet and existing interface controls for accessibility and visual consistency.
- Add unique page titles and sharing descriptions for every route.
- Verify desktop and mobile layouts, navigation, dialogs, form behavior, and visible error-free rendering.
