import { useRef, useState } from "react";
import "./draggable-globe.css";

type DraggableGlobeProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  variant?: "flat" | "realistic";
};

const DraggableGlobe = ({ size = "md", label = "Malaysia", variant = "flat" }: DraggableGlobeProps) => {
  const [rotation, setRotation] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartRotation = useRef<number>(0);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotation;
    setDragging(true);
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const dx = e.clientX - dragStartX.current;
    setRotation(dragStartRotation.current + dx * 0.35);
    e.stopPropagation();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragStartX.current = null;
    setDragging(false);
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <div className="draggable-globe" data-size={size} data-variant={variant} aria-label="Draggable globe">
      <svg
        viewBox="0 0 900 420"
        role="img"
        aria-label="Interactive globe"
        className={`draggable-globe__svg ${dragging ? "is-dragging" : ""}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {variant === "flat" ? (
          <>
            <defs>
              <clipPath id="dg_globeClip_flat">
                <circle cx="450" cy="235" r="165" />
              </clipPath>
            </defs>

            <circle cx="450" cy="235" r="172" fill="rgba(0,0,0,0.10)" opacity="0.18" />
            <circle cx="450" cy="235" r="165" fill="#f6f6f6" stroke="#cfcfcf" strokeWidth="1" />

            <g clipPath="url(#dg_globeClip_flat)">
              <g style={{ transformOrigin: "450px 235px", transform: `rotate(${rotation}deg)` }}>
                <g fill="#e9e9e9" stroke="#bdbdbd" strokeWidth="1">
                  <path d="M270 210c28-32 66-52 112-58 38-5 70 2 97 21 25 18 40 43 44 75 4 22 1 43-9 62-14 26-37 45-68 56-28 10-58 12-88 6-38-7-68-25-90-53-22-27-32-58-29-93 2-20 10-38 21-55z" />
                  <path d="M520 165c30-22 66-32 108-30 44 2 82 17 115 44 28 23 46 54 53 92 6 37 0 71-19 101-22 34-54 56-96 66-41 10-80 7-116-9-36-16-62-40-77-73-15-34-18-68-7-103 10-29 24-52 39-68z" />
                  <path d="M410 312c18-10 39-15 62-14 22 1 42 8 60 22 16 12 27 27 32 46 4 19 2 37-7 54-10 20-26 34-46 42-20 8-40 9-60 4-22-5-40-16-52-32-13-16-19-34-18-55 1-23 10-42 29-57z" />
                </g>

                <g stroke="#d8d8d8" strokeWidth="1" fill="none">
                  <path d="M285 235h330" />
                  <path d="M450 70v330" />
                  <path d="M450 70c-70 60-70 270 0 330" />
                  <path d="M450 70c70 60 70 270 0 330" />
                </g>

                <g>
                  <circle cx="535" cy="245" r="7" fill="#22c55e" opacity="0.95" />
                  <circle cx="535" cy="245" r="18" fill="#22c55e" opacity="0.15" />
                  <circle cx="535" cy="245" r="32" fill="#22c55e" opacity="0.08" />
                </g>
              </g>
            </g>

            {label ? (
              <g>
                <path
                  d="M535 232c9 0 16 7 16 16 0 11-16 27-16 27s-16-16-16-27c0-9 7-16 16-16z"
                  fill="#22c55e"
                  opacity="0.95"
                />
                <text x="565" y="250" fill="rgba(255,255,255,0.92)" fontSize="14" fontFamily="ui-sans-serif, system-ui">
                  {label}
                </text>
              </g>
            ) : null}
          </>
        ) : (
          <>
            <defs>
              <radialGradient id="dg_ocean" cx="35%" cy="28%" r="78%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.07)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
              </radialGradient>
              <radialGradient id="dg_specular" cx="30%" cy="28%" r="45%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <radialGradient id="dg_vignette" cx="50%" cy="50%" r="65%">
                <stop offset="60%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
              </radialGradient>
              <clipPath id="dg_globeClip">
                <circle cx="450" cy="235" r="165" />
              </clipPath>
            </defs>

            <circle cx="450" cy="235" r="172" fill="rgba(0,0,0,0.16)" opacity="0.4" />
            <circle cx="450" cy="235" r="165" fill="url(#dg_ocean)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <circle cx="450" cy="235" r="165" fill="url(#dg_specular)" />
            <circle cx="450" cy="235" r="165" fill="url(#dg_vignette)" />

            <circle cx="450" cy="235" r="167" fill="transparent" stroke="rgba(34,197,94,0.10)" strokeWidth="6" />

            <g clipPath="url(#dg_globeClip)">
              <g style={{ transformOrigin: "450px 235px", transform: `rotate(${rotation}deg)` }}>
                <g fill="rgba(255,255,255,0.22)">
                  <path d="M305 205c26-34 55-55 90-62 20-4 40-2 58 7 22 12 35 32 40 59 4 21 2 41-6 59-11 24-29 41-53 51-25 10-50 12-75 6-25-5-45-18-60-38-18-24-25-51-22-82 2-12 8-24 18-38z" />
                  <path d="M515 170c25-18 53-27 84-26 34 1 64 12 90 34 21 18 35 41 40 70 5 29 0 55-15 79-17 26-42 43-74 51-32 8-62 6-90-6-28-12-48-31-60-58-12-26-14-52-5-79 8-23 18-40 30-53z" />
                  <path d="M430 315c17-8 35-12 55-11 19 1 36 7 51 18 13 10 22 23 26 39 3 16 1 31-6 45-8 16-21 28-38 35-16 6-33 7-50 3-19-4-34-13-45-27-11-13-16-29-15-46 1-19 8-35 22-47z" />
                </g>

                <g stroke="rgba(255,255,255,0.14)" strokeWidth="1">
                  <path d="M285 235h330" />
                  <path d="M450 70v330" />
                  <path d="M450 70c-70 60-70 270 0 330" fill="none" />
                  <path d="M450 70c70 60 70 270 0 330" fill="none" />
                </g>

                <g>
                  <circle cx="535" cy="245" r="7" fill="#22c55e" opacity="0.98" />
                  <circle cx="535" cy="245" r="18" fill="#22c55e" opacity="0.16" />
                  <circle cx="535" cy="245" r="32" fill="#22c55e" opacity="0.08" />
                </g>
              </g>
            </g>

            {label ? (
              <g>
                <path d="M535 232c9 0 16 7 16 16 0 11-16 27-16 27s-16-16-16-27c0-9 7-16 16-16z" fill="#22c55e" opacity="0.95" />
                <text x="565" y="250" fill="rgba(255,255,255,0.92)" fontSize="14" fontFamily="ui-sans-serif, system-ui">
                  {label}
                </text>
              </g>
            ) : null}
          </>
        )}
      </svg>
    </div>
  );
};

export default DraggableGlobe;
