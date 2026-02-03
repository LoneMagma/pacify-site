# Admin Dashboard - Project Overview

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Portfolio Website                     │
│                  (pacify.site)                          │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │  Tracking Script (track.js)                │        │
│  │  - Page views                              │        │
│  │  - Project clicks                          │        │
│  │  - Flowchart interactions                  │        │
│  │  - CTA clicks                              │        │
│  │  - Scroll depth                            │        │
│  └─────────────────┬──────────────────────────┘        │
└────────────────────┼───────────────────────────────────┘
                     │
                     │ HTTP POST /api/track
                     │ (Passive, no cookies)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (FastAPI)                       │
│              Railway Deployment                          │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Public Endpoints:                       │           │
│  │  POST /api/track                         │           │
│  │  - Accepts analytics events              │           │
│  │  - Gets IP geolocation                   │           │
│  │  - Stores in PostgreSQL                  │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Auth Endpoints:                         │           │
│  │  POST /api/auth/login                    │           │
│  │  GET  /api/auth/verify                   │           │
│  │  - JWT token generation                  │           │
│  │  - bcrypt password hashing               │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Analytics Endpoints (Protected):        │           │
│  │  GET /api/analytics                      │           │
│  │  GET /api/analytics/live                 │           │
│  │  - Aggregates metrics                    │           │
│  │  - Generates insights                    │           │
│  └──────────────────────────────────────────┘           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Stores/Retrieves
                     ▼
┌─────────────────────────────────────────────────────────┐
│           PostgreSQL Database                            │
│           (Railway Managed)                             │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  events          │    │  admin_users     │          │
│  ├──────────────────┤    ├──────────────────┤          │
│  │  id              │    │  id              │          │
│  │  event_type      │    │  username        │          │
│  │  page_path       │    │  password_hash   │          │
│  │  project_name    │    │  created_at      │          │
│  │  referrer        │    └──────────────────┘          │
│  │  country         │                                   │
│  │  city            │                                   │
│  │  created_at      │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
                     │
                     │ HTTP GET /api/analytics
                     │ (Authenticated with JWT)
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Admin Dashboard Frontend                         │
│         (GitHub Pages / Vercel)                         │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Login Page                              │           │
│  │  - Username/password form                │           │
│  │  - JWT token storage                     │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Analytics Dashboard                     │           │
│  │  ┌────────────────────────────┐          │           │
│  │  │  Metrics Cards:            │          │           │
│  │  │  - Total views             │          │           │
│  │  │  - Today's views           │          │           │
│  │  │  - This week's views       │          │           │
│  │  │  - Average daily           │          │           │
│  │  └────────────────────────────┘          │           │
│  │                                           │           │
│  │  ┌────────────────────────────┐          │           │
│  │  │  Charts (Chart.js):        │          │           │
│  │  │  - Top projects (bar)      │          │           │
│  │  │  - Traffic sources (donut) │          │           │
│  │  └────────────────────────────┘          │           │
│  │                                           │           │
│  │  ┌────────────────────────────┐          │           │
│  │  │  Recent Activity Feed:     │          │           │
│  │  │  - Event type badges       │          │           │
│  │  │  - Location data           │          │           │
│  │  │  - Relative timestamps     │          │           │
│  │  └────────────────────────────┘          │           │
│  │                                           │           │
│  │  ┌────────────────────────────┐          │           │
│  │  │  Live Indicator:           │          │           │
│  │  │  - Visitors in last 5 min  │          │           │
│  │  │  - Auto-refresh (30s)      │          │           │
│  │  └────────────────────────────┘          │           │
│  └──────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Tracking Flow
```
User visits portfolio
  ↓
track.js loads
  ↓
Listens for events (click, scroll, etc.)
  ↓
Sends POST to /api/track
  ↓
Backend gets IP → queries ip-api.com for location
  ↓
Saves event to PostgreSQL
  ↓
Returns 200 OK
```

### 2. Authentication Flow
```
Admin opens dashboard
  ↓
Enters username/password
  ↓
POST /api/auth/login
  ↓
Backend checks AdminUser table
  ↓
Verifies bcrypt hash
  ↓
Generates JWT token (24h expiry)
  ↓
Returns token to client
  ↓
Client stores in localStorage
  ↓
All subsequent requests include: Authorization: Bearer <token>
```

### 3. Analytics Fetch Flow
```
Dashboard loads
  ↓
GET /api/analytics with JWT
  ↓
Backend verifies token
  ↓
Queries database:
  - COUNT(*) for total views
  - COUNT(*) WHERE created_at > today
  - COUNT(*) WHERE created_at > week_ago
  - GROUP BY project_name for top projects
  - GROUP BY referrer for traffic sources
  - ORDER BY created_at DESC LIMIT 20 for recent activity
  ↓
Aggregates data
  ↓
Returns JSON
  ↓
Dashboard updates UI
  ↓
Renders charts
  ↓
Auto-refresh after 30s
```

