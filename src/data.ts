export type Status = '확인' | '확인 필요' | '미확인';
export type Cond = { key: string; label: string; status: Status; note: string; source: string };
export type Site = {
  id: string;
  name: string;
  area: string;
  purpose: string;
  kind: '현장 실증 기록' | '팀 입력 샘플' | '가상 시연 데이터';
  x: number;
  y: number;
  lat: number;
  lng: number;
  note: string;
  blocker: string;
  spaceArea: number;
  spaceNote: string;
  conds: Cond[];
  view: { bearing: number; fov: number; radius: number; elevation: number; obstruct: string; sea: string };
  access: { slope: string; walk: string; parking: string; night: string };
  visitor: null | { state: '준비 중' | '시연 오픈'; hours: string; notice: string[] };
  stats: { views: number; saves: number; inquiries: number };
};

export const CONDS = ['안전', '권리', '접근', '비용', '주민협의'] as const;

const c = (key: string, label: string, status: Status, note: string, source: string): Cond => ({ key, label, status, note, source });

export const SITES: Site[] = [
  {
    id: 'cheonghak-88-9',
    name: '청학동 88-9 일대',
    area: '청학동',
    purpose: '지역 콘텐츠 행사',
    kind: '현장 실증 기록',
    x: 46,
    y: 30,
    lat: 35.0876,
    lng: 129.0708,
    note: '철거 공터 · 바다 조망 · 경사와 계단',
    blocker: '현재 조건만으로 단독 팝업 운영 어려움',
    spaceArea: 55.48,
    spaceNote: '공공데이터(건축물대장) 요약 표기 · 공터 실측 아님',
    conds: [
      c('안전', '구조·전기·소방', '미확인', '전문가 점검 및 피난 동선 확인 필요', '팀 검토 항목'),
      c('안전', '현장 위험', '확인 필요', '경사·계단과 야간 조도 저하', '현장 실증 기록 (9/12)'),
      c('권리', '소유자 동의·사용 권한', '미확인', '공공기관을 통한 동의 절차 문의 필요', '팀 검토 항목'),
      c('권리', '용도·신고 요건', '확인 필요', '가설 건축물 신고 요건 확인 필요', '팀 검토 항목'),
      c('접근', '보행·차량·하역', '확인', '가파른 경사·계단, 협소한 골목, 주차 공간 부재', '현장 실증 기록 (9/12)'),
      c('접근', '야간 조도', '확인', '조도 저하 관찰 · 안전 확보 여부는 미확인', '현장 실증 기록 (9/12)'),
      c('비용', '임대·보수·운영 비용', '미확인', '미입력 · 견적 필요', '팀 검토 항목'),
      c('주민협의', '주민 의견·운영시간', '미확인', '소음·쓰레기·보행 안전 협의 필요', '팀 검토 항목'),
      c('주민협의', '민원 연락 체계', '미확인', '운영 전 책임 주체 협의 필요', '팀 검토 항목'),
    ],
    view: { bearing: 128, fov: 92, radius: 1400, elevation: 42, obstruct: '남동 방향 4층 건물 일부 차폐', sea: '영도 앞바다 정면' },
    access: { slope: '평균 경사 14% · 계단 38단', walk: '버스 정류장에서 도보 7분', parking: '주차·하역 공간 없음', night: '야간 조도 낮음' },
    visitor: null,
    stats: { views: 0, saves: 0, inquiries: 0 },
  },
  {
    id: 'cheonghak-391-576',
    name: '청학동 391-576 인접 빈집',
    area: '청학동',
    purpose: '전시·체험',
    kind: '팀 입력 샘플',
    x: 52,
    y: 41,
    lat: 35.0861,
    lng: 129.0731,
    note: '보고서에 언급된 인접 빈집 군락 · 현장 재확인 필요',
    blocker: '군락지 후보 · 개별 조건 미확인',
    spaceArea: 0,
    spaceNote: '면적 미입력',
    conds: [
      c('안전', '구조·전기·소방', '미확인', '건물 상태 미조사', '팀 검토 항목'),
      c('권리', '소유자 동의·사용 권한', '미확인', '공공기관 문의 필요', '팀 검토 항목'),
      c('접근', '보행·차량·하역', '확인 필요', '동일 골목 · 청학동 제약이 유사하게 적용될 가능성', '현장 실증 기록 (9/12)'),
      c('비용', '임대·보수·운영 비용', '미확인', '미입력', '팀 검토 항목'),
      c('주민협의', '주민 의견·운영시간', '미확인', '미착수', '팀 검토 항목'),
    ],
    view: { bearing: 120, fov: 60, radius: 700, elevation: 40, obstruct: '인접 주택으로 조망 대부분 차폐', sea: '부분 조망 추정' },
    access: { slope: '경사 구간 포함', walk: '미측정', parking: '미측정', night: '미측정' },
    visitor: null,
    stats: { views: 0, saves: 0, inquiries: 0 },
  },
  {
    id: 'demo-bongsan-a',
    name: '[시연] 봉산마을 골목 공간 A',
    area: '봉산마을',
    purpose: '로컬 브랜드 테스트',
    kind: '가상 시연 데이터',
    x: 30,
    y: 52,
    lat: 35.0805,
    lng: 129.0602,
    note: '조건 다수가 확인된 상태를 가정한 시연용 공간',
    blocker: '',
    spaceArea: 48,
    spaceNote: '시연 가정값 · 실제 매물 아님',
    conds: [
      c('안전', '구조·전기·소방', '확인', '가정: 전문가 점검 완료 · 피난 동선 2개 확보', '시연 가정값'),
      c('안전', '현장 위험', '확인', '가정: 보행로 정비 및 임시 난간 설치', '시연 가정값'),
      c('권리', '소유자 동의·사용 권한', '확인', '가정: 30일 사용 동의서 확보', '시연 가정값'),
      c('권리', '용도·신고 요건', '확인 필요', '가정: 가설물 없이 기존 실내만 사용 · 신고 요건 확인 중', '시연 가정값'),
      c('접근', '보행·차량·하역', '확인', '가정: 평지 진입 · 하역 5분 정차 구간 확보', '시연 가정값'),
      c('접근', '야간 조도', '확인', '가정: 골목 조명 2개 증설', '시연 가정값'),
      c('비용', '임대·보수·운영 비용', '확인', '가정: 30일 총 420만원 견적', '시연 가정값'),
      c('주민협의', '주민 의견·운영시간', '확인', '가정: 11-19시 운영, 야간 미운영 합의', '시연 가정값'),
      c('주민협의', '민원 연락 체계', '확인', '가정: 운영자·주민대표 연락망 구성', '시연 가정값'),
    ],
    view: { bearing: 210, fov: 70, radius: 900, elevation: 26, obstruct: '서측 저층 주택', sea: '골목 사이 부분 조망' },
    access: { slope: '평균 경사 5%', walk: '버스 정류장에서 도보 4분', parking: '하역 5분 정차 가능', night: '조명 보강 가정' },
    visitor: { state: '시연 오픈', hours: '11:00 - 19:00 (월 휴무)', notice: ['계단 3단 · 휠체어 진입 시 보조 필요', '전용 주차 없음 · 대중교통 권장', '19시 이후 운영 없음'] },
    stats: { views: 0, saves: 0, inquiries: 0 },
  },
  {
    id: 'demo-yeongseon',
    name: '[시연] 영선동 해안 상가 1층',
    area: '영선동',
    purpose: '전시·체험',
    kind: '가상 시연 데이터',
    x: 24,
    y: 26,
    lat: 35.0812,
    lng: 129.0481,
    note: '평지 접근과 조망을 함께 가정한 시연용 공간',
    blocker: '',
    spaceArea: 62,
    spaceNote: '시연 가정값 · 실제 매물 아님',
    conds: [
      c('안전', '구조·전기·소방', '확인', '가정: 상가 정기점검 자료 확인', '시연 가정값'),
      c('안전', '현장 위험', '확인', '가정: 평지·단차 없음', '시연 가정값'),
      c('권리', '소유자 동의·사용 권한', '확인', '가정: 단기 임대 계약 가능', '시연 가정값'),
      c('권리', '용도·신고 요건', '확인', '가정: 근린생활시설 범위 내 사용', '시연 가정값'),
      c('접근', '보행·차량·하역', '확인', '가정: 전면 도로 하역 가능', '시연 가정값'),
      c('접근', '야간 조도', '확인', '가정: 가로등 정상', '시연 가정값'),
      c('비용', '임대·보수·운영 비용', '확인', '가정: 30일 총 680만원 견적', '시연 가정값'),
      c('주민협의', '주민 의견·운영시간', '확인 필요', '가정: 인접 상인 협의 진행 중', '시연 가정값'),
      c('주민협의', '민원 연락 체계', '확인', '가정: 상가 관리인 연락 체계', '시연 가정값'),
    ],
    view: { bearing: 250, fov: 110, radius: 1800, elevation: 8, obstruct: '차폐 요소 적음', sea: '해안 정면 조망' },
    access: { slope: '평지', walk: '버스 정류장에서 도보 3분', parking: '인근 공영주차장 가정', night: '조도 양호 가정' },
    visitor: { state: '준비 중', hours: '미정', notice: ['오픈 일정 미확정', '주민 협의 진행 중'] },
    stats: { views: 0, saves: 0, inquiries: 0 },
  },
  {
    id: 'sample-dongsam',
    name: '동삼동 유휴 점포',
    area: '동삼동',
    purpose: '로컬 브랜드 테스트',
    kind: '팀 입력 샘플',
    x: 70,
    y: 62,
    lat: 35.0742,
    lng: 129.0846,
    note: '팀 입력 샘플 · 실제 매물 아님',
    blocker: '모든 운영 조건 미확인',
    spaceArea: 0,
    spaceNote: '면적 미입력',
    conds: [
      c('안전', '구조·전기·소방', '미확인', '미조사', '팀 검토 항목'),
      c('권리', '소유자 동의·사용 권한', '미확인', '미조사', '팀 검토 항목'),
      c('접근', '보행·차량·하역', '미확인', '미조사', '팀 검토 항목'),
      c('비용', '임대·보수·운영 비용', '미확인', '미입력', '팀 검토 항목'),
      c('주민협의', '주민 의견·운영시간', '미확인', '미착수', '팀 검토 항목'),
    ],
    view: { bearing: 90, fov: 55, radius: 600, elevation: 12, obstruct: '미조사', sea: '미조사' },
    access: { slope: '미측정', walk: '미측정', parking: '미측정', night: '미측정' },
    visitor: null,
    stats: { views: 0, saves: 0, inquiries: 0 },
  },
  {
    id: 'sample-namhang',
    name: '남항동 골목 빈집',
    area: '남항동',
    purpose: '지역 콘텐츠 행사',
    kind: '팀 입력 샘플',
    x: 16,
    y: 48,
    lat: 35.0934,
    lng: 129.0435,
    note: '팀 입력 샘플 · 실제 매물 아님',
    blocker: '모든 운영 조건 미확인',
    spaceArea: 0,
    spaceNote: '면적 미입력',
    conds: [
      c('안전', '구조·전기·소방', '미확인', '미조사', '팀 검토 항목'),
      c('권리', '소유자 동의·사용 권한', '미확인', '미조사', '팀 검토 항목'),
      c('접근', '보행·차량·하역', '미확인', '미조사', '팀 검토 항목'),
      c('비용', '임대·보수·운영 비용', '미확인', '미입력', '팀 검토 항목'),
      c('주민협의', '주민 의견·운영시간', '미확인', '미착수', '팀 검토 항목'),
    ],
    view: { bearing: 300, fov: 50, radius: 500, elevation: 18, obstruct: '미조사', sea: '미조사' },
    access: { slope: '미측정', walk: '미측정', parking: '미측정', night: '미측정' },
    visitor: null,
    stats: { views: 0, saves: 0, inquiries: 0 },
  },
];

export const readiness = (s: Site) => {
  const ok = s.conds.filter((x) => x.status === '확인').length;
  const need = s.conds.filter((x) => x.status === '확인 필요').length;
  const unknown = s.conds.filter((x) => x.status === '미확인').length;
  const core = ['권리', '안전'];
  const coreBlocked = s.conds.some((x) => core.includes(x.key) && x.status === '미확인');
  const corePending = s.conds.some((x) => core.includes(x.key) && x.status === '확인 필요');
  return { ok, need, unknown, total: s.conds.length, coreBlocked, corePending };
};

export const groupConds = (s: Site) => CONDS.map((k) => ({ key: k, items: s.conds.filter((x) => x.key === k) })).filter((g) => g.items.length > 0);
