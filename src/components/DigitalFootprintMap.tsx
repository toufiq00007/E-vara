import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Platform = {
  id: string;
  label: string;
  icon: string;
  angle: number;
  r: number;
  risk: number;
  status: "active" | "idle";
  color: string;
  breaches: number;
  [key: string]: string | number;
};

const PLATFORMS: Platform[] = [
  { id: "instagram", label: "Instagram", icon: "📸", angle: 0, r: 165, risk: 78, status: "active", color: "#ff6b35", breaches: 2, followers: "2.4K", posts: 134 },
  { id: "github", label: "GitHub", icon: "⌨", angle: 45, r: 165, risk: 44, status: "active", color: "#ffb800", breaches: 0, repos: 31, commits: 892 },
  { id: "twitter", label: "X / Twitter", icon: "✦", angle: 90, r: 165, risk: 22, status: "active", color: "#00d4ff", breaches: 0, followers: "890", tweets: 512 },
  { id: "linkedin", label: "LinkedIn", icon: "◈", angle: 135, r: 165, risk: 91, status: "active", color: "#ff3366", breaches: 3, connections: 340, views: "1.2K" },
  { id: "gmail", label: "Gmail", icon: "✉", angle: 180, r: 165, risk: 83, status: "active", color: "#ff4444", breaches: 4, emails: "12K", inboxAge: "2019" },
  { id: "reddit", label: "Reddit", icon: "◉", angle: 225, r: 165, risk: 31, status: "idle", color: "#00ff9d", breaches: 0, karma: 4200, subs: 18 },
  { id: "facebook", label: "Facebook", icon: "◫", angle: 270, r: 165, risk: 88, status: "active", color: "#ff3366", breaches: 2, friends: 480, tags: 67 },
  { id: "discord", label: "Discord", icon: "◬", angle: 315, r: 165, risk: 19, status: "idle", color: "#7c3aed", breaches: 0, servers: 7, dms: 204 },
];

const NANO_PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  angle: (i / 60) * 360,
  dist: 40 + Math.random() * 200,
  size: 1.5 + Math.random() * 2.5,
  speed: 3 + Math.random() * 5,
  delay: Math.random() * 3,
  dx: `${(Math.random() - 0.5) * 80}px`,
  dy: `${(Math.random() - 0.5) * 80}px`,
}));

const RISK_COLOR = (r: number) => (r >= 80 ? "#ff3366" : r >= 60 ? "#ff6b35" : r >= 40 ? "#ffb800" : r >= 20 ? "#00d4ff" : "#00ff9d");
const RISK_LABEL = (r: number) => (r >= 80 ? "CRITICAL" : r >= 60 ? "HIGH" : r >= 40 ? "MEDIUM" : r >= 20 ? "LOW" : "SAFE");

