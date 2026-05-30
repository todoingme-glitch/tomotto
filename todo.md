# Tomotto — TODO

> 마지막 업데이트: 2026-05-30
> 현재 버전: v0.1.137

---

## 🚨 릴리즈 전 필수 체크

- [ ] **PlayStore 제출 시 `capacitor.config.json`에서 `server.url` 줄 제거**
  현재 디버그 APK는 `server.url = "https://tomotto.vercel.app"` 설정으로 Vercel에서 웹을 로드함.
  프로덕션 빌드는 이 줄을 제거해야 번들 파일 사용하는 진짜 오프라인 APK가 됨.

- [ ] **`assetlinks.json` SHA-256 지문 등록**
  `.well-known/assetlinks.json` 에 릴리즈 키스토어 SHA-256 지문 추가 → Android App Links 정식 동작.
  현재 TODO 플레이스홀더 상태 → 딥링크(배틀 초대)가 KakaoTalk IAB 브라우저로 열릴 수 있음.

---

## 🛠 다음 작업 큐

### 기능 추가

- [ ] **플로팅 타이머**
  - PC: Picture-in-Picture API (canvas → video → PiP)
  - 모바일(PWA): in-app sticky 플로팅 바 (탭 이동해도 타이머 상단 고정)

- [ ] **알림 (Notification)**
  - 웹: Service Worker + Web Notification API (타이머 종료 시)
  - Android: `@capacitor/local-notifications` — `SCHEDULE_EXACT_ALARM` + `POST_NOTIFICATIONS` 권한
  - 앱 처음 실행 시 알림 권한 요청 UI
  - 타이머 시작 시 `endTime`에 로컬 알림 예약 → 백그라운드 타이머 종료 처리 가능

- [ ] **배틀 보상 / 재화 시스템** (방향성 논의 필요)
  - 배틀 이기면 재화 획득 → 캐릭터 옷/슬롯머신 스킨 구매에 사용
  - 옷에 능력치 부여: 상대 타이머 단축, 내 타이머 연장, 재화 추가 등
  - 직업 컨셉 의상 (판타지 RPG 스타일) 검토

- [ ] **배틀룸 자동 동기화 개선**
  현재 `visibilitychange` + broadcast로 대부분 해결됨. 남은 엣지 케이스 (재접속/완전 종료 직후):
  `battle_players`에 `room_opened_at timestamptz` 컬럼 추가 → postgres_changes 감지로
  재접속 후에도 상대방 화면에 배틀 모달 자동 오픈.

### 온보딩

- [ ] 툴팁 온보딩 폴리싱
- [ ] 전신 캐릭터 SVG (`assets/tom-full.svg`, `assets/moto-full.svg`) 받으면 온보딩 카드 교체
- [ ] (추후) 대화형 온보딩 — 톰↔모토 번갈아 말하고 유저가 행동해야 다음 스텝 넘어가는 방식

---

## 💡 추가 아이디어 (우선순위 미정)

### 즉시 구현 가능

- [ ] **집중 스트릭** — 매일 최소 1세션 완료 시 연속일수 표시, 끊기면 리셋
- [ ] **집중 사운드** — 빗소리 / 백색소음 / 로파이 선택, 타이머 중 재생
- [ ] **커스텀 세션 구조** — 25/5 고정 말고 세트 수, 긴 휴식 타이밍 설정
- [ ] **오늘 목표 설정** — 목표 세션 수 설정 → 달성 시 알림/업적

### 중간 규모

- [ ] **내 통계 그래프** — 기록 탭에 주간 집중시간 바차트
- [ ] **태그 / 프로젝트 분류** — 세션에 태그 붙여서 기록 탭 필터링
- [ ] **배틀 관전 모드** — 진행 중인 공개 배틀을 구경만 하는 기능
- [ ] **스터디룸** — 배틀 아닌 협력형 방 (서로 응원, 경쟁 없음)

