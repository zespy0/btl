import React, { useState } from 'react';
import { Mascot } from './mascot';

const steps = [
  { icon: 'P', title: '거점 주차', text: '신영도롯데낙천대아파트 등 검토 후보', state: '제휴 검토 전' },
  { icon: '↻', title: '순환 셔틀', text: '승하차 지점·운행 빈도·비용 미정', state: '운영 검토 전' },
  { icon: '★', title: '팝업 존', text: '봉산마을 골목 공간 A · 시연 오픈', state: '시연 가정' },
];

export function PopupPass() {
  const [issued, setIssued] = useState(false);
  const [stamps, setStamps] = useState(0);
  return (
    <section className="pass" aria-labelledby="pass-title">
      <div className="passhero">
        <div>
          <span className="eyebrow">BINTEUM POPUP PASS · CONCEPT DEMO</span>
          <h2 id="pass-title">골목의 빈틈을 잇는<br />팝업패스</h2>
          <p>차를 세울 곳에서 팝업까지, 이동이 어려운 영도 골목의 접근 문제를 하나의 방문 흐름으로 묶는 실증 아이디어입니다.</p>
          <span className="badge">제휴·운행 미확정</span>
        </div>
        <Mascot tone="orange" mood="wow" size={150} className="mascot-bob" />
      </div>

      <div className="passroute" aria-label="팝업패스 이동 흐름">
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <article className="passstop">
              <span className="passstop__icon">{step.icon}</span>
              <small>STEP {index + 1}</small>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="badge">{step.state}</span>
            </article>
            {index < steps.length - 1 && <span className="passarrow" aria-hidden="true">→</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="passgrid">
        <article className={issued ? 'passticket issued' : 'passticket'}>
          <div className="passticket__top">
            <div><small>30-DAY POPUP TEST</small><h3>BINTEUM PASS</h3></div>
            <span>{issued ? 'ACTIVE' : 'DEMO'}</span>
          </div>
          <div className="passticket__body">
            <div className="passcode" aria-hidden="true">BT<br />30</div>
            <div>
              <b>{issued ? '나의 팝업패스' : '시연용 방문 패스'}</b>
              <p>개인정보 없이 이 브라우저에서만 체험합니다.</p>
              <div className="stamptray" aria-label={`방문 스탬프 ${stamps}개`}>
                {[0, 1, 2].map((n) => <span key={n} className={n < stamps ? 'filled' : ''}>{n < stamps ? '★' : '○'}</span>)}
              </div>
            </div>
          </div>
          {!issued ? (
            <button className="primary wide" onClick={() => setIssued(true)}>시연용 팝업패스 받기</button>
          ) : (
            <button className="primary wide" disabled={stamps >= 3} onClick={() => setStamps(Math.min(3, stamps + 1))}>{stamps >= 3 ? '3개 공간 체험 완료' : 'QR 방문 스탬프 찍기'}</button>
          )}
          {issued && <p className="okline">패스가 발급되었습니다. 현장 QR을 찍는 흐름을 버튼으로 시연할 수 있습니다.</p>}
        </article>

        <article className="passinfo">
          <span className="sticker sticker-yellow">BEFORE YOU GO</span>
          <h3>방문 전에 꼭 확인해 주세요</h3>
          <ul>
            <li><b>이동 약자</b><span>일부 골목에 경사와 계단이 있어 보조 없이 접근하기 어려울 수 있습니다.</span></li>
            <li><b>야간 방문</b><span>조도가 낮은 구간이 있어 현재 시연 공간은 19시 이후 운영하지 않습니다.</span></li>
            <li><b>셔틀 이용</b><span>운영시간, 승하차 지점, 운행 빈도와 비용은 모두 미정입니다.</span></li>
            <li><b>주차 거점</b><span>표시된 장소는 검토 후보이며 사용 승인이나 제휴가 완료되지 않았습니다.</span></li>
          </ul>
          <p className="warning">이 화면은 접근성 보완 아이디어를 검증하기 위한 MVP입니다. 실제 교통·주차 서비스 예약이나 탑승권이 아닙니다.</p>
        </article>
      </div>
    </section>
  );
}