const CSS = `
.nfp-root{font-family:'Rajdhani',sans-serif;background:#010b18;min-height:580px;color:#c8d8e8;display:flex;flex-direction:column;overflow:hidden;position:relative;border-radius:14px;border:1px solid rgba(0,212,255,.15)}
.nfp-bg{position:absolute;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(0,212,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.025) 1px,transparent 1px);background-size:40px 40px}
.nl-wrap{position:absolute;inset:0;z-index:20;background:#010b18;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;transition:opacity .6s ease, visibility .6s ease}
.nl-wrap.hidden{opacity:0;visibility:hidden}
.nl-canvas-wrap{position:relative;width:220px;height:220px}.nl-ring{position:absolute;inset:0;border-radius:50%;border:1px solid transparent;animation:nlSpin linear infinite}.nl-ring.r1{border-top-color:#00d4ff;animation-duration:2.4s}.nl-ring.r2{border-bottom-color:#7c3aed;animation-duration:1.8s;animation-direction:reverse;inset:18px}.nl-ring.r3{border-top-color:#ff3366;animation-duration:3.2s;inset:36px}
.nl-core{position:absolute;inset:54px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,.18) 0%,rgba(0,212,255,.04) 60%,transparent 100%);border:1px solid rgba(0,212,255,.3);display:flex;align-items:center;justify-content:center;animation:nlPulse 1.8s ease-in-out infinite}
.nl-core-text{font-family:'Share Tech Mono',monospace;font-size:10px;color:#00d4ff;letter-spacing:2px;text-align:center}.nl-dot-item{position:absolute;width:6px;height:6px;border-radius:50%;animation:nlOrbit linear infinite;transform-origin:110px 110px}
.nl-bar-wrap{width:220px}.nl-bar-track{width:100%;height:2px;background:rgba(0,212,255,.08)}.nl-bar-fill{height:100%;background:linear-gradient(90deg,#00d4ff,#7c3aed);transition:width .15s ease}.nl-bar-label{display:flex;justify-content:space-between;font-size:9px;letter-spacing:2px;color:#3a5a6a;font-family:'Share Tech Mono',monospace}
.nfp-hdr{position:relative;z-index:10;display:flex;align-items:center;gap:16px;padding:16px 20px;border-bottom:1px solid rgba(0,212,255,.08);background:rgba(1,11,24,.96)}
.nfp-logo{font-size:18px;font-weight:700;letter-spacing:5px;color:#00d4ff}.nfp-logo span{color:#7c3aed}.nfp-hdot{width:6px;height:6px;border-radius:50%;background:#00ff9d;animation:nlBlink 1.4s infinite}.nfp-htag{font-size:9px;letter-spacing:2.5px;color:#3a5a6a;font-family:'Share Tech Mono',monospace;text-transform:uppercase}
.nfp-body{position:relative;z-index:5;flex:1;display:grid;grid-template-columns:1fr 320px;overflow:hidden}.nfp-map-panel{position:relative;overflow:hidden;border-right:1px solid rgba(0,212,255,.08);display:flex;align-items:center;justify-content:center;padding:10px}
.nfp-scanbar{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(0,212,255,.9) 50%,transparent 100%);animation:scanV 5s linear infinite;z-index:20}
.nano-field{position:absolute;inset:0;pointer-events:none;overflow:hidden}.nano-p{position:absolute;border-radius:50%;background:#00d4ff;opacity:.25;animation:nanoFloat linear infinite}
.nfp-right{display:flex;flex-direction:column;background:rgba(1,11,24,.97)}.nfp-rblock{padding:14px;border-bottom:1px solid rgba(0,212,255,.07)}.nfp-rscroll{flex:1;overflow-y:auto;padding:12px}
.nfp-sec-title{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#2a4a5a;margin-bottom:10px;display:flex;align-items:center;gap:7px;font-family:'Share Tech Mono',monospace}.nfp-sec-title::before{content:'';width:12px;height:1px;background:rgba(0,212,255,.4)}
.nfp-node-card{border-radius:10px;padding:12px;background:rgba(0,212,255,.04);border:1px solid rgba(0,212,255,.12)}.nfp-node-name{font-size:22px;font-weight:700}.nfp-node-icon{font-size:28px;display:block}.nfp-risk-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:2px;font-family:'Share Tech Mono',monospace;margin-bottom:10px}
.nfp-stat-row{display:grid;grid-template-columns:1fr 1fr;gap:7px}.nfp-stat-cell{padding:8px 10px;border-radius:7px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.05)}.nfp-stat-val{font-size:16px;font-weight:700;font-family:'Share Tech Mono',monospace}.nfp-stat-key{font-size:9px;color:#3a5a6a;letter-spacing:1.5px;text-transform:uppercase}
.nfp-plist{display:flex;flex-direction:column;gap:7px}.nfp-prow{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:all .25s;background:rgba(255,255,255,.02)}.nfp-prow.sel{border-color:currentColor;background:rgba(0,212,255,.06)}.nfp-prow-icon{font-size:16px;width:22px}.nfp-prow-name{font-size:12px;font-weight:600}.nfp-prow-status{font-size:8px;letter-spacing:1.5px;padding:2px 6px;border-radius:3px;font-family:'Share Tech Mono',monospace;text-transform:uppercase}.nfp-prow-risk{font-size:11px;font-weight:700;font-family:'Share Tech Mono',monospace;min-width:28px;text-align:right}.nfp-risk-bar{height:2px;border-radius:1px;margin-top:3px}
.nfp-statusbar{display:flex;align-items:center;gap:20px;padding:8px 16px;border-top:1px solid rgba(0,212,255,.07);background:rgba(1,11,24,.98)}.nfp-sb-item{display:flex;align-items:center;gap:6px;font-size:9px;letter-spacing:1.5px;color:#3a5a6a;font-family:'Share Tech Mono',monospace;text-transform:uppercase}.nfp-sb-dot{width:5px;height:5px;border-radius:50%}
@keyframes nlSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes nlPulse{0%,100%{box-shadow:0 0 12px rgba(0,212,255,.15)}50%{box-shadow:0 0 30px rgba(0,212,255,.4)}}@keyframes nlOrbit{from{transform:rotate(var(--start-angle)) translateY(-85px) rotate(calc(-1*var(--start-angle)))}to{transform:rotate(calc(var(--start-angle)+360deg)) translateY(-85px) rotate(calc(-1*(var(--start-angle)+360deg)))}}@keyframes nlBlink{0%,100%{opacity:1}50%{opacity:.1}}@keyframes scanV{0%{top:-2px;opacity:0}5%{opacity:1}100%{top:100%;opacity:0}}@keyframes nanoFloat{0%{transform:translate(0,0);opacity:.3}100%{transform:translate(var(--dx),var(--dy));opacity:0}}
@media (max-width: 1024px){.nfp-body{grid-template-columns:1fr}.nfp-map-panel{min-height:420px}.nfp-right{max-height:420px}}
`;