### 대형 기능

- [ ] **홈화면 위젯 (PWA)** — 오늘 집중시간 표시 위젯

---

## 🔬 신규 기능 검토 (2026-05-30)

> Plan 에이전트 검토 결과. 우선순위: 팀 공성전 > 셔플 배틀 > 외부 연동

### 아이디어 A — 셔플 배틀 모드 (배틀 가챠 풀 공유)
**난이도: 낮음 | 기존 코드 재사용성: 매우 높음**

TOM/MOTO 모드는 그대로 두고 **SHUFFLE MODE** 신규 추가.
두 사람의 할일 목록을 합쳐 하나의 풀에서 가챠 → 같은 할일로 함께 집중.

- `battles` 테이블에 `shared_pool JSON` 컬럼 추가
- 배틀 생성 시 창조자의 categories 저장 → 수락자가 병합 후 UPDATE
- `spinGacha()`에서 `activeBattleId` 감지 시 `sharedPool` 참조로 분기
- **주의**: 할일 목록이 상대에게 노출 → "공유됨" 표시 UX 필수
- 풀 최대 크기 제한 권장 (예: 30개)

### 아이디어 B — 팀 공성전 모드
**난이도: 중간 | 기존 공개 배틀 인프라 재사용**

공개 배틀방에 **팀 톰 vs 팀 모토** 옵션 추가.
각 팀 집중시간 합산 → 차이만큼 상대 성 HP 차감 → HP 0 팀이 패배.

**미결 설계 항목**
- 동점 처리 방식 (→ 아래 논의 중)
- 팀 밸런싱 규칙 (→ 아래 논의 중)
- 실시간 HP vs 라운드 종료 후 집계 → 라운드 집계 방식 권장 (Supabase 부하)
- 방장 이탈 시 HP 집계 주체 문제 → 장기적으로 Supabase Edge Function 위임

**DB 변경 필요**
- `battles`: `team_mode BOOLEAN`, `team_a_hp INT`, `team_b_hp INT`
- `battle_players`: `team TEXT ('tom'|'moto')`, `elapsed_sec INT`

### 아이디어 C — 외부 앱 연동
**난이도: 매우 높음 | 현재 구조와 충돌 → 보류**

OAuth 기반 연동(Google Calendar, Notion 등)은 현재 닉네임 인증 구조와 충돌.
→ 계정 시스템 전환 여부와 함께 논의 필요 (아래 참고).

**현실적 축소안**: iCal URL 직접 입력 → 공개 캘린더 파싱으로 할일 임포트 (OAuth 없음).
Naver Calendar는 기업 전용 API라 사실상 불가.

---

## 💰 수익화 방향

**결론: 초기엔 완전 무료 → DAU 확보 후 단계적 적용**

- **현재**: `SHOW_AD_PROMPT = false` 유지 (광고 비활성화)
- **1단계**: 리워드 광고 — 가챠 추가 1회 얻기 버튼 클릭 시만 광고 재생 (강제 노출 없음)
- **2단계**: 프리미엄 구독 — 배틀 기록 무제한, 테마/배지 커스터마이징, 상세 통계
- **보류**: Buy Me a Coffee 등 후원 방식 (초기 커뮤니티 기반 서비스에 적합)
- **제외**: 강제 광고 (집중 앱 정체성과 충돌, 이탈률 높음)

---

## 📝 기타 메모

- **탭 아이콘 주의**: `motto-face`(왼쪽/안경) = 개인탭, `tom-face`(오른쪽) = 소셜탭
  SVG ID가 캐릭터 이름과 반대로 매핑되어 있음
- **현재 디버그 APK**: CI 빌드 `#17`부터 `server.url` 설정 적용 — Vercel에서 웹 로드.
  웹 코드(JS/CSS/HTML) 변경 시 앱 재설치 불필요. push → Vercel 배포 (~1분) → 앱 재시작으로 반영.
