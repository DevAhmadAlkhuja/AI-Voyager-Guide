import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./hero-slider.css";

type Slide = {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
};

type HeroSliderProps = {
  contained?: boolean;
};

const AUTOPLAY_MS = 5000;

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

const HeroSlider = ({ contained }: HeroSliderProps) => {
  const slides = useMemo<Slide[]>(() => {
    const images = import.meta.glob("@/assets/images/*.{png,jpg,jpeg,webp,avif,gif,svg}", {
      eager: true,
      import: "default",
    }) as Record<string, string>;

    const entries = Object.entries(images).sort(([a], [b]) => a.localeCompare(b));

    return entries.map(([path, src], idx) => {
      const file = path.split("/").pop() || `Slide ${idx + 1}`;
      return {
        src,
        alt: `Ai Voyager Guide slide ${idx + 1}: ${file}`,
        title: "Ai Voyager Guide",
        subtitle: "AI-powered travel inspiration, planning, and personalized experiences.",
        cta: "Start Your Journey",
        ctaHref: "/destinations",
      };
    });
  }, []);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerStartX = useRef<number | null>(null);

  const goTo = (next: number) => setActive(() => clampIndex(next, slides.length));
  const next = () => setActive((prev) => clampIndex(prev + 1, slides.length));
  const prev = () => setActive((prev) => clampIndex(prev - 1, slides.length));

  useEffect(() => {
    if (!slides.length) return;
    if (paused) return;

    const id = window.setInterval(() => {
      setActive((prevIndex) => clampIndex(prevIndex + 1, slides.length));
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current == null) return;

    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;

    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  };

  if (!slides.length) return null;

  const inner = (
    <div
      ref={rootRef}
      tabIndex={0}
      className="hero-slider__frame"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      role="region"
      aria-label="Homepage hero slider"
    >
      <div
        className="hero-slider__track"
        style={{
          width: `${slides.length * 100}%`,
          transform: `translate3d(-${active * (100 / slides.length)}%, 0, 0)`,
        }}
      >
        {slides.map((s, idx) => {
          const isActive = idx === active;
          return (
            <div
              key={s.src}
              className={`hero-slider__slide ${isActive ? "is-active" : ""}`}
              aria-hidden={!isActive}
              style={{ width: `${100 / slides.length}%` }}
            >
              <img
                src={s.src}
                alt={s.alt}
                className="hero-slider__image"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              <div className="hero-slider__overlay" />
              <div className="hero-slider__content">
                <div className="container mx-auto px-4 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                    <span className="text-sm font-medium text-white/90">AI Voyager</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white">
                    {s.title}
                  </h1>
                  <p className="mt-4 text-white/70 max-w-2xl mx-auto">
                    {s.subtitle}
                  </p>
                  <div className="mt-7 flex items-center justify-center gap-3">
                    <Button variant="coral" size="lg" className="text-base px-8 py-6" asChild>
                      <Link to={s.ctaHref}>{s.cta}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

        <button
          type="button"
          className="hero-slider__nav hero-slider__nav--prev"
          onClick={prev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="hero-slider__nav hero-slider__nav--next"
          onClick={next}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="hero-slider__dots" aria-label="Slide indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`hero-slider__dot ${idx === active ? "is-active" : ""}`}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === active ? "true" : "false"}
            />
          ))}
        </div>
    </div>
  );

  if (contained) {
    return (
      <section className="hero-slider hero-slider--contained w-full section-padding bg-background">
        <div className="container mx-auto px-4">
          {inner}
        </div>
      </section>
    );
  }

  return <section className="hero-slider w-full section-padding bg-background">{inner}</section>;
};

export default HeroSlider;