---

## Security Model

### Authentication
- **JWT tokens** with 24-hour expiration
- **bcrypt** password hashing (cost factor 12)
- **No session cookies** (stateless design)
- **Bearer token** in Authorization header

### Data Privacy
- **No personal data** collected
- **Anonymous IPs** (only country/city via geolocation)
- **No tracking cookies**
- **Minimal data retention** (events table only)

### CORS Protection
- **Whitelist** specific origins (pacify.site)
- **Credentials required** for admin endpoints
- **Public tracking endpoint** (POST only)

### Rate Limiting
- Implemented at application level (future enhancement)
- Database-side query limits
- Railway platform DDoS protection

---

## Database Schema

### events Table
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,    -- 'page_view', 'project_click', etc.
    page_path VARCHAR(255),             -- '/', '/projects', etc.
    project_name VARCHAR(100),          -- 'BurnLab', 'Pacify AI', etc.
    referrer VARCHAR(500),              -- 'https://google.com', etc.
    country VARCHAR(100),               -- 'United States'
    city VARCHAR(100),                  -- 'San Francisco'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_type ON events(event_type);
```

### admin_users Table
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Reference

### Public Endpoints

#### POST /api/track
Records an analytics event.

**Request:**
```json
{
  "event_type": "page_view",
  "page_path": "/",
  "project_name": null,
  "referrer": "https://google.com"
}
```

**Response:**
```json
{
  "status": "tracked"
}
```

### Auth Endpoints

#### POST /api/auth/login
Authenticates admin and returns JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### GET /api/auth/verify
Verifies JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "username": "admin"
}
```

### Analytics Endpoints (Protected)

#### GET /api/analytics
Returns comprehensive analytics data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_views": 1234,
  "views_today": 45,
  "views_this_week": 312,
  "top_projects": [
    {"name": "BurnLab", "clicks": 89},
    {"name": "Pacify AI", "clicks": 67}
  ],
  "traffic_sources": [
    {"source": "Direct", "count": 120},
    {"source": "Google", "count": 89}
  ],
  "recent_activity": [
    {
      "type": "page_view",
      "page": "/",
      "project": null,
      "location": "San Francisco, United States",
      "timestamp": "2026-02-03T10:30:00Z"
    }
  ]
}
```

#### GET /api/analytics/live
Returns count of visitors in last 5 minutes.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "live_visitors": 3
}
```

---

## Performance Considerations

### Backend
- **Async FastAPI** for high concurrency
- **Database indexes** on created_at and event_type
- **Connection pooling** via SQLAlchemy
- **Lightweight responses** (JSON only)

### Frontend
- **No frameworks** (vanilla JS, ~15KB)
- **Chart.js** lazy loaded
- **Auto-refresh** throttled to 30s
- **Responsive design** (mobile-first CSS)

### Database
- **PostgreSQL** for reliability
- **Indexed queries** for fast aggregation
- **Pagination** on activity feed (LIMIT 20)

---

## Monitoring & Maintenance

### Health Checks
- `GET /health` endpoint for uptime monitoring
- Railway auto-restarts on failures
- Database connection pooling handles transient errors

### Logs
- Railway provides built-in log viewer
- FastAPI request/response logging
- Error tracking with stack traces

### Backups
- Railway automated database backups (daily)
- Manual backups via `pg_dump`
- Export analytics data via SQL queries

---

## Future Enhancements

### Phase 2 (Content Management)
- Quick project status updater
- About section WYSIWYG editor
- Announcement banner manager
- Image uploader

### Phase 3 (Advanced Analytics)
- Session replay (privacy-safe)
- Heatmaps (click/scroll)
- Conversion funnels
- A/B testing framework

### Phase 4 (Growth Tools)
- Email capture widget
- Newsletter integration
- Contact form submissions
- Automated weekly reports

---

## Cost Breakdown

### Free Tier (Current)
- **Railway**: $5/month credit (sufficient for this app)
- **PostgreSQL**: Included with Railway
- **GitHub Pages**: Free static hosting
- **ip-api.com**: Free geolocation (45 req/min)

### Paid Tier (If Needed)
- **Railway Pro**: $20/month (higher limits)
- **Dedicated Database**: $10/month (better performance)
- **Custom Domain**: $0-15/year (optional)

**Total Cost**: $0-5/month for moderate traffic

---

## Development Notes

Built with same AI-assisted workflow as Pacify portfolio projects.

**Time Investment:**
- Backend: ~6 hours
- Frontend: ~6 hours
- Documentation: ~2 hours
- Testing & deployment: ~2 hours
- **Total: ~16 hours**

**Key Learnings:**
- FastAPI async patterns
- JWT authentication flows
- Chart.js customization
- Privacy-first analytics design
- Railway deployment workflow
