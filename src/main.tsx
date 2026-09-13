import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { SITES, Site, CONDS, groupConds, readiness } from './data';
import { ViewStudy } from './map';
import { LeafMap, SiteMiniMap } from './leafmap';
import { Dashboard } from './dash';
import { SurveyForm, SurveyQR } from './survey';
import { clearVisits, getDay, loadVisits, OPEN_SITE, PERIOD, saveVisits, seedVisits, setDay as persistDay, summarize, Visit } from './visits';
import { buildPrompt, callGemini, ConceptImage, localPlan, Plan, useGemini } from './ai';
import { Studio } from './studio';
import { AdminView, VisitorView } from './roles';
import { Mascot, RoleIcon, CondIcon, Tone } from './mascot';
import { Ticker } from './ticker';

type Role = 'operator' | 'admin' | 'visitor';
const ROLES: { id: Role; name: string; desc: string; mark: string }[] = [
  { id: 'operator', name: '팝업 운영자', desc: '후보지를 비교하고 준비 순서를 정합니다', mark: '◎' },
  { id: 'admin', name: '앱 관리자', desc: '후보지 상태와 시연 데이터를 관리합니다', mark: '▤' },
  { id: 'visitor', name: '방문자', desc: '공개된 팝업 정보를 확인합니다', mark: '☺' },
];
const SITE_TONE = (site: Site): Tone =>
  site.kind === '가상 시연 데이터' ? 'mint' : readiness(site).coreBlocked ? 'orange' : 'sky';
const KEY = 'binteum-demo-v2';
type Saved = { site: string; concept: string; days: number; budget: number; seats: number; important: string[]; items: string[]; checked: boolean[] };
function read(): Saved | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    return s && Array.isArray(s.items) && Array.isArray(s.checked) && SITES.some((x) => x.id === s.site) ? s : null;
  } catch { return null; }
}
const Badge = ({ children }: { children: React.ReactNode }) => <span className="badge">{children}</span>;
const mark = (s: string) => (s === '확인' ? '✓' : s === '확인 필요' ? '!' : '?');
const Title = ({ tag, title, text }: { tag: string; title: string; text: string }) => (
  <div className="title"><div className="eyebrow">{tag}</div><h1>{title}</h1><p>{text}</p></div>
);

function SiteCard({ site, onOpen }: { site: Site; onOpen: () => void }) {
  const r = readiness(site);
  return (
    <article>
      <div className={'siteart ' + (site.kind === '가상 시연 데이터' ? 'artdemo' : r.coreBlocked ? 'artblock' : 'artplain')}>
        <span>{site.area}</span><span>{site.kind}</span>
        <span className="artmascot">
          <Mascot tone={SITE_TONE(site)} mood={r.coreBlocked ? 'think' : 'happy'} size={64} />
        </span>
      </div>
      <div className="cardbody">
        <h2>{site.name}</h2>
        <p>{site.note}</p>
        <div className="meter" aria-hidden="true">
          <i style={{ flex: r.ok || 0.001 }} className="m1" /><i style={{ flex: r.need || 0.001 }} className="m2" /><i style={{ flex: r.unknown || 0.001 }} className="m3" />
        </div>
        <p className="metertext">확인 {r.ok} · 확인 필요 {r.need} · 미확인 {r.unknown} (총 {r.total}항목)</p>
        <p className={r.coreBlocked ? 'warning' : 'okline'}>
          {r.coreBlocked
            ? site.blocker || '권리 또는 안전 조건 미확인 · 운영 보류'
            : r.corePending
              ? '시연 기준 대부분 충족 · 일부 항목 확인 필요'
              : '시연 기준 조건 충족 · 실제 허가·계약은 별도 확인 필요'}
        </p>
        <button className="wide" onClick={onOpen}>상세 조건 · 조망 보기 →</button>
      </div>
    </article>
  );
}

