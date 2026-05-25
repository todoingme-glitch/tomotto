# Tomotto 배틀 시스템 개요

> 최종 업데이트: 2026-05-25 (v0.1.67)

---

## 1. 배틀 모달 정의 (공식 명칭)

배틀 시스템에서 사용자에게 표시되는 모달은 총 6종이며, 모두 단일 `<dialog id="battleRoomModal">` 요소 안에서 상태에 따라 내용이 교체되는 방식으로 구현됩니다.

---

### [배틀-수락]

**언제**: 친구가 초대 링크를 열고 닉네임 설정 후 최초 진입할 때

**조건**: `!alreadyJoined && !friend` (아직 battle_players에 내 row 없음)

**표시 내용**:
- 배틀 모드 + 시간 요약
- 창조자 카드 (만든 사람) / 대기 중 카드
- `"이 배틀에 참여하시겠어요?"` 안내
- **[✓ 수락하고 참여]** 버튼

**다음 상태**: 수락 후 모드에 따라 분기
- TOM MODE → [배틀-톰-시작]
- MOTO MODE + 내 가챠 없음 → [배틀-모토-가챠]
- MOTO MODE + 내 가챠 있음 → [배틀-모토-시작] 또는 [배틀-모토-대기]

---

### [배틀-톰-시작]

**언제**: TOM MODE에서 양쪽 모두 참여 완료된 상태

**조건**: `alreadyJoined && friend && battle.mode === 'common'`

**표시 내용**:
- `🍅 TOM MODE · N분 · 대기 중`
- 양측 플레이어 카드
- 공통 미션 배너 `🍅 오늘의 공통 미션: [가챠결과]`
- `"둘 다 준비됐어요. 시작하면 친구도 동시에 시작돼요."`
- **[▶ 타이머 시작]** 버튼 (양쪽 모두 표시)

**규칙**: TOM MODE는 가챠 체크 없이 둘 다 바로 준비 완료 상태.

---

### [배틀-모토-가챠]

**언제**: MOTO MODE에서 **내** 가챠 결과가 DB에 없을 때

**조건**: `battle.mode === 'separate' && !myDbTask` (myDbTask = 내 battle_players.task)

**표시 내용**:
- `🎲 MOTO MODE · N분 · 대기 중`
- 양측 플레이어 카드
- `"가챠를 먼저 돌려서 내 작업을 정해주세요!"`
- **[🎰 가챠 먼저 돌리기]** 버튼

**진입 경로**:
1. 초대 링크로 들어와서 수락 후 (내 가챠 없을 때)
2. 소셜 탭 배틀카드 **[열기]** 버튼 클릭 (내 가챠 없을 때)
3. 개인 탭 `⚔️ 배틀 연결됨` 배너의 **[배틀 열기]** 버튼 클릭 (내 가챠 없을 때)

**중요**: `battle_players.task` (DB 값) 기준으로 판단. `currentTask` (localStorage) 사용 금지 — 이전 세션 오염 가능.

**상대방 화면**: 상대방이 이 모달에 있을 때 → [배틀-모토-대기]

---

### [배틀-모토-대기]

**언제**: MOTO MODE에서 **상대방**이 아직 가챠를 안 돌렸을 때 (창조자 시점)

**조건 (창조자)**: `meIsCreator && battle.mode === 'separate' && !friend?.task`

**표시 내용**:
- `🎲 MOTO MODE · N분 · 대기 중`
- 양측 플레이어 카드
- `"친구가 가챠를 돌리길 기다리는 중... ●"` (LIVE dot 포함)
- **[닫기]** 버튼만 표시 (타이머 시작 버튼 없음)

**규칙**: 친구가 가챠를 완료하면 Realtime/폴링으로 자동 감지 → [배틀-모토-시작]으로 전환.

---

### [배틀-모토-시작]

**언제**: MOTO MODE에서 **양쪽 모두** 가챠 완료 상태

**조건**: `battle.mode === 'separate' && myDbTask && (meIsCreator ? friend?.task : true)`

**표시 내용**:
- `🎲 MOTO MODE · N분 · 대기 중`
- 양측 플레이어 카드
- MOTO MODE 안내 배너 (각자 카테고리에서 가챠 돌리기)
- `"둘 다 준비됐어요. 시작하면 친구도 동시에 시작돼요. ●"`
- **[▶ 타이머 시작]** 버튼

**창조자만**: 친구 가챠 완료를 확인 후 버튼 표시.
**친구**: 내 가챠가 DB에 저장된 것이 확인되면 바로 버튼 표시.

---

### [배틀-321 카운트다운]

