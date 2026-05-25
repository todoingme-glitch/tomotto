# Tomotto 배틀 시스템 개요

> 최종 업데이트: 2026-05-25 (v0.1.67)

---

## 1. 전체 흐름 요약

```
창조자 (어떤 브라우저든)       친구 (어떤 브라우저든)
─────────────────────────────────────────────────────
[배틀 만들기]
  → battles INSERT (status: 'pending')
  → battle_players INSERT (is_creator: true)
  → subscribeWatchBattle() 시작
  → 초대 링크 생성 & 공유

                              [초대 링크 열기]
                                → openBattleRoom()
                                → 수락 버튼 표시

                              [✓ 수락하고 참여]
                                → battle_players INSERT (is_creator: false)
                                → subscribeWatchBattle() 시작
                                → subscribeBattleRoom() 시작

[battle_players INSERT 감지]
  (postgres_changes via watchChannel)
  → openBattleRoom() 자동 열림
  → subscribeBattleRoom() 시작

[MOTO MODE: 가챠 돌리기]       [MOTO MODE: 가챠 돌리기]
  → currentTask 설정             → currentTask 설정
  → battle_players.task UPDATE   → battle_players.task UPDATE
  → refreshBattleRoom()          → refreshBattleRoom()

[▶ 타이머 시작] 버튼 클릭
  → battles UPDATE (status: 'active')
  → startBattleWithCountdown()
  → 3·2·1 카운트다운 후 startBattleTimer()

                              [battles UPDATE 감지]
                                (postgres_changes via realtimeChannel 또는 watchChannel)
                                [또는] 폴링 5초마다 DB 확인 (WebSocket 불안정 시 백업)
                                → startBattleWithCountdown()
                                → 3·2·1 카운트다운 후 startBattleTimer()

[타이머 완료] finishTimer()    [타이머 완료] finishTimer()
  → battles UPDATE (status: 'done')
  → markBattleCompletedLocally()
  → 배틀 결과 모달 표시

[인증샷 업로드]                [인증샷 업로드]
  → battle_players.proof_url UPDATE
  → battle_players.proof_uploaded_at UPDATE

[배틀 결과 보기]               [배틀 결과 보기]
  → fetchBattle() → 양측 인증샷 표시
```

---

## 2. DB 테이블 구조

### `battles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | text (PK) | 단축 배틀 ID (8자, URL에 사용) |
| status | text | `'pending'` → `'active'` → `'done'` |
| mode | text | `'common'` (TOM MODE) / `'separate'` (MOTO MODE) |
| task_common | text | TOM MODE 공통 작업 |
| duration_sec | int | 타이머 시간(초) |
| created_at | timestamptz | 생성 시각 |
| updated_at | timestamptz | 마지막 상태 변경 시각 |

### `battle_players`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | - |
| battle_id | text | battles.id FK |
| nickname | text | 참여자 닉네임 |
| is_creator | bool | 창조자 여부 |
| task | text | MOTO MODE 개인 가챠 결과 (DB에 저장됨) |
| proof_url | text | 인증샷 base64 또는 URL |
| proof_uploaded_at | timestamptz | 인증샷 업로드 시각 |
| note | text | 완료 소감 |
| room_opened_at | timestamptz | 배틀룸 열었음을 알리는 신호 (파트너 자동 오픈용) |

---

## 3. Realtime 채널 구조

### `realtimeChannel` (`battle-room-{battleId}`)
- 배틀룸 모달이 열려있을 때 활성
- 감지 이벤트:
  - `battle_players INSERT` → 친구 수락 감지 → refreshBattleRoom()
  - `battle_players UPDATE` → room_opened_at 변경 감지 → 배틀룸 자동 오픈
  - `battles UPDATE` → status='active' 감지 → startBattleWithCountdown()
  - `broadcast: room-opened` → 파트너가 배틀룸 열었음 → 자동 오픈

### `watchChannel` (`battle-watch-{battleId}`)
- 배틀 생성 후 / 수락 후 항상 유지 (모달 닫혀도 유지)
- 감지 이벤트:
  - `battle_players INSERT` → 친구 수락 감지 → openBattleRoom() 자동
  - `battle_players UPDATE` → room_opened_at 변경 감지 → 자동 오픈
  - `battles UPDATE` → status='active' 감지 → startBattleWithCountdown()
  - `broadcast: room-opened` → 파트너 배틀룸 열었음 → 자동 오픈

### `battleStartChannel` (`battle-start-{battleId}`)
- 특수 케이스용 (현재 일부 경로에서만 사용)
- `battles UPDATE` → status='active' 감지 → startBattleWithCountdown()

