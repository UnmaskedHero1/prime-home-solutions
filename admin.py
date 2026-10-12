import io
import re
import secrets
import time
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import AdminSession, GalleryPhoto, SiteImage
from schemas import GalleryAddIn, GalleryPhotoOut, LoginIn, SlotOut, UseFileIn
from slots import SLOTS

router = APIRouter()

COOKIE = "prime_admin"
MAX_EDGE = 1800
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp"}
SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]+$")

_failures: list[float] = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _throttle() -> None:
    cutoff = time.monotonic() - 600
    while _failures and _failures[0] < cutoff:
        _failures.pop(0)
    if len(_failures) >= 10:
        raise HTTPException(status_code=429, detail="Too many attempts. Wait a few minutes.")


def _is_https(request: Request) -> bool:
    proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    return proto.split(",")[0].strip() == "https"


def require_admin(request: Request, db: Session = Depends(get_db)) -> AdminSession:
    token = request.cookies.get(COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Sign in first.")
    session = db.get(AdminSession, token)
    if not session or _aware(session.expires_at) < _now():
        if session:
            db.delete(session)
            db.commit()
        raise HTTPException(status_code=401, detail="Session expired. Sign in again.")
    return session


def _url_for(filename: str) -> str:
    return f"/images/{filename}"


def _slot_rows(db: Session) -> dict[str, SiteImage]:
    return {row.slot: row for row in db.query(SiteImage).all()}


def _check_slot(slot: str) -> None:
    if slot not in SLOTS:
        raise HTTPException(status_code=404, detail="Unknown image slot.")


def _images_dir():
    folder = settings.images_dir
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def _remove_if_unused(db: Session, filename: str) -> None:
    in_slot = db.query(SiteImage).filter(SiteImage.filename == filename).count()
    in_gallery = db.query(GalleryPhoto).filter(GalleryPhoto.filename == filename).count()
    if in_slot or in_gallery:
        return
    if not filename.startswith(("slot-", "gallery-")):
        return  # only clean up files the admin upload created
    path = _images_dir() / filename
    if path.is_file():
        path.unlink()


def _gallery_out(row: GalleryPhoto) -> GalleryPhotoOut:
    return GalleryPhotoOut(id=row.id, url=_url_for(row.filename), filename=row.filename, caption=row.caption)


def _gallery_rows(db: Session) -> list[GalleryPhoto]:
    return db.query(GalleryPhoto).order_by(GalleryPhoto.created_at.desc(), GalleryPhoto.id.desc()).all()


@router.get("/gallery")
def gallery(db: Session = Depends(get_db)):
    rows = _slot_rows(db)
    return {
        "slots": {slot: _url_for(row.filename) for slot, row in rows.items() if slot in SLOTS},
        "photos": [_gallery_out(row).model_dump() for row in _gallery_rows(db)],
    }


@router.post("/admin/login")
def login(payload: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    if not settings.admin_password:
        raise HTTPException(status_code=503, detail="Admin login is not set up. Set ADMIN_PASSWORD.")
    _throttle()
    if not secrets.compare_digest(payload.password.encode(), settings.admin_password.encode()):
        _failures.append(time.monotonic())
        raise HTTPException(status_code=401, detail="Wrong password.")

    token = secrets.token_urlsafe(48)
    expires = _now() + timedelta(days=settings.admin_session_days)
    db.add(AdminSession(token=token, expires_at=expires))
    db.query(AdminSession).filter(AdminSession.expires_at < _now()).delete()
    db.commit()

    response.set_cookie(
        COOKIE,
        token,
        max_age=settings.admin_session_days * 86400,
        httponly=True,
        samesite="lax",
        secure=_is_https(request),
        path="/",
    )
    return {"ok": True}


@router.post("/admin/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE)
    if token:
        session = db.get(AdminSession, token)
        if session:
            db.delete(session)
            db.commit()
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


@router.get("/admin/me")
def me(_: AdminSession = Depends(require_admin)):
    return {"ok": True}


@router.get("/admin/slots", response_model=list[SlotOut])
def list_slots(_: AdminSession = Depends(require_admin), db: Session = Depends(get_db)):
    rows = _slot_rows(db)
    out = []
    for slot, label in SLOTS.items():
        row = rows.get(slot)
        out.append(
            SlotOut(
                slot=slot,
                label=label,
                url=_url_for(row.filename) if row else None,
                filename=row.filename if row else None,
            )
        )
    return out


@router.get("/admin/files")
def list_files(_: AdminSession = Depends(require_admin)):
    folder = _images_dir()
    files = sorted(
        p.name for p in folder.iterdir() if p.is_file() and p.suffix.lower() in ALLOWED_EXT
    )
    return {"files": files}


def _read_upload(data: bytes) -> bytes:
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Keep uploads under {settings.max_upload_mb} MB.")
    if not data:
        raise HTTPException(status_code=400, detail="The file was empty.")
    return _process_upload(data)


def _existing_file(name: str) -> str:
    name = name.strip()
    if not SAFE_NAME.match(name) or not (_images_dir() / name).is_file():
        raise HTTPException(status_code=404, detail="That file is not in the images folder.")
    return name


def _process_upload(data: bytes) -> bytes:
    try:
        image = Image.open(io.BytesIO(data))
        image = ImageOps.exif_transpose(image)
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="That file is not an image we can read.") from None
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    image.thumbnail((MAX_EDGE, MAX_EDGE))
    out = io.BytesIO()
    image.save(out, format="JPEG", quality=84, optimize=True, progressive=True)
    return out.getvalue()


@router.put("/admin/images/{slot}", response_model=SlotOut)
async def upload_image(
    slot: str,
    file: UploadFile = File(...),
    _: AdminSession = Depends(require_admin),
    db: Session = Depends(get_db),
):
    _check_slot(slot)
    processed = _read_upload(await file.read())
    filename = f"slot-{slot}-{int(time.time())}.jpg"
    (_images_dir() / filename).write_bytes(processed)

    row = db.get(SiteImage, slot)
    old = row.filename if row else None
    if row:
        row.filename = filename
    else:
        db.add(SiteImage(slot=slot, filename=filename))
    db.commit()
    if old and old != filename:
        _remove_if_unused(db, old)

    return SlotOut(slot=slot, label=SLOTS[slot], url=_url_for(filename), filename=filename)


@router.post("/admin/images/{slot}/use", response_model=SlotOut)
def use_existing(
    slot: str,
    payload: UseFileIn,
    _: AdminSession = Depends(require_admin),
    db: Session = Depends(get_db),
):
    _check_slot(slot)
    name = _existing_file(payload.filename)

    row = db.get(SiteImage, slot)
    old = row.filename if row else None
    if row:
        row.filename = name
    else:
        db.add(SiteImage(slot=slot, filename=name))
    db.commit()
    if old and old != name:
        _remove_if_unused(db, old)

    return SlotOut(slot=slot, label=SLOTS[slot], url=_url_for(name), filename=name)


@router.delete("/admin/images/{slot}")
def clear_slot(slot: str, _: AdminSession = Depends(require_admin), db: Session = Depends(get_db)):
    _check_slot(slot)
    row = db.get(SiteImage, slot)
    if row:
        old = row.filename
        db.delete(row)
        db.commit()
        _remove_if_unused(db, old)
    return {"ok": True}


# --- Gallery-only photos -------------------------------------------------


@router.get("/admin/gallery", response_model=list[GalleryPhotoOut])
def list_gallery(_: AdminSession = Depends(require_admin), db: Session = Depends(get_db)):
    return [_gallery_out(row) for row in _gallery_rows(db)]


@router.post("/admin/gallery", response_model=GalleryPhotoOut)
async def upload_gallery(
    file: UploadFile = File(...),
    caption: str = Form(""),
    _: AdminSession = Depends(require_admin),
    db: Session = Depends(get_db),
):
    processed = _read_upload(await file.read())
    filename = f"gallery-{int(time.time() * 1000)}.jpg"
    (_images_dir() / filename).write_bytes(processed)

    row = GalleryPhoto(filename=filename, caption=caption.strip()[:160])
    db.add(row)
    db.commit()
    db.refresh(row)
    return _gallery_out(row)


@router.post("/admin/gallery/use", response_model=GalleryPhotoOut)
def add_gallery_existing(
    payload: GalleryAddIn,
    _: AdminSession = Depends(require_admin),
    db: Session = Depends(get_db),
):
    name = _existing_file(payload.filename)
    if db.query(GalleryPhoto).filter(GalleryPhoto.filename == name).count():
        raise HTTPException(status_code=409, detail="That file is already in the gallery.")
    row = GalleryPhoto(filename=name, caption=payload.caption.strip())
    db.add(row)
    db.commit()
    db.refresh(row)
    return _gallery_out(row)


@router.delete("/admin/gallery/{photo_id}")
def remove_gallery(photo_id: int, _: AdminSession = Depends(require_admin), db: Session = Depends(get_db)):
    row = db.get(GalleryPhoto, photo_id)
    if row:
        old = row.filename
        db.delete(row)
        db.commit()
        _remove_if_unused(db, old)
    return {"ok": True}
