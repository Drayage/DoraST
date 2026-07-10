# DoraST — 섬 탈출 카드 서바이벌

`island_escape/`가 실제 게임. 섬별 진행형 콘텐츠(무인도, 화산섬, 균사늪 등), PWA, GitHub Pages 배포.

## 파일 지도

- `island_escape/game.html` (~7,900줄) — 메인 화면/CSS/코어 로직.
  **매우 큼: 전체를 읽지 말 것. Grep으로 함수/문자열 위치를 찾아 부분만 읽는다.**
- `island_escape/js/data.js` (~1,300줄) — 카드/아이템/섬/날씨/이벤트/업적 데이터.
  콘텐츠 추가·수정은 대부분 여기서 끝난다.
- `island_escape/js/` — 기능별 모듈: combat, explore, survival, camp, sleep, craft,
  skills, map, achievements, state, render, mobile, usecard, deckviewer 등
- `service-worker.js` — PWA 캐시

## 규칙

- 콘텐츠(카드/섬/이벤트/스킬) 작업은 data.js 우선, 로직은 해당 기능 모듈에.
- 섬 특수 메커니즘(날씨 풀, 피날레 등)은 기존 섬 구현(`WEATHER_*`, `*_finale` 등)을
  먼저 Grep해서 같은 패턴으로 구현할 것 — 섬마다 다른 방식으로 만들면 후속 수정이 늘어난다.
- 스킬은 카운트 기반 스택 시스템 — 중복/중첩 처리 시 기존 카운트 로직을 따를 것.
- SW/캐시/배포/모바일: webgame-ship 스킬 참조.