function Detail({ site, onBack, onPlan }: { site: Site; onBack: () => void; onPlan: () => void }) {
  const r = readiness(site);
  return (
    <>
      <button onClick={onBack}>← 후보지 목록</button>
      <Title tag={site.kind} title={site.name} text={site.note} />
      <div className={r.coreBlocked ? 'alert' : 'alert ok'}>
        <strong>
          {mark(r.coreBlocked ? '미확인' : r.corePending ? '확인 필요' : '확인')}{' '}
          {r.coreBlocked
            ? site.blocker || '권리·안전 조건 미확인 · 운영 보류'
            : r.corePending
              ? '대부분 정리됨 · 일부 항목은 관계기관 확인 필요'
              : '시연 기준으로 준비 조건이 정리된 상태'}
        </strong>
        <p>{site.kind === '가상 시연 데이터' ? '이 공간의 모든 값은 시연을 위한 가정값이며 실재하는 매물이 아닙니다.' : '권리·안전·주민협의가 확인되기 전에는 운영을 보류합니다.'}</p>
      </div>
      <p className="dim">면적: {site.spaceArea ? site.spaceArea + '㎡' : '미입력'} · {site.spaceNote}</p>
      <h2 className="sechead">지도 기반 조망(뷰) 측정</h2>
      <p className="dim">방위·화각·시점 층수를 조정해 조망 범위를 비교합니다. 개략도 기준 추정이며 실제 측량이 아닙니다.</p>
      <SiteMiniMap site={site} />
      <p className="dim">지도에 표시된 부채꼴은 기준 조망 방향입니다. 좌표는 후보지 위치를 나타내는 근사값입니다.</p>
      <ViewStudy site={site} />
      <h2 className="sechead">다섯 가지 조건</h2>
      <div className="conditiongrid">
        {groupConds(site).map((g, i) => (
          <article className="condition" key={g.key}>
            <h2><CondIcon kind={g.key} /> {g.key} <span>0{i + 1}</span></h2>
            {g.items.map((it) => (
              <div className="field" key={it.label}>
                <strong>{it.label}</strong>
                <Badge>{mark(it.status)} {it.status}</Badge>
                <p>{it.note}</p>
                <small>출처: {it.source}</small>
              </div>
            ))}
          </article>
        ))}
      </div>
      <p className="dim">상태 범례: ✓ 확인 · ! 확인 필요 · ? 미확인. 이 정보는 검토용이며 법적·안전 적합 판정이 아닙니다.</p>
      <button className="primary" onClick={onPlan}>이 후보지로 공간 모델링 →</button>
    </>
  );
}