function NanoLoader({ progress, phase, done }: { progress: number; phase: number; done: boolean }) {
  const phases = ["INITIALIZING NANOTECH ARRAY", "CALIBRATING NODE SENSORS", "MAPPING DIGITAL FOOTPRINT", "ANALYZING THREAT VECTORS", "ASSEMBLING SUIT PROTOCOLS", "SYSTEM ONLINE"];
  return (
    <div className={`nl-wrap${done ? " hidden" : ""}`}>
      <div className="nl-canvas-wrap">
        <div className="nl-ring r1" /><div className="nl-ring r2" /><div className="nl-ring r3" />
        {[0, 60, 120, 180, 240, 300].map((a, i) => (
          <div key={i} className="nl-dot-item" style={{ "--start-angle": `${a}deg`, top: "calc(50% - 3px)", left: "calc(50% - 3px)", background: i % 3 === 0 ? "#00d4ff" : i % 3 === 1 ? "#7c3aed" : "#ff3366", animationDuration: `${1.5 + i * 0.3}s` } as CSSProperties} />
        ))}
        <div className="nl-core"><div className="nl-core-text"><div style={{ fontSize: 14, fontWeight: 700 }}>E·VARA</div><div>{Math.round(progress)}%</div></div></div>
      </div>
      <div className="nl-bar-wrap"><div className="nl-bar-label"><span>{phases[phase] ?? phases[5]}</span><span style={{ color: "#00d4ff" }}>{Math.round(progress)}%</span></div><div className="nl-bar-track"><div className="nl-bar-fill" style={{ width: `${progress}%` }} /></div></div>
    </div>
  );
}

