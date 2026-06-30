# Tomotto — LLM Wiki

> 이 문서는 AI가 Tomotto 프로젝트를 한 번에 이해하기 위한 단일 레퍼런스입니다.
> 마지막 업데이트: 2026-06-30 (v0.1.167)

---

## 1. 프로젝트 한 줄 요약

**"가챠로 할 일을 뽑고, 친구와 함께 집중하는 뽀모도로 타이머 웹앱"**

솔로 뽀모도로의 외로움을 1:1 배틀과 가챠 랜덤성으로 해결한다. Tom(공통 미션)과 Moto(각자 가챠) 두 모드로 친구와 실시간 동기화된 집중 세션을 진행한다.

---

## 2. 기술 스택

| 항목 | 내용 |
|---|---|
| **프론트엔드** | Vanilla JS (`app.js` 단일 파일 ~3800줄) + HTML + CSS |
| **백엔드** | Supabase (PostgreSQL + Realtime WebSocket) |
| **배포** | Vercel (정적 웹앱) |
| **PWA** | `manifest.json` + `sw.js` (Service Worker) |
| **Android** | Capacitor (`capacitor.config.json`) — WebView 래퍼 |
| **외부 SDK** | Kakao SDK (배틀 초대 링크 공유) |
| **언어** | 한국어 UI |

**왜 Vanilla JS인가**: 초기 빠른 개발을 위해 프레임워크 없이 시작. 현재 app.js가 비대해졌으나 리팩토링은 기능 완성 후 예정.

---

## 3. 주요 화면 & 탭 구조

앱은 단일 페이지(index.html), 하단 탭 네비게이션으로 구성:

```
[홈 탭]           — 타이머 + 가챠 + 오늘 할 일 목록
[소셜 탭]         — 배틀 만들기 / 공개 배틀방 목록 / 공성전
[기록 탭]         — 완료 세션 로그, 리더보드
[개인 탭]         — 닉네임, 레벨, 업적 배지
```

**모달 시스템**: 배틀룸은 단일 `<dialog id="battleRoomModal">` 안에서 상태에 따라 내용이 교체되는 방식 (6종 상태).

---

## 4. 핵심 기능

### 4-1. 가챠 시스템
- 할 일 목록(카테고리별 등록)에서 랜덤으로 하나를 뽑아 타이머 미션으로 설정
- 리롤 가능 (횟수 제한 없음, 단 업적에서 리롤 안 한 것 추적)
- `currentTask`: localStorage에 저장된 현재 뽑힌 미션

### 4-2. 타이머
- 기본 25분 뽀모도로 (커스텀 미구현, todo 예정)
- 일시정지 / 리셋 가능
- 완료 시 기록 로그 저장 + 업적 체크

### 4-3. 배틀 시스템 (핵심 소셜 기능)

**배틀 모드 2종**:
- **TOM MODE** (`mode: 'common'`): 공통 미션 하나로 함께 집중. 가챠 없이 바로 시작.
- **MOTO MODE** (`mode: 'separate'`): 각자 가챠 돌린 뒤 시작. 결과가 달라도 같이 타이머.

**배틀룸 모달 6종 상태** (같은 `<dialog>` 안에서 교체):
1. `[배틀-수락]` — 초대 링크 첫 진입 (참여 전)
2. `[배틀-톰-시작]` — TOM MODE, 양쪽 참여 완료
3. `[배틀-모토-가챠]` — MOTO MODE, 내 가챠 없음
4. `[배틀-모토-대기]` — MOTO MODE, 상대방이 가챠 미완료
5. `[배틀-모토-시작]` — MOTO MODE, 양쪽 가챠 완료
6. `[배틀-321 카운트다운]` — 시작 버튼 누른 직후

**실시간 동기화**:
- `realtimeChannel` (`battle-room-{id}`): 모달 열려있을 때만 활성
- `watchChannel` (`battle-watch-{id}`): 모달 닫혀도 항상 유지
- 5초 폴링 백업 (WebSocket 불안정 환경 대비)

**주의**: 가챠 완료 여부는 반드시 `battle_players.task` (DB) 기준으로 판단. `currentTask` (localStorage) 사용 금지.

### 4-4. 공성전 (팀 배틀)
- 여러 명이 팀으로 참여하는 공개 배틀방
- 방장이 강제 시작 가능 (5분 준비 타임아웃)
- 데미지 공식 있음 (집중 시간 기반)

### 4-5. 레벨 & 업적 시스템
- 타이머 완료 횟수 기반 레벨업 (레벨 박스는 소셜 탭에 표시)
- 업적 5계열: A(온보딩), B(집중), C(가챠), D(배틀), E(숨겨진)
- 배지 티어: 일반 / 희귀 / 숨겨짐
- localStorage 기반 (Phase 1), Supabase 연동은 Phase 3

### 4-6. 리더보드
- 닉네임 첫 설정 시 기존 로컬 기록 소급 동기화
- Supabase `leaderboard` 테이블 기반

### 4-7. 라디오 (로파이 스트림)
- 픽셀 토마토 걷기 애니메이션과 함께 배경음악 스트리밍
- 로파이 플레이어에서 라디오 스트림으로 전환됨

---

## 5. DB 스키마 (Supabase)

