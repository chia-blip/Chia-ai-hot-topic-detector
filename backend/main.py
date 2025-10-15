from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pytrends.request import TrendReq
import json
import schedule
import time
import threading

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

DB_FILE = "db.json"

def fetch_and_save_trends():
    print("Fetching trending topics from Google Trends...")
    try:
        pytrends = TrendReq(hl='en-US', tz=360)
        trending_searches_df = pytrends.trending_searches(pn='united_states')
        
        # Convert dataframe to a list of dictionaries
        trends = []
        for i, row in trending_searches_df.iterrows():
            trends.append({
                "rank": i + 1,
                "title": row[0],
            })

        # Save to db.json
        with open(DB_FILE, "w") as f:
            json.dump(trends, f, indent=2)
        print(f"Successfully saved {len(trends)} trending topics to {DB_FILE}")

    except Exception as e:
        print(f"An error occurred while fetching trends: {e}")

def run_scheduler():
    # Schedule the job every 8 hours
    schedule.every(8).hours.do(fetch_and_save_trends)
    print("Scheduler started. Will run every 8 hours.")
    while True:
        schedule.run_pending()
        time.sleep(1)

@app.on_event("startup")
def startup_event():
    # Fetch trends once on startup
    fetch_and_save_trends()
    
    # Run the scheduler in a background thread
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()

@app.get("/")
def read_root():
    return {"message": "Hot Topic Detector API is running."}

@app.get("/api/trends")
def get_trends():
    try:
        with open(DB_FILE, "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        return {"error": "Database file not found. Please run the scraper first."}
    except json.JSONDecodeError:
        return {"error": "Database is empty or corrupted."}