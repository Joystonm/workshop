# Hackathon log

- **Project:** Workshop
- **Event:** Convex All Gas Hackathon
- **What it does:** Virtual hands-on learning environment where students learn by experimenting through CAD, Physics, Solar, and Chemistry simulations.
- **Live app:** not deployed
- **Repo:** none
- **Frontend:** Convex static hosting
- **Convex deployment:** not deployed
- **Components:** none
- **Convex features:** queries, mutations, actions, schema, indexes
- **Auth:** session-based anonymous users
- **AI models:** MiniMax/Abab6 (GMI Cloud)
- **Started:** 2026-09-07T09:21:00Z
- **Last updated:** 2026-09-07T09:46:00Z

## Log

### 2026-09-07 - working tree

Set up Workshop project from scratch. Created React + TypeScript + Vite frontend with Convex backend. Defined full schema with users, workshops, experiments, attempts, savedProjects, progress, conversations, researchSessions, achievements, activityHistory tables. Implemented workshop.ts queries and mutations for CRUD operations. Created ai.ts with MiniMax and Firecrawl actions.

Built Home page with workshop previews and animated SVG icons for each workshop. Created WorkshopShell wrapper with persistent navigation. Implemented four interactive workshops:

- Physics: Circuit builder with battery, wire, switch, bulb, resistor, LED, voltmeter, ammeter components. Challenge panel shows objectives and circuit validation.
- CAD: Three.js 3D viewport with OrbitControls, shape creation (cube, sphere, cylinder, cone, plane), transform tools, and load testing simulation.
- Solar: Solar panel system builder with animated sun, panel angle controls, battery charging visualization, and power calculations.
- Chemistry: Virtual lab with beaker, test tube, flask, burner, dropper equipment. Substance mixing with reaction simulation and heat controls.

Added My Experiments page and Progress page with workshop statistics. Integrated AI services (MiniMax, Firecrawl, AgentMail) with environment variable configuration. Added DESIGN.md from Figma design system.

Evidence: `convex/schema.ts`, `convex/workshop.ts`, `convex/ai.ts`, `src/pages/Home.tsx`, `src/pages/workshops/*.tsx`, `src/components/*.tsx`, `src/lib/ai/*.ts`

---

## Build Progress

### 2026-09-07 — Project Initialization

**Completed:**
- Initialized React + TypeScript + Vite project
- Set up Convex schema with all tables
- Created workshop.ts CRUD functions
- Created AI actions (minimax, firecrawl)
- Built Home page with workshop previews
- Built Navigation component
- Built WorkshopShell wrapper
- Created Physics Workshop (circuit builder)
- Created CAD Workshop (Three.js 3D modeling)
- Created Solar Workshop (energy system builder)
- Created Chemistry Workshop (virtual lab)
- Created My Experiments page
- Created Progress page
- Integrated AI services (MiniMax, Firecrawl, AgentMail)
- Added DESIGN.md inspired by Figma
- Build passes successfully

**Key Features Implemented:**
- Physics: Interactive circuit builder with components (battery, wire, switch, bulb, resistor, LED, meters)
- CAD: Three.js 3D viewport with shape creation and transform tools
- Solar: Solar panel system with sun simulation and energy calculations
- Chemistry: Lab equipment and substance mixing with reaction simulation
- Challenge system with objectives and test/validation
- Session-based user tracking
- Activity history and progress tracking

---

## Submission

**URL:** TBD (pending deployment)

**Video:** TBD (pending recording)

**Status:** Core implementation complete, pending deployment and testing.