**언제**: [배틀-톰-시작] 또는 [배틀-모토-시작]에서 한명이라도 **[▶ 타이머 시작]** 버튼을 누른 직후

**트리거**: `battles.status = 'active'` DB 업데이트 → 상대방이 이 변경 감지 → 동시 시작

**표시 내용**:
- 모달 내 카운트다운 애니메이션 (톰 얼굴 🔴 · 숫자 · 모토 얼굴 🍅)
- 3 → 2 → 1 → 시작! (각 0.9초)
- 완료 시 자동으로 개인 탭 타이머 시작

**규칙**: 유저가 직접 [▶ 타이머 시작] 버튼을 누르기 전까지는 절대 나와서는 안 됨. 자동 실행 금지.

---

## 2. 모달 상태 전환 다이어그램

```
[배틀-수락]
    │ 수락하고 참여 클릭
    ▼
┌───────────────────────────────────────────────┐
│   내 가챠(myDbTask) 있음?                    │
│                                               │
│  TOM MODE → [배틀-톰-시작]                   │
│                                               │
│  MOTO MODE                                    │
│   └─ 없음 → [배틀-모토-가챠]                 │
│               └─ 상대방: [배틀-모토-대기]     │
│   └─ 있음                                     │
│       └─ 상대 가챠 없음 → [배틀-모토-대기]   │
│       └─ 상대 가챠 있음 → [배틀-모토-시작]   │
└───────────────────────────────────────────────┘
    │ 타이머 시작 버튼 클릭 (둘 중 누구든)
    ▼
[배틀-321 카운트다운] → 타이머 시작
```

---

## 3. 전체 배틀 흐름

```
창조자 (어떤 브라우저든)       친구 (어떤 브라우저든)
─────────────────────────────────────────────────────
[배틀 만들기]
  → battles INSERT (status: 'pending')
  → battle_players INSERT (is_creator: true)
  → subscribeWatchBattle() 시작
  → 초대 링크 생성 & 공유

                              [초대 링크 열기]
                                → [배틀-수락] 표시

                              [✓ 수락하고 참여]
                                → battle_players INSERT (is_creator: false)
                                → subscribeWatchBattle() 시작
                                → subscribeBattleRoom() 시작
                                → 모드별 [배틀-모토-가챠] 또는 [배틀-톰-시작]

[battle_players INSERT 감지]
  (postgres_changes via watchChannel)
  → 배틀룸 모달 자동 오픔
  → 모드별 화면 표시

[MOTO MODE: 가챠 돌리기]       [MOTO MODE: 가챠 돌리기]
  → battle_players.task UPDATE   → battle_players.task UPDATE
  → refreshBattleRoom() 호출     → refreshBattleRoom() 호출

[▶ 타이머 시작] 버튼 클릭
  → battles UPDATE (status: 'active')
  → [배틀-321 카운트다운] → startBattleTimer()

                              [battles UPDATE 감지]
                                (Realtime postgres_changes 또는 5초 폴링)
                                → [배틀-321 카운트다운] → startBattleTimer()

[타이머 완료]                  [타이머 완료]
  → battles UPDATE (status: 'done')
  → markBattleCompletedLocally()
  → 배틀 결과 모달 표시
```

---

## 4. 동기화 지속성 요구사항

**핵심 원칙**: 어느 한쪽이 새로고침, 앱 종료, 백그라운드 전환을 해도 다시 들어오면 동기화가 복구되어야 한다.

### 모달 자동 오픈 (room_opened_at 신호)
- 유저 A가 배틀룸을 열면 `battle_players.room_opened_at` 업데이트
- 유저 B의 `postgres_changes` 리스너가 감지 → `openBattleRoom()` 자동 호출
- **새로고침/재접속 후에도 작동**: 채널 구독(SUBSCRIBED) 직후 `fiveMinAgo` 이내 `room_opened_at` 확인

### 타이머 시작 동기화
| 방법 | 작동 조건 | 지연 |
|------|-----------|------|
| Realtime `postgres_changes` | WebSocket 연결 유지 중 | 즉시 |
| 5초 폴링 백업 | 항상 (카카오톡, 라인 등 포함) | 최대 5초 |

### 새로고침/재접속 시 복구 흐름
1. 페이지 로드 → `loadMyBattles()` → 참여 중인 배틀 목록 복원
2. `subscribeWatchBattle()` 재시작
3. URL에 `?battle=` 파라미터 있으면 즉시 `openBattleRoom()` 호출
4. 소셜 탭 배틀카드 **[열기]** 버튼으로 언제든 재진입 가능

---

## 5. DB 테이블 구조

