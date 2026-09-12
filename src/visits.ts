export type Visit = {
  id: string;
  site: string;
  day: number;
  ts: number;
  group: '1인' | '2인' | '3인 이상';
  age: '10-20대' | '30-40대' | '50대 이상' | '응답 안 함';
  from: '영도 주민' | '부산 다른 지역' | '부산 외 지역' | '응답 안 함';
  channel: '지나가다' | 'SNS' | '지인 소개' | '기관 안내' | '응답 안 함';
  access: 1 | 2 | 3 | 4 | 5 | null;
  revisit: '예' | '아니오' | '모르겠음';
  concern: string[];
  memo: string;
};

export const OPEN_SITE = 'demo-bongsan-a';
export const PERIOD = 30;
const KEY = 'binteum-visits-v1';
const DAY_KEY = 'binteum-visit-day-v1';

export const CONCERNS = ['계단·경사', '주차', '찾기 어려움', '야간 어두움', '소음', '없음'];

export function loadVisits(): Visit[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((v) => v && typeof v.day === 'number' && typeof v.site === 'string') : [];
  } catch { return []; }
}

export function saveVisits(list: Visit[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(-2000))); return true; } catch { return false; }
}

export function clearVisits() {
  try { localStorage.removeItem(KEY); localStorage.removeItem(DAY_KEY); return true; } catch { return false; }
}

export function getDay(): number {
  try {
    const d = Number(localStorage.getItem(DAY_KEY));
    return Number.isFinite(d) && d >= 1 && d <= PERIOD ? d : 1;
  } catch { return 1; }
}

export function setDay(d: number) {
  const v = Math.max(1, Math.min(PERIOD, Math.round(d)));
  try { localStorage.setItem(DAY_KEY, String(v)); } catch { /* ignore */ }
  return v;
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export type Summary = {
  total: number;
  days: number;
  perDay: number[];
  heads: number;
  accessAvg: number | null;
  accessCount: number;
  revisitYes: number;
  revisitAnswered: number;
  concerns: { label: string; count: number }[];
  from: { label: string; count: number }[];
  channel: { label: string; count: number }[];
  memos: { day: number; text: string }[];
};

const tally = (list: Visit[], pick: (v: Visit) => string | string[]) => {
  const map = new Map<string, number>();
  for (const v of list) {
    const val = pick(v);
    for (const k of Array.isArray(val) ? val : [val]) map.set(k, (map.get(k) || 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
};

export function summarize(list: Visit[], day: number): Summary {
  const perDay = Array.from({ length: PERIOD }, (_, i) => list.filter((v) => v.day === i + 1).length);
  const heads = list.reduce((n, v) => n + (v.group === '1인' ? 1 : v.group === '2인' ? 2 : 3), 0);
  const scored = list.filter((v) => typeof v.access === 'number') as (Visit & { access: number })[];
  const answered = list.filter((v) => v.revisit !== '모르겠음');
  return {
    total: list.length,
    days: Math.max(1, Math.min(PERIOD, day)),
    perDay,
    heads,
    accessAvg: scored.length ? Math.round((scored.reduce((n, v) => n + v.access, 0) / scored.length) * 10) / 10 : null,
    accessCount: scored.length,
    revisitYes: answered.filter((v) => v.revisit === '예').length,
    revisitAnswered: answered.length,
    concerns: tally(list, (v) => v.concern),
    from: tally(list, (v) => v.from),
    channel: tally(list, (v) => v.channel),
    memos: list.filter((v) => v.memo.trim()).slice(-8).map((v) => ({ day: v.day, text: v.memo.trim() })).reverse(),
  };
}

const pick = <T,>(arr: T[], w: number[]) => {
  const total = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) { r -= w[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
};

export function seedVisits(days: number): Visit[] {
  const out: Visit[] = [];
  for (let d = 1; d <= days; d++) {
    const weekend = d % 7 === 6 || d % 7 === 0;
    const base = weekend ? 9 : 5;
    const n = Math.max(0, Math.round(base + (Math.random() * 4 - 2)));
    for (let i = 0; i < n; i++) {
      out.push({
        id: newId(),
        site: OPEN_SITE,
        day: d,
        ts: Date.now() - (days - d) * 86400000,
        group: pick(['1인', '2인', '3인 이상'], [4, 5, 2]) as Visit['group'],
        age: pick(['10-20대', '30-40대', '50대 이상', '응답 안 함'], [3, 5, 3, 1]) as Visit['age'],
        from: pick(['영도 주민', '부산 다른 지역', '부산 외 지역', '응답 안 함'], [4, 5, 2, 1]) as Visit['from'],
        channel: pick(['지나가다', 'SNS', '지인 소개', '기관 안내', '응답 안 함'], [4, 4, 3, 2, 1]) as Visit['channel'],
        access: pick([5, 4, 3, 2, 1, null], [2, 4, 3, 2, 1, 1]) as Visit['access'],
        revisit: pick(['예', '아니오', '모르겠음'], [5, 2, 3]) as Visit['revisit'],
        concern: [pick(CONCERNS, [4, 4, 3, 2, 2, 3])],
        memo: '',
      });
    }
  }
  return out;
}
