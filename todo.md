# Tomotto — TODO

> 마지막 업데이트: 2026-05-31
> 현재 버전: v0.1.167

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

- [ ] **햇살(☀️) 재화 시스템** → 아래 전용 섹션 참고

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

**✅ 확정된 규칙 (2026-05-31)**

| 항목 | 규칙 |
|---|---|
| 팀 구성 | 방장이 N vs N 설정, 입장 순서 교차 자동 배정, 인원 충족 시 로비 잠금 |
| 인원 균형 | 동수 강제 (홀수 불가) |
| 타이머 | 라운드 시작 시 각자 개별 가챠 스핀 |
| 일반 범위 | 15~25분 랜덤 |
| 럭키 라운드 | 매 라운드 일정 확률 + 마지막 라운드 항상 발동 → 25~40분 범위 |
| 라운드 종료 | 팀원 전원 타이머 완료 시 |
| 라운드 간 휴식 | 5분 후 자동 시작 |
| 이긴 라운드 데미지 | 진 팀 HP -= (팀 총 집중시간 차이 × 1.5) |
| 타이 라운드 데미지 | 양 팀 각각 HP -= 팀 평균 세션 시간 (팀 합산 아닌 1인당 평균) |
| 시작 HP | 100 |
| 최대 라운드 | 5라운드 (초과 시 HP 높은 팀 승) |
| 승리 조건 | 상대 HP 0 or 5라운드 후 HP 비교 |

**DB 변경 필요**
- `battles`: `team_mode BOOLEAN`, `team_a_hp INT`, `team_b_hp INT`, `current_round INT`
- `battle_players`: `team TEXT ('tom'|'moto')`, `round_elapsed_sec INT`

**미결 항목**
- 방장 이탈 시 HP 집계 주체 문제 → 장기적으로 Supabase Edge Function 위임 검토
- 럭키 라운드 발동 확률 수치 (20% 제안, 조율 필요)

### 아이디어 C — 외부 앱 연동
**난이도: 매우 높음 | 현재 구조와 충돌 → 보류**

OAuth 기반 연동(Google Calendar, Notion 등)은 현재 닉네임 인증 구조와 충돌.
→ 계정 시스템 전환 여부와 함께 논의 필요 (아래 참고).

**현실적 축소안**: iCal URL 직접 입력 → 공개 캘린더 파싱으로 할일 임포트 (OAuth 없음).
Naver Calendar는 기업 전용 API라 사실상 불가.

---

## ☀️ 햇살 재화 시스템 & 빌리징 로드맵 (2026-05-31 확정)

> Plan 에이전트 + Gemini 기획안 통합본. 재화명: **햇살(☀️)**, 단위: **햇살** (예: "120 햇살")

### 설계 원칙 (변경 불가)

1. **햇살 ≠ 전투력**: 리더보드는 오직 집중 완료 횟수/시간만 집계. 햇살 잔고는 순위에 0% 영향.
2. **배틀 완주 기반 지급**: 승패 무관, "끝까지 집중했는가"에만 지급. 어뷰징 방지.
3. **칭호/업적은 햇살으로 절대 해금 불가**: 실제 사용 기록으로만 획득. 코드 레벨에서도 분리 유지.
4. **외형·편의만 구매 가능**: 성능 향상, 확률 증가, 점수 구매 불가.

---

### Phase 0 — 재화 기반 (지금 구현)

**햇살 획득**

| 행동 | 햇살 | 비고 |
|---|---|---|
| 타이머 완료 (기본 25분) | 10 | 기준값 |
| 타이머 완료 (60분 이상) | 20 | |
| 타이머 완료 (90분 이상) | 30 | |
| 일시정지 없이 완료 | +3 보너스 | 업적 B-4/B-5 연동 |
| 리롤 없이 바로 시작 | +3 보너스 | 업적 A-3/E-7 연동 |
| 친구/공개 배틀 완주 | +5 추가 | 승패 무관 |
| 얼리버드(새벽 5~8시) | +5 추가 | 업적 E-4 연동 |
| 미드나잇(자정~새벽 2시) | +5 추가 | 업적 E-5 연동 |

**햇살 사용처 (구현 난이도 낮은 순)**

| 사용처 | 비용 | 구현 |
|---|---|---|
| 가챠 추가 스핀 1회 | 50 햇살 | ★ (즉시 가능) |
| 배틀방 제목 이모지 프리픽스 | 100 햇살 | ★★ |
| 닉네임 색상 태그 | 150 햇살 | ★★ |
| 인증샷 톰/모토 스티커 오버레이 | 200 햇살 | ★★★ (Canvas 합성) |

**저장 방식**
- `localStorage: 'tomotto_햇살'` (빠른 UI)
- Supabase `user_stats.햇살 INTEGER` 컬럼 (기기 간 동기화)
- 증가는 반드시 RPC 호출 (`earn_햇살`), 클라이언트 직접 set 금지

```sql
ALTER TABLE user_stats ADD COLUMN 햇살 INTEGER DEFAULT 0;

CREATE OR REPLACE FUNCTION earn_햇살(p_nickname TEXT, p_amount INT)
RETURNS INT AS $$
DECLARE v_new INT;
BEGIN
  UPDATE user_stats SET 햇살 = COALESCE(햇살, 0) + p_amount
  WHERE nickname = p_nickname RETURNING 햇살 INTO v_new;
  RETURN v_new;
END;
$$ LANGUAGE plpgsql;
```

**구현 체크리스트**
- [ ] Supabase `user_stats` 테이블에 `햇살` 컬럼 추가 + RPC 생성
- [ ] `finishTimer()` 끝에 `earnHamsal(amount)` 함수 호출
- [ ] 헤더 또는 설정 패널에 햇살 잔고 UI 표시 (☀️ 120)
- [ ] 첫 번째 사용처: 가챠 추가 스핀 (50햇살)

---

### Phase 1 — 소셜 꾸미기 (팀 공성전 전후)

- [ ] 닉네임 색상 변경 상점 오픈
- [ ] 배틀방 제목 이모지 프리픽스 해금
- [ ] 인증샷 톰/모토 표정 스티커 Canvas 합성 기능

---

### Phase 2 — 빌리징 (장기 로드맵, 릴리즈 이후)

**기술 스택**: CSS Grid(12x12 타일) + absolute position SVG 스프라이트
→ 현재 배틀카드 드래그앤드롭 코드 재사용 가능

**마을 구성**
- 톰의 집 / 모토의 집 (기본 배치)
- 뽀모 오두막, 연구 탑, 배틀 아레나, 명예의 전당 (업적 연동)
- 토마토 밭 (햇살 잔고 시각화), 장식 소품

**소셜 요소 (비경쟁)**
- 닉네임으로 친구 마을 방문 → 햇살 1개 선물 / 발자국 남기기
- 배틀 상대 프로필에서 마을 팝업으로 구경
- 계절 이벤트 (모든 참여자 동일 혜택, 경쟁 없음)

**햇살 소비**
- 장식 소품 50 / 소형 건물 100 / 중형 250 / 대형 500

**DB 신설**
```sql
CREATE TABLE village_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_nick TEXT NOT NULL,
  item_id TEXT NOT NULL,
  grid_x INTEGER NOT NULL,
  grid_y INTEGER NOT NULL,
  placed_at TIMESTAMPTZ DEFAULT NOW()
);
```

- [ ] `index.html` 4번째 탭 [마을] 추가
- [ ] CSS Grid 기반 타일맵 레이아웃 구현
- [ ] 아이템 배치 저장용 `village_items` 테이블 신설

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
