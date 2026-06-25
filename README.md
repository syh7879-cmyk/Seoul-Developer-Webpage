# 정비지도랩

정비지도랩은 서울시 정비사업 추진지역을 지도 위에 보여주고, 사용자가 필지를 선택해 개발 검토용 가상 합필 시뮬레이션을 해볼 수 있는 MVP 웹앱입니다.

## 주요 기능
- Next.js + TypeScript + Tailwind CSS 기반 웹앱
- MapLibre GL JS 지도 화면
- mock 정비구역 polygon 표시
- mock 필지 polygon 표시
- 정비구역 클릭 시 상세 정보 패널 표시
- 필지 선택 모드로 가상 합필 바구니 구성
- 선택 필지 수, 합산 대지면적, 평균 공시지가, 총 공시지가 계산
- 기초 사업성 카드 제공
- localStorage 기반 프로젝트 저장/불러오기/삭제

## 설치 방법
```bash
npm install
```

## 실행 방법
```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하세요.

## GitHub Codespaces에서 실행하기
1. GitHub 저장소에서 Codespaces를 생성합니다.
2. 터미널에서 아래 명령을 실행합니다.
```bash
npm install
npm run dev -- --hostname 0.0.0.0
```
3. 포트 3000을 열어 브라우저에서 확인합니다.

## 폴더 구조
- app/: Next.js App Router 페이지와 전역 스타일
- src/data/: mock 정비구역, mock 필지 데이터
- src/lib/: 계산 함수, 저장소 유틸리티
- src/types/: 타입 정의

## mock data 설명
- mockZones.ts: 서울 성북구 근처 정비구역 3개 예시
- mockParcels.ts: 정비구역 주변 필지 20개 예시

## 향후 실제 API 연동 계획
- 서울시 정비사업 정보
- 브이월드 연속지적도
- 개별공시지가 API
- 토지이용계획 API
- 건축물대장 API

## 주의사항
- 본 서비스는 실제 합필 가능 여부를 확정하지 않습니다.
- 가상 합필과 사업성 분석은 개발 검토용 시뮬레이션입니다.
- 실제 법적 합필 가능 여부, 인허가, 권리관계, 감정평가, 세무 판단은 전문가 검토가 필요합니다.