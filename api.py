from fastapi import FastAPI
import psycopg2
import json

app = FastAPI()

# database
conn = psycopg2.connect(
    dbname="canicannabis",
    user="postgres",
    password="1234", 
    host="localhost"
)
cur = conn.cursor()

# =========================
# red zone
# =========================
@app.get("/zones/red")
def red_zones():
    cur.execute("SELECT ST_AsGeoJSON(geom), zone_color, restriction FROM red_small;")
    rows = cur.fetchall()
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"color": row[1], "restriction": row[2]},
                "geometry": json.loads(row[0])
            }
            for row in rows
        ]
    }

# =========================
# blue zone
# =========================
@app.get("/zones/blue")
def blue_zones():
    cur.execute("SELECT ST_AsGeoJSON(geom), zone_color, restriction FROM blue_small;")
    rows = cur.fetchall()
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"color": row[1], "restriction": row[2]},
                "geometry": json.loads(row[0])
            }
            for row in rows
        ]
    }

# test endpoint
@app.get("/")
def home():
    return {"status": "Backend is running!"}

 
 
 

