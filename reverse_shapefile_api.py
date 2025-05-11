import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Added for CORS
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import geopandas
import pandas as pd
from shapely.geometry import Point
import os
import glob
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Configuration ---
SHAPEFILES_DIR = "C:\\repos\\crisis-resource-guardian\\public\\files"
FILENAME_PATTERN = re.compile(r"gminy_JPT_NAZWA__(.+)\.shp", re.IGNORECASE)

# --- Pydantic Models ---
class Coordinate(BaseModel):
    lat: float
    lon: float

class CommuneResponseItem(BaseModel):
    input_coordinate: Coordinate
    commune_name: Optional[str] = None
    status: str # e.g., "found", "not_found", "error_no_shapefiles_loaded"

# --- FastAPI Application ---
app = FastAPI(
    title="Reverse Geocoding API for Communes",
    description="This API takes latitude and longitude and returns the commune name.",
    version="1.0.0"
)

# --- CORS Middleware ---
# Define the origins that are allowed to make requests.
# You should restrict this to your frontend's actual origin in production.
origins = [
    "http://localhost:8080", # Your frontend origin
    "http://127.0.0.1:8080", # Another common local origin
    # Add any other origins your frontend might be served from
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows specific origins
    # allow_origins=["*"], # Or, allow all origins (less secure, use for dev only if needed)
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"]  # Allows all headers
)

# --- Global Data Store for Optimized Approach ---
master_gdf: Optional[geopandas.GeoDataFrame] = None
master_gdf_crs: Optional[Any] = None
loaded_geodata_fallback: Dict[str, geopandas.GeoDataFrame] = {}

# --- Helper function to extract commune name ---
def extract_commune_name_from_filename(filename: str) -> Optional[str]:
    match = FILENAME_PATTERN.search(os.path.basename(filename))
    if match:
        return match.group(1).replace('_', ' ')
    return None

# --- Startup Event ---
@app.on_event("startup")
async def load_shapefiles_on_startup():
    logger.info(f"FastAPI application startup: Scanning for shapefiles in {SHAPEFILES_DIR}")
    global master_gdf, master_gdf_crs, loaded_geodata_fallback

    if not os.path.isdir(SHAPEFILES_DIR):
        logger.error(f"Shapefiles directory not found: {SHAPEFILES_DIR}. API will not load data.")
        return

    shapefile_paths = glob.glob(os.path.join(SHAPEFILES_DIR, "gminy_JPT_NAZWA__*.shp"))
    
    if not shapefile_paths:
        logger.warning(f"No shapefiles found matching the pattern in {SHAPEFILES_DIR}")
        return

    logger.info(f"Found {len(shapefile_paths)} shapefiles to process.")
    
    all_gdfs_for_master = []
    target_crs_for_master = None
    successfully_loaded_for_master_count = 0

    for shp_path in shapefile_paths:
        commune_name = extract_commune_name_from_filename(shp_path)
        if not commune_name:
            logger.warning(f"Could not extract commune name from filename: {shp_path}")
            continue
        
        try:
            gdf = geopandas.read_file(shp_path)
            if gdf.empty or 'geometry' not in gdf.columns:
                logger.warning(f"Skipping {shp_path} for {commune_name}: GDF empty or no geometry column.")
                continue

            if gdf.crs is None:
                logger.warning(f"Skipping {shp_path} for {commune_name}: CRS is undefined. Cannot include in master GDF.")
                loaded_geodata_fallback[commune_name] = gdf
                continue
            
            if target_crs_for_master is None:
                target_crs_for_master = gdf.crs
                logger.info(f"Target CRS for master GDF set to: {target_crs_for_master} (from {commune_name})")

            if gdf.crs != target_crs_for_master:
                logger.info(f"Transforming {commune_name} from {gdf.crs} to {target_crs_for_master}")
                try:
                    gdf = gdf.to_crs(target_crs_for_master)
                except Exception as e_crs:
                    logger.error(f"Failed to transform {commune_name} ({shp_path}) to {target_crs_for_master}: {e_crs}. Skipping for master GDF.")
                    loaded_geodata_fallback[commune_name] = gdf
                    continue
            
            gdf['commune_name'] = commune_name
            all_gdfs_for_master.append(gdf)
            successfully_loaded_for_master_count += 1
            logger.info(f"Successfully processed for master GDF: {commune_name} (CRS: {gdf.crs})")
            loaded_geodata_fallback[commune_name] = gdf

        except Exception as e:
            logger.error(f"Error loading or processing shapefile {shp_path} for commune {commune_name}: {e}")

    if all_gdfs_for_master and target_crs_for_master is not None:
        logger.info(f"Concatenating {len(all_gdfs_for_master)} GeoDataFrames into a master GDF.")
        try:
            master_gdf = pd.concat(all_gdfs_for_master, ignore_index=True)
            master_gdf_crs = target_crs_for_master
            logger.info(f"Master GDF created with {len(master_gdf)} geometries. CRS: {master_gdf_crs}")
            logger.info("Building spatial index on master GDF...")
            _ = master_gdf.sindex
            logger.info("Spatial index for master GDF is ready.")
        except Exception as e_concat:
            logger.error(f"Failed to concatenate GDFs or build spatial index: {e_concat}. Will use fallback method.")
            master_gdf = None
    else:
        logger.warning("No suitable GeoDataFrames were processed to create a master GDF. Fallback method will be used.")

    if master_gdf is None:
        logger.info(f"Master GDF not created/available. Fallback will use {len(loaded_geodata_fallback)} individually loaded GDFs.")

