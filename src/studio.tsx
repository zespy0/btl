import React, { useState } from 'react';
import { Site } from './data';
import { buildPrompt, callGemini, ConceptImage, localPlan, Plan, useGemini } from './ai';
import { Mascot } from './mascot';
import { SIMULATIONS, SimulationGallery, SimulationPreset } from './simulation';

export function Studio({ site, sites, onSite }: { site: Site; sites: Site[]; onSite: (id: string) => void }) {
  const { apiKey, save } = useGemini();
  const [keyInput, setKeyInput] = useState('');
  const [concept, setConcept] = useState(SIMULATIONS[2].concept);
  const [seats, setSeats] = useState(SIMULATIONS[2].seats);
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [live, setLive] = useState<{ text?: string; image?: string } | null>(null);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const [simulation, setSimulation] = useState(SIMULATIONS[2].id);

  const selectSimulation = (preset: SimulationPreset) => {
    setSimulation(preset.id);
    setConcept(preset.concept);
    setSeats(preset.seats);
    setLive(null);
    setErr('');
    setPlan(localPlan(site, preset.concept, preset.seats));
  };

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLive(null); setBusy(true);
    const useLive = mode === 'live' && !!apiKey;
    if (!useLive) {
      setTimeout(() => { setPlan(localPlan(site, concept, seats)); setBusy(false); }, 450);
      return;
    }
    try {
      const out = await callGemini(apiKey, buildPrompt(site, concept, seats));
      setLive(out);
      setPlan(localPlan(site, concept, seats));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : '호출에 실패했습니다.');
      setPlan(localPlan(site, concept, seats));
    } finally { setBusy(false); }
  };

  return (
    <>
      <SimulationGallery selected={simulation} onSelect={selectSimulation} />
      <div className="workgrid">
      <form onSubmit={run}>
        <h2>공간 모델링 조건</h2>
        <label>대상 공간
          <select value={site.id} onChange={(e) => onSite(e.target.value)}>
            {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label>팝업 콘셉트
          <input value={concept} onChange={(e) => setConcept(e.target.value)} maxLength={40} required />
        </label>
        <label>목표 동시 수용 인원 {seats}명
          <input type="range" min="4" max="40" value={seats} onChange={(e) => setSeats(+e.target.value)} />
        </label>
        <fieldset>
          <legend>생성 방식</legend>
          <label className="check"><input type="radio" name="mode" checked={mode === 'demo'} onChange={() => setMode('demo')} />내장 시연 모드 (외부 호출 없음)</label>
          <label className="check"><input type="radio" name="mode" checked={mode === 'live'} onChange={() => setMode('live')} />Gemini 연동 모드 (키 필요)</label>
        </fieldset>
        {mode === 'live' && (
          <div className="keybox">
            {apiKey ? (
              <>
                <p>키가 이 탭에만 저장되어 있습니다.</p>
                <button type="button" onClick={() => save('')}>키 삭제</button>
              </>
            ) : (
              <>
                <label>Gemini API 키
                  <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="AI Studio에서 발급한 키" autoComplete="off" />
                </label>
                <button type="button" onClick={() => { save(keyInput.trim()); setKeyInput(''); }}>키 적용</button>
                <small>키는 브라우저 세션에만 보관되며 서버로 전송하거나 저장하지 않습니다. 탭을 닫으면 사라집니다.</small>
              </>
            )}
          </div>
        )}
        <button className="primary wide" disabled={busy || (mode === 'live' && !apiKey)}>{busy ? '배치안 만드는 중…' : '배치안 생성'}</button>
        {mode === 'live' && !apiKey && <small>키를 적용해야 연동 모드를 실행할 수 있습니다.</small>}
      </form>
      <section className="results" aria-live="polite">
        {!plan && !busy && (
          <div className="empty">
            <Mascot tone="orange" mood="wow" size={110} className="mascot-bob" />
            <h2>공간을 어떻게 쓸 수 있을지 먼저 그려봅니다</h2>
            <p>면적과 접근 조건을 바탕으로 배치안과 수용 인원을 계산합니다. 안전·법규 적합 판정은 하지 않습니다.</p>
          </div>
        )}
        {plan && (
          <>
            <Badge>{live ? 'Gemini 응답 포함 · 참고용' : '내장 시연 모드 · 외부 호출 없음'}</Badge>
            <h2>{site.name}</h2>
            <p>{concept} · 목표 {seats}명</p>
            <ConceptImage site={site} concept={concept} />
            {live?.image && (
              <figure className="genfig">
                <img src={live.image} alt="Gemini가 생성한 공간 이미지" />
                <figcaption>Gemini 생성 이미지 · 실제 공간 사진이 아닙니다.</figcaption>
              </figure>
            )}
            <div className="result"><h3>배치 가정</h3><p>{plan.layout}</p></div>
            <div className="result"><h3>수용 인원</h3><p>{plan.capacity}</p></div>
            <div className="result"><h3>동선 제안</h3><ul>{plan.flow.map((f) => <li key={f}>{f}</li>)}</ul></div>
            <div className="result"><h3>확인이 필요한 항목</h3><ul>{plan.cautions.map((f) => <li key={f}>{f}</li>)}</ul></div>
            {live?.text && (
              <div className="result"><h3>Gemini 응답</h3><p className="pre">{live.text}</p><small>모델 생성 결과이며 사실 확인이 필요합니다.</small></div>
            )}
            {err && <p className="warning">Gemini 호출 실패: {err} · 아래 내장 계산 결과로 대체했습니다.</p>}
          </>
        )}
      </section>
      </div>
    </>
  );
}

const Badge = ({ children }: { children: React.ReactNode }) => <span className="badge">{children}</span>;
