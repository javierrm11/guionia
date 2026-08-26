"use client";

import { useRef, useState } from "react";
import type { PuntoRetencion } from "@/lib/youtube/oauth";

const W = 300;
const H = 110;
const MARGIN_LEFT = 32;
const MARGIN_BOTTOM = 18;
const VIEW_W = MARGIN_LEFT + W;
const VIEW_H = H + MARGIN_BOTTOM;

function formatPct(v: number) {
  return `${Math.round(v * 100)}%`;
}

export function RetencionChart({ datos }: { datos: PuntoRetencion[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (datos.length < 2) return null;

  const yMax = Math.max(1, Math.ceil(Math.max(...datos.map((d) => d.audienceWatchRatio)) * 10) / 10);
  const x = (ratio: number) => MARGIN_LEFT + ratio * W;
  const y = (valor: number) => H - (valor / yMax) * H;

  const puntos = datos.map((d) => [x(d.elapsedRatio), y(d.audienceWatchRatio)] as const);
  const linea = puntos.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const area = `${linea} L${puntos[puntos.length - 1][0].toFixed(1)},${H} L${puntos[0][0].toFixed(1)},${H} Z`;

  const retencionMedia =
    datos.reduce((suma, d) => suma + d.audienceWatchRatio, 0) / datos.length;
  const ultimoPunto = datos[datos.length - 1];

  function moverPuntero(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * VIEW_W;
    const ratio = Math.min(1, Math.max(0, (relX - MARGIN_LEFT) / W));

    let nearest = 0;
    let mejorDist = Infinity;
    for (let i = 0; i < datos.length; i++) {
      const dist = Math.abs(datos[i].elapsedRatio - ratio);
      if (dist < mejorDist) {
        mejorDist = dist;
        nearest = i;
      }
    }
    setHoverIndex(nearest);
  }

  const hover = hoverIndex != null ? datos[hoverIndex] : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-h3 text-text-primary">{formatPct(retencionMedia)}</span>
        <span className="text-caption text-text-secondary">retención media</span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full touch-pan-y"
        style={{ maxHeight: 160 }}
        onPointerMove={(e) => moverPuntero(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {[0, 0.5, 1].map((frac) => (
          <g key={frac}>
            <line
              x1={MARGIN_LEFT}
              x2={MARGIN_LEFT + W}
              y1={y(yMax * frac)}
              y2={y(yMax * frac)}
              stroke="rgba(17,17,20,0.08)"
              strokeWidth={1}
            />
            <text
              x={MARGIN_LEFT - 6}
              y={y(yMax * frac) + 3}
              textAnchor="end"
              fontSize={9}
              fill="var(--text-disabled)"
            >
              {formatPct(yMax * frac)}
            </text>
          </g>
        ))}

        {[0, 0.5, 1].map((frac) => (
          <text
            key={frac}
            x={x(frac)}
            y={VIEW_H - 4}
            textAnchor={frac === 0 ? "start" : frac === 1 ? "end" : "middle"}
            fontSize={9}
            fill="var(--text-disabled)"
          >
            {formatPct(frac)}
          </text>
        ))}

        <path d={area} fill="rgba(108,92,224,0.12)" />
        <path d={linea} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        <circle
          cx={x(ultimoPunto.elapsedRatio)}
          cy={y(ultimoPunto.audienceWatchRatio)}
          r={4}
          fill="var(--accent)"
          stroke="var(--bg-primary)"
          strokeWidth={2}
        />
        <text
          x={x(ultimoPunto.elapsedRatio) - 6}
          y={y(ultimoPunto.audienceWatchRatio) - 8}
          textAnchor="end"
          fontSize={10}
          fontWeight={600}
          fill="var(--text-primary)"
        >
          {formatPct(ultimoPunto.audienceWatchRatio)}
        </text>

        {hover && (
          <>
            <line
              x1={x(hover.elapsedRatio)}
              x2={x(hover.elapsedRatio)}
              y1={0}
              y2={H}
              stroke="rgba(17,17,20,0.15)"
              strokeWidth={1}
            />
            <circle
              cx={x(hover.elapsedRatio)}
              cy={y(hover.audienceWatchRatio)}
              r={4}
              fill="var(--accent)"
              stroke="var(--bg-primary)"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      {hover && (
        <p className="text-caption text-text-secondary">
          Al {formatPct(hover.elapsedRatio)} del vídeo: {formatPct(hover.audienceWatchRatio)} de audiencia
        </p>
      )}
    </div>
  );
}
