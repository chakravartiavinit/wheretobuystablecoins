# Product Requirements Document - wheretobuystablecoins.xyz

## Original Problem Statement
Create a coming soon waitlist page for "wheretobuystablecoins.xyz" - a comparison site to find the cheapest, fastest way to buy USDT & USDC with local currency. Theme: dark and crypto web3 types.

## User Personas
- **Early Adopters**: Crypto enthusiasts who want to be first to know when the comparison site launches
- **Cost-Conscious Buyers**: Users looking for the best rates to buy stablecoins
- **International Users**: People from various countries wanting to buy with their local currency

## Core Requirements (Static)
1. **Coming Soon Page**
   - Dark crypto/web3 theme design
   - "Coming Soon" heading centered
   - Description: "Find the cheapest, fastest way to buy USDT & USDC with your local currency."
   - Custom favicon provided by user

2. **Waitlist Form**
   - Email-only collection
   - Email validation
   - Success/error toast notifications
   - Background particle animation

3. **Backend Storage**
   - Store waitlist emails in Supabase database
   - Transaction pooler connection for reliability

## What's Been Implemented (December 2025)

### Phase 1: Frontend with Mock Data ✅
**Date**: December 2025

**Components Created**:
- `/app/frontend/src/pages/WaitlistPage.jsx` - Main waitlist landing page
- `/app/frontend/src/components/AnimatedBackground.jsx` - Cosmic nebula animation with particles
- `/app/frontend/src/mock/waitlistMock.js` - Mock localStorage storage for demo

**Styling**:
- Dark purple theme (#1A1347 very dark blue-purple background)
- Purple/pink color palette:
  - Light pink: #F1B7EA (headings, accents, glows)
  - Light purple: #A486B0 (text, borders)
  - Medium purple: #694786 (buttons, features)
  - Dark purple: #3C2D57 (input backgrounds)
  - Vibrant purple: #5D479A (borders, gradients)
- Rounded modern design (12px border-radius)
- Responsive design for mobile/tablet/desktop
- Unique cosmic nebula background animation:
  - Animated gradient clouds that pulse and move
  - Flowing sine wave patterns
  - Particle trails with glow effects
  - Purple to pink color shifts
- Smooth hover states with glow effects and elevation
- Text shadow glows for premium feel

**Features**:
- Email input with validation
- Toast notifications (sonner)
- Mock data storage in localStorage
- Three feature indicators (Compare Rates, Fastest Routes, Local Currency)
- Custom favicon integration
- Fully responsive layout
- Compact, centered design
- Logo section removed for cleaner look

## Prioritized Backlog

### P0 - Backend Implementation (Next Phase)
**Supabase Integration**:
- [ ] Get Transaction Pooler URI from user
- [ ] Install dependencies: sqlalchemy[asyncio], asyncpg, alembic, psycopg2-binary
- [ ] Create `/app/backend/database.py` with Supabase connection
- [ ] Create `/app/backend/models.py` with Waitlist model
- [ ] Setup Alembic migrations
- [ ] Create waitlist table in Supabase
- [ ] Create POST `/api/waitlist` endpoint to store emails
- [ ] Create GET `/api/waitlist/count` endpoint (optional - for display)
- [ ] Update frontend to use real API instead of mock
- [ ] Remove mock.js and localStorage logic
- [ ] Full testing with testing_agent_v3

### P1 - Enhanced Features
- [ ] Email confirmation/welcome email integration
- [ ] Waitlist position counter display
- [ ] Social media share buttons
- [ ] Admin panel to view waitlist entries
- [ ] Export waitlist to CSV functionality
- [ ] Duplicate email prevention with user feedback

### P2 - Polish & Marketing
- [ ] Launch countdown timer
- [ ] More detailed feature preview section
- [ ] FAQ section
- [ ] Social proof (waitlist count display)
- [ ] Newsletter signup integration
- [ ] Analytics tracking setup

## API Contracts

### POST /api/waitlist
**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Successfully joined waitlist",
  "email": "user@example.com",
  "created_at": "2025-12-XX..."
}
```

**Response (Error - Duplicate)**:
```json
{
  "success": false,
  "error": "Email already registered"
}
```

### GET /api/waitlist/count
**Response**:
```json
{
  "count": 42
}
```

## Mock Data Location
Currently using `/app/frontend/src/mock/waitlistMock.js` which stores emails in localStorage. This will be removed when backend is implemented.

## Next Tasks
1. **Get Supabase credentials from user** (Transaction Pooler URI)
2. **Backend implementation** with Supabase database
3. **Frontend-Backend integration** - replace mock with real API calls
4. **End-to-end testing** with testing_agent_v3
5. **Email duplicate handling** at database level

## Design Theme
Custom purple/dark color palette:
- Very dark blue-purple: #1A1347 (main background)
- Dark purple: #3C2D57 (cards, inputs)
- Medium purple: #694786 (buttons, muted elements)
- Vibrant purple: #5D479A (borders, accents)
- Light purple: #A486B0 (secondary text)
- Light pink: #F1B7EA (primary text, highlights, glows)
- Rounded corners (12px) for modern, friendly feel
- High contrast for readability
- Cosmic, premium aesthetic with glow effects
- Unique animated nebula background with flowing gradients and particles
