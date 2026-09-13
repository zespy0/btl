import React from 'react';

/** 참조 디자인의 스크롤 배너. 사실 경계 문구를 반복 노출한다. */
export function Ticker({ items }: { items: string[] }) {
  const loop = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {loop.map((t, i) => (
          <span key={i}>{t} <i>★</i></span>
        ))}
      </div>
    </div>
  );
}
