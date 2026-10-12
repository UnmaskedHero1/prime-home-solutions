import { useEffect, useRef, useState } from "react";
import Admin from "./Admin.jsx";
import { submitContact } from "./api.js";
import {
  business,
  comparisons,
  landscaping,
  ownerPhoto,
  reviews,
  serviceFamilies,
  serviceOptions,
  singles,
} from "./content.js";
import { GalleryProvider, usePhoto } from "./gallery.jsx";
import { useSiteMotion } from "./useSiteMotion.js";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  message: "",
};

const homeLinks = [
  { href: "#services", label: "Services" },
  { href: "#pressure-washing", label: "Work" },
  { href: "#owner", label: "Owner" },
  { href: "#reviews", label: "Reviews" },
  { href: "#contact", label: "Contact" },
];

const landscapingLinks = [
  { href: "/", label: "Home" },
  { href: "#contact", label: "Contact" },
];

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

export default function App() {
  const path = currentPath();
  if (path === "/admin") {
    return <Admin />;
  }
  return (
    <GalleryProvider>
      <Site isLandscaping={path === landscaping.path} />
    </GalleryProvider>
  );
}

function Site({ isLandscaping }) {
  const rootRef = useRef(null);
  useSiteMotion(rootRef);

  return (
    <div className="page" ref={rootRef}>
      {isLandscaping ? <LandscapingPage /> : <HomePage />}
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Header links={homeLinks} home="#top" />
      <main>
        <Hero />
        <Services />
        <CompareSection
          id="pressure-washing"
          eyebrow="Pressure washing"
          title="Before and after."
          lede="Drag the tab to show more of the before or the after. On a phone, the two photos sit side by side."
          items={comparisons["pressure-washing"]}
        />
        <CompareSection
          id="painting"
          eyebrow="Painting"
          title="Fresh walls."
          lede="Homes and businesses. Drag the tab to compare."
          items={comparisons.painting}
        />
        <Singles />
        <Charlotte />
        <Owner />
        <Reviews />
        <Contact options={serviceOptions} />
      </main>
      <Footer />
    </>
  );
}

function LandscapingPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = `${landscaping.name} · ${business.name}`;
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.title = previous;
      meta.remove();
    };
  }, []);

  const options = [`${landscaping.name} · ${landscaping.audience}`, ...serviceOptions];

  return (
    <>
      <Header links={landscapingLinks} home="/" />
      <main>
        <section className="hero" id="top">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">
                {business.area} · {landscaping.audience}
              </p>
              <h1>
                <span>Landscaping</span>
                <span className="gold">for the home.</span>
              </h1>
              <span className="hero-rule" aria-hidden="true" />
              <p className="tagline">{landscaping.intro}</p>
              <div className="hero-actions">
                <a className="btn btn-navy" href={business.phoneHref}>
                  Call now
                </a>
                <a className="btn btn-line" href="#contact">
                  Request a visit
                </a>
              </div>
            </div>
            <ul className="service-panel">
              {landscaping.points.map((point) => (
                <li key={point}>
                  <ServiceIcon name="Landscaping" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="band" id="photos">
          <div className="container">
            <p className="eyebrow">The yard</p>
            <h2>Beds, plants, and upkeep.</h2>
            <span className="reveal-rule" aria-hidden="true" />
            <p className="lede">Photos of planting and finished beds will go here.</p>
            <div className="feature-grid">
              {landscaping.photos.map((item) => (
                <figure className="feature-card" key={item.photo.slot}>
                  <div className="feature-frame">
                    <PhotoSlot photo={item.photo} label={item.label} />
                  </div>
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <Contact options={options} defaultService={options[0]} />
      </main>
      <Footer />
    </>
  );
}

function Header({ links, home }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href={home}>
          <HouseMark />
          <span className="brand-text">
            <span className="brand-name">Prime</span>
            <span className="brand-sub">Home Solutions LLC</span>
          </span>
        </a>
        <nav aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <a className="btn btn-gold" href={business.phoneHref}>
            {business.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div>
          <p className="eyebrow">
            {business.area} · {business.role} {business.owner}
          </p>
          <h1>
            <span>One call.</span>
            <span>We do it all.</span>
            <span className="gold">Inside &amp; out.</span>
          </h1>
          <span className="hero-rule" aria-hidden="true" />
          <p className="tagline">
            Pressure washing, painting, light installation, and tree trimming for homes and businesses
            around {business.area}.
          </p>
          <div className="hero-actions">
            <a className="btn btn-navy" href={business.phoneHref}>
              Call now
            </a>
            <a className="btn btn-line" href="#contact">
              Request a visit
            </a>
          </div>
        </div>
        <ul className="service-panel">
          {serviceFamilies.map((family) => (
            <li key={family.name}>
              <ServiceIcon name={family.name} />
              <span>
                {family.name}
                <small>{family.options.map((option) => option.audience).join(" · ")}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="band" id="services">
      <div className="container">
        <p className="eyebrow">Services</p>
        <h2>Homes and businesses.</h2>
        <span className="reveal-rule" aria-hidden="true" />
        <p className="lede">
          One call covers the property. Each service below says who it is for.
        </p>
        <div className="service-grid">
          {serviceFamilies.map((family) => (
            <article className="service-card" key={family.name}>
              <ServiceIcon name={family.name} />
              <h3>{family.name}</h3>
              <ul className="option-list">
                {family.options.map((option) => (
                  <li key={option.audience}>
                    <span className="tag">{option.audience}</span>
                    <span>{option.detail}</span>
                  </li>
                ))}
              </ul>
              {family.anchor ? (
                <a className="card-link" href={family.anchor}>
                  See the work
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompareSection({ id, eyebrow, title, lede, items }) {
  return (
    <section className="band band-tight" id={id}>
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <span className="reveal-rule" aria-hidden="true" />
        <p className="lede">{lede}</p>
        <div className="compare-list">
          {items.map((item) => (
            <Compare key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Singles() {
  return (
    <section className="band" id="lights-and-trees">
      <div className="container">
        <p className="eyebrow">Lights and trees</p>
        <h2>On the ladder.</h2>
        <span className="reveal-rule" aria-hidden="true" />
        <p className="lede">Light installation and tree trimming, one photo each.</p>
        <div className="light-grid">
          {singles.map((item) => (
            <figure className="light-tile" key={item.photo.slot}>
              <div className="light-frame">
                <PhotoSlot photo={item.photo} label={`${item.title} · ${item.audience}`} />
              </div>
              <figcaption>
                <span className="tag">{item.audience}</span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoSlot({ photo, alt, label, className = "" }) {
  const src = usePhoto(photo);
  if (src) {
    return <img className={className} src={src} alt={alt || label} loading="lazy" />;
  }
  return (
    <div className={`photo-slot ${className}`.trim()} role="img" aria-label={label}>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="M21 16l-5-5-8 8" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

function Compare({ item }) {
  const frameRef = useRef(null);
  const dragRef = useRef(false);
  const [position, setPosition] = useState(50);
  const [wide, setWide] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 721px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function moveTo(clientX) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, next)));
  }

  function onPointerDown(event) {
    if (!wide) return;
    dragRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    moveTo(event.clientX);
  }

  function onPointerMove(event) {
    if (!dragRef.current) return;
    moveTo(event.clientX);
  }

  function onPointerUp() {
    dragRef.current = false;
  }

  function onKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((current) => Math.max(2, current - 4));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((current) => Math.min(98, current + 4));
    }
  }

  return (
    <article className="compare">
      <div
        className="compare-frame"
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <PhotoSlot className="compare-before" photo={item.before} label={`Before photo · ${item.title.toLowerCase()}`} />
        <div
          className="compare-after"
          style={wide ? { clipPath: `inset(0 0 0 ${position}%)` } : undefined}
        >
          <PhotoSlot photo={item.after} label={`After photo · ${item.title.toLowerCase()}`} />
        </div>
        <span className="compare-label is-before">Before</span>
        <span className="compare-label is-after">After</span>
        {wide ? (
          <div
            className="compare-handle"
            role="slider"
            tabIndex={0}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            aria-label={`Drag to compare ${item.title}`}
            style={{ left: `${position}%` }}
            onKeyDown={onKeyDown}
          >
            <span className="compare-tab" aria-hidden="true">
              &lt;&gt;
            </span>
          </div>
        ) : null}
      </div>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </article>
  );
}

function Charlotte() {
  return (
    <section className="charlotte" id="charlotte">
      <div className="container">
        <p className="drift-line drift-left">Charlotte</p>
        <p className="drift-line drift-right">Inside &amp; out</p>
        <p className="charlotte-copy">
          Prime Home Solutions is for homes and businesses around Charlotte that want one person for the
          property. Pressure washing, painting, light installation, and tree trimming. Call {business.owner}{" "}
          and say what the place needs.
        </p>
        <a className="btn btn-gold" href={business.phoneHref}>
          Call {business.phoneDisplay}
        </a>
      </div>
    </section>
  );
}

function Owner() {
  return (
    <section className="owner" id="owner">
      <div className="container owner-grid">
        <figure className="owner-frame">
          <PhotoSlot className="owner-photo" photo={ownerPhoto} label={`Photo of ${business.owner}`} />
        </figure>
        <div className="owner-copy">
          <p className="eyebrow">Meet the owner</p>
          <h2>{business.owner}</h2>
          <span className="reveal-rule" aria-hidden="true" />
          <p>
            {business.owner} owns {business.name}. He is the person on the phone. Homes and businesses
            around {business.area} reach him for pressure washing, paint, new lights, and tree trimming.
          </p>
          <p>{business.tagline}</p>
          <p className="owner-meta">
            {business.role}
            <br />
            <a href={business.phoneHref}>{business.phoneDisplay}</a>
            <br />
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </p>
          <a className="btn btn-navy" href="#contact">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const loops = [0, 1];
  return (
    <section className="reviews" id="reviews">
      <div className="container">
        <p className="eyebrow">Reviews</p>
        <h2>Neighbors around Charlotte.</h2>
        <span className="reveal-rule" aria-hidden="true" />
      </div>
      <div className="review-viewport">
        <div className="review-track">
          {loops.flatMap((copy) =>
            reviews.map((review) => (
              <article
                className="review-card"
                key={`${review.name}-${copy}`}
                aria-hidden={copy === 1 ? true : undefined}
              >
                <p className="stars" aria-hidden="true">
                  ★★★★★
                </p>
                <p className="quote">“{review.quote}”</p>
                <p className="review-meta">
                  {review.name} · {review.area}
                  <span>{review.service}</span>
                </p>
              </article>
            ))
          )}
        </div>
      </div>
      <div className="container">
        <p className="fine-print">Sample reviews for this preview. Real ones can replace them.</p>
      </div>
    </section>
  );
}

function Contact({ options, defaultService = "" }) {
  const [form, setForm] = useState({ ...emptyForm, service: defaultService });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status === "sent") setStatus("idle");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setError("Enter a phone number or an email.");
      return;
    }

    setStatus("sending");
    try {
      await submitContact(form);
      setStatus("sent");
      setForm({ ...emptyForm, service: defaultService });
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Something went wrong. Call us and we will take it from there.");
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="container contact-grid">
        <div className="contact-copy">
          <p className="eyebrow on-navy">Charlotte home and business needs</p>
          <h2>Get in touch</h2>
          <p className="slogan">{business.slogan}</p>
          <p>
            Tell {business.owner} what the property needs. A wash, paint, new lights, or the trees.
            He will take it from there.
          </p>
          <ul className="contact-list">
            <li>
              <a href={business.phoneHref}>{business.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
            <li>
              {business.owner}, {business.role} · {business.area}
            </li>
          </ul>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="form-row">
            <label>
              Name
              <input name="name" value={form.name} onChange={update} autoComplete="name" required />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={update} autoComplete="tel" inputMode="tel" />
            </label>
          </div>
          <div className="form-row">
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" />
            </label>
            <label>
              Service
              <select name="service" value={form.service} onChange={update}>
                <option value="">Select a service</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            What does the property need?
            <textarea name="message" value={form.message} onChange={update} rows={5} />
          </label>
          <button className="btn btn-navy" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send request"}
          </button>
          <p
            className={`form-status${status === "sent" ? " is-ok" : ""}${error ? " is-error" : ""}`}
            role="status"
            aria-live="polite"
          >
            {status === "sent" ? "Request received. We will be in touch." : error}
          </p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>{business.name}</p>
        <p>
          {business.area} · {business.tagline}
        </p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

function HouseMark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 30 L32 10 L56 30" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M14 28 V54 H50 V28" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="M6 36 C22 28 40 44 58 22" fill="none" stroke="#c6a35a" strokeWidth="3" strokeLinecap="round" />
      <path d="M27 38 H37 V54 H27 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M32 38 V54 M27 46 H37" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ServiceIcon({ name }) {
  const props = {
    viewBox: "0 0 24 24",
    width: "26",
    height: "26",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "Pressure Washing") {
    return (
      <svg {...props}>
        <path d="M4 15h7l2-3h5" />
        <path d="M14 8c2 0 3 2 3 4" />
        <path d="M16 6l2-2M18 9l3-1M17 12l3 1" />
        <path d="M5 18h4" />
      </svg>
    );
  }
  if (name === "Painting") {
    return (
      <svg {...props}>
        <path d="M4 5h10a3 3 0 0 1 0 6H8" />
        <path d="M8 11v3a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v1" />
        <path d="M14 4v3" />
      </svg>
    );
  }
  if (name === "Light Installation") {
    return (
      <svg {...props}>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
      </svg>
    );
  }
  if (name === "Tree Trimming") {
    return (
      <svg {...props}>
        <path d="M12 21v-5" />
        <path d="M8 16h8l-2-4h1.5l-2.5-4h1l-2-4-2 4h1l-2.5 4H10z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M5 19c4-1 6-5 7-9 1 4 3 8 7 9" />
      <path d="M12 10V5" />
      <path d="M12 7c2-2 4-1 4 1" />
    </svg>
  );
}
