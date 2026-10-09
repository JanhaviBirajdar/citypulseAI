You are an elite full-stack developer, UI/UX designer, AI engineer, and product architect. Build a complete, polished, responsive web application named CITYPULSE AI for the PromptWars × BRAIN DYPCOEI hackathon.

PROJECT TAGLINE:
"Explore Smart. Travel Aware."

CORE IDEA:
Build an intelligent city exploration and decision-making platform that helps people discover attractions, local food, hotels, historical places, affordable destinations, and cultural experiences while understanding traffic, weather, accessibility, and reported safety concerns.

IMPORTANT:
Do not create just a landing page or static UI mockup. Build a working application with functional navigation, interactive maps, search, filters, comparison tools, an itinerary planner, and citizen reports. Run the application, test the main workflows, and fix errors.

==================================================

1. TECHNOLOGY STACK
   ==================================================

Use:

* React with Vite.
* TypeScript.
* Tailwind CSS.
* Lucide React icons.
* React Router for navigation.
* Recharts for useful analytics.
* Google Maps Platform for maps, places, and routing when API credentials are available.
* Google Gemini API for AI-powered recommendations and itinerary generation.
* Firebase or a suitable lightweight backend for persistent reports if configuration is available.

Before coding:

1. Inspect the existing workspace and preserve useful existing code.
2. Choose a compatible project structure.
3. Install necessary dependencies.
4. Create an .env.example file.
5. Never expose secret API keys in client-side code.
6. If a live service is unavailable, implement a working demo fallback and clearly label its data as DEMO DATA.

==================================================
2. PREMIUM DESIGN SYSTEM
========================

Create a beautiful, production-style smart-city interface.

Visual direction:

* Deep midnight navy: #101426.
* Electric violet: #7957FF.
* Fresh teal: #20D6B5.
* White and soft lavender backgrounds.
* Subtle gradients, soft shadows, clean borders, and rounded cards.
* Modern typography, consistent spacing, clear visual hierarchy.
* Smooth but restrained animations.
* Excellent responsive behavior for mobile, tablet, and desktop.
* Accessible contrast, keyboard navigation, and clear focus states.

Use a professional city-tech aesthetic inspired by high-quality mapping and travel products.

Avoid:

* Generic AI-generated landing pages.
* Excessive gradients and glowing effects.
* Random emojis in place of icons.
* Oversized empty hero sections.
* Fake live-data indicators.
* Non-functional buttons.
* Horizontal overflow on mobile.

Create a consistent design system with reusable components.

==================================================
3. APPLICATION LAYOUT
=====================

Build a complete dashboard application with:

A. Sidebar navigation:

* Overview
* Explore City
* Smart Map
* City Face-Off
* SafeRoute Lens
* Smart Itinerary
* Citizen Reports
* City Insights
* Settings

B. Top navigation:

* City selector.
* Search bar.
* Weather summary when data is available.
* Notifications.
* User profile or demo profile.

C. Main content:

* Responsive page layout.
* Context-aware cards and controls.
* Loading, error, empty, and success states.

The application must work on desktop and mobile. Use a collapsible sidebar or mobile navigation.

==================================================
4. OVERVIEW DASHBOARD
=====================

Create an informative home dashboard.

Include:

* Welcome message: "Your city, understood."
* Search input: "Where do you want to explore?"
* Interactive city map preview.
* Explore categories: Food, Heritage, Attractions, Hotels, Budget Friendly.
* City conditions panel.
* Weather and traffic summaries when available.
* Recently explored places.
* Recommended destinations based on preferences.
* Recent citizen reports with timestamps and verification status.
* Quick action: "Plan My Journey".

Use demo content for a single configurable city, Pune, India.

All sample records must be labelled as demo data wherever users might mistake them for real-time information.

==================================================
5. EXPLORE CITY
===============

Create an exploration page with:

* Searchable place cards.
* Categories for attractions, food, hotels, parks, and heritage.
* Filters for budget, distance, ratings, accessibility, and opening hours when available.
* Grid and map views.
* Sort options.
* Place details page or modal.

Every place card should display:

* Place name.
* Category.
* Location.
* Estimated price or price range, if available.
* Rating and rating source, if available.
* Accessibility information, if available.
* Data source and last-updated time when applicable.
* Button to compare.
* Button to add to itinerary.
* Button to view on map.

Do not fabricate real ratings, opening hours, reviews, or prices. Use explicit sample labels for mock records.

==================================================
6. UNIQUE FEATURE: CITY FACE-OFF
================================

