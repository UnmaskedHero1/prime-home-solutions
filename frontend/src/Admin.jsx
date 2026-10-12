import { useEffect, useState } from "react";
import { business, defaultPhotos } from "./content.js";

function Placeholder({ text }) {
  return (
    <div className="photo-slot" role="img" aria-label={text}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M21 16l-5-5-8 8" />
      </svg>
      <span>{text}</span>
    </div>
  );
}

function FilePicker({ files, onPick, label = "Or use a file in the folder" }) {
  return (
    <label className="slot-pick">
      {label}
      <select value="" onChange={(event) => onPick(event.target.value)}>
        <option value="">Choose a file</option>
        {files.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data?.detail;
    throw new Error(typeof detail === "string" ? detail : "Something went wrong.");
  }
  return data;
}

export default function Admin() {
  const [signedIn, setSignedIn] = useState(null);

  useEffect(() => {
    document.title = `Admin · ${business.name}`;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    api("/api/admin/me")
      .then(() => setSignedIn(true))
      .catch(() => setSignedIn(false));
    return () => meta.remove();
  }, []);

  return (
    <div className="admin">
      <header className="admin-bar">
        <a className="admin-brand" href="/">
          {business.name}
        </a>
        <span>Site photos</span>
        {signedIn ? (
          <button
            className="btn btn-line"
            type="button"
            onClick={() => api("/api/admin/logout", { method: "POST" }).then(() => setSignedIn(false))}
          >
            Sign out
          </button>
        ) : null}
      </header>
      {signedIn === null ? <p className="admin-note">Loading…</p> : null}
      {signedIn === false ? <Login onSignedIn={() => setSignedIn(true)} /> : null}
      {signedIn ? <Photos /> : null}
    </div>
  );
}

function Photos() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  async function refreshFiles() {
    const fileList = await api("/api/admin/files");
    setFiles(fileList.files);
  }

  useEffect(() => {
    refreshFiles().catch((err) => setMessage(err.message));
  }, []);

  return (
    <main className="admin-main">
      <p className="admin-status" role="status" aria-live="polite">
        {message}
      </p>
      <Slots files={files} setMessage={setMessage} refreshFiles={refreshFiles} />
      <GalleryPhotos files={files} setMessage={setMessage} refreshFiles={refreshFiles} />
    </main>
  );
}

function Login({ onSignedIn }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      onSignedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-login" onSubmit={onSubmit}>
      <h1>Sign in</h1>
      <p className="admin-note">Enter the admin password to change the photos on the site.</p>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          autoFocus
          required
        />
      </label>
      <button className="btn btn-navy" type="submit" disabled={busy}>
        {busy ? "Checking…" : "Sign in"}
      </button>
      <p className="form-status is-error" role="status">
        {error}
      </p>
    </form>
  );
}

