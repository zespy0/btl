import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Site, readiness } from './data';

const YEONGDO: [number, number] = [35.0846, 129.0662];

const icon = (tone: string, on: boolean) =>
  L.divIcon({
    className: 'leafpin',
    html:
      '<span class="pindot" style="background:' + tone + ';' + (on ? 'box-shadow:0 0 0 4px rgba(35,79,75,.28);' : '') + '"></span>',
    iconSize: [on ? 20 : 15, on ? 20 : 15],
    iconAnchor: [on ? 10 : 7.5, on ? 10 : 7.5],
  });

export function LeafMap({ sites, active, onPick, height }: { sites: Site[]; active: string | null; onPick: (id: string) => void; height?: number }) {
  const box = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => {
    if (!box.current || map.current) return;
    const m = L.map(box.current, { center: YEONGDO, zoom: 14, scrollWheelZoom: false, attributionControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap 기여자',
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    setTimeout(() => m.invalidateSize(), 60);
    return () => { m.remove(); map.current = null; layer.current = null; };
  }, []);

  useEffect(() => {
    const g = layer.current;
    const m = map.current;
    if (!g || !m) return;
    g.clearLayers();
    const pts: [number, number][] = [];
    for (const s of sites) {
      const r = readiness(s);
      const tone = s.kind === '가상 시연 데이터' ? '#3f7f6b' : r.coreBlocked ? '#c07445' : '#5b7f86';
      const on = active === s.id;
      pts.push([s.lat, s.lng]);
      const mk = L.marker([s.lat, s.lng], { icon: icon(tone, on), title: s.name, keyboard: true, alt: s.name + ' 선택' });
      mk.bindTooltip(s.name.replace('[시연] ', ''), { direction: 'top', offset: [0, -10], permanent: on });
      mk.on('click', () => pick.current(s.id));
      mk.on('keypress', () => pick.current(s.id));
      mk.addTo(g);
    }
    if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.35), { maxZoom: 15, animate: false });
    setTimeout(() => m.invalidateSize(), 60);
  }, [sites, active]);

  return <div className="leafbox" style={{ height: height || 360 }} ref={box} role="application" aria-label="영도 후보지 지도" />;
}

export function SiteMiniMap({ site }: { site: Site }) {
  const box = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!box.current) return;
    const m = L.map(box.current, { center: [site.lat, site.lng], zoom: 16, scrollWheelZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap 기여자' }).addTo(m);
    L.marker([site.lat, site.lng], { icon: icon('#234f4b', true) }).addTo(m);
    const a0 = ((site.view.bearing - site.view.fov / 2) - 90) * Math.PI / 180;
    const a1 = ((site.view.bearing + site.view.fov / 2) - 90) * Math.PI / 180;
    const R = site.view.radius / 111000;
    const arc: [number, number][] = [[site.lat, site.lng]];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const a = a0 + ((a1 - a0) * i) / steps;
      arc.push([site.lat + R * Math.sin(a) * -1, site.lng + (R * Math.cos(a)) / Math.cos((site.lat * Math.PI) / 180)]);
    }
    L.polygon(arc, { color: '#cf7a3c', weight: 1, fillOpacity: 0.22 }).addTo(m);
    setTimeout(() => m.invalidateSize(), 60);
    return () => { m.remove(); };
  }, [site.id, site.lat, site.lng, site.view.bearing, site.view.fov, site.view.radius]);
  return <div className="leafbox mini" ref={box} role="img" aria-label={site.name + ' 위치와 기준 조망 방향 지도'} />;
}