Implement an interactive destination comparison tool.

Allow users to select two or three destinations.

Compare:

* Affordability.
* Ratings and review counts, where available.
* Cleanliness evidence.
* Accessibility.
* Distance and estimated travel time.
* Available facilities.
* Recent reported hazards.
* Data freshness.
* Confidence and evidence coverage.

Display a clean comparison table and visual charts.

Add a recommendation panel:
"Best match for your preferences"

Explain:

* Why the location was recommended.
* Which criteria influenced the recommendation.
* What information is missing.
* Which alternative may be better for a different preference.

Implement a configurable CityMatch score from 0 to 100.

Initial example weights:

* Safety evidence: 30%.
* Affordability: 20%.
* Ratings: 20%.
* Cleanliness evidence: 15%.
* Accessibility: 15%.

Normalize available values before scoring.

CRITICAL:

* Do not interpret missing data as good or safe.
* Do not calculate misleading scores from unavailable information.
* Display a separate evidence coverage or confidence indicator.
* Make it possible to configure the scoring weights.
* Label this score as a preference-based decision aid, not an objective safety rating.

==================================================
7. UNIQUE FEATURE: SAFEROUTE LENS
=================================

Build an interactive map with:

* Place markers.
* Route visualization.
* Traffic conditions when supported by the connected provider.
* Weather alerts when available.
* Reported road hazards and accidents.
* Alternative route options.
* Report timestamps.
* Source and verification status.
* A report details panel.

Allow users to choose:

* Origin.
* Destination.
* Travel mode.
* Route preferences.

Route preferences may include:

* Shortest estimated travel time.
* Accessibility needs.
* Avoiding known reported hazards when reliable routing information supports it.

Show a clear explanation for each suggested route.

Never promise that a route is completely safe.

Do not create a custom road-routing algorithm that claims to find a safe route from incomplete data. Use supported routing services and clearly describe limitations.

If Google Maps credentials are missing, show a working demo map or map fallback with sample locations and visibly labelled simulated routes.

==================================================
8. UNIQUE FEATURE: SMART ITINERARY
==================================

Create a functional itinerary builder.

Inputs:

* Starting location.
* Destination preferences.
* Total budget in INR.
* Available duration.
* Travel mode.
* Interests.
* Accessibility requirements.
* Optional weather preference.

Interests may include:
Food, History, Culture, Nature, Shopping, Family Activities, and Photography.

Output:

* Suggested sequence of places.
* Estimated travel times where supported.
* Approximate costs with explicit assumptions.
* Time spent at each destination.
* Total estimated budget.
* Alternative destinations.
* Available weather warnings.
* Relevant reported hazards.
* Explanation of recommendations.

Features:

* Add and remove stops.
* Reorder stops.
* Regenerate the itinerary after changing preferences.
* Save the itinerary locally or through the configured backend.
* Display a clear budget breakdown.

The itinerary must respect the user's budget and available time as far as the available data permits.

If a required value is unknown, ask the user or label the estimate instead of inventing precise figures.

==================================================
9. CITIZEN REPORTS AND TRUST
============================

Build a report submission interface.

Report categories:

* Road hazard.
* Accident.
* Traffic disruption.
* Flooding or waterlogging.
* Cleanliness concern.
* Accessibility problem.
* Public infrastructure issue.
* Other city concern.

Report fields:

* Category.
* Description.
* Location.
* Timestamp.
* Optional photo upload.
* Optional additional context.

Implement:

* Form validation.
* Success and error messages.
* Report list and detail views.
* Duplicate-report handling where feasible.
* Report status: Unverified, Under Review, Verified, Rejected, or Expired.
* Moderation interface for authorized reviewers.
* Ability to mark outdated reports as expired.

Do not automatically mark a citizen report as verified.

For the demo, implement persistent browser storage if no backend is configured. Clearly state that local demo reports are stored only in that browser.

Do not expose private reporter details.

==================================================
10. GEMINI AI INTEGRATION
=========================

Implement an AI service for:

* Personalized destination recommendations.
* Itinerary generation.
* Destination comparison explanations.
* Short historical and cultural summaries.
* Natural-language city search.
* Summarizing citizen reports without hiding uncertainty.

Use the Gemini API through a secure server-side integration or another supported secure configuration.

Create structured prompts that instruct the model to:

1. Use only the evidence supplied by the application or retrieved from trusted sources.
2. Separate confirmed facts from assumptions.
3. Avoid fabricating live traffic, weather, incidents, ratings, or opening hours.
4. Explain why recommendations were made.
5. Identify missing data.
6. Return a predictable structured response that can be validated.
7. Avoid presenting rumours as verified safety information.

