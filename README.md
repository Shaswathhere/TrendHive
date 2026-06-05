# Live demo URL - https://trend-hive-ten.vercel.app

# TrendHive

TrendHive is an AI-powered trend discovery and innovation platform for exploring emerging technologies, analyzing signals across industries, saving insights, and eventually collaborating around ideas.

The product vision is to help users move beyond simply noticing trends and instead understand, organize, and act on them.

## Vision

TrendHive aims to become a centralized ecosystem where users can:

- Discover emerging trends
- Analyze them with AI
- Save and organize insights
- Turn signals into ideas and decisions

## Current Codebase Status

This README reflects the actual state of the repository as of April 16, 2026, based on the code currently present in `frontend/` and `backend/`.

### What Is Implemented

- Public landing page with modular sections
- Firebase initialization
- Firebase email/password sign up flow
- Firebase email/password login flow
- React Router setup for public routes
- Reusable UI primitives using Tailwind and shadcn-style components
- Auth provider and protected route guards
- Dashboard shell with sidebar and navbar
- Home, TrendBot, InfoHub, and Profile pages
- Shared workspace state for chat history, saved insights, and activity
- Initial Express backend scaffold with health, chat, and trends routes

### What Is Not Yet Implemented

- Database models or collections
- Firestore persistence
- Authenticated backend access control
- External trend/news source integrations
- Production-ready OpenAI integration with stored history
- Collaboration and advanced AI phase features

## Feature Progress Checklist

### Phase 1: MVP

- [x] Landing page UI
- [x] Hero, features, about, CTA, and footer sections
- [x] Login page UI
- [x] Signup page UI
- [x] Firebase email/password authentication wiring
- [x] Basic route setup for `/`, `/login`, and `/signup`
- [x] Protected routes
- [x] Auth state management with context/provider
- [x] Logout flow
- [x] Dashboard shell
- [x] Sidebar
- [x] Navbar/topbar
- [x] Home dashboard page
- [x] TrendBot page
- [x] TrendBot backend API
- [x] Prompt handling for trend queries
- [x] AI response rendering
- [x] Chat history storage
- [x] Activity log
- [x] InfoHub page logic
- [x] Save insight workflow
- [x] Trend categorization/tagging
- [x] Profile page logic
- [x] User settings/preferences

### Phase 2: Collaboration Layer

- [ ] HiveRooms
- [ ] Project Pods
- [ ] AI-assisted discussions

### Phase 3: Experience Layer

- [ ] Personalized dashboard data
- [ ] StoryView
- [ ] Vision Board
- [ ] Mobile optimization review

### Phase 4: Advanced AI

- [ ] Trend Simulation Engine
- [ ] AI Persona
- [ ] Plugin system / plugin store

## Codebase Audit Notes

### Frontend

Implemented files include:

- `frontend/src/pages/LandingPage.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/SignUp.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/TrendBot.jsx`
- `frontend/src/pages/InfoHub.jsx`
- `frontend/src/pages/Profile.jsx`
- `frontend/src/components/landing/*`
- `frontend/src/components/layout/*`
- `frontend/src/components/auth/routeGuards.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/WorkspaceContext.jsx`
- `frontend/src/lib/firebase.ts`
- `frontend/src/hooks/useWorkspace.js`
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`

### Backend

The backend now includes an initial Express scaffold with:

- `backend/src/server.js`
- `backend/src/app.js`
- `backend/src/routes/health.js`
- `backend/src/routes/chat.js`
- `backend/src/routes/trends.js`
- `backend/src/services/openaiService.js`

Still pending on the backend:

- Database integration
- Persistent user/chat storage
- Source ingestion from external APIs
- Auth middleware for protected backend calls

## Recommended MVP Flow

The strongest MVP loop for TrendHive is:

`discover -> ask -> save -> revisit`

That means the first complete version should prioritize:

1. Authentication
2. Protected dashboard
3. TrendBot query and response flow
4. Insight saving to InfoHub
5. Basic history/activity

## Finalized MVP Tech Stack

This is the recommended tech stack to finalize around for the current project direction.

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS v4
- shadcn/ui-style component system
- Lucide React icons

### Authentication

- Firebase Authentication

### Backend

- Node.js
- Express

### Database

- Firebase Firestore

Why Firestore for MVP:

- It matches your current Firebase setup
- It reduces auth and data integration overhead
- It is faster to ship than splitting early across Firebase Auth plus MongoDB

### AI Layer

- OpenAI API through the backend only

### External Data Sources

- News APIs
- Reddit APIs
- GitHub Trending or GitHub topic-based ingestion

## Suggested Data Collections

If you use Firestore for MVP, start with these collections:

- `users`
- `chats`
- `messages`
- `saved_insights`
- `trends`
- `activity_logs`

## Suggested Backend Modules

When you build the backend, keep it organized like this:

- `server.js` or `index.js`
- `routes/auth.js`
- `routes/trends.js`
- `routes/chat.js`
- `routes/insights.js`
- `controllers/`
- `services/openaiService.js`
- `services/trendIngestionService.js`
- `services/firestoreService.js`
- `middleware/auth.js`

## Remaining Tasks

### Immediate Tasks

- [x] Create Express backend
- [x] Add environment variable management
- [x] Move Firebase config values to environment variables
- [x] Add protected route wrapper
- [x] Implement auth persistence and route redirection
- [x] Build dashboard layout
- [x] Create TrendBot page UI
- [x] Add backend endpoint for AI trend queries
- [x] Save chat prompts and responses
- [x] Build InfoHub save/view flow
- [x] Implement profile page

### Quality Tasks

- [ ] Add loading and empty states across pages
- [ ] Add error boundaries or route-level error handling
- [ ] Add form validation improvements
- [x] Add lint fixes
- [ ] Add basic tests
- [ ] Add deployment configuration

### Product Tasks

- [ ] Define primary target user for MVP
- [ ] Finalize TrendBot prompt strategy
- [ ] Define insight tags/categories
- [ ] Define trend scoring model for later phases

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Verification Notes

The current repo was checked at a high level:

- Frontend lint passes.
- Frontend build could not be completed in this environment because the installed Node.js version is `20.17.0`, while the installed Vite version requires `20.19+` or `22.12+`.

## Next Recommended Build Order

1. Upgrade Node.js to `20.19+` or `22.12+` so Vite builds cleanly
2. Replace in-memory workspace state with Firestore for chats, insights, and activity
3. Add backend auth middleware using Firebase token verification
4. Connect TrendBot responses to persisted chat sessions
5. Add external trend ingestion sources
6. Add profile persistence and settings sync

## Summary

TrendHive already has a promising visual foundation and authentication start, but it is still in early MVP construction. The right move now is to narrow the stack, finish the core user loop, and avoid expanding into advanced modules until TrendBot, InfoHub, and dashboard workflows are genuinely working end to end.
