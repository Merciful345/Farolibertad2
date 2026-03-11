"use client";

import { useEffect, useRef } from "react";
import type { Senal } from "@/types";

const ESTADO_COLOR: Record<string, string> = {
  en_servicio:  "#4ade80",
  sin_servicio: "#f87171",
  caido:        "#fb923c",
  dañado:       "#fbbf24",
};

interface Props {
  senales: Senal[];
  onMarkerClick?: (senal: Senal) => void;
}

export function MapaSeñales({ senales, onMarkerClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<import("leaflet").Map | null>(null);
  const markersRef   = useRef<import("leaflet").CircleMarker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [-42, -63],
        zoom:   5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when señales change
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      for (const senal of senales) {
        if (!senal.lat || !senal.lng) continue;

        const color   = ESTADO_COLOR[senal.estado?.nombre ?? ""] ?? "#94a3b8";
        const marker  = L.circleMarker([senal.lat, senal.lng], {
          radius:      8,
          fillColor:   color,
          color:       "#0f1923",
          weight:      2,
          opacity:     1,
          fillOpacity: 0.9,
        });

        const estadoLabel = senal.estado?.label ?? "—";
        const tipoLabel   = senal.categoria?.label ?? "—";

        marker.bindPopup(`
          <div style="font-family:monospace;font-size:12px;color:#e2e8f0;background:#162233;border-radius:8px;padding:12px;min-width:180px">
            <p style="font-weight:bold;font-size:13px;margin-bottom:4px">${senal.nombre}</p>
            <p style="color:#4a9edd;margin-bottom:6px">${senal.codigo}</p>
            <p style="color:#94a3b8;margin-bottom:2px">${tipoLabel} · ${senal.provincia ?? ""}</p>
            <p style="margin-top:6px">
              <span style="background:${color}22;color:${color};border:1px solid ${color}44;border-radius:20px;padding:2px 8px;font-size:11px">
                ${estadoLabel}
              </span>
            </p>
          </div>
        `, {
          className: "mapa-popup",
          maxWidth: 250,
        });

        if (onMarkerClick) marker.on("click", () => onMarkerClick(senal));
        marker.addTo(mapRef.current!);
        markersRef.current.push(marker);
      }
    });
  }, [senales, onMarkerClick]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
