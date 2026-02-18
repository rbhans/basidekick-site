# BAS Data API (Website Wrapper)

This project exposes a thin API wrapper around BAS Babel and BAS Atlas datasets.

## Endpoints
- `GET /api/meta`
- `GET /api/points/:id`
- `GET /api/equipment/:id`
- `GET /api/search?q=`
- `POST /api/normalize`
- `POST /api/validate`
- `GET /api/templates/:equipmentTypeId`

## Behavior
- In-memory resource cache with 5-minute TTL.
- ETag support for GET endpoints.
- Simple IP-based rate limiting for public endpoints.
- Source-of-truth data fetched from GitHub raw URLs with local fallback for core index files.

## Example
```bash
curl /api/meta
curl "/api/search?q=zone%20temp"
curl -X POST /api/normalize -H "content-type: application/json" -d '{"name":"AHU-1 SAT"}'
```
