"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Faithful recreation of the reference design (Koumizen's "Koumian Academy"
// internal school — Stoic theme, A.R.I.S.E. values, 6 courses, philosophy
// pillars, crest, CTA). Colors/typography match the reference exactly.
const SERIF = "var(--font-cormorant), Georgia, 'Times New Roman', serif";
const SANS = "var(--font-poppins), system-ui, sans-serif";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Courses", href: "#courses" },
  { label: "About", href: "#about" },
];

const VALUES = [
  { L: "A", name: "Ambitious", desc: "We achieve challenging goals." },
  { L: "R", name: "Relentless", desc: "We do whatever it takes." },
  { L: "I", name: "Integrity", desc: "We operate in unity." },
  { L: "S", name: "Sincere Care", desc: "We challenge everybody to their best work." },
  { L: "E", name: "Evolve", desc: "We embrace change and innovate continuously." },
];

export type CourseShow = {
  roman: string;
  cat: string;
  title: string;
  desc: string;
  lessons: string;
  href: string;
};

// Fallback showcase shown only when the live catalog is empty, so the landing
// always looks complete (and matches the reference) before any course exists.
const SHOWCASE: CourseShow[] = [
  { roman: "I", cat: "Foundation", title: "Stoicism: The Foundation", desc: "Learn timeless principles for discipline, clarity, and self-mastery.", lessons: "8 Lessons", href: "/courses" },
  { roman: "II", cat: "Mind", title: "Mastering Your Mind", desc: "Train your thoughts, build focus, and strengthen emotional control.", lessons: "10 Lessons", href: "/courses" },
  { roman: "III", cat: "Leadership", title: "The Koumian Leader", desc: "Lead with ownership, courage, communication, and accountability.", lessons: "12 Lessons", href: "/courses" },
  { roman: "IV", cat: "Legacy", title: "Build What Lasts", desc: "Create impact, protect the culture, and leave a legacy that empowers generations.", lessons: "10 Lessons", href: "/courses" },
  { roman: "V", cat: "Systems", title: "Systems & Excellence", desc: "Learn the standards, processes, and execution habits that help Koumizen operate with consistency and excellence.", lessons: "9 Lessons", href: "/courses" },
  { roman: "VI", cat: "Service", title: "Customer Sincere Care", desc: "Develop empathy, communication, and customer-first thinking to create meaningful customer experiences.", lessons: "7 Lessons", href: "/courses" },
];

const PILLARS = [
  { idx: "01", name: "Wisdom", desc: "Think with clarity before taking action." },
  { idx: "02", name: "Discipline", desc: "Build habits that create consistent growth." },
  { idx: "03", name: "Legacy", desc: "Create work that outlives the moment." },
];

const FOOTER_LINKS = ["Courses", "About", "Sign In"];

const CSS = `
@keyframes kHeroIn{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:none;}}
@keyframes kFloatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-16px);}}
.k-cta{transition:transform .25s ease,box-shadow .25s ease;}
.k-cta:hover{transform:translateY(-3px);box-shadow:0 18px 40px -10px rgba(124,58,237,1);}
.k-join{transition:transform .25s ease,box-shadow .25s ease;}
.k-join:hover{transform:translateY(-2px);box-shadow:0 12px 30px -8px rgba(124,58,237,.95);}
.k-ghost{transition:border-color .25s ease,background .25s ease;}
.k-ghost:hover{border-color:#7C3AED;background:rgba(155,120,255,.14);}
.k-navlink{transition:color .25s ease;}
.k-navlink:hover{color:#F4F2FA;}
.k-signin{transition:color .25s ease;}
.k-signin:hover{color:#7C3AED;}
.k-viewall{transition:gap .25s ease,color .25s ease;}
.k-viewall:hover{gap:16px;color:#7C3AED;}
.k-card{transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease;}
.k-card:hover{transform:translateY(-7px);border-color:rgba(155,120,255,.4);box-shadow:0 28px 60px -24px rgba(124,58,237,.6);}
.k-footlink{transition:color .25s ease;}
.k-footlink:hover{color:#7C3AED;}
.k-enter{transition:transform .25s ease,box-shadow .25s ease;}
.k-enter:hover{transform:translateY(-3px);box-shadow:0 22px 54px -12px rgba(124,58,237,1);}
@media (max-width:919px){.k-desktop-nav{display:none !important;}.k-mobile-burger{display:flex !important;}}
`;

