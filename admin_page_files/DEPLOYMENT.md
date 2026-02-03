# Quick Deployment Checklist

## Pre-Deployment

- [ ] Generate strong JWT secret: `openssl rand -hex 32`
- [ ] Choose strong admin password (12+ characters)
- [ ] Have GitHub account ready
- [ ] Have Railway/Render account ready

---

## Backend Deployment (Railway - 15 minutes)

1. **Prepare Code**
   - [ ] Push backend code to GitHub repository
   - [ ] Ensure `.env` is in `.gitignore` (it is by default)

2. **Deploy to Railway**
   - [ ] Go to railway.app and sign in
   - [ ] Click "New Project" → "Deploy from GitHub"
   - [ ] Select your repository
   - [ ] Railway auto-detects Python and installs dependencies

3. **Add Database**
   - [ ] In project dashboard, click "New" → "Database" → "PostgreSQL"
   - [ ] Railway auto-creates `DATABASE_URL` environment variable

4. **Set Environment Variables**
   - [ ] Click "Variables" tab
   - [ ] Add `JWT_SECRET_KEY` = your generated secret
   - [ ] Add `ADMIN_USERNAME` = your chosen username
   - [ ] Add `ADMIN_PASSWORD` = your chosen password

5. **Initialize Database**
   - [ ] Wait for deployment to complete
   - [ ] Go to "Settings" → "Deploy Trigger" → trigger manual deploy
   - [ ] OR use Railway CLI: `railway run python database.py admin password`

6. **Get Backend URL**
   - [ ] Copy deployment URL (e.g., `https://pacify-admin.railway.app`)
   - [ ] Test: Visit `https://your-url.railway.app/health`
   - [ ] Should return: `{"status": "healthy"}`

---

## Frontend Deployment (GitHub Pages - 5 minutes)

1. **Update API URL**
   - [ ] Edit `frontend/admin.js`
   - [ ] Replace `YOUR_BACKEND_URL` with Railway URL
   ```javascript
   const API_BASE = 'https://your-app.railway.app';
   ```

2. **Deploy to GitHub Pages**
   - [ ] Create `gh-pages` branch
   - [ ] Copy frontend files to branch
   - [ ] Push to GitHub
   ```bash
   git checkout -b gh-pages
   git add frontend/*
   git commit -m "Deploy admin dashboard"
   git push origin gh-pages
   ```

3. **Enable GitHub Pages**
   - [ ] Go to repo Settings → Pages
   - [ ] Source: Deploy from branch `gh-pages`
   - [ ] Save and wait ~2 minutes

4. **Access Dashboard**
   - [ ] Visit `https://yourusername.github.io/admin.html`
   - [ ] Login with your credentials

---

## Portfolio Integration (2 minutes)

1. **Update Tracking Script**
   - [ ] Edit `tracking/track.js`
   - [ ] Replace `YOUR_BACKEND_URL` with Railway URL
   ```javascript
   const API_ENDPOINT = 'https://your-app.railway.app/api/track';
   ```

2. **Add to Portfolio**
   - [ ] Copy `tracking/track.js` to your portfolio site
   - [ ] Add before closing `</body>` in `index.html`:
   ```html
   <script src="track.js"></script>
   ```

3. **Test Tracking**
   - [ ] Open your portfolio in browser
   - [ ] Check browser console for: `📊 Analytics Active`
   - [ ] Visit admin dashboard
   - [ ] Verify new page view appears in Recent Activity

---

## Verification Steps

- [ ] Backend health check returns 200: `curl https://your-url.railway.app/health`
- [ ] Login works at admin dashboard
- [ ] Dashboard shows metrics (may be zero initially)
- [ ] Visit portfolio and see event in admin Recent Activity
- [ ] Charts render without errors
- [ ] Live visitor counter updates

---

## Post-Deployment

- [ ] Bookmark admin dashboard URL
- [ ] Save credentials in password manager
- [ ] Test from different device
- [ ] Check mobile responsiveness
- [ ] Monitor for 24 hours

---

## Common Issues

**"Invalid credentials" on login**
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Railway variables
- Re-run database initialization: `railway run python database.py admin newpassword`

**CORS errors in browser**
- Verify `allow_origins` in `main.py` includes your GitHub Pages URL
- Redeploy backend after fixing

**No tracking data appearing**
- Check browser Network tab for failed requests to `/api/track`
- Verify tracking script URL is correct
- Check Railway logs for errors

**Charts not loading**
- Verify Chart.js CDN is accessible
- Check browser console for JavaScript errors
- Try hard refresh (Ctrl+Shift+R)

---

## Next Steps

Once everything works:

1. Visit your portfolio a few times to generate sample data
2. Check admin dashboard to see metrics populate
3. Share portfolio link to start collecting real analytics
4. Monitor daily for the first week
5. Plan Phase 2 features (content management)

---

**Estimated Total Time: 25-30 minutes**

Good luck with deployment!
