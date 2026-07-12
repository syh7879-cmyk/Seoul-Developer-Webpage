# 정비지도랩

정비지도랩은 서울시 정비사업 추진지역을 지도 위에 보여주고, 사용자가 필지를 선택해 개발 검토용 가상 합필 시뮬레이션을 해볼 수 있는 MVP 웹앱입니다.

현재 버전은 실제 공공 API를 연결하지 않고 mock data만 사용합니다. 따라서 지도, 필지, 정비구역, 가격, 노후도, 접도 조건 등은 기능 검증용 예시 데이터입니다.

## 현재 구현된 기능

- Next.js App Router, TypeScript, Tailwind CSS 기반 웹앱
- MapLibre GL JS 지도 화면
- mock 정비구역 polygon 표시
- mock 필지 polygon 표시
- 정비구역 클릭 시 상세 정보 패널 표시
- 필지 선택 모드
- 필지 선택 및 선택 해제
- 선택 필지 하이라이트
- 가상 합필 바구니
- 선택 필지 수, 합산 대지면적, 평균 공시지가, 총 공시지가 계산
- 용도지역 구성, 노후도, 접도 조건, 정비구역 포함률, 필지 연속성 요약
- 기초 사업성 카드
- 적용 용적률, 평균 세대면적, 예상 분양가, 공사비, 기타사업비율 입력
- 예상 연면적, 예상 세대수, 총분양수입, 총공사비, 총사업비, 개발이익, ROI 계산
- localStorage 기반 프로젝트 저장, 불러오기, 삭제

## 설치 방법

```bash
npm install
```

## 실행 방법

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```txt
http://localhost:3000
```

## 빌드 방법

```bash
npm run build
```

## GitHub Codespaces 실행 방법

1. GitHub 저장소에서 Codespaces를 생성합니다.
2. 터미널에서 의존성을 설치합니다.

```bash
npm install
```

3. 개발 서버를 실행합니다.

```bash
npm run dev -- --hostname 0.0.0.0
```

4. Codespaces의 포트 3000을 열어 브라우저에서 확인합니다.

## 데이터 상태

현재는 mock data 기반입니다.

- `src/data/mockZones.ts`: 서울 성북구 인근 정비구역 예시
- `src/data/mockParcels.ts`: 정비구역 주변 필지 예시

아직 실제 API 연동은 하지 않았습니다.

- 서울시 정비사업 데이터 미연동
- 브이월드 연속지적도 미연동
- 개별공시지가 API 미연동
- 토지이용계획 API 미연동
- 건축물대장 API 미연동
- 실거래가 API 미연동
- 교통망 데이터 미연동

## API Lab

실제 공공 API 연동 가능성을 검증하기 위한 실험 페이지입니다.

접속 경로:

```txt
/lab/api
```

필요한 환경변수:

- `VWORLD_API_KEY`
- `SEOUL_OPEN_API_KEY`
- `DATA_GO_KR_API_KEY`

환경변수 예시는 `.env.example`에서 확인할 수 있습니다. 실제 키는 `.env.local`에 넣고 GitHub에 커밋하지 않습니다.

키가 필요한 공공 API를 검증하기 전에, API Lab에서는 `OpenStreetMap Nominatim 장소/경계 polygon` 또는 `OpenStreetMap Overpass 건물 polygon` 옵션으로 키 없이 외부 오픈 데이터 호출 흐름을 먼저 테스트할 수 있습니다.

현재 API Lab은 본 서비스에 직접 연결되어 있지 않으며, 실제 API 연동 가능성을 검증하기 위한 별도 실험 공간입니다.

## Architecture Lab

건축계획 초기 검토를 위한 3D 매스 시뮬레이션 실험 페이지입니다.

접속 경로:

```txt
/lab/architecture
```

현재 Architecture Lab은 mock 필지와 수동 규제 입력값을 사용합니다.

- 대지분석 요약
- 용도지역, 건폐율, 용적률, 최고층수, 최고높이, 이격거리 수동 입력
- 건축 가능 후보 면적 계산
- 판상형, 타워형, 중정형, 계단형 매스 유형 선택
- Three.js 기반 3D 매스 모델 표시

이 기능은 개발 검토용 3D 매스 시뮬레이션이며, 실제 건축 가능 여부나 인허가 가능 여부를 판정하지 않습니다. 향후 규제 입력값은 토지이용계획, 조례, 지구단위계획 API 후보값으로 대체할 수 있도록 분리되어 있습니다.

### 좌표계 처리 원칙

API Lab의 내부 표준 geometry 표시 좌표계는 `EPSG:4326`입니다.

- 외부 API 원본 좌표계는 `sourceCrs`로 보존합니다.
- MapLibre에 표시하는 좌표계는 `displayCrs: "EPSG:4326"`로 통일합니다.
- 좌표계 변환 필요 여부는 `crsStatus`로 표시합니다.
- 국내 공공 GIS에서 자주 만나는 `EPSG:5179`, `EPSG:5181`, `EPSG:5186` 등은 추후 `proj4` 같은 검증된 변환 라이브러리로 연결할 예정입니다.
- 면적/거리 계산은 위경도 좌표만으로 단정하지 않고, API 제공 면적값 또는 투영좌표계 기반 계산을 우선 검토합니다.

## 향후 API 연동 순서

1. 서울시 정비사업 데이터
2. 브이월드 연속지적도
3. 개별공시지가 API
4. 토지이용계획 API
5. 건축물대장 API
6. 실거래가 API
7. 교통망 데이터

## 주요 폴더 구조

```txt
app/
  page.tsx
  layout.tsx
src/
  components/
    map/
    panel/
    sidebar/
    ui/
  data/
  lib/
  types/
```

## 주의사항

본 서비스는 개발 검토용 MVP입니다. 실제 합필 가능 여부, 인허가 가능 여부, 감정평가, 조합원 분담금, 세무·법률 판단은 전문가 검토가 필요합니다.

가상 합필과 사업성 분석은 개발 검토용 시뮬레이션이며, 실제 합필 가능 여부는 지적, 등기, 소유권, 도시계획, 건축 인허가 검토 필요 사항입니다.
