import React from 'react';

/** 빈틈랩 마스코트 "틈이" — 빈 공간이 살아난 모습을 표현한 캐릭터 세트. */

export type Tone = 'mint' | 'orange' | 'pink' | 'sky';

const TONES: Record<Tone, { body: string; shade: string; roof: string }> = {
  mint: { body: '#8BE3C8', shade: '#5FC7A8', roof: '#FF7A2F' },
  orange: { body: '#FFC48A', shade: '#F2A055', roof: '#FF4FA3' },
  pink: { body: '#FFB4D4', shade: '#F58BBA', roof: '#FFD23F' },
  sky: { body: '#A8D8FF', shade: '#7DBCF0', roof: '#35C9A9' },
};

type MascotProps = {
  tone?: Tone;
  mood?: 'happy' | 'think' | 'wow' | 'wink';
  size?: number;
  className?: string;
  title?: string;
};

/** 기본 마스코트: 작은 빈 공간(집)에 눈이 달린 형태 */
export function Mascot({ tone = 'mint', mood = 'happy', size = 120, className, title }: MascotProps) {
  const c = TONES[tone];
  return (
    <svg
      className={'mascot ' + (className || '')}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <ellipse cx="60" cy="108" rx="34" ry="6" fill="#101018" opacity=".18" />
      <g>
        {/* 몸체 */}
        <path d="M26 54 L60 28 L94 54 L94 96 Q94 102 88 102 L32 102 Q26 102 26 96 Z" fill={c.body} stroke="#101018" strokeWidth="4" strokeLinejoin="round" />
        {/* 그림자면 */}
        <path d="M78 54 L94 54 L94 96 Q94 102 88 102 L78 102 Z" fill={c.shade} />
        {/* 지붕 */}
        <path d="M20 56 L60 25 L100 56" fill="none" stroke={c.roof} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 56 L60 25 L100 56" fill="none" stroke="#101018" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".22" />
        {/* 얼굴 */}
        <Face mood={mood} />
        {/* 볼 */}
        <circle cx="40" cy="79" r="5.5" fill="#FF7A9C" opacity=".6" />
        <circle cx="80" cy="79" r="5.5" fill="#FF7A9C" opacity=".6" />
        {/* 다리 */}
        <rect x="42" y="100" width="9" height="10" rx="4" fill="#101018" />
        <rect x="69" y="100" width="9" height="10" rx="4" fill="#101018" />
      </g>
    </svg>
  );
}

