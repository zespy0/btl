import React, { useState } from 'react';
import { Site } from './data';

const KEY = 'binteum-gemini-key';
const MODEL = 'gemini-2.5-flash-image';

export type Plan = { layout: string; capacity: string; flow: string[]; cautions: string[] };

export function localPlan(site: Site, concept: string, seats: number): Plan {
  const area = site.spaceArea || 50;
  const usable = Math.round(area * 0.62);
  const cap = Math.max(4, Math.min(seats, Math.floor(usable / 2.5)));
  return {
    layout: `전체 ${area}㎡ 중 통행·안전 여유를 제외한 약 ${usable}㎡를 사용한다고 가정하고, 입구-전시-체험-계산 순으로 배치했습니다.`,
    capacity: `동시 체류 ${cap}명 기준 (1인 2.5㎡ 가정). 입력한 목표 ${seats}명과의 차이는 회전율로 조정해야 합니다.`,
    flow: [
      '입구 1.2m 폭 유지, 우측 벽면을 ' + concept + ' 주 전시면으로 사용',
      '중앙에 이동 가능한 테이블 배치, 피크 시간에는 치워 통행폭 확보',
      '계산·응대는 출구 방향에 배치해 동선 교차를 줄임',
      '피난 동선 1개 이상을 상시 개방하고 적치물 금지',
    ],
    cautions: [
      site.access.parking + ' 조건이므로 하역 시간과 방식을 사전에 정해야 합니다.',
      site.access.night + ' 상태이므로 야간 운영은 별도 확인이 필요합니다.',
      '이 배치안은 도면·구조 검토를 대신하지 않습니다.',
    ],
  };
}

export function ConceptImage({ site, concept }: { site: Site; concept: string }) {
  return (
    <svg className="concept" viewBox="0 0 320 200" role="img" aria-label={site.name + ' ' + concept + ' 배치 개념도'}>
      <rect width="320" height="200" fill="#f3f1e6" />
      <rect x="22" y="20" width="276" height="160" fill="#fbfaf3" stroke="#2f5350" strokeWidth="2" />
      <rect x="22" y="92" width="6" height="44" fill="#f3f1e6" />
      <text x="12" y="118" fontSize="9" fill="#4d6b66" transform="rotate(-90 12 118)">입구</text>
     <rect x="38" y="32" width="120" height="26" fill="#cfdcc9" />
      <text x="48" y="49" fontSize="10" fill="#31544e">전시 · {concept.slice(0, 12)}</text>
     <rect x="120" y="88" width="84" height="46" rx="4" fill="#e3d3bd" stroke="#b79a76" />
      <text x="162" y="116" fontSize="10" textAnchor="middle" fill="#6b5334">체험 테이블</text>
      <rect x="228" y="128" width="56" height="34" fill="#d6e0e6" stroke="#7f9aa5" />
      <text x="236" y="149" fontSize="10" fill="#3f5f6b">계산·응대</text>
      <path d="M30 114 H100 M100 114 V70 M100 70 H112 M212 111 H228" fill="none" stroke="#cf7a3c" strokeWidth="2" strokeDasharray="6 5" />
      <path d="M204 111 H212" fill="none" stroke="#cf7a3c" strokeWidth="2" />
      <path d="M228 111 V128" fill="none" stroke="#cf7a3c" strokeWidth="2" strokeDasharray="6 5" />
      <circle cx="30" cy="114" r="4" fill="#cf7a3c" />
      <text x="196" y="44" fontSize="10" fill="#4d6b66">피난 동선 확보 구역</text>
      <rect x="196" y="52" width="88" height="22" fill="none" stroke="#88a29a" strokeDasharray="4 4" />
      <text x="24" y="194" fontSize="9" fill="#7d8f81">개념 배치도 · 실제 도면 아님</text>
    </svg>
  );
}

export function useGemini() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem(KEY) || '');
  const save = (v: string) => { setApiKey(v); try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch { /* ignore */ } };
  return { apiKey, save };
}

export async function callGemini(apiKey: string, prompt: string): Promise<{ text?: string; image?: string }> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error('Gemini 응답 오류 ' + res.status + ': ' + detail.slice(0, 200));
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const out: { text?: string; image?: string } = {};
  for (const p of parts) {
    if (p.text && !out.text) out.text = p.text;
    const inline = p.inlineData || p.inline_data;
    if (inline?.data && !out.image) out.image = 'data:' + (inline.mimeType || inline.mime_type || 'image/png') + ';base64,' + inline.data;
  }
  if (!out.text && !out.image) throw new Error('응답에 사용할 수 있는 결과가 없습니다.');
  return out;
}

export function buildPrompt(site: Site, concept: string, seats: number) {
  return [
    '부산 영도의 빈집·유휴공간을 30일 팝업으로 시험 운영하려는 상황이다.',
    '공간: ' + site.name + ' (' + site.area + '), 면적 가정 ' + (site.spaceArea || '미상') + '㎡.',
    '접근 조건: ' + site.access.slope + ', ' + site.access.parking + ', ' + site.access.night + '.',
    '팝업 콘셉트: ' + concept + ', 목표 동시 수용 ' + seats + '명.',
    '요청: 위 조건에서 가능한 실내 배치안을 제안하고, 입구/전시/체험/계산 동선과 피난 동선 확보 방법을 한국어로 간단히 설명하라.',
    '단정적인 안전·법규 적합 판정은 하지 말고, 확인이 필요한 항목을 함께 적어라.',
  ].join('\n');
}