---

## 4. 폴링 백업 시스템 (v0.1.67)

WebSocket(Realtime)이 불안정한 환경(카카오톡 인앱브라우저, 구형 모바일 브라우저 등)을 위한 폴링 백업.

- **주기**: 5초마다 `battles.status` DB 직접 조회
- **시작 조건**: `openBattleRoom()` 호출 시, status가 `'pending'`인 경우만 시작
- **트리거 조건**: status가 `'pending'` → `'active'`로 변경됨을 감지
- **중지 조건**: 타이머 시작 / 모달 닫기 / status='done' 감지
- **중복 방지**: `isStartingBattle`, `timer.running` 플래그로 중복 카운트다운 차단

```js
// 핵심 로직
const knownStatus = currentBattleData?.battle?.status;
if (knownStatus === 'active' || knownStatus === 'done') return; // 이미 진행 중이면 폴링 안 함
```

---

## 5. MOTO MODE 가챠 체크 (v0.1.67)

### 문제
`currentTask` (JS 전역변수)는 localStorage에서 이전 세션 값으로 로드됨.
→ 이전에 가챠를 돌린 적 있는 유저는 이번 배틀에서 가챠 안 해도 "준비됨"으로 표시되는 버그.

### 해결
`renderBattleRoom()`에서 DB의 `battle_players.task`를 직접 확인:
```js
const myDbTask = meIsCreator ? creator?.task : friend?.task;
if (battle.mode === 'separate' && !myDbTask) {
  // 가챠 버튼 표시
}
```

### 가챠 결과 저장 시점
가챠 완료(`showGachaResult()`) 시:
```js
sb.from('battle_players')
  .update({ task })
  .eq('battle_id', battleIdForTask)
  .eq('nickname', myNickname)
```
→ 저장 후 `refreshBattleRoom()` 호출 → UI 자동 갱신

---

## 6. 배틀룸 자동 오픈 (room_opened_at 신호)

### 흐름
1. 유저 A가 배틀룸 모달을 열면 → `battle_players.room_opened_at` UPDATE
2. 유저 B의 `postgres_changes` 리스너가 감지 → `openBattleRoom()` 자동 호출
3. **새로고침/재접속 후에도 작동**: 채널 구독(SUBSCRIBED) 시점에 `fiveMinAgo` 이내 `room_opened_at` 확인

### 한계
- 유저 B가 아직 `battle_players` 행이 없으면(수락 전) 신호 없음
- 이 경우 유저 B는 초대 링크에서 직접 모달에 진입하므로 문제 없음

---

## 7. 완료된 배틀 처리

### 로컬 완료 표시
```js
locallyCompletedBattleIds = new Set(); // 메모리
localStorage: 'tomotto_battle_completedIds' // 영속
```

### DB 레벨 필터
`loadMyBattles()` 쿼리: `.neq('status', 'done')` → 완료된 배틀은 DB에서 제외

### 24시간 자동 정리
`loadMyBattles()` 호출 시 백그라운드로 실행:
```js
doneBattles
  .filter(b => (now - updated_at) >= 24h)
  .forEach(b => deleteBattleSilent(b.id))
```

---

## 8. 브라우저 호환성

| 환경 | Realtime WebSocket | 폴링 백업 | 동작 여부 |
|------|-------------------|-----------|-----------|
| Chrome (PC/모바일) | ✅ 안정적 | 5초 폴링 | ✅ |
| Safari (iOS) | ✅ 대체로 안정적 | 5초 폴링 | ✅ |
| 카카오톡 인앱브라우저 | ⚠️ 불안정 가능 | 5초 폴링 | ✅ (폴링으로 보완) |
| 라인 인앱브라우저 | ⚠️ 불안정 가능 | 5초 폴링 | ✅ (폴링으로 보완) |
| 구형 안드로이드 WebView | ⚠️ 불안정 가능 | 5초 폴링 | ✅ (폴링으로 보완) |

**결론**: 어떤 브라우저/앱에서 접속하든 최대 5초 내 동기화 보장.

---

## 9. 알려진 한계 및 TODO

- [ ] `battle_players.room_opened_at` 컬럼이 없으면 자동 오픈 신호 작동 안 함 (Supabase 스키마 확인 필요)
- [ ] 배틀 완료 후 양측이 모두 새로고침하면 배틀카드가 잠깐 보였다 사라지는 깜빡임 (locallyCompletedBattleIds Set으로 최소화)
- [ ] 공개 배틀방 / 랜덤 매칭 (_todo.md 참조)
