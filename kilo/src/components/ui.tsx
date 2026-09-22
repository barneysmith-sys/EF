import type { ReactNode } from "react";
import type { StatusMark } from "../data/types";

/* ─────────────────────────── Wordmark ─────────────────────────── */

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ fontSize: size }}>
      <svg
        className="wordmark-glyph"
        style={{ width: size * 0.78, height: size * 0.78 }}
        viewBox="0 0 24 24"
        aria-hidden
      >
        {/* Stylized bus bar with a tap — reads as electrical, not as a generic logo */}
        <path d="M4 3 V21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" />
        <path d="M4 12 L13 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
        <path d="M4 12 L13 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
        <circle cx="19" cy="12" r="2.6" fill="var(--signal)" />
        <path d="M13 12 H16.4" stroke="var(--signal)" strokeWidth="2.2" strokeLinecap="square" />
      </svg>
      <span className="wordmark-text">KILO</span>
    </span>
  );
}

/* ─────────────────────────── Status ─────────────────────────── */

export const STATUS_GLYPH: Record<StatusMark, string> = {
  ok: "✓",
  warn: "⚠",
  risk: "✕",
  pending: "·",
};

export function StatusDot({ status }: { status: StatusMark }) {
  return <span className={`sdot ${status}`} aria-hidden />;
}

export function StatusMarkIcon({ status, label }: { status: StatusMark; label?: string }) {
  return (
    <span className={`smark ${status}`}>
      <span className="smark-glyph">{STATUS_GLYPH[status]}</span>
      {label && <span className="smark-label">{label}</span>}
    </span>
  );
}

/* ─────────────────────────── Confidence ─────────────────────────── */

export function ConfidenceMeter({
  value,
  showLabel = true,
  width = 64,
}: {
  value: number;
  showLabel?: boolean;
  width?: number;
}) {
  const tone = value >= 80 ? "high" : value >= 65 ? "mid" : "low";
  return (
    <span className="conf">
      <span className="conf-track" style={{ width }}>
        <span className={`conf-fill ${tone}`} style={{ width: `${value}%` }} />
        {/* Ticks make the bar read as an instrument rather than a progress bar */}
        {[25, 50, 75].map((t) => (
          <span key={t} className="conf-tick" style={{ left: `${t}%` }} />
        ))}
      </span>
      {showLabel && <span className={`conf-val num ${tone}`}>{value}%</span>}
    </span>
  );
}

/* ─────────────────────────── Stat block ─────────────────────────── */

export function Stat({
  label,
  value,
  unit,
  sub,
  tone,
  size = "md",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  tone?: "signal" | "ok" | "warn" | "risk";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={`stat ${size}`}>
      <div className="mlabel">{label}</div>
      <div className={`stat-value num${tone ? ` ${tone}` : ""}`}>
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

/* ─────────────────────────── Segmented control ─────────────────────────── */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className={`segmented ${size}`} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          className={`seg-opt${value === o.value ? " active" : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Sparkline ─────────────────────────── */

export function Sparkline({
  data,
  width = 92,
  height = 22,
  tone = "signal",
}: {
  data: number[];
  width?: number;
  height?: number;
  tone?: "signal" | "ok" | "risk";
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / span) * (height - 3) - 1.5;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg className={`spark ${tone}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={area} className="spark-area" />
      <path d={line} className="spark-line" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="1.8" className="spark-dot" />
    </svg>
  );
}

/* ─────────────────────────── Workflow rail ─────────────────────────── */

const STEPS = ["Search", "Verify", "Request", "Secure"] as const;

export function WorkflowRail({
  active,
  compact = false,
}: {
  active: (typeof STEPS)[number];
  compact?: boolean;
}) {
  const idx = STEPS.indexOf(active);
  return (
    <div className={`wrail${compact ? " compact" : ""}`}>
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={`wrail-step${i === idx ? " active" : ""}${i < idx ? " done" : ""}`}
        >
          <span className="wrail-idx num">{i + 1}</span>
          <span className="wrail-label">{s}</span>
          {i < STEPS.length - 1 && <span className="wrail-arrow" aria-hidden />}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Buttons ─────────────────────────── */

export function Button({
  children,
  variant = "default",
  size = "md",
  onClick,
  disabled,
  full,
}: {
  children: ReactNode;
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
}) {
  return (
    <button
      className={`btn ${variant} ${size}${full ? " full" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── Panel scaffolding ─────────────────────────── */

export function SectionHead({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && <div className="mlabel">{eyebrow}</div>}
        <h2 className="section-title">{title}</h2>
      </div>
      {right && <div className="section-right">{right}</div>}
    </div>
  );
}

export function KeyValue({
  label,
  value,
  note,
  status,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  status?: StatusMark;
}) {
  return (
    <div className="kv">
      <div className="kv-label">{label}</div>
      <div className="kv-main">
        <span className={`kv-value num${status ? ` ${status}` : ""}`}>{value}</span>
        {status && <StatusDot status={status} />}
      </div>
      {note && <div className="kv-note">{note}</div>}
    </div>
  );
}

/* ─────────────────────────── Pathway mix bar ─────────────────────────── */

export function MixBar({
  grid,
  generation,
  storage,
  height = 6,
  showLegend = false,
}: {
  grid: number;
  generation: number;
  storage: number;
  height?: number;
  showLegend?: boolean;
}) {
  const total = grid + generation + storage;
  return (
    <div className="mixwrap">
      <div className="mixbar" style={{ height }}>
        <span className="mix grid" style={{ width: `${(grid / total) * 100}%` }} />
        <span className="mix gen" style={{ width: `${(generation / total) * 100}%` }} />
        <span className="mix stor" style={{ width: `${(storage / total) * 100}%` }} />
      </div>
      {showLegend && (
        <div className="mixlegend">
          <span className="mixleg grid num">{grid} MW grid</span>
          <span className="mixleg gen num">{generation} MW generation</span>
          <span className="mixleg stor num">{storage} MW storage</span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Demo banner ─────────────────────────── */

export function DemoNotice({ inline = false }: { inline?: boolean }) {
  return (
    <div className={`demo-notice${inline ? " inline" : ""}`}>
      <span className="demo-chip">Demo data</span>
      <span>
        Every figure on this screen is illustrative and generated for demonstration. Capacity,
        pricing, utility positions and energization dates are <strong>not verified</strong> and must
        not be relied upon.
      </span>
    </div>
  );
}