function Prep({ site, saved, onSave, onReset }: { site: Site; saved: Saved | null; onSave: (s: Saved) => void; onReset: () => void }) {
  const [concept, setConcept] = useState(saved?.concept ?? '로컬 브랜드 전시·판매');
  const [days, setDays] = useState(saved?.days ?? 30);
  const [budget, setBudget] = useState(saved?.budget ?? 300);
  const [seats, setSeats] = useState(saved?.seats ?? 12);
  const [important, setImportant] = useState<string[]>(saved?.important ?? ['접근성', '주민협의']);
  const [result, setResult] = useState<Saved | null>(saved);
  const [busy, setBusy] = useState(false);
  const toggle = (v: string) => setImportant(important.includes(v) ? important.filter((x) => x !== v) : [...important, v]);
  const gen = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      const open = site.conds.filter((c) => c.status !== '확인');
      const items = [
        open.length
          ? '우선 확인: ' + open.slice(0, 3).map((c) => c.key + '/' + c.label).join(', ') + ' 항목을 관계기관과 소유자 동의 절차를 통해 확인합니다. 개인정보 제공은 요청하지 않습니다.'
          : '이 공간은 시연 기준으로 조건이 정리되어 있습니다. 실제 진행 시에는 동일 항목의 최신 근거를 다시 확인합니다.',
        concept + ' 목적의 사용 범위와 ' + days + '일 운영 기간을 기준으로 용도·신고 요건, 소방·피난 안전 확인의 선행 조건을 구청 담당 부서에 질의합니다. 부서 간 순서는 기관 답변에 따라 달라질 수 있습니다.',
        [
          important.includes('접근성') ? '이동 약자 보행·승하차 동선(' + site.access.slope + ')을 확인하고 해결 전 이용 제한을 안내합니다.' : '',
          important.includes('주차·하역') ? '하역 방식과 시간을 정합니다(' + site.access.parking + ').' : '',
          important.includes('야간 운영') ? '야간 조도(' + site.access.night + ')를 측정하고 미해결 시 야간 운영을 보류합니다.' : '',
          important.includes('주민협의') ? '운영시간·소음·쓰레기·민원 대응 체계를 주민과 사전 합의합니다.' : '',
          '예산 ' + budget + '만원과 동시 수용 ' + seats + '명은 사용자 가정입니다. 견적과 수용인원은 현장 확인이 필요합니다.',
        ].filter(Boolean).join(' '),
        '권리 동의, 안전·소방, 주민협의, 야간 보행 안전 중 핵심 항목이 미확인이면 운영을 보류합니다. 좋은 조망이나 낮은 비용으로 핵심 제약을 상쇄하지 않습니다.',
      ];
      setResult({ site: site.id, concept, days, budget, seats, important, items, checked: items.map(() => false) });
      setBusy(false);
    }, 400);
  };
  return (
    <div className="workgrid">
      <form onSubmit={gen}>
        <h2>운영 계획</h2>
        <p className="dim">{site.name}</p>
        <label>팝업 콘셉트<input value={concept} onChange={(e) => setConcept(e.target.value)} maxLength={40} required /></label>
        <div className="twocol">
          <label>운영 기간 (일)<input type="number" min="1" max="365" value={days} onChange={(e) => setDays(+e.target.value)} required /></label>
          <label>예산 가정 (만원)<input type="number" min="1" max="100000" value={budget} onChange={(e) => setBudget(+e.target.value)} required /></label>
        </div>
        <label>목표 동시 수용 {seats}명<input type="range" min="4" max="40" value={seats} onChange={(e) => setSeats(+e.target.value)} /></label>
        <fieldset>
          <legend>중요 조건 (복수 선택)</legend>
          {['접근성', '야간 운영', '주차·하역', '주민협의'].map((x) => (
            <label className="check" key={x}><input type="checkbox" checked={important.includes(x)} onChange={() => toggle(x)} />{x}</label>
          ))}
        </fieldset>
        <button className="primary wide" disabled={busy}>{busy ? '초안 만드는 중…' : result ? '다시 생성' : '확인 순서 만들기'}</button>
        <small>개인정보 입력 없이 이 브라우저에서만 처리합니다.</small>
      </form>
      <section className="results" aria-live="polite">
        {result ? (
          <>
            <Badge>참고용 초안 · 관계기관 확인 필요</Badge>
            <h2>{site.name}</h2>
            <p>{result.concept} · {result.days}일 · 예산 가정 {result.budget}만원</p>
            {result.items.map((item, i) => (
              <div className="result" key={i}>
                <h3>{['01 우선 확인', '02 다음 단계', '03 운영 보완안', '04 중단/보류 기준'][i]}</h3>
                <p>{item}</p>
                <label className="check">
                  <input type="checkbox" checked={result.checked[i]} onChange={() => { const n = { ...result, checked: result.checked.map((v, j) => (j === i ? !v : v)) }; setResult(n); if (saved) onSave(n); }} />
                  문의 준비 완료 (적합 확인 아님)
                </label>
              </div>
            ))}
            <div className="actions">
              <button className="primary" onClick={() => onSave(result)}>체크리스트로 저장</button>
              <button onClick={() => window.print()}>인쇄 / PDF 저장</button>
              <button onClick={() => { onReset(); setResult(null); }}>데모 데이터 초기화</button>
            </div>
          </>
        ) : (
          <div className="empty">
            <Mascot tone="pink" mood="think" size={110} className="mascot-bob" />
            <h2>막연한 계획을 구체적인 질문으로</h2>
            <p>운영 계획을 입력하면 우선 확인부터 보류 기준까지 정리합니다. 미확인 조건을 적합으로 바꾸지 않습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}

const OP_NAV = ['시작하기', '후보지 지도', '공간 모델링', '준비 순서', '30일 실증'];

function App() {
  const fromQR = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('survey') === OPEN_SITE;
  const [role, setRole] = useState<Role>(fromQR ? 'visitor' : 'operator');
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState(false);
  const [siteId, setSiteId] = useState(SITES[0].id);
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('전체');
  const [kind, setKind] = useState('전체');
  const [onlyReady, setOnlyReady] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(read);
  const [notice, setNotice] = useState('');
  const [visits, setVisits] = useState<Visit[]>(loadVisits);
  const [day, setDayState] = useState<number>(getDay);
  const [survey, setSurvey] = useState(false);
  useEffect(() => { if (fromQR) setSurvey(true); }, [fromQR]);
  const site = SITES.find((s) => s.id === siteId) as Site;
  useEffect(() => { window.scrollTo(0, 0); }, [role, page, detail]);
  const areas = ['전체', ...Array.from(new Set(SITES.map((s) => s.area)))];
  const filtered = SITES.filter((s) =>
    s.name.includes(query) && (area === '전체' || s.area === area) && (kind === '전체' || s.kind === kind) && (!onlyReady || !readiness(s).coreBlocked));
  const open = (id: string) => { setSiteId(id); setDetail(true); setRole('operator'); setPage(1); };
  const persist = (s: Saved) => {
    try { localStorage.setItem(KEY, JSON.stringify(s)); setSaved(s); setNotice('이 브라우저에 체크리스트를 저장했습니다.'); }
    catch { setNotice('저장 공간을 사용할 수 없습니다. 인쇄 기능을 이용하세요.'); }
  };
  const reset = () => {
    try { localStorage.removeItem(KEY); setSaved(null); setNotice('저장한 체크리스트를 삭제했습니다.'); }
    catch { setNotice('저장 공간에 접근할 수 없습니다.'); }
  };
  const roleMeta = ROLES.find((r) => r.id === role) as (typeof ROLES)[number];
  const openSite = SITES.find((s) => s.id === OPEN_SITE) as Site;
  const openVisits = visits.filter((v) => v.site === OPEN_SITE && v.day <= day);
  const sum = summarize(openVisits, day);
  const surveyUrl = window.location.origin + '/?survey=' + OPEN_SITE;
  const pushVisit = (v: Visit) => {
    const next = [...visits, v];
    setVisits(next);
    if (!saveVisits(next)) setNotice('저장 공간을 사용할 수 없어 이번 응답은 화면에만 표시됩니다.');
  };
  const seed = () => {
    const upto = Math.max(day, 14);
    const next = [...visits, ...seedVisits(upto)];
    setVisits(next);
    setDayState(persistDay(upto));
    saveVisits(next);
    setNotice('시연용 예시 응답을 채웠습니다. 실제 운영 성과가 아닙니다.');
  };
  const wipe = () => {
    clearVisits();
    setVisits([]);
    setDayState(1);
    setNotice('수집된 방문 데이터를 모두 삭제했습니다.');
  };
  const changeDay = (d: number) => setDayState(persistDay(d));

  return (
    <>
      <a className="skip" href="#main">본문으로 이동</a>
      <aside>
        <button className="brand" onClick={() => { setRole('operator'); setPage(0); setDetail(false); }}>
          <span className="brandmark"><Mascot tone="mint" mood="wink" size={34} /></span>
          <span className="brandtext">빈틈랩<small>BINTEUM LAB</small></span>
        </button>
        <div className="navlabel">역할 선택</div>
        <nav aria-label="역할">
          {ROLES.map((r) => (
            <button key={r.id} className={role === r.id ? 'active' : ''} aria-current={role === r.id ? 'page' : undefined}
              onClick={() => { setRole(r.id); setPage(0); setDetail(false); }}>
              <span><RoleIcon role={r.id} size={22} /></span>{r.name}
            </button>
          ))}
        </nav>
        {role === 'operator' && (
          <>
            <div className="navlabel">운영자 메뉴</div>
            <nav aria-label="운영자 메뉴">
              {OP_NAV.map((n, i) => (
                <button key={n} className={'sub' + (page === i ? ' active' : '')} aria-current={page === i ? 'page' : undefined}
                  onClick={() => { setPage(i); setDetail(false); }}>{n}</button>
              ))}
            </nav>
          </>
        )}
        <div className="asidefoot">
          <strong>작게 시작하고,<br />함께 확인합니다.</strong>
          <p>부산 영도 · 30일 팝업 준비</p>
          <Badge>프로토타입</Badge>
        </div>
      </aside>
      <div className="shell">
        <header>
          <span>{roleMeta.name} / <b>{role === 'operator' ? (detail ? '후보지 상세' : OP_NAV[page]) : roleMeta.desc}</b></span>
          <Badge>◌ 프로토타입 · 시연 데이터 포함</Badge>
        </header>
        <main id="main">
          <div role="status" className={notice ? 'notice' : 'sr'}>{notice}</div>
          {role === 'admin' && (
            <>
              <Title tag="ADMIN CONSOLE" title="후보지와 공개 상태를 관리합니다." text="조건 집계, 방문자 공개 여부, 문의 처리 상태를 한 곳에서 확인하는 시연 화면입니다." />
              <AdminView onOpen={open} />
              <h2 className="sechead">30일 실증 · 운영 현황</h2>
              <p className="dim">{openSite.name.replace('[시연] ', '')}에서 수집 중인 방문 설문입니다.</p>
              <Dashboard role="admin" site={openSite} sum={sum} day={day} onDay={changeDay} onSeed={seed} onClear={wipe} live={openVisits} />
            </>
          )}
          {role === 'visitor' && (
            <>
              <Title tag="VISITOR" title="가기 전에 알아야 할 것부터." text="공개된 팝업의 운영 시간과 접근 조건을 먼저 안내합니다." />
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={!survey} className={!survey ? 'on' : ''} onClick={() => setSurvey(false)}>팝업 정보</button>
                <button role="tab" aria-selected={survey} className={survey ? 'on' : ''} onClick={() => setSurvey(true)}>QR 설문 참여</button>
              </div>
              {survey ? (
                <>
                  <div className="surveywrap">
                    <div>
                      <h2>현장 QR</h2>
                      <p className="dim">팝업 입구에 붙이는 QR입니다. 방문자가 휴대폰으로 찍으면 아래 설문이 열립니다. 시연에서는 오른쪽 설문을 직접 작성해 보세요.</p>
                      <SurveyQR url={surveyUrl} />
                    </div>
                    <SurveyForm site={openSite} day={day} onSubmit={pushVisit} />
                  </div>
                  <h2 className="sechead">지금까지 모인 방문 기록</h2>
                  <Dashboard role="visitor" site={openSite} sum={sum} day={day} onDay={changeDay} onSeed={seed} onClear={wipe} live={openVisits} />
                </>
              ) : (
                <VisitorView sites={SITES} />
              )}
            </>
          )}
          {role === 'operator' && page === 0 && !detail && (
            <>
              <div className="hero">
                <div>
                  <div className="eyebrow">LOCAL SPACE, NEXT STEP</div>
                  <h1>빈 공간을,<br /><em>시작 가능한 선택으로.</em></h1>
                  <p>지도에서 후보지를 고르고 조망과 접근 조건을 확인한 뒤,<br className="desktop" /> 공간 배치와 준비 순서까지 이어서 정리합니다.</p>
                  <div className="actions">
                    <button className="primary" onClick={() => setPage(1)}>지도에서 후보지 보기 <span>↗</span></button>
                    <button onClick={() => setPage(2)}>공간 모델링 데모 →</button>
                  </div>
                  <div className="heronote">안전 · 권리 · 접근 · 비용 · 주민협의</div>
                </div>
                <div className="heroart">
                  <div className="herosquad">
                    <Mascot tone="orange" mood="happy" size={92} />
                    <Mascot tone="mint" mood="wow" size={116} className="mascot-bob" />
                    <Mascot tone="pink" mood="wink" size={92} />
                  </div>
                  <div className="maphero"><LeafMap sites={SITES} active={siteId} onPick={open} height={250} /></div>
                </div>
              </div>
              <Ticker items={['영도 빈 공간 30일 실증', '현장 기록 · 팀 샘플 · 시연 데이터 구분', '운영 가능 판정 아님', 'QR 설문으로 방문 데이터 누적']} />
              <div className="steps">
                {ROLES.map((r) => (
                  <button key={r.id} onClick={() => { setRole(r.id); setPage(0); }}>
                    <RoleIcon role={r.id} size={48} />
                    <div><h3>{r.name}</h3><p>{r.desc}</p></div>
                    <b>↗</b>
                  </button>
                ))}
              </div>
              <div className="fieldnote">
                <div>
                  <Badge>현장 실증 기록 · 2026.09.12</Badge>
                  <h2>바다가 보이는 공터,<br />팝업을 열 수 있을까요?</h2>
                  <p>청학동 88-9 일대 · 공공데이터 요약상 55.48㎡</p>
                  <Mascot tone="orange" mood="think" size={96} />
                </div>
                <div>
                  <h3>! 현재 조건만으로 단독 팝업 운영 어려움</h3>
                  <p>가파른 경사와 계단, 주차 공간 부재, 협소한 하역 동선과 야간 조도 저하가 확인되었습니다. 사용 권한과 안전 적합성은 미확인입니다.</p>
                  <button onClick={() => open('cheonghak-88-9')}>실증 사례 열기 →</button>
                </div>
              </div>
            </>
          )}
          {role === 'operator' && page === 1 && !detail && (
            <>
              <Title tag="SPACE EXPLORER" title="지도에서 조건을 비교합니다." text="핀을 눌러 후보지를 고르면 조망과 접근 조건을 함께 확인할 수 있습니다." />
              <div className="explore">
                <div className="mapbox"><LeafMap sites={filtered} active={siteId} onPick={(id) => setSiteId(id)} height={380} />
                  <div className="legend"><span><i className="lg1" />시연 조건 충족</span><span><i className="lg2" />권리·안전 미확인</span></div>
                </div>
                <div>
                  <div className="filters">
                    <label>후보지 검색<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름으로 검색" /></label>
                    <label>동네<select value={area} onChange={(e) => setArea(e.target.value)}>{areas.map((a) => <option key={a}>{a}</option>)}</select></label>
                    <label>데이터 구분<select value={kind} onChange={(e) => setKind(e.target.value)}>{['전체', '현장 실증 기록', '팀 입력 샘플', '가상 시연 데이터'].map((a) => <option key={a}>{a}</option>)}</select></label>
                    <label className="check"><input type="checkbox" checked={onlyReady} onChange={() => setOnlyReady(!onlyReady)} />권리·안전 확인된 곳만</label>
                  </div>
                  <p className="dim">후보지 {filtered.length}곳 · 운영 가능 판정 아님</p>
                  <div className="cards">
                    {filtered.map((s) => <SiteCard key={s.id} site={s} onOpen={() => open(s.id)} />)}
                  </div>
                  {!filtered.length && (
                    <div className="empty">
                      <h2>조건에 맞는 후보지가 없습니다.</h2>
                      <button onClick={() => { setQuery(''); setArea('전체'); setKind('전체'); setOnlyReady(false); }}>필터 초기화</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {role === 'operator' && page === 1 && detail && (
            <Detail site={site} onBack={() => setDetail(false)} onPlan={() => { setDetail(false); setPage(2); }} />
          )}
          {role === 'operator' && page === 2 && (
            <>
              <Title tag="SPACE MODELING" title="이 공간, 어떻게 쓸 수 있을까요?" text="면적과 접근 조건으로 배치안을 만듭니다. Gemini 키를 입력하면 실제 모델 응답을, 없으면 내장 시연 결과를 사용합니다." />
              <Studio site={site} sites={SITES} onSite={setSiteId} />
            </>
          )}
          {role === 'operator' && page === 3 && (
            <>
              <Title tag="PREPARATION" title="다음 질문을, 함께 정리해요." text="입력 조건과 후보지 상태를 바탕으로 만드는 확인 순서 초안입니다. 실제 규제 판정은 하지 않습니다." />
              <Prep site={site} saved={saved && saved.site === site.id ? saved : null} onSave={persist} onReset={reset} />
            </>
          )}
          {role === 'operator' && page === 4 && (
            <>
              <Title tag="30-DAY LEARNING LOG" title="방문 수 너머, 함께 남기는 기록." text={openSite.name.replace('[시연] ', '') + '에서 QR 설문으로 모이는 방문 데이터를 30일 기준으로 누적합니다.'} />
              <div className="alert ok">
                <strong>✓ 시연 운영 공간 개방: {openSite.name.replace('[시연] ', '')}</strong>
                <p>이 공간은 조건이 정리된 상태를 가정한 시연용 공간입니다. 아래 수치는 이 브라우저에 저장된 설문 응답만 집계하며 실제 운영 성과가 아닙니다.</p>
              </div>
              <Dashboard role="operator" site={openSite} sum={sum} day={day} onDay={changeDay} onSeed={seed} onClear={wipe} live={openVisits} />
              <h2 className="sechead">현장 QR 설문</h2>
              <div className="surveywrap">
                <div>
                  <p className="dim">입구에 붙일 QR입니다. 방문자 화면의 'QR 설문 참여' 탭에서도 같은 설문을 열 수 있습니다.</p>
                  <SurveyQR url={surveyUrl} />
                </div>
                <SurveyForm site={openSite} day={day} onSubmit={pushVisit} />
              </div>
            </>
          )}
          <footer>
            <div className="footmark">
              <Mascot tone="mint" mood="happy" size={62} />
              <p><strong>빈틈랩 · BINTEUM LAB</strong>
                공간 활용 의사결정과 준비를 돕는 AX 도구<br />
                <small>현장 기록·팀 입력 샘플·가상 시연 데이터를 구분합니다. 법적·안전 적합성을 보증하지 않습니다.</small></p>
            </div>
            <button onClick={reset}>데모 데이터 초기화</button>
          </footer>
        </main>
      </div>
    </>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
