import React, { useState } from 'react';
import { SITES, Site, readiness } from './data';

const SEA = 'M0 0 H100 V16 Q70 26 52 18 Q30 8 0 22 Z';
const dirName = (b: number) => ['북', '북동', '동', '남동', '남', '남서', '서', '북서'][Math.round((((b % 360) + 360) % 360) / 45) % 8];

export function IslandMap({ sites, active, onPick }: { sites: Site[]; active: string | null; onPick: (id: string) => void }) {
  return (
    <svg className="mapsvg" viewBox="0 0 100 100" role="img" aria-label="영도 후보지 개략 지도. 각 핀을 눌러 후보지를 선택합니다.">
      <rect width="100" height="100" fill="#cfe3e4" />
      <path d={SEA} fill="#b7d5d8" />
      <path d="M12 26 Q30 10 56 18 Q82 26 88 48 Q92 74 66 86 Q38 96 20 74 Q8 52 12 26 Z" fill="#dfe6d4" stroke="#9db3a4" strokeWidth="0.4" />
      <path d="M20 40 Q44 30 62 42 Q78 52 72 70" fill="none" stroke="#f2efe3" strokeWidth="3" />
      <path d="M20 40 Q44 30 62 42 Q78 52 72 70" fill="none" stroke="#b9c9bd" strokeWidth="0.3" strokeDasharray="2 2" />
      <text x="76" y="14" fontSize="3" fill="#5b7b80">영도 앞바다</text>
      <text x="28" y="94" fontSize="3" fill="#7d8f81">개략도 · 실제 좌표 아님</text>
      {sites.map((s) => {
        const r = readiness(s);
        const tone = s.kind === '가상 시연 데이터' ? '#3f7f6b' : r.coreBlocked ? '#c07445' : '#5b7f86';
        return (
          <g key={s.id} className={'pin' + (active === s.id ? ' pinon' : '')} onClick={() => onPick(s.id)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.id); } }}
            aria-label={s.name + ' 선택'}>
            <circle cx={s.x} cy={s.y} r={active === s.id ? 3.6 : 2.6} fill={tone} />
           <circle cx={s.x} cy={s.y} r="1" fill="#fff" />
            <text x={s.x} y={s.y - 4.6} fontSize="2.6" textAnchor="middle" fill="#2c4a49" className="pinlabel">{s.name.replace('[시연] ', '')}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ViewStudy({ site }: { site: Site }) {
  const [bearing, setBearing] = useState(site.view.bearing);
  const [fov, setFov] = useState(site.view.fov);
  const [floor, setFloor] = useState(1);
  const measured = bearing === site.view.bearing && fov === site.view.fov && floor === 1;
  const eye = site.view.elevation + (floor - 1) * 3;
  const reach = Math.round(site.view.radius * (1 + (floor - 1) * 0.18));
  const cx = 50, cy = 62, R = 42;
  const a0 = ((bearing - fov / 2) - 90) * Math.PI / 180;
  const a1 = ((bearing + fov / 2) - 90) * Math.PI / 180;
  const arc = ['M', cx, cy, 'L', cx + R * Math.cos(a0), cy + R * Math.sin(a0), 'A', R, R, 0, fov > 180 ? 1 : 0, 1, cx + R * Math.cos(a1), cy + R * Math.sin(a1), 'Z'].join(' ');
  const seaShare = Math.max(0, Math.min(100, Math.round(((180 - Math.abs((((bearing - 130) % 360) + 540) % 360 - 180)) / 180) * 100)));
  return (
    <div className="viewwrap">
      <div className="viewcanvas">
        <svg viewBox="0 0 100 100" role="img" aria-label={'조망 범위 도식. 방위 ' + bearing + '도, 화각 ' + fov + '도'}>
          <rect width="100" height="100" fill="#eef2ea" />
          <path d="M0 0 H100 V34 Q64 44 40 34 Q18 26 0 38 Z" fill="#cbdee1" />
          <path d="M0 30 Q22 16 44 28 Q66 40 100 24 V40 Q64 50 38 40 Q16 32 0 44 Z" fill="#9fb8a8" opacity="0.7" />
          <path d={arc} fill="#e08a4c" opacity="0.32" />
          <path d={arc} fill="none" stroke="#cf7a3c" strokeWidth="0.5" />
          <circle cx={cx} cy={cy} r="2.4" fill="#24514f" />
          <text x={cx} y={cy + 7} fontSize="3" textAnchor="middle" fill="#2c4a49">후보지</text>
          {[0, 90, 180, 270].map((d) => {
            const a = (d - 90) * Math.PI / 180;
            return <text key={d} x={cx + 46 * Math.cos(a)} y={cy + 46 * Math.sin(a) + 1} fontSize="3" textAnchor="middle" fill="#6f8480">{dirName(d)}</text>;
          })}
        </svg>
      </div>
      <div className="viewctl">
        <label>조망 방위 {bearing}° ({dirName(bearing)})
          <input type="range" min="0" max="359" value={bearing} onChange={(e) => setBearing(+e.target.value)} />
        </label>
        <label>수평 화각 {fov}°
          <input type="range" min="30" max="180" value={fov} onChange={(e) => setFov(+e.target.value)} />
        </label>
        <label>시점 층수 {floor}층
          <input type="range" min="1" max="3" value={floor} onChange={(e) => setFloor(+e.target.value)} />
        </label>
        <dl className="viewout">
          <div><dt>기준 시점 고도</dt><dd>약 {eye}m</dd></div>
          <div><dt>가시 거리(가정)</dt><dd>약 {reach}m</dd></div>
          <div><dt>바다 방향 일치도</dt><dd>{seaShare}%</dd></div>
          <div><dt>차폐 요소</dt><dd>{site.view.obstruct}</dd></div>
        </dl>
        <p className="viewnote">
          {measured
            ? (site.kind === '현장 실증 기록' ? '기준값은 현장 답사에서 기록한 조망 방향이며, 각도와 거리는 개략도 기준 추정입니다.' : '기준값은 시연을 위한 가정값입니다.')
            : '사용자가 조정한 값입니다. 실제 측량 결과가 아니며 현장 확인이 필요합니다.'}
        </p>
      </div>
    </div>
  );
}

export const siteById = (id: string) => SITES.find((s) => s.id === id) as Site;