# --- API Endpoint ---
@app.post("/find_communes/", response_model=List[CommuneResponseItem])
async def find_communes_for_coordinates(coordinates: List[Coordinate]):
    results: List[CommuneResponseItem] = []

    if master_gdf is not None and master_gdf_crs is not None:
        logger.info("Using optimized path with master_gdf and spatial index.")
        for coord in coordinates:
            shapely_point_wgs84 = Point(coord.lon, coord.lat)
            found_commune_name: Optional[str] = None
            try:
                point_gs_wgs84 = geopandas.GeoSeries([shapely_point_wgs84], crs="EPSG:4326")
                transformed_point_gs = point_gs_wgs84.to_crs(master_gdf_crs)
                transformed_shapely_point = transformed_point_gs.iloc[0]

                possible_matches_indices = master_gdf.sindex.query(transformed_shapely_point, predicate='intersects')

                for idx in possible_matches_indices:
                    candidate_geometry = master_gdf.geometry.iloc[idx]
                    if candidate_geometry.contains(transformed_shapely_point):
                        found_commune_name = master_gdf['commune_name'].iloc[idx]
                        logger.info(f"Point ({coord.lat}, {coord.lon}) found in {found_commune_name} (Optimized Path)")
                        break
            except Exception as e:
                logger.error(f"Error during optimized search for point ({coord.lon},{coord.lat}): {e}")

            results.append(CommuneResponseItem(
                input_coordinate=coord,
                commune_name=found_commune_name,
                status="found" if found_commune_name else "not_found"
            ))
    else:
        logger.warning("Master GDF not available. Using fallback (slower) method.")
        if not loaded_geodata_fallback:
            logger.warning("Fallback: No shapefiles loaded at all.")
            for coord in coordinates:
                results.append(CommuneResponseItem(input_coordinate=coord, status="error_no_shapefiles_loaded"))
            return results

        for coord in coordinates:
            shapely_point_wgs84 = Point(coord.lon, coord.lat)
            found_commune_name_fallback: Optional[str] = None
            for commune_name, gdf in loaded_geodata_fallback.items():
                try:
                    if gdf.crs is None:
                        logger.warning(f"Fallback: Skipping {commune_name}, CRS is None.")
                        continue
                    point_gs_wgs84 = geopandas.GeoSeries([shapely_point_wgs84], crs="EPSG:4326")
                    transformed_point_gs = point_gs_wgs84.to_crs(gdf.crs)
                    transformed_shapely_point = transformed_point_gs.iloc[0]
                    if gdf.contains(transformed_shapely_point).any():
                        found_commune_name_fallback = commune_name
                        logger.info(f"Point ({coord.lat}, {coord.lon}) found in {commune_name} (Fallback Path)")
                        break
                except Exception as e:
                    logger.error(f"Fallback: Error for {commune_name}, point ({coord.lon},{coord.lat}): {e}")
            
            results.append(CommuneResponseItem(
                input_coordinate=coord,
                commune_name=found_commune_name_fallback,
                status="found" if found_commune_name_fallback else "not_found"
            ))
            
    return results

# --- Main Block to Run the Server ---
if __name__ == "__main__":
    if not os.path.isdir(SHAPEFILES_DIR):
        logger.error(f"Critical: Shapefiles directory '{SHAPEFILES_DIR}' does not exist. The application will not be able to load data.")

    logger.info(f"Starting Uvicorn server. Shapefiles will be loaded from: {SHAPEFILES_DIR}")
    uvicorn.run(app, host="127.0.0.1", port=8000)

