# Syncare

A modern, clean, polished web app for a student wellness and health companion called “Syncare”.

IMPORTANT: Focus on building the FRONTEND/UI/UX first. Do not build complicated backend logic yet. Use realistic mock/sample data so that every screen looks complete and functional. The code should be structured cleanly so Firebase, Groq API, weather API and OpenStreetMap can be connected later.

APP CONCEPT:
This is an AI-powered student wellness app. Students can track their daily habits and wellbeing, receive personalized AI recommendations, get general health guidance, see weather-based health precautions, and find nearby healthcare facilities.

DESIGN DIRECTION:

Modern student-focused interface

Premium but simple and friendly

Clean, minimal layout

Avoid an overly corporate or hospital-like appearance

Avoid excessive gradients, glowing effects, floating AI decorations, or “AI-generated” looking design

Use a consistent design system throughout the app

Make it feel like a real startup product rather than a generic dashboard template

Prioritize readability and usability

Smooth subtle animations and transitions

Responsive design for desktop, tablet and mobile

Use modern cards, rounded corners, clean typography and proper spacing

Make the UI visually impressive enough for a hackathon demo

Do not overcrowd the dashboard

MAIN APP STRUCTURE:

LOGIN / SIGN UP
Create a clean authentication screen with:

App logo/name

Email

Password

Sign in

Sign up

Forgot password

Optional Google sign-in button
Keep this screen minimal and polished.

MAIN DASHBOARD / HOME
Create the main student dashboard.

Top section:

Greeting such as “Good morning, Alex”

Current date

Small profile avatar

Notification icon

Main wellness section:

Large “Today’s Wellness Score” card

Score should be shown visually, for example 78/100

Short explanation below it

Daily tracking cards:

Water intake

Steps

Sleep

Exercise

Stress / Mood

Study time

Each card should show:

Current value

Daily target

Progress indicator

Small icon

Simple visual trend if appropriate

Example:
Water: 1.8L / 2.5L
Steps: 7,240 / 10,000
Sleep: 6h 40m / 8h

AI recommendation section:
Create a visually important but clean card called:
“Today’s Insight”

Example:
“Your activity level is good today, but your sleep has been below your usual level. Consider prioritizing rest tonight.”

Add a small “View details” button.

Daily input section:
Add an easy way for the student to update their daily information:

Add water

Update steps

Log sleep

Log exercise

Set stress/mood

Add meal/nutrition information
Use clean buttons, sliders, dropdowns or modal forms where appropriate.

FLOATING HEALTH BUTTON
Add a floating button on the dashboard that opens a “Quick Health Help” panel.

Categories can include:

Hair fall

Headache

Fatigue

Dehydration

Stress

Muscle soreness

Skin concerns

Fever

When a category is selected, show:

General self-care tips

Possible common contributing factors

Simple preventive advice

A clear note that the app does not diagnose medical conditions

A “Seek professional help” section for concerning/persistent symptoms

For the first version, use realistic static sample content.

HEALTH SERVICES PAGE
Create a separate page called “Health”.

Include:

Search bar

Nearby hospitals

Clinics

Pharmacies

Vaccination centres

Emergency information

Create a large map area using a realistic map placeholder/mock map for now, structured so OpenStreetMap can be integrated later.

Below the map, show healthcare location cards containing:

Name

Type

Distance

Opening status

Address

“View on map” / “Directions” button

Also create a “My Health Records” section with:

Vaccination records

Completed vaccinations

Upcoming reminders

Use sample data only for now.

WEATHER & ENVIRONMENT PAGE
Create a page called “Weather & Environment”.

Show:

Current city

Current temperature

Weather condition

Humidity

UV index

Air quality

Today's high/low

Create an AI-style but clean recommendation section:
“Today’s Health Precautions”

Example:
“High temperature today. Stay hydrated, avoid excessive outdoor activity during peak afternoon hours, and wear lightweight clothing.”

Add sections for:

Hydration

Clothing

Outdoor activity

Sun protection

Use mock weather data for now so a real weather API can be connected later.

WEEKLY WELLNESS PAGE
Create a “Weekly Report” page.

Show:

Average wellness score

Sleep trend

Water trend

Steps trend

Exercise trend

Stress trend

Use attractive charts/graphs.

Add:
“Your Week in Review”

Example:
“You were more active this week, but your sleep decreased compared with last week.”

Then:
“Next Week’s Focus”
with 1–3 simple recommendations.

PROFILE / SETTINGS
Create:

Profile information

Age

City

Daily goals

Notification preferences

Units/preferences

Privacy settings

Logout

NAVIGATION
Use a clean navigation system.

Desktop:

Left sidebar

Mobile:

Bottom navigation bar

Main navigation:

Home

Health

Weather

Weekly Report

Profile

Make navigation smooth and consistent.

UI DETAILS
Use:

Consistent icon style

Consistent card spacing

Clear hierarchy

Accessible contrast

Proper hover states

Loading states

Empty states

Error states

Form validation

Responsive layouts

Create reusable components instead of duplicating code.

MOCK DATA
Use realistic sample student data so the application looks complete immediately.

Example student:
Name: Alex
City: Chennai
Wellness Score: 78
Water: 1.8L / 2.5L
Steps: 7,240 / 10,000
Sleep: 6h 40m
Exercise: 45 min
Stress: Moderate

IMPORTANT TECHNICAL REQUIREMENTS:

Keep the code organized and modular

Create reusable components

Keep frontend/backend concerns separated

Use mock data for now

Do not hardcode future API keys

Do not expose secrets

Make it easy to replace mock data with Firebase later

Structure API/service files cleanly so Groq, weather services and OpenStreetMap can be added later

Make the UI responsive and production-quality

Do not overcomplicate the application with unnecessary features

The final result should feel like a polished student wellness startup product suitable for a hackathon presentation, with the dashboard being the main visual highlight.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1045cb2d-a39e-41c3-956a-f8f49a15f028).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
