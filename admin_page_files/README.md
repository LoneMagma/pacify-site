# Pacify Admin Dashboard

Complete analytics and admin panel for your portfolio site. Track visitors, project engagement, traffic sources, and more.

## Features

**Core Analytics**
- Real-time visitor counter
- Page views (total, today, this week)
- Project click tracking
- Flowchart interaction metrics
- Traffic source breakdown
- Geographic visitor data

**Admin Panel**
- Secure JWT authentication
- Interactive charts (Chart.js)
- Recent activity feed
- Auto-refresh every 30 seconds
- Mobile responsive design

**Privacy-First**
- No cookies or personal data collection
- Anonymous IP addresses
- Minimal tracking footprint

---

## Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL database
- Node.js (for local testing, optional)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your values
# Set DATABASE_URL, JWT_SECRET_KEY, ADMIN_USERNAME, ADMIN_PASSWORD
```

### 2. Initialize Database

```bash
# Create tables
python database.py

# Create admin user
python database.py your_username your_secure_password
```

### 3. Run Backend Locally

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### 4. Frontend Setup

1. Open `frontend/admin.html`
2. Edit `admin.js` and replace `YOUR_BACKEND_URL` with your backend URL
3. Open `admin.html` in browser or serve with any web server

---

## Deployment Guide

### Option 1: Railway (Recommended)

**Backend Deployment:**

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Select your repository
5. Add PostgreSQL database (Railway will auto-provision)
6. Set environment variables:
   ```
   JWT_SECRET_KEY=your-super-secret-key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=YourSecurePassword123!
   ```
7. Railway will auto-detect `requirements.txt` and deploy
8. Note your deployment URL (e.g., `https://your-app.railway.app`)

**Database Initialization:**

```bash
# SSH into Railway container or use local psql
railway run python database.py admin YourPassword
```

**Frontend Deployment:**

1. Edit `frontend/admin.js`:
   ```javascript
   const API_BASE = 'https://your-app.railway.app';
   ```

2. Deploy to GitHub Pages:
   - Push frontend files to `gh-pages` branch
   - Access at `https://yourusername.github.io/admin.html`

3. Or deploy to Vercel/Netlify (drag and drop `frontend/` folder)

### Option 2: Render

Similar to Railway but requires `render.yaml`:

```yaml
services:
  - type: web
    name: pacify-admin
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: pacify-db
          property: connectionString
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: ADMIN_USERNAME
        value: admin
      - key: ADMIN_PASSWORD
        sync: false

databases:
  - name: pacify-db
    databaseName: pacify_admin
    user: pacify_user
```

---

## Integration with Portfolio

### Add Tracking Script

Add this to your `index.html` before closing `</body>`:

```html
<!-- Analytics Tracking -->
<script src="tracking/track.js"></script>
```

### Configure Tracking Script

Edit `tracking/track.js`:

```javascript
const API_ENDPOINT = 'https://your-app.railway.app/api/track';
const ENABLED = true;
```

That's it! Your portfolio will now send analytics to your backend.

---

## Usage

### Accessing Admin Dashboard

1. Navigate to your admin page URL
2. Login with username/password you set
3. View real-time analytics

### Security Best Practices

1. **Change default credentials immediately**
2. **Use strong JWT secret** (generate with `openssl rand -hex 32`)
3. **Enable HTTPS** (Railway/Render provide this automatically)
4. **Don't commit `.env` file** (already in `.gitignore`)
5. **Rotate passwords regularly**

---

## API Endpoints

### Public Endpoints

```
POST /api/track
- Records analytics event
- No authentication required
- Used by tracking script
```

### Protected Endpoints (Require JWT)

```
POST /api/auth/login
- Returns JWT token
- Body: { username, password }

GET /api/auth/verify
- Validates JWT token
- Header: Authorization: Bearer <token>

GET /api/analytics
- Returns comprehensive analytics
- Header: Authorization: Bearer <token>

GET /api/analytics/live
- Returns live visitor count
- Header: Authorization: Bearer <token>
```

---

## Customization

### Add New Event Types

**1. Update tracking script:**

```javascript
// In track.js
track('custom_event', { project_name: 'Your Data' });
```

**2. Handle in backend** (already generic, no changes needed)

**3. Update frontend display:**

```javascript
// In admin.js formatEventType()
const types = {
    'custom_event': 'Custom Event',
    // ... existing types
};
```

### Modify Chart Colors

Edit `admin.js`:

```javascript
// Line ~200
backgroundColor: '#YOUR_COLOR',
borderColor: '#YOUR_BORDER_COLOR',
```

### Add More Metrics

1. Create SQL query in `main.py` analytics endpoint
2. Add to `AnalyticsResponse` model
3. Display in `admin.html` metrics grid
4. Update `admin.js` to fetch and display

---

## Troubleshooting

### Backend won't start

- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check Python version (3.9+ required)

### CORS errors in browser

- Verify `allow_origins` in `main.py` includes your frontend URL
- Check browser console for exact error

### No data showing

- Verify tracking script is loaded (check browser Network tab)
- Check backend logs for incoming `/api/track` requests
- Verify database has entries: `SELECT * FROM events LIMIT 10;`

### Charts not rendering

- Check browser console for errors
- Verify Chart.js CDN is loading
- Ensure canvas elements have IDs

---

## Development

### Local Development Setup

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (in another terminal)
cd frontend
python -m http.server 8080
# Open http://localhost:8080/admin.html
```

### Database Migrations

Currently using SQLAlchemy auto-creation. For production:

1. Use Alembic for migrations
2. Version control schema changes
3. Add `alembic init` and migration scripts

---

## Tech Stack

**Backend:**
- FastAPI (async Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL (database)
- JWT + bcrypt (authentication)
- httpx (IP geolocation)

**Frontend:**
- Vanilla JavaScript (no frameworks)
- Chart.js (visualizations)
- CSS Grid/Flexbox (responsive layout)

**Deployment:**
- Railway/Render (backend + DB)
- GitHub Pages/Vercel (frontend)

---

## Roadmap

**Phase 2 - Content Management:**
- Quick project status updater
- About section editor
- Announcement banner manager

**Phase 3 - Advanced Analytics:**
- Heatmaps
- Session recordings (privacy-safe)
- Funnel analysis
- A/B testing

**Phase 4 - Growth Tools:**
- Email capture widget
- Contact form submissions
- Automated reports via email

---

## License

MIT License - Use freely for your own portfolio

## Support

Open an issue on GitHub or reach out via your contact methods.

---

**Built with the same AI-assisted approach as your portfolio projects.**
