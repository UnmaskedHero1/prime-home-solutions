import { useEffect, useRef, useState } from "react";
import { submitContact } from "./api.js";
import { business, comparisons, reviews, services } from "./content.js";
import { useSiteMotion } from "./useSiteMotion.js";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  message: "",
};

export default function App() {
  const rootRef = useRef(null);
  useSiteMotion(rootRef);

  return (
    <div className="page" ref={rootRef}>
      <Header />
      <main>
        <Hero />
        <Services />
        <Work />
        <Charlotte />
        <Owner />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#top">
          <HouseMark />
          <span className="brand-text">
            <span className="brand-name">Prime</span>
            <span className="brand-sub">Home Solutions LLC</span>
          </span>
        </a>
        <nav aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#owner">Owner</a>
          <a href="#reviews">Reviews</a>
          <a href="#contact">Contact</a>
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
            Paint, HVAC repair, HVAC install, roofing, and the rest of the house.
            Prime Home Solutions works with homeowners around {business.area}.
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
          <li>
            <ServiceIcon name="Interior Painting" />
            <span>Interior painting</span>
          </li>
          <li>
            <ServiceIcon name="HVAC Repair" />
            <span>HVAC repair and install</span>
          </li>
          <li>
            <ServiceIcon name="Roofing" />
            <span>Roofing</span>
          </li>
          <li>
            <ServiceIcon name="Pressure Washing" />
            <span>Pressure washing and gutters</span>
          </li>
          <li>
            <ServiceIcon name="Yard Clean Up" />
            <span>Yard clean up and trash outs</span>
          </li>
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
        <h2>The work, inside and out.</h2>
        <span className="reveal-rule" aria-hidden="true" />
        <p className="lede">
          One call covers the house. Mr. Armas takes painting, HVAC, roofing, and the cleanup that comes with it.
        </p>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.name}>
              <ServiceIcon name={service.name} />
              <h3>{service.name}</h3>
              <p>{service.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="band band-tight" id="work">
      <div className="container">
        <p className="eyebrow">Before and after</p>
        <h2>Watch the house change.</h2>
        <span className="reveal-rule" aria-hidden="true" />
        <p className="lede">
          Drag the tab to show more of the before or the after. On a phone, the two photos sit side by side.
        </p>
        <div className="compare-list">
          {comparisons.map((item) => (
            <Compare key={item.title} item={item} />
          ))}
        </div>
        <p className="fine-print">
          Example photos for this preview. Real jobs can replace them.
        </p>
      </div>
    </section>
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
        <img className="compare-before" src={item.before} alt={item.beforeAlt} />
        <div
          className="compare-after"
          style={wide ? { clipPath: `inset(0 ${100 - position}% 0 0)` } : undefined}
        >
          <img src={item.after} alt={item.afterAlt} />
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
          Prime Home Solutions is for homeowners around Charlotte who want one person for the house.
          Painting, HVAC repair, HVAC install, roofing, pressure washing, gutters, yard clean up, and trash outs.
          Call {business.owner} and tell him what the home needs.
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
          <img
            className="owner-photo"
            src="/photos/prime-owner-home.jpg"
            alt="A brick Charlotte home with a front porch in late-day light"
          />
        </figure>
        <div className="owner-copy">
          <p className="eyebrow">Meet the owner</p>
          <h2>{business.owner}</h2>
          <span className="reveal-rule" aria-hidden="true" />
          <p>
            {business.owner} owns {business.name}. He is the person on the phone.
            Homes around {business.area} reach him for paint, a roof, HVAC repair or a new install,
            and the cleanup that gets a property ready.
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

function Contact() {
  const [form, setForm] = useState(emptyForm);
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
      setForm(emptyForm);
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Something went wrong. Call us and we will take it from there.");
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="container contact-grid">
        <div className="contact-copy">
          <p className="eyebrow on-navy">Charlotte home needs</p>
          <h2>Get in touch</h2>
          <p className="slogan">{business.slogan}</p>
          <p>
            Tell {business.owner} what the house needs. Paint, HVAC, roofing, or a clean-out.
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
                {services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            What does the house need?
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

  if (name === "Interior Painting") {
    return (
      <svg {...props}>
        <path d="M4 5h10a3 3 0 0 1 0 6H8" />
        <path d="M8 11v3a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v1" />
        <path d="M14 4v3" />
      </svg>
    );
  }
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
  if (name === "Gutter Cleaning") {
    return (
      <svg {...props}>
        <path d="M3 10 L12 4 L21 10" />
        <path d="M4 10h16" />
        <path d="M18 10v3a2 2 0 0 1-2 2h-1" />
        <path d="M8 19c0-2 2-2 2-4" />
      </svg>
    );
  }
  if (name === "Yard Clean Up") {
    return (
      <svg {...props}>
        <path d="M5 19c4-1 6-5 7-9 1 4 3 8 7 9" />
        <path d="M12 10V5" />
        <path d="M12 7c2-2 4-1 4 1" />
      </svg>
    );
  }
  if (name === "HVAC Repair" || name === "HVAC Install") {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 6.5v2M12 15.5v2M6.5 12h2M15.5 12h2" />
      </svg>
    );
  }
  if (name === "Roofing") {
    return (
      <svg {...props}>
        <path d="M3 12 L12 4 L21 12" />
        <path d="M6 11.5 V20 H18 V11.5" />
        <path d="M10 20v-4h4v4" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M10 12v5M14 12v5" />
    </svg>
  );
}
