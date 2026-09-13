import React from 'react';

export type SimulationPreset = {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  concept: string;
  image: string;
  seats: number;
  duration: string;
  highlight: string;
};

export const SIMULATIONS: SimulationPreset[] = [
  { id: 'cafe', emoji: '☕', title: '카페', tagline: '바다를 품은 동네 카페', concept: '영도 바다 조망 로컬 카페', image: '/simulations/cafe.png', seats: 16, duration: '30일', highlight: '체류형' },
  { id: 'gallery', emoji: '🎨', title: '갤러리', tagline: '지역 작가 쇼케이스', concept: '영도 로컬 아트 갤러리', image: '/simulations/gallery.png', seats: 20, duration: '21일', highlight: '전시형' },
  { id: 'popup-store', emoji: '🛍️', title: '팝업스토어', tagline: '로컬 굿즈 테스트 마켓', concept: '영도 로컬 브랜드 팝업스토어', image: '/simulations/popup-store.png', seats: 18, duration: '14일', highlight: '판매형' },
  { id: 'restaurant', emoji: '🍽️', title: '레스토랑', tagline: '항구 골목의 작은 식탁', concept: '영도 식재료 커뮤니티 다이닝', image: '/simulations/restaurant.png', seats: 14, duration: '30일', highlight: '예약형' },
  { id: 'culture', emoji: '🎭', title: '문화공간', tagline: '워크숍과 공연이 한곳에', concept: '주민 참여형 문화 라운지', image: '/simulations/culture.png', seats: 28, duration: '30일', highlight: '참여형' },
  { id: 'coworking', emoji: '💻', title: '코워킹', tagline: '바다 앞 프로젝트 스튜디오', concept: '로컬 크리에이터 코워킹 스튜디오', image: '/simulations/coworking.png', seats: 12, duration: '30일', highlight: '업무형' },
];

export function SimulationGallery({ selected, onSelect }: { selected: string; onSelect: (preset: SimulationPreset) => void }) {
  const current = SIMULATIONS.find((item) => item.id === selected) || SIMULATIONS[0];
  return (
    <section className="simulator" aria-labelledby="simulation-title">
      <div className="simulator__head">
        <div>
          <span className="eyebrow">AI SPACE TRANSFORMER · DEMO</span>
          <h2 id="simulation-title">6가지 공간, 한 번에 시뮬레이션</h2>
          <p>대표 유형을 고르면 AI 변환 이미지와 운영 배치안이 즉시 바뀝니다.</p>
        </div>
        <span className="sticker sticker-yellow">MVP QUICK DEMO</span>
      </div>
      <div className="simulator__stage">
        <div className="simulation-image">
          <img key={current.id} src={current.image} alt={`${current.title}로 변환한 영도 빈집 시뮬레이션`} />
          <span className="simulation-image__label">AI CONCEPT IMAGE · 실제 공간 사진 아님</span>
          <div className="simulation-image__copy">
            <span>{current.emoji} {current.highlight}</span>
            <h3>{current.title}</h3>
            <p>{current.tagline}</p>
          </div>
        </div>
        <div className="simulation-facts" aria-label={`${current.title} 운영 가정`}>
          <div><small>추천 수용</small><strong>{current.seats}명</strong></div>
          <div><small>실증 기간</small><strong>{current.duration}</strong></div>
          <div><small>운영 형태</small><strong>{current.highlight}</strong></div>
        </div>
      </div>
      <div className="simulation-grid" role="group" aria-label="공간 변환 유형">
        {SIMULATIONS.map((item) => (
          <button key={item.id} type="button" className={item.id === current.id ? 'simulation-card on' : 'simulation-card'} onClick={() => onSelect(item)} aria-pressed={item.id === current.id}>
            <img src={item.image} alt="" />
            <span className="simulation-card__copy"><b>{item.emoji} {item.title}</b><small>{item.tagline}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}