### `battles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | text (PK) | 단축 배틀 ID (8자, URL 사용) |
| status | text | `'pending'` → `'active'` → `'done'` |
| mode | text | `'common'` (TOM) / `'separate'` (MOTO) |
| task_common | text | TOM MODE 공통 작업 |
| duration_sec | int | 타이머 시간(초) |
| updated_at | timestamptz | 마지막 상태 변경 시각 |

### `battle_players`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| battle_id | text | battles.id FK |
| nickname | text | 참여자 닉네임 |
| is_creator | bool | 창조자 여부 |
| task | text | **MOTO MODE 가챠 결과** (가챠 완료 시 저장) |
| proof_url | text | 인증샷 |
| proof_uploaded_at | timestamptz | 인증샷 업로드 시각 |
| note | text | 완료 소감 |
| room_opened_at | timestamptz | 배틀룸 열었음 신호 (파트너 자동 오픈용) |

---

## 6. MOTO MODE 가챠 체크 규칙 (v0.1.67)

**판단 기준**: `battle_players.task` (DB 값) 사용. `currentTask` (localStorage) 사용 금지.

```js
const myDbTask = meIsCreator ? creator?.task : friend?.task;

if (battle.mode === 'separate' && !myDbTask) {
  // [배틀-모토-가챠] 표시
} else {
  // 내 가챠 준비 완료 → 상대 가챠 여부에 따라 분기
}
```

**이유**: `currentTask`는 localStorage에서 이전 세션 값으로 로드될 수 있어, 가챠를 안 돌렸는데 "준비됨"으로 오판하는 버그 발생.

**가챠 결과 저장 시점**: 가챠 완료(`showGachaResult()`) 호출 시 즉시 `battle_players.task` DB 업데이트. 이후 `refreshBattleRoom()` 호출로 UI 자동 갱신.

---

## 7. Realtime 채널 구조

### `realtimeChannel` (`battle-room-{battleId}`)
배틀룸 모달이 열려있을 때 활성. 감지 이벤트:
- `battle_players INSERT` → 친구 수락 → `refreshBattleRoom()`
- `battle_players UPDATE` → `room_opened_at` 변경 → 배틀룸 자동 오픈
- `battles UPDATE` → `status='active'` → `startBattleWithCountdown()`
- `broadcast: room-opened` → 파트너 배틀룸 열었음 → 자동 오픈

### `watchChannel` (`battle-watch-{battleId}`)
배틀 생성/수락 후 모달 닫혀도 유지. 감지 이벤트:
- `battle_players INSERT` → 친구 수락 → `openBattleRoom()` 자동
- `battle_players UPDATE` → `room_opened_at` 변경 → 자동 오픈
- `battles UPDATE` → `status='active'` → `startBattleWithCountdown()`

---

## 8. 폴링 백업 (v0.1.67)

WebSocket 불안정 환경을 위한 5초 폴링:

```
openBattleRoom() 호출
    └─ 현재 status 확인
        ├─ 'pending' → 폴링 시작 (5초 간격)
        │       └─ DB 확인 → status='active'이면 카운트다운 시작
        ├─ 'active' → 폴링 시작 안 함 (이미 진행 중)
        └─ 'done'   → 폴링 시작 안 함
```

---

## 9. 완료된 배틀 처리

- `locallyCompletedBattleIds` Set + localStorage로 완료 ID 유지 (새로고침 후에도)
- `loadMyBattles()` 쿼리: `.neq('status', 'done')` → DB 레벨에서 완료 배틀 제외
- 완료 24시간 후 백그라운드 자동 삭제

---

## 10. 브라우저 호환성

| 환경 | Realtime WebSocket | 폴링 백업 | 동작 |
|------|-------------------|-----------|------|
| Chrome PC/모바일 | ✅ 안정 | 5초 | ✅ |
| Safari iOS | ✅ 대체로 안정 | 5초 | ✅ |
| 카카오톡 인앱브라우저 | ⚠️ 불안정 가능 | 5초 | ✅ |
| 라인 인앱브라우저 | ⚠️ 불안정 가능 | 5초 | ✅ |
| 구형 안드로이드 WebView | ⚠️ 불안정 가능 | 5초 | ✅ |

어떤 브라우저/앱에서 접속하든 최대 5초 내 동기화 보장.

---

## 11. TODO / 알려진 한계

- [ ] `room_opened_at` 컬럼 Supabase 스키마에 있는지 확인 필요
- [ ] 완료 배틀카드 깜빡임 (neq 쿼리 + locallyCompletedBattleIds로 최소화됨)
- [ ] 공개 배틀방 / 랜덤 매칭 (_todo.md 참조)
- [ ] 앱 백그라운드 시 타이머 완료 알림 (Capacitor 전환 시 local-notifications로 해결 예정)
