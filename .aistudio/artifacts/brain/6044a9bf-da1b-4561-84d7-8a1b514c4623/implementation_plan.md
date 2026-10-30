# Implementation Plan: Live Session Countdown Timeline, Universal Back Navigation & Multi-Graded Live Animations

## 1. Architectural & Experience Overview

Based on your selections, we will upgrade **EduVerify** across four coordinated pillars while preserving all existing backend routes (`server.ts`, `apps/api/**`) and role-based portal boundaries:

1. **Top-Center Live Session Timeline & 10-Minute Auto-Logout Compliance**:
   - **Always-Visible Top-Center Timeline Bar**: Positioned in the top-center of both the **AICTE Administration Console** and **My EduVerify Student Portal** headers.
   - **Minute-by-Minute Milestone Progression**: Displays a live countdown (`10:00` down to `00:00`, alongside the 15-minute policy context) with 10 discrete 1-minute segment ticks (`10m` → `9m` → ... → `1m` → `0m`). After each elapsed minute, a live milestone badge updates to show the current minute checkpoint and remaining time before the 10-minute session timeout.
   - **Automatic Redirect at 10 Minutes**: When the 10-minute countdown reaches `00:00` (or when triggered via the quick-test controls), the session automatically terminates and redirects to `/login?reason=idle_timeout` with a clear compliance notice.
2. **Universal "Back" Navigation on Every Page & Multi-Step Workflow**:
   - **Global Top-Left Back Control**: Paired directly with the top-center session timeline bar and breadcrumb bar across `LoginPage`, `StudentLayout`, `AdminLayout`, and public verification views—allowing one-click return to the previous page or portal home.
   - **Step-Level Back Controls**: Added inside multi-step workflows (Bulk CSV Upload stages, Duplicate Conflict Review drawer/steps, Student Discrepancy filing steps, and Verification Token inspection steps) so users can step backward at any stage.
3. **Home Page Hero Upgrade & Emerald-Gold-Crimson Live Background Grading**:
   - **Hero Tagline & Visual Presence**: Upgrade the hero kicker to **"NATIONAL ACADEMIC LEDGER · INSTITUTIONAL TRUST"** with refined typography and zero static clutter.
   - **Multi-Color Graded Live Canvas (`HeroBackgroundCanvas` & Section Strata)**: Upgrade the home page and portal ambient canvases from faint single-tone gold to a rich, continuous multi-color live animation blending **Deep Emerald (`#0F5132` / `#15803D`)**, **Sovereign Gold (`#B88938` / `#D4AF37`)**, and **Crimson-Garnet (`#991B1B` / `#B91C1C`)** kinetic streams, interactive node pulses, and flowing strata ribbons.
4. **Live Interactive Actions in Landing Sections (01 & 02) and Student/Admin Portals**:
   - **Landing Section 01 (`01 · Structural Context`)**: Add live animated micro-simulations inside each of the three pillars (*Institutional Silos* live schema normalizer, *Cross-Campus Collisions* real-time hash collision detector, and *Verification Opacity* live intake & Ed25519 token stream).
   - **Landing Section 02 (`02 · Deterministic Workflow`)**: Turn the 4-stage workflow (*Submit → Validate → Review → Verify*) into an auto-cycling and user-clickable live state machine with animated packet progression, rule evaluation counters, and live stage telemetry.
   - **Student & Admin Portals (Every 2nd/3rd Section)**: Embed live interactive telemetry and action modules into every second/third section across both `StudentPortalPages.tsx` and `AdminPortalPages.tsx` (e.g., Live Cryptographic Hash Pulse & Verification Stream in Student Portal; Live National Ingestion & Rule Engine Pulse Stream in Admin Console).

---

## 2. Planned File Changes

| File | Planned Modifications |
| :--- | :--- |
| `src/lib/weaveEngine.ts` & `src/lib/weaveEngine.test.ts` | Support the 10-minute (`600s`) active session countdown timeline with minute-by-minute milestone calculation (`currentMinuteMilestone`, `minutesRemaining`, `progressPct`) and automatic redirect at 10 minutes, while keeping unit tests passing. |
| `src/lib/auth.tsx` | Expose minute-by-minute countdown state, current minute alert milestone, and 1-click simulation helpers (`advanceOneMinute`, `simulateWarningMilestone`, `simulateAutoLogout10m`) for immediate evaluation. |
| `src/components/ui/PortalEnhancements.tsx` | Build the **Top-Center Live Session Timeline Bar** (with 10 minute-ticks, live `MM:SS` tabular counter, minute-alert banner, and `+1m` / `Auto-Logout` evaluator buttons) + **Universal Back Navigation Bar** (`PortalBackButton`). Enhance `PortalAmbientCanvas` with Emerald-Gold-Crimson multi-color live grading. |
| `src/components/layout/AdminLayout.tsx` & `src/components/layout/StudentLayout.tsx` | Integrate the unified Top-Center Session Timeline Bar and Left Back Button into the sticky portal header and breadcrumb navigation bar. |
| `src/features/auth/LoginPage.tsx` | Add a prominent Back to Home / Previous Step button at the top-left of the login view, update the session timeout compliance alert banner for the 10-minute auto-redirect policy, and add live Emerald-Gold-Crimson background motion. |
| `src/features/landing/components/HeroBackgroundCanvas.tsx` | Upgrade the 2D canvas engine to render multi-layered Emerald, Sovereign Gold, and Crimson-Garnet aurora fields, flowing ledger packets, and harmonic verification waves. |
| `src/features/landing/LandingPage.tsx` | Update hero kicker to `NATIONAL ACADEMIC LEDGER · INSTITUTIONAL TRUST`, apply multi-color graded background strata across sections, and add live interactive animations to **Section 01 (Structural Context)** and **Section 02 (Deterministic Workflow)**. |
| `src/features/student/StudentPortalPages.tsx` | Add step-level Back navigation across student subpages/workflows and embed live interactive actions in every 2nd/3rd section (Live APAAR Cryptographic Heartbeat, Live Semester Verification Stream, and Interactive Consent/Discrepancy Live Simulator). |
| `src/features/admin/AdminPortalPages.tsx` | Add step-level Back buttons across admin subviews/drawers (Bulk Upload steps, Institution detail drilldown, Conflict resolution drawer) and embed live interactive actions in every 2nd/3rd section (Live National Ingestion Telemetry, Real-Time Rule Engine Inspector, and Live Intake Utilization Pulse). |

---

## 3. Verification Criteria

- **Session Timeline & Auto-Logout**: Logging into either Student or Admin portal immediately displays the live top-center countdown timeline with minute ticks, minute-by-minute alert updates, and automatic redirect to `/login?reason=idle_timeout` at `00:00`.
- **Universal Back Navigation**: Every page and multi-step workflow in Public, Login, Student, and Admin views includes an active Back control that navigates to the prior step or route.
- **Live Animations & Multi-Color Grading**: Home page hero, Section 01, Section 02, and every 2nd/3rd section in Student and Admin portals feature smooth, compositor-friendly live animations with Emerald-Gold-Crimson color grading.
- **Build & Test Integrity**: All unit tests (`weaveEngine.test.ts`), `lint_applet`, and `compile_applet` succeed with zero errors, and all backend files remain untouched.
