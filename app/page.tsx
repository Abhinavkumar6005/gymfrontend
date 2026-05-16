"use client";

import { useState } from "react";
import PlansDisplay from "./PlansDisplay";
import TrainersDisplay from "./components/TrainersDisplay";
import { useRouter } from "next/navigation";



const stats = [
  { val: "12K+", label: "Active Members" },
  { val: "50+", label: "Expert Trainers" },
  { val: "200+", label: "Weekly Classes" },
  { val: "24/7", label: "Open Hours" },
];

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", background: "#0a0a0a", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .body-font { font-family: 'DM Sans', sans-serif; }

        .nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 4rem; position: fixed; top: 0; width: 100%; z-index: 100;
          background: linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, transparent 100%);
        }
        .nav-logo { font-size: 2rem; letter-spacing: 4px; color: #C8F542; }
        .nav-links { display: flex; gap: 2rem; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; letter-spacing: 2px; text-transform: uppercase; }
        .nav-links a { color: #aaa; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: #C8F542; }
        .nav-cta { background: #C8F542; color: #000; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; border: none; padding: 0.6rem 1.5rem; cursor: pointer; transition: opacity 0.2s; }
        .nav-cta:hover { opacity: 0.85; }

        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 4rem 6rem;
          background: #0a0a0a;
          position: relative;
          overflow: hidden;
        }
        .hero-bg-text {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -55%);
          font-size: clamp(140px, 22vw, 320px); color: rgba(255,255,255,0.04);
          letter-spacing: -10px; white-space: nowrap; pointer-events: none; user-select: none;
        }
        .hero-accent-bar {
          width: 60px; height: 4px; background: #C8F542; margin-bottom: 2rem;
        }
        .hero-title { font-size: clamp(64px, 10vw, 140px); line-height: 0.9; letter-spacing: 2px; }
        .hero-title span { color: #C8F542; }
        .hero-sub { font-family: 'DM Sans', sans-serif; font-size: 1rem; color: #888; letter-spacing: 3px; text-transform: uppercase; margin-top: 1.5rem; }
        .hero-actions { display: flex; gap: 1rem; margin-top: 2.5rem; align-items: center; }
        .btn-primary { background: #C8F542; color: #000; border: none; padding: 1rem 2.5rem; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-outline { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 1rem 2.5rem; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
        .btn-outline:hover { border-color: #C8F542; color: #C8F542; }

        .stats-bar {
          background: #C8F542; padding: 2rem 4rem;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
        }
        .stat-item { text-align: center; }
        .stat-val { font-size: clamp(2rem, 4vw, 3.5rem); color: #000; line-height: 1; }
        .stat-label { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #000; letter-spacing: 2px; text-transform: uppercase; margin-top: 0.25rem; opacity: 0.7; }

        .section { padding: 6rem 4rem; }
        .section-tag { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; letter-spacing: 4px; text-transform: uppercase; color: #C8F542; margin-bottom: 1rem; }
        .section-title { font-size: clamp(3rem, 6vw, 7rem); line-height: 0.9; }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          margin-top: 4rem;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .plan-card {
          background: #111; padding: 2.5rem 1.5rem;
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.08);
          transition: background 0.3s, transform 0.3s;
          cursor: pointer; position: relative; overflow: hidden;
        }
        .plan-card:last-child { border-right: none; }
        .plan-card.highlighted { background: #C8F542; }
        .plan-card.hovered-card { background: #1a1a1a; transform: translateY(-8px); }
        .plan-card.highlighted.hovered-card { background: #d4ff4a; transform: translateY(-8px); }

        .plan-tag { font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; background: #000; color: #C8F542; padding: 0.25rem 0.75rem; display: inline-block; margin-bottom: 1.5rem; }
        .plan-card.highlighted .plan-tag { background: #000; color: #C8F542; }
        .plan-tag-spacer { height: 1.8rem; margin-bottom: 1.5rem; }

        .plan-duration { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; letter-spacing: 3px; text-transform: uppercase; color: #666; }
        .plan-card.highlighted .plan-duration { color: rgba(0,0,0,0.5); }

        .plan-name { font-size: 3.5rem; line-height: 1; margin-top: 0.25rem; }
        .plan-card.highlighted .plan-name { color: #000; }

        .plan-price-block { margin-top: 1.5rem; }
        .plan-price { font-size: 2.5rem; }
        .plan-card.highlighted .plan-price { color: #000; }
        .plan-period { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #555; letter-spacing: 1px; }
        .plan-card.highlighted .plan-period { color: rgba(0,0,0,0.5); }

        .plan-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 1.5rem 0; }
        .plan-card.highlighted .plan-divider { background: rgba(0,0,0,0.15); }

        .plan-features { list-style: none; flex: 1; display: flex; flex-direction: column; gap: 0.6rem; }
        .plan-features li { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #888; display: flex; align-items: center; gap: 0.5rem; }
        .plan-features li::before { content: '—'; color: #C8F542; font-size: 0.9rem; flex-shrink: 0; }
        .plan-card.highlighted .plan-features li { color: rgba(0,0,0,0.7); }
        .plan-card.highlighted .plan-features li::before { color: rgba(0,0,0,0.5); }

        .plan-cta { margin-top: 2rem; background: #fff; color: #000; border: none; padding: 0.85rem; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; width: 100%; transition: opacity 0.2s; }
        .plan-card.highlighted .plan-cta { background: #000; color: #C8F542; }
        .plan-cta:hover { opacity: 0.8; }

        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 4rem; background: rgba(255,255,255,0.05); }
        .feature-item { background: #0a0a0a; padding: 3rem 2rem; }
        .feature-icon { font-size: 2.5rem; color: #C8F542; margin-bottom: 1.5rem; }
        .feature-title { font-size: 2rem; margin-bottom: 0.75rem; }
        .feature-desc { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #666; line-height: 1.7; }

        .cta-section { background: #C8F542; padding: 6rem 4rem; display: flex; justify-content: space-between; align-items: center; }
        .cta-left .section-tag { color: rgba(0,0,0,0.5); }
        .cta-title { font-size: clamp(3rem, 6vw, 7rem); color: #000; line-height: 0.9; }
        .btn-dark { background: #000; color: #C8F542; border: none; padding: 1.2rem 3rem; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
        .btn-dark:hover { opacity: 0.85; }

        .footer { padding: 3rem 4rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-size: 1.5rem; letter-spacing: 4px; color: #C8F542; }
        .footer-copy { font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #444; letter-spacing: 1px; }

        @media (max-width: 1100px) {
          .plans-grid { grid-template-columns: repeat(3, 1fr); }
          .nav { padding: 1.5rem 2rem; }
          .section { padding: 5rem 2rem; }
          .hero { padding: 0 2rem 5rem; }
          .stats-bar { padding: 2rem; }
          .cta-section { padding: 4rem 2rem; }
          .footer { padding: 2rem; }
        }
        @media (max-width: 700px) {
          .plans-grid { grid-template-columns: 1fr 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .cta-section { flex-direction: column; gap: 2rem; }
          .nav-links { display: none; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">IRONFORGE</div>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#classes">Classes</a>
          <a href="#trainer">Trainers</a>
          <a href="#plans">Plans</a>
        </div>
        <button className="nav-cta" onClick={() => router.push('/admin-login')}>
          Admin Login
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-text">IRON</div>
        <div className="hero-accent-bar" />
        <h1 className="hero-title">
          FORGE<br />YOUR<br /><span>LIMITS</span>
        </h1>
        <p className="hero-sub">Premium Fitness · Est. 2018 · Ludhiana</p>
        <div className="hero-actions">
          <button className="btn-primary">
  <a href="tel:+919876543210" style={{ color: '#000', textDecoration: 'none' }}>Start Today</a>
</button>
          <button className="btn-outline">
            <a href="#plans" style={{  textDecoration: 'none' }}>View Plans</a>
          </button>
        </div>
      </section>


{/* ABOUT SECTION */}
<section id="about" className="section" style={{ background: "#0a0a0a" }}>
  <div className="section-tag">About Ironforge</div>
  <h2 className="section-title">MORE THAN<br />A GYM</h2>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", marginTop: "3rem" }}>
    <div>
      <p className="body-font" style={{ color: "#aaa", lineHeight: "1.8", fontSize: "1.1rem" }}>
        Founded in 2018, Ironforge Gym has grown into Ludhiana's premier fitness destination. 
        We're not just a gym - we're a community of warriors committed to pushing beyond limits.
      </p>
      <div style={{ marginTop: "2rem" }}>
        {[
          "🏆 50+ Certified Trainers",
          "💪 20,000+ sq ft State-of-art Facility",
          "🎯 Personalized Training Programs",
          "🥗 In-house Nutrition Counseling"
        ].map((item) => (
          <div key={item} className="body-font" style={{ color: "#C8F542", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <div style={{ background: "#111", padding: "2rem", borderRadius: "4px" }}>
        <div style={{ fontSize: "3rem", color: "#C8F542", marginBottom: "1rem" }}>⚡</div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Our Mission</h3>
        <p className="body-font" style={{ color: "#888", lineHeight: "1.8" }}>
          To forge stronger versions of ourselves - physically, mentally, and spiritually. 
          Every member who walks through our doors becomes family.
        </p>
      </div>
    </div>
  </div>
</section>

{/* CLASSES SECTION */}
<section id="classes" className="section" style={{ paddingTop: 0 }}>
  <div className="section-tag">Our Classes</div>
  <h2 className="section-title">FIND YOUR<br />FIGHT</h2>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", marginTop: "3rem" }}>
    {[
      { 
        icon: "🧘", 
        title: "YOGA", 
        desc: "Find inner peace and flexibility. Perfect for recovery and mental clarity.",
        schedule: "Mon/Wed/Fri - 7AM & 6PM",
        duration: "60 min"
      },
      { 
        icon: "🥋", 
        title: "JUDO", 
        desc: "Learn self-defense, discipline, and technique from black belt instructors.",
        schedule: "Tue/Thu/Sat - 5PM & 7PM",
        duration: "90 min"
      },
      { 
        icon: "💪", 
        title: "STRENGTH TRAINING", 
        desc: "Build muscle and increase power with progressive overload programs.",
        schedule: "Mon-Sat - 8AM to 9PM",
        duration: "Flexible"
      },
      { 
        icon: "🔥", 
        title: "HIIT", 
        desc: "High-intensity intervals for maximum calorie burn in minimum time.",
        schedule: "Mon/Wed/Fri - 8AM & 6PM",
        duration: "45 min"
      },
      { 
        icon: "🥊", 
        title: "BOXING", 
        desc: "Release stress while building endurance and coordination.",
        schedule: "Tue/Thu/Sat - 6PM & 8PM",
        duration: "60 min"
      },
      { 
        icon: "🏋️", 
        title: "CROSSFIT", 
        desc: "Functional fitness at its best. Challenge your limits daily.",
        schedule: "Mon-Sat - 7AM, 12PM, 7PM",
        duration: "60 min"
      },
    ].map((classItem) => (
      <div key={classItem.title} style={{ background: "#111", padding: "2rem", transition: "transform 0.3s", cursor: "pointer" }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-10px)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
        <div style={{ fontSize: "3rem", color: "#C8F542", marginBottom: "1rem" }}>{classItem.icon}</div>
        <h3 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{classItem.title}</h3>
        <p className="body-font" style={{ color: "#888", marginBottom: "1rem", lineHeight: "1.6" }}>{classItem.desc}</p>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", marginTop: "1rem" }}>
          <p className="body-font" style={{ color: "#C8F542", fontSize: "0.8rem", marginBottom: "0.5rem" }}>⏰ {classItem.schedule}</p>
          <p className="body-font" style={{ color: "#666", fontSize: "0.75rem" }}>⌛ {classItem.duration}</p>
        </div>
      </div>
    ))}
  </div>
</section>
      {/* STATS */}
      <div className="stats-bar">
        {stats.map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* PLANS */}
      <section id="plans" className="section">
        <div className="section-tag">Membership Plans</div>
        <h2 className="section-title">PICK YOUR<br />BATTLE PLAN</h2>

        <PlansDisplay/>
      </section>


      <section id="trainer"><TrainersDisplay/></section>

      {/* FEATURES */}
      <section className="section" id="features" style={{ paddingTop: 0 }}>
        <div className="section-tag">Why Ironforge</div>
        <h2 className="section-title">BUILT FOR<br />WINNERS</h2>
        <div className="features-grid">
          {[
            { icon: "🏋️", title: "PRO EQUIPMENT", desc: "State-of-the-art machines, free weights, and functional training zones updated every year." },
            { icon: "🔥", title: "EXPERT COACHING", desc: "Our certified trainers design programs tailored to your body, goals, and timeline." },
            { icon: "⚡", title: "OPEN 24 / 7", desc: "Train on your schedule. Our doors never close — because neither does your drive." },
          ].map((f) => (
            <div key={f.title} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc body-font">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="cta-section">
        <div className="cta-left">
          <div className="section-tag">Limited Spots</div>
          <h2 className="cta-title">READY TO<br />TRANSFORM?</h2>
        </div>
        <button className="btn-dark">Claim Your Spot →</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">IRONFORGE</div>
        <div className="footer-copy body-font">© 2025 Ironforge Gym · Ludhiana, Punjab</div>
      </footer>
    </div>
  );
}