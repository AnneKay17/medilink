"""Make a browser-sized projection of the user-provided facility export.

Run with: python3 scripts/prepare-facilities.py /path/to/health_facilities_enriched_2026-09-29.json
The source file stays outside the app; no service claims are inferred.
"""

import json
import sys
from pathlib import Path

# Broad screening bounds. A flag asks for review; passing does not verify a location.
PROVINCE_BOUNDS = {
    "Western Cape": (-35.5, -29.5, 16.5, 26),
    "Northern Cape": (-34, -25, 16, 27),
    "Eastern Cape": (-35, -28.5, 21, 31),
    "KwaZulu-Natal": (-32, -25.5, 27.5, 34),
    "Gauteng": (-27, -24.5, 26, 30),
    "Limpopo": (-26, -21.5, 25.5, 33),
    "Mpumalanga": (-27.6, -23.5, 27.5, 33),
    "North West": (-28.3, -23.5, 21.5, 29.5),
    "Free State": (-31.5, -25.7, 22.5, 31),
}


def main():
    source = Path(sys.argv[1])
    data = json.loads(source.read_text())
    facilities = []
    for row in data["facilities"]:
        identity = row["identity"]
        coords = identity["coordinates"]
        def coordinate(value):
            return value.get("parsedValue") if isinstance(value, dict) else value
        lat, lng = coordinate(coords["latitude"]), coordinate(coords["longitude"])
        min_lat, max_lat, min_lng, max_lng = PROVINCE_BOUNDS[identity["province"]]
        coordinate_caution = not (min_lat <= lat <= max_lat and min_lng <= lng <= max_lng)
        facilities.append({
            "id": row["id"],
            "name": identity["name"],
            "type": identity["facility_type"],
            "province": identity["province"],
            "district": identity["health_district"],
            "locality": identity["locality"],
            "address": identity["address"],
            "lat": lat,
            "lng": lng,
            "coordinateCaution": coordinate_caution,
            "serviceStatus": row["services"]["verification_status"],
            "services": [{
                "name": item["name"],
                "category": item["category"],
                "availability": item["availability"],
                "note": item["notes"],
                "sources": [{"url": evidence["url"], "publisher": evidence["publisher"]}
                            for evidence in item.get("evidence", [])],
            } for item in row["services"]["items"]],
        })
    output = {
        "generatedOn": data["generated_on"],
        "facilityCount": len(facilities),
        "coordinateCautionCount": sum(row["coordinateCaution"] for row in facilities),
        "sourceNote": data["source_dataset"]["provenance"],
        "facilities": facilities,
    }
    destination = Path(__file__).resolve().parents[1] / "public" / "facilities.json"
    destination.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")))
    print(f"Wrote {len(facilities)} facilities to {destination} ({destination.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