export function KoumianLanding({ courses }: { courses?: CourseShow[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Use the live catalog when it has courses; otherwise the showcase so the
  // landing always looks complete and matches the catalog once populated.
  const courseList = courses && courses.length > 0 ? courses : SHOWCASE;

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      id="home"
      style={{
        position: "relative",
        background: "#09080E",
        color: "#E7E3F2",
        fontFamily: SANS,
        overflowX: "hidden",
        minHeight: "100vh",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-260px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1100px",
          height: "760px",
          background:
            "radial-gradient(ellipse at center,rgba(124,58,237,.22),rgba(124,58,237,0) 62%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ===== HEADER ===== */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          display: "flex",
          justifyContent: "center",
          padding: "16px clamp(18px,4vw,56px)",
          borderBottom: `1px solid ${scrolled ? "rgba(155,120,255,.14)" : "rgba(155,120,255,0)"}`,
          background: scrolled
            ? "linear-gradient(180deg,rgba(8,7,13,.94),rgba(8,7,13,.82))"
            : "linear-gradient(180deg,rgba(9,8,14,.85),rgba(9,8,14,0))",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          transition: "background .4s ease,border-color .4s ease,backdrop-filter .4s ease",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1320px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <Link href="#home" style={{ display: "flex", alignItems: "center", gap: "13px", textDecoration: "none" }}>
            <Mark size={46} glow />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "22px", letterSpacing: ".005em", color: "#F4F2FA" }}>
                Koumian
              </span>
              <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: ".44em", color: "#7C3AED", marginTop: "4px" }}>
                ACADEMY
              </span>
            </span>
          </Link>

          {/* desktop nav */}
          <div className="k-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "clamp(20px,2.6vw,40px)" }}>
            <nav style={{ display: "flex", alignItems: "center", gap: "clamp(16px,2.2vw,34px)" }}>
              {NAV.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="k-navlink"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    letterSpacing: ".05em",
                    textDecoration: "none",
                    color: i === 0 ? "#F4F2FA" : "#C7C2D6",
                  }}
                >
                  {item.label}
                  {i === 0 && (
                    <span style={{ display: "block", width: "22px", height: "1.5px", background: "#7C3AED", boxShadow: "0 0 8px rgba(124,58,237,.8)" }} />
                  )}
                </a>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <Link href="/login" className="k-join" style={ctaStyle("11px 22px", "13px", "9px")}>
                Sign In
              </Link>
            </div>
          </div>

          {/* mobile burger */}
          <button
            className="k-mobile-burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            style={{ display: "none", flexDirection: "column", gap: "5px", background: "transparent", border: "none", cursor: "pointer", padding: "8px" }}
          >
            <span style={{ display: "block", width: "26px", height: "2px", background: "#E7E3F2" }} />
            <span style={{ display: "block", width: "26px", height: "2px", background: "#E7E3F2" }} />
            <span style={{ display: "block", width: "18px", height: "2px", background: "#7C3AED" }} />
          </button>
        </div>
      </header>

      {/* mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(8,7,13,.97)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "26px",
            padding: "40px",
          }}
        >
          <button onClick={() => setMenuOpen(false)} aria-label="Close" style={{ position: "absolute", top: "22px", right: "24px", background: "transparent", border: "none", color: "#E7E3F2", fontSize: "30px", cursor: "pointer", lineHeight: 1 }}>
            ×
          </button>
          {NAV.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} style={{ fontFamily: SERIF, fontSize: "30px", fontWeight: 500, color: "#F4F2FA", textDecoration: "none" }}>
              {item.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: "14px", marginTop: "14px" }}>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={ctaStyle("13px 24px", "14px", "9px")}>
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px clamp(20px,5vw,72px) 80px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "1320px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))",
            gap: "clamp(40px,6vw,80px)",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "26px", opacity: 0, animation: "kHeroIn .8s cubic-bezier(.2,.7,.2,1) .05s both" }}>
              <span style={{ width: "38px", height: "1px", background: "linear-gradient(90deg,#7C3AED,transparent)" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 500, letterSpacing: ".34em", color: "#B6A7E0" }}>EDUCATION. CHARACTER. LEGACY.</span>
            </div>
            <h1 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(3rem,6.6vw,5.6rem)", lineHeight: ".98", letterSpacing: "-.01em", color: "#F6F4FB", opacity: 0, animation: "kHeroIn .85s cubic-bezier(.2,.7,.2,1) .14s both" }}>
              BUILD THE MIND.
              <br />
              <span style={{ background: "linear-gradient(120deg,#C9B6FF,#7C3AED)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                LEAD WITH PURPOSE.
              </span>
            </h1>
            <p style={{ maxWidth: "520px", margin: "28px 0 0", fontSize: "clamp(15px,1.4vw,17px)", fontWeight: 300, lineHeight: 1.7, color: "#A9A3BC", opacity: 0, animation: "kHeroIn .85s cubic-bezier(.2,.7,.2,1) .24s both" }}>
              Koumian Academy is the internal school of Koumizen, built to train every Koumian in wisdom, discipline, leadership, excellence, and legacy.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "38px", opacity: 0, animation: "kHeroIn .85s cubic-bezier(.2,.7,.2,1) .34s both" }}>
              <Link href="/courses" className="k-cta" style={ctaStyle("16px 32px", "14px", "11px")}>
                Explore Courses
              </Link>
              <Link href="/signup" className="k-ghost" style={{ fontSize: "14px", fontWeight: 500, letterSpacing: ".02em", color: "#E9E4F5", textDecoration: "none", padding: "16px 32px", borderRadius: "11px", background: "rgba(155,120,255,.06)", border: "1px solid rgba(155,120,255,.38)", whiteSpace: "nowrap" }}>
                Start Learning
              </Link>
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "clamp(420px,46vw,600px)" }}>
            <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "118%", height: "118%", background: "radial-gradient(circle at center,rgba(124,58,237,.34),rgba(124,58,237,0) 60%)", pointerEvents: "none" }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/stoic-bust.webp"
              alt="Stoic bust"
              style={{ position: "relative", width: "min(100%,560px)", maxHeight: "660px", objectFit: "contain", mixBlendMode: "screen", filter: "drop-shadow(0 30px 60px rgba(124,58,237,.3))", animation: "kFloatY 8s ease-in-out infinite" }}
            />
            <div style={{ position: "absolute", left: "clamp(-8px,1vw,12px)", bottom: "clamp(6px,3vw,30px)", maxWidth: "330px", padding: "24px 26px", borderRadius: "14px", background: "linear-gradient(160deg,rgba(28,21,48,.86),rgba(16,12,28,.82))", border: "1px solid rgba(155,120,255,.22)", boxShadow: "0 24px 60px -20px rgba(0,0,0,.8)", backdropFilter: "blur(10px)", opacity: 0, animation: "kHeroIn .9s cubic-bezier(.2,.7,.2,1) .5s both" }}>
              <span style={{ fontFamily: SERIF, fontSize: "46px", lineHeight: 0, color: "#7C3AED", display: "block", height: "22px" }}>&ldquo;</span>
              <p style={{ margin: "6px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: "20px", lineHeight: 1.4, color: "#EDE9F7" }}>
                What stands in the way becomes the way.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "16px" }}>
                <span style={{ width: "22px", height: "1px", background: "#7C3AED" }} />
                <span style={{ fontSize: "11px", fontWeight: 500, letterSpacing: ".18em", color: "#B6A7E0" }}>MARCUS AURELIUS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== A.R.I.S.E. ===== */}
      <section style={sectionStyle()}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(48px,6vw,72px)" }}>
            <div style={eyebrowStyle(18)}>OUR CORE VALUES</div>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(3.2rem,8vw,6rem)", letterSpacing: ".08em", background: "linear-gradient(120deg,#F4F2FA,#C9B6FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              A.R.I.S.E.
            </h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch", justifyContent: "center", gap: "clamp(20px,3vw,8px)" }}>
            {VALUES.map((v, i) => (
              <div key={v.name} style={{ display: "contents" }}>
                {i > 0 && (
                  <div style={{ width: "1px", alignSelf: "center", height: "108px", background: "linear-gradient(180deg,transparent,rgba(155,120,255,.4),transparent)" }} />
                )}
                <div style={{ flex: "1 1 150px", maxWidth: "210px", minWidth: "140px", textAlign: "center", padding: "8px clamp(8px,1.4vw,20px)" }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "62px", lineHeight: 1, background: "linear-gradient(150deg,#D6C7FF,#7C3AED)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", marginBottom: "14px" }}>
                    {v.L}
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, letterSpacing: ".02em", color: "#F1EEF8", marginBottom: "9px" }}>{v.name}</div>
                  <div style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.6, color: "#9F99B2" }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section id="courses" style={{ ...sectionStyle(), background: "linear-gradient(180deg,#0B0913,#0E0B18)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "clamp(40px,5vw,60px)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
                <span style={{ width: "38px", height: "1px", background: "linear-gradient(90deg,#7C3AED,transparent)" }} />
                <span style={{ fontSize: "11.5px", fontWeight: 500, letterSpacing: ".34em", color: "#B6A7E0" }}>OUR COURSES</span>
              </div>
              <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2.4rem,4.6vw,3.8rem)", lineHeight: 1.04, color: "#F4F2FA", maxWidth: "620px" }}>
                Knowledge for Character.
                <br />
                Tools for Life.
              </h2>
            </div>
            <Link href="/courses" className="k-viewall" style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", fontWeight: 500, letterSpacing: ".04em", color: "#D6CDF0", textDecoration: "none", whiteSpace: "nowrap" }}>
              View All Courses <span style={{ fontSize: "17px" }}>→</span>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,320px),1fr))", gap: "22px" }}>
            {courseList.map((c, i) => (
              <Link
                key={i}
                href={c.href}
                className="k-card"
                style={{ display: "flex", flexDirection: "column", textDecoration: "none", borderRadius: "16px", overflow: "hidden", background: "linear-gradient(165deg,#161028,#100C1E)", border: "1px solid rgba(155,120,255,.14)" }}
              >
                <div style={{ position: "relative", height: "158px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "radial-gradient(circle at 70% 25%,rgba(124,58,237,.35),rgba(124,58,237,0) 60%),linear-gradient(150deg,#211641,#120D24)", borderBottom: "1px solid rgba(155,120,255,.12)" }}>
                  <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "96px", lineHeight: 1, color: "rgba(201,182,255,.16)" }}>{c.roman}</span>
                  <span style={{ position: "absolute", top: "16px", left: "16px", fontSize: "10px", fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "#E9E0FF", padding: "6px 12px", borderRadius: "6px", background: "rgba(124,58,237,.32)", border: "1px solid rgba(155,120,255,.4)" }}>{c.cat}</span>
                </div>
                <div style={{ padding: "24px 24px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ margin: "0 0 12px", fontFamily: SERIF, fontWeight: 600, fontSize: "24px", lineHeight: 1.15, color: "#F2EFF9" }}>{c.title}</h3>
                  <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 300, lineHeight: 1.65, color: "#9C96AF", flex: 1 }}>{c.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "22px", paddingTop: "16px", borderTop: "1px solid rgba(155,120,255,.12)" }}>
                    <span style={{ fontSize: "12px", fontWeight: 500, letterSpacing: ".05em", color: "#B6A7E0" }}>{c.lessons}</span>
                    <span style={{ fontSize: "16px", color: "#7C3AED" }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section id="philosophy" style={{ ...sectionStyle("clamp(80px,10vw,140px)"), position: "relative" }}>
        <div aria-hidden style={{ position: "absolute", top: 0, right: "-120px", width: "620px", height: "620px", background: "radial-gradient(circle at center,rgba(124,58,237,.12),rgba(124,58,237,0) 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{ margin: "0 auto", maxWidth: "760px", fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2.3rem,4.6vw,3.7rem)", lineHeight: 1.1, color: "#F4F2FA" }}>
            The Philosophy Behind Koumian Academy
          </h2>
          <p style={{ margin: "28px auto 0", maxWidth: "680px", fontSize: "clamp(15px,1.4vw,17px)", fontWeight: 300, lineHeight: 1.8, color: "#A9A3BC" }}>
            Koumian Academy is not just about learning skills. It is about forming better people. Every lesson is designed to help Koumians think clearly, act with discipline, lead with sincerity, and build a legacy through daily excellence.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,250px),1fr))", gap: "clamp(20px,3vw,32px)", marginTop: "clamp(48px,6vw,72px)" }}>
            {PILLARS.map((p) => (
              <div key={p.idx} style={{ textAlign: "left", padding: "30px 28px", borderRadius: "14px", background: "linear-gradient(165deg,rgba(28,21,48,.5),rgba(16,12,28,.5))", border: "1px solid rgba(155,120,255,.14)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 600, color: "#7C3AED", letterSpacing: ".1em" }}>{p.idx}</span>
                  <span style={{ flex: 1, height: "1px", background: "linear-gradient(90deg,rgba(155,120,255,.5),transparent)" }} />
                </div>
                <h3 style={{ margin: "0 0 10px", fontFamily: SERIF, fontWeight: 600, fontSize: "26px", color: "#F2EFF9" }}>{p.name}</h3>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 300, lineHeight: 1.65, color: "#9C96AF" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" style={{ ...sectionStyle(), background: "linear-gradient(180deg,#0E0B18,#0B0913)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: "clamp(40px,6vw,72px)", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <span style={{ width: "38px", height: "1px", background: "linear-gradient(90deg,#7C3AED,transparent)" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 500, letterSpacing: ".34em", color: "#B6A7E0" }}>THE ACADEMY</span>
            </div>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2.3rem,4.4vw,3.6rem)", lineHeight: 1.08, color: "#F4F2FA" }}>
              Built for Koumians.
              <br />
              Designed for Growth.
            </h2>
            <p style={{ margin: "26px 0 0", maxWidth: "540px", fontSize: "clamp(15px,1.4vw,17px)", fontWeight: 300, lineHeight: 1.8, color: "#A9A3BC" }}>
              Koumian Academy is the internal learning platform of Koumizen, Inc. It exists to strengthen every Koumian through structured courses, leadership lessons, cultural training, and practical systems that support both personal and professional growth.
            </p>
          </div>

          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "min(100%,420px)", padding: "44px 36px 36px", borderRadius: "18px", background: "linear-gradient(165deg,rgba(30,22,52,.7),rgba(13,10,24,.7))", border: "1px solid rgba(155,120,255,.26)", boxShadow: "0 30px 70px -28px rgba(124,58,237,.5)", textAlign: "center", overflow: "hidden" }}>
              <Corner pos="tl" />
              <Corner pos="tr" />
              <Corner pos="bl" />
              <Corner pos="br" />
              <div style={{ fontSize: "10.5px", fontWeight: 500, letterSpacing: ".32em", color: "#B6A7E0", marginBottom: "8px" }}>EST. FOR LEGACY</div>
              <Mark size={200} glow center />
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "26px", color: "#F4F2FA", marginTop: "6px" }}>Koumian Academy</div>
              <div style={{ fontSize: "10px", fontWeight: 500, letterSpacing: ".3em", color: "#7C3AED", marginTop: "6px" }}>DISCIPLINE · LEADERSHIP · LEGACY</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="join" style={{ position: "relative", zIndex: 1, padding: "clamp(96px,12vw,170px) clamp(20px,5vw,72px)", textAlign: "center", overflow: "hidden", borderTop: "1px solid rgba(155,120,255,.08)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stoic-bust.webp" alt="" aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(90%,640px)", objectFit: "contain", mixBlendMode: "screen", opacity: 0.22, pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "600px", background: "radial-gradient(ellipse at center,rgba(124,58,237,.26),rgba(124,58,237,0) 62%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: "820px", margin: "0 auto" }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 600, fontSize: "clamp(2.6rem,5.4vw,4.4rem)", lineHeight: 1.06, color: "#F6F4FB" }}>
            Become the Koumian Who Builds What Lasts.
          </h2>
          <p style={{ margin: "26px auto 0", maxWidth: "560px", fontSize: "clamp(15px,1.5vw,18px)", fontWeight: 300, lineHeight: 1.7, color: "#B0AAC2" }}>
            Start learning. Strengthen your character. Lead with purpose.
          </p>
          <Link href="/signup" className="k-enter" style={{ display: "inline-block", marginTop: "40px", fontSize: "15px", fontWeight: 600, letterSpacing: ".02em", color: "#fff", textDecoration: "none", padding: "18px 44px", borderRadius: "12px", background: "linear-gradient(135deg,#7C3AED,#5B21B6)", boxShadow: "0 16px 44px -12px rgba(124,58,237,.85)" }}>
            Enter the Academy
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ position: "relative", zIndex: 1, padding: "clamp(56px,7vw,84px) clamp(20px,5vw,72px) 40px", background: "#08070D", borderTop: "1px solid rgba(155,120,255,.12)" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <p style={{ margin: "0 auto", maxWidth: "760px", textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(17px,2.2vw,22px)", lineHeight: 1.5, color: "#CFC8E2", letterSpacing: ".02em" }}>
            Turning ambitions into reality and opportunities into legacies.
          </p>
          <div style={{ height: "1px", maxWidth: "760px", margin: "36px auto", background: "linear-gradient(90deg,transparent,rgba(155,120,255,.4),transparent)" }} />
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "28px" }}>
            <Link href="#home" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
              <Mark size={40} glow />
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: "19px", color: "#F4F2FA" }}>Koumian</span>
                <span style={{ fontSize: "9px", fontWeight: 500, letterSpacing: ".42em", color: "#7C3AED", marginTop: "3px" }}>ACADEMY</span>
              </span>
            </Link>
            <nav style={{ display: "flex", flexWrap: "wrap", gap: "clamp(16px,2.4vw,30px)" }}>
              {FOOTER_LINKS.map((l) => (
                <a key={l} href={l === "Sign In" ? "/login" : "#courses"} className="k-footlink" style={{ fontSize: "12.5px", fontWeight: 400, letterSpacing: ".04em", color: "#9C96AF", textDecoration: "none" }}>
                  {l}
                </a>
              ))}
            </nav>
          </div>
          <div style={{ marginTop: "36px", fontSize: "11px", letterSpacing: ".04em", color: "#6B6680", textAlign: "center" }}>
            © 2026 Koumizen, Inc. · Koumian Academy — Internal Learning Platform
          </div>
        </div>
      </footer>
    </div>
  );
}

