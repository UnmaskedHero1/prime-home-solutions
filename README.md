# Prime Home Solutions LLC

React site in `frontend/`. Python API at the project root. SQLite lives in `databases/` so Coolify can keep it on a persistent volume.

## Local

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

```powershell
cd frontend
npm install
npm run dev
```

- Site: http://localhost:5173
- Health: http://127.0.0.1:8000/api/health
- API docs: http://127.0.0.1:8000/docs

Copy `.env.example` to `.env` if you want to change the database folder or CORS origins.

## Photos

Image spots are placeholders until real pictures are added. Drop files into `frontend/public/photos/` and set the paths in `frontend/src/content.js` (`pressureWashing` before/after, `lighting` items).

## Hidden page

`/landscaping` is a landscaping page for homes. Nothing links to it and it is marked `noindex`. Share the URL directly if that service is confirmed.

## Coolify

- Build pack: Nixpacks (`nixpacks.toml`)
- Port: `8000`, or whatever `PORT` Coolify sets
- Health check: `/api/health`
- Persistent storage: mount a volume at `/app/databases`

On startup the API creates `databases/prime.db`. Without that volume, leads are wiped on every redeploy.

`DATABASE_DIR` overrides the folder. Leave it unset on Coolify when the volume is mounted at `/app/databases`.
