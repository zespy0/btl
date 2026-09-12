import React, { useState } from 'react';
import { SITES, Site, readiness } from './data';

const Badge = ({ children }: { children: React.ReactNode }) => <span className="badge">{children}</span>;
const mark = (s: string) => (s === '확인' ? '✓' : s === '확인 필요' ? '!' : '?');

export function AdminView({ onOpen }: { onOpen: (id: string) => void }) {
  const [tab, setTab] = useState(0);
  const tabs = ['후보지 대장', '공개 상태', '문의 처리'];
  const [pub, setPub] = useState<Record<string, boolean>>(() => Object.fromEntries(SITES.map((s) => [s.id, s.visitor?.state === '시연 오픈'])));
  const [inquiries, setInquiries] = useState([
    { id: 1, site: '[시연] 봉산마을 골목 공간 A', text: '주말 이틀 운영 문의', state: '접수' },
    { id: 2, site: '청학동 88-9 일대', text: '하역 동선 확인 요청', state: '접수' },
  ]);
  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>
      {tab === 0 && (
        <div className="tablewrap">
          <table>
            <caption>후보지별 조건 집계 · 시연 데이터 포함</caption>
            <thead><tr><th>후보지</th><th>구분</th><th>확인</th><th>확인 필요</th><th>미확인</th><th>운영 판단</th><th></th></tr></thead>
            <tbody>
              {SITES.map((s) => {
                const r = readiness(s);
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td><Badge>{s.kind}</Badge></td>
                    <td>{r.ok}</td><td>{r.need}</td><td>{r.unknown}</td>
                    <td>{r.coreBlocked ? '보류' : '검토 가능'}</td>
                    <td><button onClick={() => onOpen(s.id)}>열기</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {tab === 1 && (
        <div className="adminlist">
          <p className="dim">방문자 화면에 공개할 후보지를 선택합니다. 권리 또는 안전이 미확인인 곳은 공개할 수 없습니다.</p>
          {SITES.map((s) => {
            const r = readiness(s);
            return (
              <div className="adminrow" key={s.id}>
                <div><strong>{s.name}</strong><small>{r.coreBlocked ? '권리·안전 미확인으로 공개 불가' : '공개 가능'}</small></div>
                <label className="check">
                  <input type="checkbox" disabled={r.coreBlocked} checked={!!pub[s.id]} onChange={() => setPub({ ...pub, [s.id]: !pub[s.id] })} />
                  방문자 화면 공개
                </label>
              </div>
            );
          })}
        </div>
      )}
      {tab === 2 && (
        <div className="adminlist">
          <p className="dim">시연용 문의 목록입니다. 개인정보는 수집하지 않으며 연락처 항목이 없습니다.</p>
          {inquiries.map((q) => (
            <div className="adminrow" key={q.id}>
              <div><strong>{q.text}</strong><small>{q.site}</small></div>
              <div className="rowactions">
                <Badge>{q.state}</Badge>
                <button onClick={() => setInquiries(inquiries.map((x) => (x.id === q.id ? { ...x, state: x.state === '접수' ? '담당 배정' : x.state === '담당 배정' ? '회신 완료' : '접수' } : x)))}>상태 변경</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function VisitorView({ sites }: { sites: Site[] }) {
  const open = sites.filter((s) => s.visitor);
  const [picked, setPicked] = useState<string | null>(open[0]?.id ?? null);
  const site = open.find((s) => s.id === picked) || null;
  const [sent, setSent] = useState(false);
  if (!open.length) return <div className="empty"><h2>공개된 팝업이 없습니다.</h2><p>운영 조건이 확인된 공간만 이곳에 표시됩니다.</p></div>;
  return (
    <>
      <div className="chips">
        {open.map((s) => (
          <button key={s.id} className={picked === s.id ? 'on' : ''} onClick={() => { setPicked(s.id); setSent(false); }}>{s.name.replace('[시연] ', '')}</button>
        ))}
      </div>
      {site && site.visitor && (
        <div className="visitor">
          <div className="vcard">
            <Badge>{site.visitor.state}</Badge>
            <h2>{site.name.replace('[시연] ', '')}</h2>
            <p>{site.area} · {site.purpose}</p>
            <dl className="viewout">
              <div><dt>운영 시간</dt><dd>{site.visitor.hours}</dd></div>
              <div><dt>가는 길</dt><dd>{site.access.walk}</dd></div>
              <div><dt>경사</dt><dd>{site.access.slope}</dd></div>
              <div><dt>주차</dt><dd>{site.access.parking}</dd></div>
            </dl>
          </div>
          <div className="vcard">
            <h3>방문 전 확인</h3>
            <ul>{site.visitor.notice.map((n) => <li key={n}>{n}</li>)}</ul>
            <h3>방문 의향</h3>
            <p className="dim">이름과 연락처를 받지 않습니다. 관심 표시만 집계합니다.</p>
            <button className="primary" onClick={() => setSent(true)} disabled={sent}>{sent ? '관심 표시 완료' : '관심 있어요'}</button>
            {sent && <p className="okline">시연용 집계에만 반영되었습니다.</p>}
          </div>
        </div>
      )}
      <p className="dim">이 화면의 공간은 시연을 위한 가정값이며 실제 운영 중인 팝업이 아닙니다.</p>
    </>
  );
}