function Face({ mood }: { mood: NonNullable<MascotProps['mood']> }) {
  if (mood === 'think') {
    return (
      <g>
        <circle cx="47" cy="70" r="6" fill="#101018" />
        <circle cx="73" cy="70" r="6" fill="#101018" />
        <circle cx="49" cy="68" r="2" fill="#fff" />
        <circle cx="75" cy="68" r="2" fill="#fff" />
        <path d="M52 86 Q60 82 68 86" fill="none" stroke="#101018" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'wow') {
    return (
      <g>
        <circle cx="47" cy="69" r="7" fill="#101018" />
        <circle cx="73" cy="69" r="7" fill="#101018" />
        <circle cx="49.5" cy="66.5" r="2.4" fill="#fff" />
        <circle cx="75.5" cy="66.5" r="2.4" fill="#fff" />
        <ellipse cx="60" cy="87" rx="6" ry="7" fill="#101018" />
      </g>
    );
  }
  if (mood === 'wink') {
    return (
      <g>
        <path d="M41 70 Q47 64 53 70" fill="none" stroke="#101018" strokeWidth="4" strokeLinecap="round" />
        <circle cx="73" cy="70" r="6" fill="#101018" />
        <circle cx="75" cy="68" r="2" fill="#fff" />
        <path d="M51 85 Q60 93 69 85" fill="none" stroke="#101018" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="47" cy="70" r="6" fill="#101018" />
      <circle cx="73" cy="70" r="6" fill="#101018" />
      <circle cx="49" cy="68" r="2" fill="#fff" />
      <circle cx="75" cy="68" r="2" fill="#fff" />
      <path d="M51 85 Q60 93 69 85" fill="none" stroke="#101018" strokeWidth="3.5" strokeLinecap="round" />
    </g>
  );
}

/** 역할 아이콘: 운영자 / 관리자 / 방문자 */
export function RoleIcon({ role, size = 56 }: { role: 'operator' | 'admin' | 'visitor'; size?: number }) {
  const common = { strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, stroke: '#101018' };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="roleicon">
      {role === 'operator' && (
        <g {...common} fill="none">
          <rect x="8" y="20" width="48" height="34" rx="6" fill="#8BE3C8" />
          <path d="M20 20 V14 Q20 10 24 10 H40 Q44 10 44 14 V20" />
          <circle cx="32" cy="37" r="7" fill="#FFD23F" />
          <path d="M32 30 V26" />
        </g>
      )}
      {role === 'admin' && (
        <g {...common} fill="none">
          <rect x="9" y="12" width="46" height="40" rx="6" fill="#A8D8FF" />
          <path d="M9 24 H55" />
          <path d="M19 34 H33" />
          <path d="M19 43 H27" />
          <circle cx="43" cy="39" r="7" fill="#FF7A2F" />
          <path d="M48 44 L54 50" />
        </g>
      )}
      {role === 'visitor' && (
        <g {...common} fill="none">
          <circle cx="32" cy="24" r="11" fill="#FFB4D4" />
          <path d="M13 54 Q13 38 32 38 Q51 38 51 54" fill="#FFB4D4" />
          <circle cx="28" cy="23" r="2.6" fill="#101018" stroke="none" />
          <circle cx="37" cy="23" r="2.6" fill="#101018" stroke="none" />
          <path d="M28 29 Q32.5 33 37 29" />
        </g>
      )}
    </svg>
  );
}

/** 조건 5종 픽토그램 */
export function CondIcon({ kind, size = 34 }: { kind: string; size?: number }) {
  const s = { stroke: '#101018', strokeWidth: 3.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const map: Record<string, React.ReactNode> = {
    안전: (
      <g {...s}>
        <path d="M20 4 L34 10 V19 Q34 30 20 36 Q6 30 6 19 V10 Z" fill="#FFD23F" />
        <path d="M14 20 L18 24 L26 15" />
      </g>
    ),
    권리: (
      <g {...s}>
        <rect x="7" y="5" width="26" height="30" rx="4" fill="#A8D8FF" />
        <path d="M13 14 H27M13 21 H27M13 28 H22" />
      </g>
    ),
    접근: (
      <g {...s}>
        <path d="M5 31 L15 31 L25 14 L35 14" fill="none" />
        <circle cx="30" cy="28" r="6" fill="#8BE3C8" />
        <path d="M5 31 L15 31" />
      </g>
    ),
    비용: (
      <g {...s}>
        <circle cx="20" cy="20" r="15" fill="#FFC48A" />
        <path d="M20 11 V29M15 16 H25M15 24 H25" />
      </g>
    ),
    주민협의: (
      <g {...s}>
        <circle cx="14" cy="15" r="6" fill="#FFB4D4" />
        <circle cx="27" cy="17" r="5" fill="#8BE3C8" />
        <path d="M4 33 Q4 23 14 23 Q21 23 23 28" />
        <path d="M19 33 Q19 26 27 26 Q35 26 35 33" />
      </g>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="condicon">
      {map[kind] || map['안전']}
    </svg>
  );
}

/** 섹션 사이 물결 구분선 */
export function Wave({ flip, color = '#FDF6E9' }: { flip?: boolean; color?: string }) {
  return (
    <svg className={'wave' + (flip ? ' flip' : '')} viewBox="0 0 1200 48" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 48 L1200 0 L1200 48 Z" fill={color} />
    </svg>
  );
}

/** 스티커형 라벨 */
export function Sticker({ children, tone = 'yellow' }: { children: React.ReactNode; tone?: 'yellow' | 'pink' | 'mint' | 'orange' }) {
  return <span className={'sticker sticker-' + tone}>{children}</span>;
}