function Slots({ files, setMessage, refreshFiles }) {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    api("/api/admin/slots")
      .then(setSlots)
      .catch((err) => setMessage(err.message));
  }, [setMessage]);

  function replace(updated) {
    setSlots((current) => current.map((slot) => (slot.slot === updated.slot ? updated : slot)));
  }

  async function upload(slot, file) {
    if (!file) return;
    setMessage(`Uploading ${slot.label}…`);
    const body = new FormData();
    body.append("file", file);
    try {
      const updated = await api(`/api/admin/images/${slot.slot}`, { method: "PUT", body });
      replace(updated);
      setMessage(`Saved ${slot.label}.`);
      await refreshFiles();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function useFile(slot, filename) {
    if (!filename) return;
    try {
      const updated = await api(`/api/admin/images/${slot.slot}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      replace(updated);
      setMessage(`Set ${slot.label} to ${filename}.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function clear(slot) {
    try {
      await api(`/api/admin/images/${slot.slot}`, { method: "DELETE" });
      replace({ ...slot, url: null, filename: null });
      setMessage(
        defaultPhotos[slot.slot]
          ? `Cleared ${slot.label}. The site is back to the photo it shipped with.`
          : `Cleared ${slot.label}. The site shows a placeholder there now.`
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section className="admin-section">
      <h1>Photos on the site</h1>
      <p className="admin-note">
        Each card is one spot on the site and shows the photo that is live there right now. Upload a photo,
        or pick a file already in the images folder. Uploads are resized and saved in{" "}
        <code>databases/images</code>, which is on the persistent volume.
      </p>
      <div className="slot-grid">
        {slots.map((slot) => {
          const shown = slot.url || defaultPhotos[slot.slot] || null;
          const source = slot.url ? "Your upload" : shown ? "Photo the site shipped with" : null;
          return (
            <article className="slot-card" key={slot.slot}>
              <div className="slot-preview">
                {shown ? <img src={shown} alt="" /> : <Placeholder text="No photo for this yet" />}
                {source ? <span className="slot-badge">{source}</span> : null}
              </div>
              <h2>{slot.label}</h2>
              <p className="slot-file">{slot.filename || (shown ? "Default photo" : "Placeholder showing on the site")}</p>
              <label className="btn btn-navy slot-upload">
                {shown ? "Replace photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    upload(slot, event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              <FilePicker files={files} onPick={(name) => useFile(slot, name)} />
              {slot.url ? (
                <button className="slot-clear" type="button" onClick={() => clear(slot)}>
                  {defaultPhotos[slot.slot] ? "Go back to the original photo" : "Clear this spot"}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function GalleryPhotos({ files, setMessage, refreshFiles }) {
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    api("/api/admin/gallery")
      .then(setPhotos)
      .catch((err) => setMessage(err.message));
  }, [setMessage]);

  async function upload(fileList) {
    const chosen = Array.from(fileList || []);
    if (!chosen.length) return;
    for (const [index, file] of chosen.entries()) {
      setMessage(`Uploading gallery photo ${index + 1} of ${chosen.length}…`);
      const body = new FormData();
      body.append("file", file);
      body.append("caption", caption);
      try {
        const added = await api("/api/admin/gallery", { method: "POST", body });
        setPhotos((current) => [added, ...current]);
      } catch (err) {
        setMessage(err.message);
        return;
      }
    }
    setMessage(chosen.length === 1 ? "Added to the gallery." : `Added ${chosen.length} photos to the gallery.`);
    setCaption("");
    await refreshFiles();
  }

  async function useFile(filename) {
    if (!filename) return;
    try {
      const added = await api("/api/admin/gallery/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, caption }),
      });
      setPhotos((current) => [added, ...current]);
      setMessage(`Added ${filename} to the gallery.`);
      setCaption("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function remove(photo) {
    try {
      await api(`/api/admin/gallery/${photo.id}`, { method: "DELETE" });
      setPhotos((current) => current.filter((item) => item.id !== photo.id));
      setMessage("Removed from the gallery.");
      await refreshFiles();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <section className="admin-section">
      <h1>Gallery photos</h1>
      <p className="admin-note">
        The gallery on the site already shows every work photo above. Anything you add here shows in the
        gallery too, without being tied to a spot on the page.
      </p>
      <div className="gallery-add">
        <label className="gallery-caption">
          Caption (optional, applies to what you add next)
          <input
            type="text"
            maxLength={160}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Driveway wash in Ballantyne"
          />
        </label>
        <label className="btn btn-navy slot-upload">
          Upload gallery photos
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              upload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <FilePicker files={files} onPick={useFile} label="Or add a file from the folder" />
      </div>
      {photos.length ? (
        <div className="slot-grid">
          {photos.map((photo) => (
            <article className="slot-card" key={photo.id}>
              <div className="slot-preview">
                <img src={photo.url} alt="" />
              </div>
              <h2>{photo.caption || "Gallery photo"}</h2>
              <p className="slot-file">{photo.filename}</p>
              <button className="slot-clear" type="button" onClick={() => remove(photo)}>
                Remove from gallery
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-note">No extra gallery photos yet.</p>
      )}
    </section>
  );
}
