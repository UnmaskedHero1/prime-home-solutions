import { useEffect, useState } from "react";
import { business } from "./content.js";

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
      {signedIn ? <Slots /> : null}
    </div>
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

function Slots() {
  const [slots, setSlots] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [slotList, fileList] = await Promise.all([api("/api/admin/slots"), api("/api/admin/files")]);
    setSlots(slotList);
    setFiles(fileList.files);
  }

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

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
      const fileList = await api("/api/admin/files");
      setFiles(fileList.files);
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
      setMessage(`Cleared ${slot.label}. The site shows its default or a placeholder.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <main className="admin-main">
      <h1>Photos</h1>
      <p className="admin-note">
        Upload a photo for each spot, or pick a file already in the images folder. Uploads are resized and
        saved in <code>databases/images</code>, which is on the persistent volume.
      </p>
      <p className="admin-status" role="status" aria-live="polite">
        {message}
      </p>
      <div className="slot-grid">
        {slots.map((slot) => (
          <article className="slot-card" key={slot.slot}>
            <div className="slot-preview">
              {slot.url ? (
                <img src={slot.url} alt="" />
              ) : (
                <span>No upload. Site uses its default or a placeholder.</span>
              )}
            </div>
            <h2>{slot.label}</h2>
            <p className="slot-file">{slot.filename || "—"}</p>
            <label className="btn btn-navy slot-upload">
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  upload(slot, event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
            <label className="slot-pick">
              Or use a file in the folder
              <select value="" onChange={(event) => useFile(slot, event.target.value)}>
                <option value="">Choose a file</option>
                {files.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            {slot.url ? (
              <button className="slot-clear" type="button" onClick={() => clear(slot)}>
                Clear this spot
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