```
battles
  id, status(pending/active/done), mode(common/separate),
  task_common, duration_sec, updated_at

battle_players
  battle_id, nickname, is_creator,
  task(MOTO MODE 가챠 결과), proof_url, proof_uploaded_at,
  note, room_opened_at(timestamptz — 실시간 오픈 트리거용)

leaderboard
  nickname, total_sessions, ...

user_achievements (Phase 3 예정, 현재 localStorage)
```

---

## 6. 내가 한 주요 결정과 이유

| 결정 | 이유 |
|---|---|
| Vanilla JS 단일 파일 | 빠른 프로토타이핑. 프레임워크 오버헤드 없이 시작 |
| 배틀 모달을 단일 `<dialog>`로 | DOM 상태 관리 단순화. 6종 모달이 같은 데이터 컨텍스트 공유 |
| Supabase Realtime + 폴링 이중화 | WebSocket이 불안정한 환경(KakaoTalk IAB 브라우저 등) 대비 |
| 가챠 완료 여부를 DB 기준으로 | localStorage는 탭별·기기별 상이 → 배틀 동기화 버그 방지 |
| `watchChannel`을 모달과 독립 유지 | 모달 닫혀도 상대방 상태 감지 필요 |
| Capacitor로 Android 래핑 | 네이티브 재개발 비용 없이 PWA를 Android APK로 배포 |

---

## 7. 막혔다 풀었던 것

### 배틀룸 자동 동기화 실패
- **문제**: 탭 닫고 재접속 후 [배틀 열기] 클릭해도 상대방 화면에 모달 안 뜸
- **원인**: Broadcast는 양쪽이 동시에 같은 채널 구독 중일 때만 동작
- **해결**: `visibilitychange` 이벤트 + `watchChannel` 상시 유지로 대부분 해결
- **남은 엣지케이스**: `battle_players.room_opened_at` 업데이트 → `postgres_changes` 감지로 재접속 후 자동 오픈 (미구현)

### 개인탭 스크롤 깨짐
- `body overflow:hidden` + `container height:100svh`으로 해결 (여러 번 시도 후)

### 레벨 박스 위치
- 처음엔 개인탭, 소셜탭으로 이동 (공개 노출 의도)

### 공성전 round_elapsed_sec 버그
- 실제 경과 시간이 아닌 다른 값이 들어가던 문제 → `round_elapsed_sec` 계산 로직 수정

---

## 8. 알려진 버그 & 미해결 이슈

| # | 증상 | 상태 |
|---|---|---|
| 배틀룸 자동 동기화 엣지케이스 | 재접속/완전 종료 후 상대방 모달 미오픈 | 부분 해결, room_opened_at 미구현 |
| 웹 온보딩 툴팁 위치 | 데스크탑에서 좌상단 고정됨 | 개인탭 디자인 수정 후 함께 수정 예정 |
| `assetlinks.json` SHA-256 미등록 | 딥링크가 KakaoTalk IAB 브라우저로 열릴 수 있음 | 릴리즈 전 필수 |
| APK `server.url` 제거 | 프로덕션 빌드 시 제거 필요 | 릴리즈 전 필수 |

---

## 9. 남은 할 일 (우선순위 순)

### 긴급 (릴리즈 전)
- [ ] `capacitor.config.json`에서 `server.url` 제거
- [ ] `assetlinks.json` SHA-256 지문 등록

### 다음 스프린트
- [ ] 플로팅 타이머 (PC: PiP API, 모바일: sticky 바)
- [ ] 알림 (Web Notification API + Capacitor Local Notifications)
- [ ] 배틀룸 자동 동기화 개선 (`room_opened_at` → postgres_changes)
- [ ] 온보딩 툴팁 폴리싱

### 기능 아이디어 (우선순위 미정)
- 햇살(☀️) 재화 시스템
- 집중 스트릭, 통계 그래프
- 셔플 배틀 모드 (두 사람 할일 풀 합쳐서 가챠)
- 스터디룸 (협력형, 경쟁 없음)

---

## 10. 파일 구조

```
/
├── index.html          — 단일 HTML, 모든 UI
├── app.js              — 단일 JS (~3800줄), 모든 로직
├── style.css           — 전체 스타일
├── sw.js               — Service Worker (PWA 오프라인)
├── manifest.json       — PWA 메타
├── capacitor.config.json — Android 빌드 설정
├── battle-system.md    — 배틀 모달 6종 공식 명세
├── todo.md             — 전체 할 일 & 기능 아이디어
├── _achievements.md    — 업적/배지 설계 문서
├── assets/             — 이미지, 픽셀 아트
├── android/            — Capacitor Android 프로젝트
└── .well-known/        — assetlinks.json (딥링크)
```

---

## 11. 작업할 때 주의사항 (AI에게)

1. **가챠 완료 여부**: `battle_players.task` (DB) 기준. `currentTask` (localStorage) 절대 사용 금지.
2. **배틀 채널**: `realtimeChannel`(모달 의존)과 `watchChannel`(항상 유지) 구분 필수.
3. **Vanilla JS 패턴 유지**: 프레임워크 import 없음. DOM 직접 조작.
4. **한국어 UI**: 사용자에게 노출되는 텍스트는 모두 한국어.
5. **버전 표기**: `todo.md` 상단 버전이 최신 (battle-system.md보다 우선).