function ctaStyle(padding: string, fontSize: string, radius: string): React.CSSProperties {
  return {
    fontSize,
    fontWeight: 600,
    letterSpacing: ".02em",
    color: "#fff",
    textDecoration: "none",
    padding,
    borderRadius: radius,
    background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
    boxShadow: "0 14px 34px -10px rgba(124,58,237,.75)",
    whiteSpace: "nowrap",
  };
}

function sectionStyle(pad = "clamp(80px,9vw,130px)"): React.CSSProperties {
  return {
    position: "relative",
    zIndex: 1,
    padding: `${pad} clamp(20px,5vw,72px)`,
    borderTop: "1px solid rgba(155,120,255,.08)",
  };
}

function eyebrowStyle(mb: number): React.CSSProperties {
  return {
    fontSize: "11.5px",
    fontWeight: 500,
    letterSpacing: ".36em",
    color: "#B6A7E0",
    marginBottom: `${mb}px`,
  };
}

function Mark({ size, glow, center }: { size: number; glow?: boolean; center?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/koumian-mark.webp"
      alt="Koumian Academy"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: "contain",
        mixBlendMode: "screen",
        filter: glow ? "drop-shadow(0 0 9px rgba(124,58,237,.55))" : undefined,
        margin: center ? "0 auto" : undefined,
        display: center ? "block" : undefined,
      }}
    />
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base: React.CSSProperties = { position: "absolute", width: "22px", height: "22px" };
  const c = "rgba(155,120,255,.55)";
  const map: Record<string, React.CSSProperties> = {
    tl: { top: 14, left: 14, borderTop: `1px solid ${c}`, borderLeft: `1px solid ${c}` },
    tr: { top: 14, right: 14, borderTop: `1px solid ${c}`, borderRight: `1px solid ${c}` },
    bl: { bottom: 14, left: 14, borderBottom: `1px solid ${c}`, borderLeft: `1px solid ${c}` },
    br: { bottom: 14, right: 14, borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}` },
  };
  return <span aria-hidden style={{ ...base, ...map[pos] }} />;
}
