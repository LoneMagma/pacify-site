"""
Admin Dashboard Backend - FastAPI
Analytics tracking and admin authentication for Pacify Portfolio
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import httpx
from database import get_db, Event, AdminUser
from auth import hash_password, verify_password, create_access_token, verify_token

app = FastAPI(title="Pacify Admin API", version="1.0.0")

# CORS - Allow your portfolio domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pacify.site",
        "http://localhost:3000",
        "http://127.0.0.1:5500"  # Live Server during development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# --- Pydantic Models ---

class TrackingEvent(BaseModel):
    event_type: str  # 'page_view', 'project_click', 'flowchart_open', etc.
    page_path: Optional[str] = None
    project_name: Optional[str] = None
    referrer: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AnalyticsResponse(BaseModel):
    total_views: int
    views_today: int
    views_this_week: int
    top_projects: List[dict]
    traffic_sources: List[dict]
    recent_activity: List[dict]

# --- IP Geolocation Helper ---

async def get_location_from_ip(ip: str) -> tuple:
    """Get country and city from IP using ip-api.com (free, no key needed)"""
    if ip in ["127.0.0.1", "localhost", "::1"]:
        return "Local", "Development"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://ip-api.com/json/{ip}")
            data = response.json()
            if data.get("status") == "success":
                return data.get("country", "Unknown"), data.get("city", "Unknown")
    except:
        pass
    
    return "Unknown", "Unknown"

# --- Authentication Endpoints ---

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db = Depends(get_db)):
    """Admin login - returns JWT token"""
    user = db.query(AdminUser).filter(AdminUser.username == credentials.username).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.username})
    return LoginResponse(access_token=token)

@app.get("/api/auth/verify")
async def verify_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token validity"""
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"valid": True, "username": token_data["sub"]}

# --- Tracking Endpoint (Public) ---

@app.post("/api/track")
async def track_event(
    event: TrackingEvent,
    x_forwarded_for: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Record analytics event from portfolio site"""
    
    # Get IP address (check proxy headers first)
    ip = x_forwarded_for.split(",")[0] if x_forwarded_for else "127.0.0.1"
    
    # Get location
    country, city = await get_location_from_ip(ip)
    
    # Save event
    new_event = Event(
        event_type=event.event_type,
        page_path=event.page_path,
        project_name=event.project_name,
        referrer=event.referrer,
        country=country,
        city=city
    )
    db.add(new_event)
    db.commit()
    
    return {"status": "tracked"}

# --- Analytics Endpoints (Protected) ---

@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
):
    """Get comprehensive analytics data"""
    
    # Verify admin
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_start = today_start - timedelta(days=7)
    
    # Total views
    total_views = db.query(Event).filter(Event.event_type == "page_view").count()
    
    # Views today
    views_today = db.query(Event).filter(
        Event.event_type == "page_view",
        Event.created_at >= today_start
    ).count()
    
    # Views this week
    views_this_week = db.query(Event).filter(
        Event.event_type == "page_view",
        Event.created_at >= week_start
    ).count()
    
    # Top projects (by clicks)
    project_clicks = db.query(
        Event.project_name,
        db.func.count(Event.id).label("clicks")
    ).filter(
        Event.event_type == "project_click",
        Event.project_name.isnot(None)
    ).group_by(Event.project_name).order_by(db.desc("clicks")).limit(5).all()
    
    top_projects = [
        {"name": name, "clicks": clicks} 
        for name, clicks in project_clicks
    ]
    
    # Traffic sources
    sources = db.query(
        Event.referrer,
        db.func.count(Event.id).label("count")
    ).filter(
        Event.event_type == "page_view",
        Event.created_at >= week_start
    ).group_by(Event.referrer).order_by(db.desc("count")).limit(10).all()
    
    traffic_sources = []
    for referrer, count in sources:
        if not referrer or referrer == "":
            source = "Direct"
        elif "google" in referrer.lower():
            source = "Google"
        elif "github" in referrer.lower():
            source = "GitHub"
        elif "instagram" in referrer.lower():
            source = "Instagram"
        else:
            source = referrer[:50]  # Truncate long URLs
        
        traffic_sources.append({"source": source, "count": count})
    
    # Recent activity (last 20 events)
    recent = db.query(Event).order_by(Event.created_at.desc()).limit(20).all()
    
    recent_activity = [
        {
            "type": event.event_type,
            "page": event.page_path,
            "project": event.project_name,
            "location": f"{event.city}, {event.country}" if event.city != "Unknown" else event.country,
            "timestamp": event.created_at.isoformat()
        }
        for event in recent
    ]
    
    return AnalyticsResponse(
        total_views=total_views,
        views_today=views_today,
        views_this_week=views_this_week,
        top_projects=top_projects,
        traffic_sources=traffic_sources,
        recent_activity=recent_activity
    )

@app.get("/api/analytics/live")
async def get_live_count(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
):
    """Get count of visitors in last 5 minutes (live indicator)"""
    
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    five_min_ago = datetime.utcnow() - timedelta(minutes=5)
    
    # Count unique sessions (rough estimate using distinct pages visited)
    live_count = db.query(Event.page_path).filter(
        Event.created_at >= five_min_ago
    ).distinct().count()
    
    return {"live_visitors": live_count}

# --- Health Check ---

@app.get("/")
async def root():
    return {
        "service": "Pacify Admin API",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
