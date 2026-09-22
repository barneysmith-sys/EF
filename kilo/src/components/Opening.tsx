import { useEffect, useRef } from "react";
import Skyline from "./Skyline";
import { Wordmark } from "./ui";
import { geographyById } from "../lib/geo";
import { QUARTER_OPTIONS, type SearchCriteria } from "../lib/search";

interface Props {
  criteria: SearchCriteria;
  onCompose: () => void;
}

function scrollParent(el: HTMLElement): HTMLElement | Window {
  let n = el.parentElement;
  while (n) {
    const s = getComputedStyle(n).overflowY;
    if (s === "auto" || s === "scroll") return n;
    n = n.parentElement;
  }
  return window;
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function Opening({ criteria, onCompose }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const geo = geographyById(criteria.geographyId);
  const quarter = QUARTER_OPTIONS.find((q) => q.index === criteria.requiredByIndex)?.label;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      root.style.setProperty("--pan", "0.35");
      root.style.setProperty("--night", "0");
      return;
    }

    const scroller = scrollParent(root);
    let raf = 0;

    const apply = () => {
      const rect = root.getBoundingClientRect();
      const viewTop = scroller === window ? 0 : (scroller as HTMLElement).getBoundingClientRect().top;
      const viewH = scroller === window ? window.innerHeight : (scroller as HTMLElement).clientHeight;
      const travel = root.offsetHeight - viewH;
      const scrolled = viewTop - rect.top;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, scrolled / travel));
      // The painting plays through the first part of the scroll, then holds
      // so the line of copy can be read before the page moves on.
      const t = Math.min(1, p / 0.78);
      const pan = easeOut(Math.min(1, t / 0.5));
      const night = easeInOut(Math.min(1, Math.max(0, (t - 0.34) / 0.66)));
      root.style.setProperty("--pan", pan.toFixed(4));
      root.style.setProperty("--night", night.toFixed(4));
      root.classList.toggle("is-open", night > 0.62);
      root.querySelector(".opening-reveal")?.setAttribute("aria-hidden", night > 0.55 ? "false" : "true");
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / Math.max(r.height, 1) - 0.5;
      root.style.setProperty("--px", x.toFixed(4));
      root.style.setProperty("--py", y.toFixed(4));
    };

    apply();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section className="opening" ref={rootRef} aria-label="Opening">
      <div className="opening-sticky">
        <div className="opening-scene">
          <Skyline />
          <div className="opening-veil" />
        </div>

        <header className="opening-bar">
          <Wordmark size={18} />
          <span className="opening-chip">Demo prototype · mock data</span>
        </header>

        <div className="opening-title-wrap">
          <h1 className="opening-title">
            <span>Search. Verify.</span>
            <span>Secure.</span>
          </h1>
        </div>

        <div className="opening-reveal" aria-hidden="true">
          <p className="opening-meta">
            <span className="num">{criteria.mw} MW</span>
            <i />
            <span>{geo.label}</span>
            <i />
            <span className="num">{quarter}</span>
          </p>
          <p className="opening-lead">
            Name the megawatts and the date. Kilo finds where that load can actually be energized
            — transmission, generation, land, fiber, equipment — and turns one pathway into a request.
          </p>
          <button className="opening-cta" onClick={onCompose}>
            Compose a requirement
            <span aria-hidden>→</span>
          </button>
        </div>

        <button
          className="opening-scroll"
          onClick={() => {
            const scroller = scrollParent(rootRef.current!);
            const viewH = scroller === window ? window.innerHeight : (scroller as HTMLElement).clientHeight;
            scroller.scrollBy({ top: viewH * 0.72, behavior: "smooth" });
          }}
          aria-label="Continue"
        >
          <span>Scroll</span>
          <span className="opening-scroll-line" />
        </button>
      </div>
    </section>
  );
}