function FootprintSVG({ selected, onSelect, assembled }: { selected: string | null; onSelect: (id: string | null) => void; assembled: boolean }) {
  const W = 580; const H = 560; const cx = 290; const cy = 280;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, height: "auto" }}>
      <defs><radialGradient id="coreGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#00d4ff" stopOpacity=".25" /><stop offset="60%" stopColor="#00d4ff" stopOpacity=".05" /><stop offset="100%" stopColor="#00d4ff" stopOpacity="0" /></radialGradient><filter id="glow4"><feGaussianBlur stdDeviation="4" /></filter></defs>
      {assembled && PLATFORMS.map((p) => { const rad = (p.angle * Math.PI) / 180; const px = cx + p.r * Math.cos(rad); const py = cy + p.r * Math.sin(rad); const isSel = selected === p.id; const c = RISK_COLOR(p.risk); return <line key={`${p.id}-l`} x1={cx} y1={cy} x2={px} y2={py} stroke={c} strokeWidth={isSel ? 2.5 : 1} strokeOpacity={isSel ? 0.7 : 0.2} filter="url(#glow4)" />; })}
      {assembled && PLATFORMS.map((p) => { const rad = (p.angle * Math.PI) / 180; const px = cx + p.r * Math.cos(rad); const py = cy + p.r * Math.sin(rad); const isSel = selected === p.id; const c = RISK_COLOR(p.risk); const nr = isSel ? 28 : 22; return <g key={p.id} onClick={() => onSelect(isSel ? null : p.id)} style={{ cursor: "pointer" }}><circle cx={px} cy={py} r={nr + 10} fill={c} opacity={isSel ? 0.12 : 0.05} /><circle cx={px} cy={py} r={nr} fill={`rgba(1,11,24,${isSel ? ".92" : ".8"})`} stroke={c} strokeWidth={isSel ? 2 : 1.5} /><text x={px} y={py + 1} textAnchor="middle" dominantBaseline="middle" fontSize={isSel ? 16 : 13} fill={c}>{p.icon}</text><text x={px} y={py + nr + 13} textAnchor="middle" fontSize="9" fill={isSel ? c : "#3a5a6a"}>{p.label}</text></g>; })}
      {assembled && <g><circle cx={cx} cy={cy} r="38" fill="url(#coreGrad)" /><circle cx={cx} cy={cy} r="28" fill="rgba(0,212,255,.12)" stroke="#00d4ff" strokeWidth="2" /><text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="#00d4ff">USER</text></g>}
    </svg>
  );
}

