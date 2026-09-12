import React from 'react';
import { Site } from './data';
import { PERIOD, Summary, Visit } from './visits';

const Badge = ({ children }: { children: React.ReactNode }) => <span className="badge">{children}</span>;

export function DayChart({ perDay, day }: { perDay: number[]; day: number }) {
  const max = Math.max(1, ...perDay);
  return (
    <div className="daychart" role="img" aria-label={'일자별 방문 응답 수. D+1부터 D+' + day + '까지 집계.'}>
      {perDay.map((n, i) => (
        <div key={i} className={'bar' + (i + 1 > day ? ' future' : '')} title={'D+' + (i + 1) + ' · ' + n + '건'}>
          <i style={{ height: Math.round((n / max) * 100) + '%' }} />
        </div>
      ))}
    </div>
  );
}

function Bars({ rows, total }: { rows: { label: string; count: number }[]; total: number }) {
  if (!rows.length) return <p className="dim">아직 응답이 없습니다.</p>;
  return (
    <ul className="barlist">
      {rows.map((r) => (
        <li key={r.label}>
          <span>{r.label}</span>
          <i style={{ width: Math.round((r.count / Math.max(1, total)) * 100) + '%' }} />
          <b>{r.count}</b>
        </li>
      ))}
    </ul>
  );
}

const Metric = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <article><p>{label}</p><h2>{value}</h2><small>{note}</small></article>
);

export function Dashboard({ role, site, sum, day, onDay, onSeed, onClear, live }: {
  role: 'operator' | 'admin' | 'visitor';
  site: Site;
  sum: Summary;
  day: number;
  onDay: (d: number) => void;
  onSeed: () => void;
  onClear: () => void;
  live: Visit[];
}) {
  const empty = sum.total === 0;
  const revisitRate = sum.revisitAnswered ? Math.round((sum.revisitYes / sum.revisitAnswered) * 100) : null;
  const topConcern = sum.concerns.find((c) => c.label !== '없음' && c.label !== '응답 안 함');

  if (empty) {
    return (
      <div className="empty">
        <span className="bigicon">▥</span>
        <h2>아직 수집된 방문 데이터가 없습니다</h2>
        <p>{site.name.replace('[시연] ', '')}의 QR 설문으로 응답이 들어오면 이곳에 누적됩니다.</p>
        {role !== 'visitor' && <p className="dim">시연용으로 과거 응답을 한 번에 만들어 볼 수 있습니다.</p>}
        {role !== 'visitor' && <button className="primary" onClick={onSeed}>D+14까지 예시 응답 채우기</button>}
      </div>
    );
  }

  return (
    <>
      <div className="sectionhead">
        <Badge>{live.length ? '수집 중 · ' + sum.total + '건 누적' : '데이터 없음'}</Badge>
        {role !== 'visitor' && (
          <div className="rowactions">
            <label className="dayctl">운영 경과일 D+{day}
              <input type="range" min="1" max={PERIOD} value={day} onChange={(e) => onDay(+e.target.value)} />
            </label>
            <button onClick={onSeed}>예시 응답 추가</button>
            <button onClick={onClear}>수집 데이터 초기화</button>
          </div>
        )}
      </div>

      <div className="metrics">
        <Metric label="설문 응답" value={sum.total + '건'} note={'D+1 ~ D+' + sum.days + ' 누적'} />
        <Metric label="추정 방문 인원" value={sum.heads + '명'} note="응답의 동반 인원 합계" />
        {role !== 'visitor' && <Metric label="찾아오기 편의" value={sum.accessAvg ? sum.accessAvg + ' / 5' : '미응답'} note={sum.accessCount + '명 응답 기준'} />}
        {role !== 'visitor' && <Metric label="재방문 의향" value={revisitRate !== null ? revisitRate + '%' : '미응답'} note={sum.revisitAnswered + '명 중 예 ' + sum.revisitYes + '명'} />}
        {role === 'visitor' && <Metric label="운영 경과" value={'D+' + sum.days} note={PERIOD + '일 중'} />}
      </div>

      <div className="workgrid">
        <article className="chart">
          <h2>일자별 응답</h2>
          <p className="dim">회색은 아직 지나지 않은 날짜입니다.</p>
          <DayChart perDay={sum.perDay} day={sum.days} />
          <div className="axis"><span>D+1</span><span>D+{PERIOD}</span></div>
        </article>

        {role === 'operator' && (
          <article className="chart">
            <h2>불편했던 점</h2>
            <p className="dim">운영 개선과 주민 협의에서 먼저 다룰 항목입니다.</p>
            <Bars rows={sum.concerns} total={sum.total} />
            {topConcern && <p className="warning">가장 많이 꼽힌 불편: {topConcern.label} ({topConcern.count}건). 현장 조건 개선 없이는 반복될 수 있습니다.</p>}
          </article>
        )}

        {role === 'admin' && (
          <article className="chart">
            <h2>유입 경로</h2>
            <p className="dim">안내 채널별 도달 정도를 봅니다.</p>
            <Bars rows={sum.channel} total={sum.total} />
          </article>
        )}

        {role === 'visitor' && (
          <article className="chart">
            <h2>방문자 구성</h2>
            <p className="dim">어디서 오셨는지에 대한 응답입니다.</p>
            <Bars rows={sum.from} total={sum.total} />
          </article>
        )}
      </div>

      {role === 'admin' && (
        <div className="workgrid">
          <article className="chart">
            <h2>방문자 거주지</h2>
            <Bars rows={sum.from} total={sum.total} />
          </article>
          <article className="chart">
            <h2>최근 남긴 말</h2>
            {sum.memos.length ? (
              <ul className="memolist">{sum.memos.map((m, i) => <li key={i}><span>D+{m.day}</span>{m.text}</li>)}</ul>
            ) : <p className="dim">아직 남겨진 의견이 없습니다.</p>}
            <small>개인정보가 포함된 응답은 공개 전 관리자가 확인해야 합니다.</small>
          </article>
        </div>
      )}

      {role === 'operator' && (
        <article className="chart">
          <h2>종료 판단</h2>
          <Badge>판단 보류 · 관계자 검토 필요</Badge>
          <p className="dim">응답 수만으로 성공을 판정하지 않습니다. 접근 편의, 불편 사항, 재방문 의향, 주민 의견, 비용을 함께 봅니다.</p>
          {[
            ['연장 검토', '권리 유효기간과 안전 조건, 주민협의, 비용을 다시 확인한 뒤 관계자가 결정합니다.'],
            ['개선 후 재실증', topConcern ? topConcern.label + ' 문제의 개선 책임자와 확인 방법을 정하고 다시 검증합니다.' : '반복된 불편 항목의 개선 책임자와 확인 방법을 정합니다.'],
            ['원상복구 검토', '권리 종료, 안전 조건 미충족 또는 운영 중단 시 협약에 따라 복구 범위와 책임자를 확인합니다.'],
          ].map(([t, d]) => (
            <details key={t}><summary>{t}</summary><p>{d}</p></details>
          ))}
        </article>
      )}

      <p className="dim">이 수치는 이 브라우저에 저장된 설문 응답만 집계한 결과입니다. 실제 운영 성과가 아니며, 예시 응답을 채운 경우 시연용 생성 데이터가 포함됩니다.</p>
    </>
  );
}