Validate AI responses before displaying them.

If the API is not configured, implement deterministic demo recommendations with the same interface. Clearly label these recommendations as demo output.

Do not claim the Gemini integration works until it has been tested with valid credentials.

==================================================
11. CITY INSIGHTS AND ANALYTICS
===============================

Build an insights dashboard with:

* Distribution of reported city issues.
* Report counts by category.
* Report status breakdown.
* Trends over time when enough data exists.
* Popular exploration categories.
* Affordability comparisons.
* Accessibility information coverage.

Use Recharts where appropriate.

Use only actual available data or explicitly labelled sample data.

Do not infer that an area is dangerous merely because it has more reports; account for reporting volume, exposure, recency, and data coverage before drawing conclusions.

Avoid unsupported claims about crime, public safety, or neighbourhood reputation.

==================================================
12. DATA ARCHITECTURE
=====================

Create reusable types and service modules for:

* Places.
* Citizen reports.
* Weather alerts.
* Traffic information.
* Routes.
* Itineraries.
* User preferences.
* AI recommendations.

Suggested structure:

src/
components/
layout/
map/
cards/
charts/
forms/
ui/
pages/
Dashboard.tsx
Explore.tsx
SmartMap.tsx
CityFaceOff.tsx
SafeRoute.tsx
Itinerary.tsx
Reports.tsx
Insights.tsx
Settings.tsx
services/
gemini.ts
places.ts
maps.ts
weather.ts
reports.ts
recommendationEngine.ts
data/
demoPlaces.ts
demoReports.ts
types/
index.ts
utils/
scoring.ts
validation.ts
App.tsx
main.tsx

Adapt this structure to the actual framework setup when necessary.

==================================================
13. FUNCTIONALITY REQUIREMENTS
==============================

Every visible control must perform a meaningful action.

Implement:

* Working sidebar navigation.
* Search and category filtering.
* Comparison selection and removal.
* Functional scoring calculations.
* Working itinerary generation and editing.
* Working report submission and status display.
* Map markers and details.
* Responsive dialogs and forms.
* Useful empty, loading, and error states.
* Input validation.
* Persistent demo data where appropriate.
* A clear way to reset demo data.

Avoid placeholder links and buttons that do nothing.

==================================================
14. FINAL HACKATHON DEMONSTRATION
=================================

Create a polished demonstration flow:

Step 1: The user chooses Pune and enters a budget of ₹500.

Step 2: The user selects food, heritage, and photography interests.

Step 3: CityPulse recommends destinations from the available dataset and explains its choices.

Step 4: The user compares two destinations using affordability, ratings, accessibility, and evidence freshness.

Step 5: The user opens SafeRoute Lens and inspects a clearly labelled sample road-hazard report.

Step 6: The user changes a preference or avoids the reported hazard.

Step 7: CityPulse updates the itinerary, explains the change, and shows the new estimated budget.

Step 8: The user sees the evidence sources, timestamps, uncertainty, and alternative options.

Provide a "Load Demo Scenario" button that initializes this workflow with sample records. Every sample record must be clearly marked as demo data.

==================================================
15. IMPLEMENTATION AND TESTING
==============================

Work in the following order:

Phase 1: Inspect the workspace and set up the application.
Phase 2: Build the visual design system and navigation.
Phase 3: Implement the dashboard and exploration experience.
Phase 4: Implement City Face-Off and scoring logic.
Phase 5: Implement SafeRoute Lens and the itinerary builder.
Phase 6: Implement citizen reports and insights.
Phase 7: Add secure Gemini integration and provider adapters.
Phase 8: Test all major workflows and responsive layouts.
Phase 9: Fix errors and prepare the final demonstration.

Run the application using the appropriate development command.

Verify:

* All routes load.
* Navigation works.
* Search and filters work.
* Comparison calculations are correct.
* Itinerary editing works.
* Report submission and persistence work as designed.
* Demo mode works without API credentials.
* No secret keys are exposed.
* No critical console or build errors remain.

Do not stop after generating a plan or writing a README. Implement the application in the workspace.

FINAL DELIVERABLE:
A professional, functional CITYPULSE AI web application that demonstrates a unique city decision engine, trustworthy safety information, smart destination comparisons, and personalized itinerary planning.

Prioritize a working, impressive core product over superficial features. At the end, summarize what was implemented, how to run it, which API keys are required, which features use demo data, and what tests were performed.