export default function DigitalFootprintMap() {
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [loaderPhase, setLoaderPhase] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    let p = 0;
    const steps = [{ target: 15, phase: 0 }, { target: 30, phase: 1 }, { target: 50, phase: 2 }, { target: 68, phase: 3 }, { target: 85, phase: 4 }, { target: 100, phase: 5 }];
    let si = 0;
    const iv = window.setInterval(() => {
      const step = steps[si];
      p += 0.9 + Math.random() * 1.2;
      if (p >= step.target) { setLoaderPhase(step.phase); si = Math.min(si + 1, steps.length - 1); }
      if (p >= 100) {
        p = 100;
        window.clearInterval(iv);
        window.setTimeout(() => { setLoaderDone(true); window.setTimeout(() => setAssembled(true), 300); }, 500);
      }
      setLoaderProgress(Math.min(p, 100));
    }, 40);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const selectedPlatform = useMemo(() => PLATFORMS.find((p) => p.id === selected) ?? null, [selected]);
  const active = PLATFORMS.filter((p) => p.status === "active").length;
  const critical = PLATFORMS.filter((p) => p.risk >= 80).length;

  const statEntries = (p: Platform) => Object.entries(p).filter(([k]) => !["id", "label", "icon", "angle", "r", "risk", "status", "color"].includes(k)).slice(0, 4);

  return (
    <div className="nfp-root">
      <style>{CSS}</style>
      <div className="nfp-bg" />
      <NanoLoader progress={loaderProgress} phase={loaderPhase} done={loaderDone} />
      <div className="nano-field" aria-hidden="true">{NANO_PARTICLES.map((p) => <div key={p.id} className="nano-p" style={{ width: p.size, height: p.size, left: `${(p.dist * Math.cos((p.angle * Math.PI) / 180)) / 4 + 50}%`, top: `${(p.dist * Math.sin((p.angle * Math.PI) / 180)) / 3 + 50}%`, "--dx": p.dx, "--dy": p.dy, animationDuration: `${p.speed}s`, animationDelay: `${p.delay}s` } as CSSProperties} />)}</div>
      <header className="nfp-hdr"><div className="nfp-logo">E<span>-</span>VARA</div><div style={{ width: 1, height: 18, background: "rgba(0,212,255,.15)" }} /><div><div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2 }}>DIGITAL FOOTPRINT MAP</div><div className="nfp-htag">Nanotech Intelligence Layer v2.0</div></div><div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}><div className="nfp-sb-item"><div className="nfp-hdot" /><span style={{ color: "#00ff9d" }}>LIVE SCAN</span></div><div style={{ fontSize: 10, fontFamily: "'Share Tech Mono',monospace", color: "#2a4a5a" }}>{time.toLocaleTimeString()} UTC</div></div></header>
      <div className="nfp-body">
        <div className="nfp-map-panel"><div className="nfp-scanbar" /><FootprintSVG selected={selected} assembled={assembled} onSelect={setSelected} /></div>
        <div className="nfp-right">
          <div className="nfp-rblock"><div className="nfp-sec-title">Active Node</div>{selectedPlatform ? <div className="nfp-node-card" style={{ borderColor: `${RISK_COLOR(selectedPlatform.risk)}25`, color: RISK_COLOR(selectedPlatform.risk) }}><span className="nfp-node-icon">{selectedPlatform.icon}</span><div className="nfp-node-name">{selectedPlatform.label}</div><div className="nfp-risk-badge" style={{ background: `${RISK_COLOR(selectedPlatform.risk)}15`, border: `1px solid ${RISK_COLOR(selectedPlatform.risk)}35`, color: RISK_COLOR(selectedPlatform.risk) }}>RISK {selectedPlatform.risk}% · {RISK_LABEL(selectedPlatform.risk)}</div><div className="nfp-stat-row">{statEntries(selectedPlatform).map(([k, v]) => <div key={k} className="nfp-stat-cell"><div className="nfp-stat-val">{String(v)}</div><div className="nfp-stat-key">{k}</div></div>)}</div></div> : <div style={{ padding: "18px 12px", textAlign: "center" }}>SELECT A NODE TO INSPECT PLATFORM</div>}</div>
          <div className="nfp-rblock"><div className="nfp-sec-title">Footprint Summary</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>{[{ val: PLATFORMS.length, lbl: "Platforms", color: "#00d4ff" }, { val: active, lbl: "Active", color: "#00ff9d" }, { val: critical, lbl: "Critical", color: "#ff3366" }].map((s) => <div key={s.lbl} style={{ padding: "8px 6px", borderRadius: 7, textAlign: "center", background: `${s.color}08`, border: `1px solid ${s.color}18` }}><div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div><div style={{ fontSize: 9, color: "#3a5a6a", letterSpacing: 1.5, textTransform: "uppercase" }}>{s.lbl}</div></div>)}</div></div>
          <div className="nfp-rscroll"><div className="nfp-sec-title">All Platforms</div><div className="nfp-plist">{[...PLATFORMS].sort((a, b) => b.risk - a.risk).map((p) => { const c = RISK_COLOR(p.risk); return <div key={p.id} className={`nfp-prow${selected === p.id ? " sel" : ""}`} style={{ borderColor: selected === p.id ? `${c}40` : "transparent", color: c }} onClick={() => setSelected(selected === p.id ? null : p.id)}><span className="nfp-prow-icon">{p.icon}</span><div style={{ flex: 1 }}><div className="nfp-prow-name">{p.label}</div><div className="nfp-risk-bar" style={{ width: `${p.risk}%`, background: c }} /></div><span className="nfp-prow-status" style={{ background: p.status === "active" ? "rgba(0,255,157,.1)" : "rgba(58,90,106,.1)", color: p.status === "active" ? "#00ff9d" : "#3a5a6a" }}>{p.status}</span><span className="nfp-prow-risk">{p.risk}%</span></div>; })}</div></div>
        </div>
      </div>
      <div className="nfp-statusbar">{[{ dot: "#00ff9d", text: "8 nodes mapped" }, { dot: "#ff3366", text: "3 critical exposures" }, { dot: "#ffb800", text: "9 breaches total" }].map((s) => <div key={s.text} className="nfp-sb-item"><div className="nfp-sb-dot" style={{ background: s.dot, boxShadow: `0 0 5px ${s.dot}` }} /><span>{s.text}</span></div>)}</div>
    </div>
  );
}
