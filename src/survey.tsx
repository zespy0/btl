import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Site } from './data';
import { CONCERNS, newId, PERIOD, Visit } from './visits';
import { Mascot } from './mascot';

export function SurveyQR({ url }: { url: string }) {
  const [src, setSrc] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, { width: 260, margin: 1, color: { dark: '#1f4a48', light: '#ffffff' } })
      .then((d) => { if (live) setSrc(d); })
      .catch(() => { if (live) setErr('QR 이미지를 만들지 못했습니다. 아래 주소를 직접 입력하세요.'); });
    return () => { live = false; };
  }, [url]);
  return (
    <div className="qrbox">
      {src ? <img src={src} alt="방문 설문 페이지로 이동하는 QR 코드" width={220} height={220} /> : <div className="qrskel" aria-hidden="true" />}
      {err && <p className="warning">{err}</p>}
      <code>{url}</code>
    </div>
  );
}

const Q = <T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) => (
  <fieldset className="qfield">
    <legend>{label}</legend>
    <div className="qopts">
      {options.map((o) => (
        <button type="button" key={o} className={value === o ? 'on' : ''} aria-pressed={value === o} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  </fieldset>
);

export function SurveyForm({ site, day, onSubmit }: { site: Site; day: number; onSubmit: (v: Visit) => void }) {
  const [group, setGroup] = useState<Visit['group']>('2인');
  const [age, setAge] = useState<Visit['age']>('30-40대');
  const [from, setFrom] = useState<Visit['from']>('영도 주민');
  const [channel, setChannel] = useState<Visit['channel']>('지나가다');
  const [access, setAccess] = useState<Visit['access']>(4);
  const [revisit, setRevisit] = useState<Visit['revisit']>('예');
  const [concern, setConcern] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [done, setDone] = useState(false);
  const toggle = (v: string) =>
    setConcern(v === '없음' ? (concern.includes('없음') ? [] : ['없음']) : concern.includes(v) ? concern.filter((x) => x !== v) : [...concern.filter((x) => x !== '없음'), v]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: newId(), site: site.id, day, ts: Date.now(), group, age, from, channel, access, revisit, concern: concern.length ? concern : ['응답 안 함'], memo });
    setDone(true);
    setMemo('');
    setConcern([]);
  };
  if (done) {
    return (
      <div className="surveydone">
        <Mascot tone="mint" mood="wow" size={104} className="mascot-bob" />
        <h2>응답이 기록되었습니다</h2>
        <p>D+{day} 방문으로 집계했습니다. 이름과 연락처는 받지 않으며, 이 브라우저에만 저장됩니다.</p>
        <button onClick={() => setDone(false)}>다음 방문자 응답하기</button>
      </div>
    );
  }
  return (
    <form className="survey" onSubmit={submit}>
      <div className="surveyhead">
        <span className="badge">D+{day} / {PERIOD}일</span>
        <h2>{site.name.replace('[시연] ', '')} 방문 설문</h2>
        <p>5개 문항 · 약 30초 · 개인정보를 받지 않습니다.</p>
      </div>
      <Q label="함께 오신 인원" options={['1인', '2인', '3인 이상'] as const} value={group} onChange={setGroup} />
      <Q label="연령대" options={['10-20대', '30-40대', '50대 이상', '응답 안 함'] as const} value={age} onChange={setAge} />
      <Q label="어디서 오셨나요" options={['영도 주민', '부산 다른 지역', '부산 외 지역', '응답 안 함'] as const} value={from} onChange={setFrom} />
      <Q label="어떻게 알고 오셨나요" options={['지나가다', 'SNS', '지인 소개', '기관 안내', '응답 안 함'] as const} value={channel} onChange={setChannel} />
      <fieldset className="qfield">
        <legend>찾아오기 편했나요 (1 어려움 - 5 편함)</legend>
        <div className="qopts">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} className={access === n ? 'on' : ''} aria-pressed={access === n} onClick={() => setAccess(n as Visit['access'])}>{n}</button>
          ))}
          <button type="button" className={access === null ? 'on' : ''} aria-pressed={access === null} onClick={() => setAccess(null)}>응답 안 함</button>
        </div>
      </fieldset>
      <fieldset className="qfield">
        <legend>불편했던 점 (복수 선택 가능)</legend>
        <div className="qopts">
          {CONCERNS.map((v) => (
            <button type="button" key={v} className={concern.includes(v) ? 'on' : ''} aria-pressed={concern.includes(v)} onClick={() => toggle(v)}>{v}</button>
          ))}
        </div>
      </fieldset>
      <Q label="다시 방문할 의향이 있나요" options={['예', '아니오', '모르겠음'] as const} value={revisit} onChange={setRevisit} />
      <label>남기고 싶은 말 (선택)
        <textarea value={memo} maxLength={120} rows={2} onChange={(e) => setMemo(e.target.value)} placeholder="이름·연락처는 적지 마세요" />
      </label>
      <button className="primary wide">응답 제출</button>
      <small>응답은 이 브라우저의 로컬 저장소에만 기록되며 서버로 전송하지 않습니다.</small>
    </form>
  );
}
