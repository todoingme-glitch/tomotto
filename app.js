// ============================================================
// Tomotto v0.1.6 — 가챠 뽀모도로
// 토마토 톤 + 슬롯머신 reel + persistent timer
// ============================================================

// ====== 개발 플래그 ======
// 운영 시작 전(W3-W4 광고 SDK 연동 시) 다시 true 로
const SHOW_AD_PROMPT = false;

// 요소
const $catInput = document.getElementById('categoryInput');
const $addBtn = document.getElementById('addBtn');
const $catList = document.getElementById('categoryList');
const $emptyHint = document.getElementById('emptyHint');

const $gachaBtn = document.getElementById('gachaBtn');
const $gachaResult = document.getElementById('gachaResult');
const $gachaCount = document.getElementById('gachaCount');
const $adHint = document.getElementById('adHint');

const $timerDisplay = document.getElementById('timerDisplay');
const $startBtn = document.getElementById('startBtn');
const $pauseBtn = document.getElementById('pauseBtn');
const $resetBtn = document.getElementById('resetBtn');
const $durationSelect = document.getElementById('durationSelect');
const $customDurationWrap = document.getElementById('customDurationWrap');
const $customHours = document.getElementById('customHours');
const $customMinutes = document.getElementById('customMinutes');
const $timerStatus = document.getElementById('timerStatus');

// v0.1.8 — 완료 카운트 + 인증샷
const $completedCount = document.getElementById('completedCount');
const $captureRow = document.getElementById('captureRow');
const $captureBtn = document.getElementById('captureBtn');
const $captureInput = document.getElementById('captureInput');
const $lastCapture = document.getElementById('lastCapture');
const $lastCaptureImg = document.getElementById('lastCaptureImg');
const $removeCaptureBtn = document.getElementById('removeCaptureBtn');

// v0.1.9 — 카테고리 편집 모달
const $catEditModal = document.getElementById('categoryEditModal');
const $catEditInput = document.getElementById('categoryEditInput');
const $catEditSave = document.getElementById('categoryEditSave');
const $catEditCancel = document.getElementById('categoryEditCancel');
const $catEditDelete = document.getElementById('categoryEditDelete');

// v0.1.14 — Supabase 연동 활성화
const USE_SUPABASE = true;
const SUPABASE_URL = 'https://xiuwgqmrojvesmxljegm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdXdncW1yb2p2ZXNteGxqZWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0Mjg4OTksImV4cCI6MjA5NTAwNDg5OX0.WdTaoOMkwnBvwWUuNRq-BPcELxQ7Y_ctqG93f-hjq0s';

// Supabase client — SDK가 CDN으로 로드된 후 초기화
let sb = null;
if (USE_SUPABASE && window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Supabase client 초기화 실패:', err);
  }
}

// 친구 배틀 요소
const $battleNick = document.getElementById('battleNick');
const $battleNickEditBtn = document.getElementById('battleNickEditBtn');
const $battleCreateBtn = document.getElementById('battleCreateBtn');
const $battleList = document.getElementById('battleList');

// 닉네임 모달
const $nickModal = document.getElementById('nickModal');
const $nickModalTitle = document.getElementById('nickModalTitle');
const $nickInput = document.getElementById('nickInput');
const $nickSaveBtn = document.getElementById('nickSaveBtn');
const $nickCancelBtn = document.getElementById('nickCancelBtn');

// 배틀 생성 모달
const $battleCreateModal = document.getElementById('battleCreateModal');
const $battleCommonTaskField = document.getElementById('battleCommonTaskField');
const $battleCommonTask = document.getElementById('battleCommonTask');
const $battleDuration = document.getElementById('battleDuration');
const $battleCustomWrap = document.getElementById('battleCustomWrap');
const $battleCustomHours = document.getElementById('battleCustomHours');
const $battleCustomMinutes = document.getElementById('battleCustomMinutes');
const $battleCreateCancelBtn = document.getElementById('battleCreateCancelBtn');
const $battleCreateConfirmBtn = document.getElementById('battleCreateConfirmBtn');

// 초대 링크 모달
const $inviteModal = document.getElementById('inviteModal');
const $inviteSummary = document.getElementById('inviteSummary');
const $inviteLinkInput = document.getElementById('inviteLinkInput');
const $inviteCopyBtn = document.getElementById('inviteCopyBtn');
const $inviteShareBtn = document.getElementById('inviteShareBtn');
const $inviteCloseBtn = document.getElementById('inviteCloseBtn');

// 친구 배틀 STORAGE 키
const BATTLE_STORAGE = {
  nickname: 'tomotto_battle_nickname',
  myBattles: 'tomotto_battle_myBattles',  // 내가 만든 배틀 목록 (JSON 배열)
};

let myNickname = '';

// v0.1.11 — SVG 로고 + 하이파이브 애니메이션
const $logoSvg = document.getElementById('tomottoLogo');
const $logoWrap = document.getElementById('logoWrap');

function playHifive() {
  if (!$logoSvg) return;
  // 클래스 토글로 애니메이션 재트리거
  $logoSvg.classList.remove('play');
  // reflow 강제 → 클래스 다시 추가하면 애니메이션 처음부터
  void $logoSvg.offsetWidth;
  $logoSvg.classList.add('play');
}

// ====== v0.1.13 — 친구 배틀 ======

// 짧은 랜덤 ID 생성 (배틀 ID용)
function makeBattleId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// 닉네임 복원·표시
function loadNickname() {
  myNickname = localStorage.getItem(BATTLE_STORAGE.nickname) || '';
  renderBattleNickname();
}

function renderBattleNickname() {
  if (myNickname) {
    $battleNick.textContent = myNickname;
    $battleNick.style.color = '';
  } else {
    $battleNick.textContent = '(미설정)';
    $battleNick.style.color = 'var(--text-muted)';
  }
}

// 닉네임 모달 열기 (mode: 'first' 처음 입력, 'edit' 수정)
function openNickModal(mode) {
  $nickInput.value = myNickname || '';
  if (mode === 'first') {
    $nickModalTitle.textContent = '닉네임을 알려주세요';
    $nickCancelBtn.hidden = true;
  } else {
    $nickModalTitle.textContent = '닉네임 수정';
    $nickCancelBtn.hidden = false;
  }
  if (typeof $nickModal.showModal === 'function') $nickModal.showModal();
  else $nickModal.setAttribute('open', '');
  setTimeout(() => $nickInput.focus(), 50);
}

function closeNickModal() {
  if (typeof $nickModal.close === 'function') $nickModal.close();
  else $nickModal.removeAttribute('open');
}

function saveNickname() {
  const v = $nickInput.value.trim();
  if (!v) {
    alert('닉네임을 입력해주세요.');
    return;
  }
  if (v.length > 12) {
    alert('12자 이내로 적어주세요.');
    return;
  }
  myNickname = v;
  localStorage.setItem(BATTLE_STORAGE.nickname, v);
  renderBattleNickname();
  closeNickModal();
  // v0.1.14 — 닉네임 저장 후 대기 중인 곳(배틀 룸 등)에 알림
  document.dispatchEvent(new CustomEvent('nick-saved'));
}

$nickSaveBtn.addEventListener('click', saveNickname);
$nickCancelBtn.addEventListener('click', closeNickModal);
$nickInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); saveNickname(); }
});

$battleNickEditBtn.addEventListener('click', () => openNickModal('edit'));

// 배틀 생성 모달
$battleCreateBtn.addEventListener('click', () => {
  // 닉네임 없으면 먼저 입력받음
  if (!myNickname) {
    openNickModal('first');
    return;
  }
  openBattleCreateModal();
});

function openBattleCreateModal() {
  // 초기화
  document.querySelector('input[name="battleMode"][value="common"]').checked = true;
  $battleCommonTask.value = '';
  $battleCommonTaskField.hidden = false;
  $battleDuration.value = '1500';
  $battleCustomWrap.hidden = true;
  if (typeof $battleCreateModal.showModal === 'function') $battleCreateModal.showModal();
  else $battleCreateModal.setAttribute('open', '');
}

function closeBattleCreateModal() {
  if (typeof $battleCreateModal.close === 'function') $battleCreateModal.close();
  else $battleCreateModal.removeAttribute('open');
}

// 모드 변경 시 공통 작업 input 토글
document.querySelectorAll('input[name="battleMode"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    $battleCommonTaskField.hidden = e.target.value !== 'common';
  });
});

// 시간 직접 입력 토글
$battleDuration.addEventListener('change', () => {
  if ($battleDuration.value === 'custom') {
    $battleCustomWrap.hidden = false;
    if (!$battleCustomHours.value && !$battleCustomMinutes.value) {
      $battleCustomHours.value = '0';
      $battleCustomMinutes.value = '25';
    }
  } else {
    $battleCustomWrap.hidden = true;
  }
});

function getBattleDurationSec() {
  if ($battleDuration.value === 'custom') {
    const h = parseInt($battleCustomHours.value, 10) || 0;
    const m = parseInt($battleCustomMinutes.value, 10) || 0;
    return Math.max(60, (h * 60 + m) * 60);  // 최소 1분
  }
  return parseInt($battleDuration.value, 10) || 1500;
}

$battleCreateCancelBtn.addEventListener('click', closeBattleCreateModal);

$battleCreateConfirmBtn.addEventListener('click', async () => {
  const mode = document.querySelector('input[name="battleMode"]:checked').value;
  const durationSec = getBattleDurationSec();
  let taskCommon = null;

  if (mode === 'common') {
    taskCommon = $battleCommonTask.value.trim();
    if (!taskCommon) {
      alert('공통 작업을 입력해주세요.');
      $battleCommonTask.focus();
      return;
    }
  }

  // 배틀 데이터 생성
  const battleId = makeBattleId();
  const battle = {
    id: battleId,
    creator_nickname: myNickname,
    mode,
    task_common: taskCommon,
    duration_sec: durationSec,
    status: 'waiting',  // waiting → active → completed
    created_at: new Date().toISOString(),
  };

  // 저장 — 일단 localStorage (Supabase 연동되면 서버로)
  await saveBattle(battle);

  // 내 배틀 목록에 추가
  addToMyBattles(battle);

  // 모달 닫고 초대 링크 표시
  closeBattleCreateModal();
  openInviteModal(battle);
  await renderMyBattles();
});

// v0.1.14 — Supabase 배틀 저장 + 생성자를 battle_players에도 등록
async function saveBattle(battle) {
  if (USE_SUPABASE && sb) {
    // battles 테이블에 insert
    const { error: e1 } = await sb.from('battles').insert(battle);
    if (e1) {
      console.error('배틀 저장 실패:', e1);
      alert('배틀 저장 실패: ' + e1.message);
      throw e1;
    }
    // battle_players에 생성자 등록
    const { error: e2 } = await sb.from('battle_players').insert({
      battle_id: battle.id,
      nickname: battle.creator_nickname,
      is_creator: true,
    });
    if (e2) {
      console.error('플레이어 등록 실패:', e2);
      // 배틀은 만들어졌으니 치명적이진 않음 — 알림만
    }
  } else {
    localStorage.setItem(`tomotto_battle_${battle.id}`, JSON.stringify(battle));
  }
}

// v0.1.14 — Supabase에서 단일 배틀 + 참여자 정보 가져오기
async function fetchBattle(battleId) {
  if (!sb) return null;
  const { data: battle, error: e1 } = await sb
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .single();
  if (e1) {
    console.error('배틀 조회 실패:', e1);
    return null;
  }
  const { data: players, error: e2 } = await sb
    .from('battle_players')
    .select('*')
    .eq('battle_id', battleId)
    .order('created_at', { ascending: true });
  if (e2) {
    console.error('참여자 조회 실패:', e2);
  }
  return { battle, players: players || [] };
}

function addToMyBattles(battle) {
  let list = [];
  try { list = JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); } catch {}
  list.unshift(battle);  // 최신 위로
  // 최대 10개 유지
  list = list.slice(0, 10);
  localStorage.setItem(BATTLE_STORAGE.myBattles, JSON.stringify(list));
}

// v0.1.14.1 — 내가 참여한 모든 배틀 Supabase에서 fetch (생성자 + 수락자 둘 다)
async function loadMyBattles() {
  if (sb && myNickname) {
    try {
      // 1) 본인 nickname으로 battle_players에서 본인 row 찾기
      const { data: myPlayerRows, error: e1 } = await sb
        .from('battle_players')
        .select('battle_id, is_creator')
        .eq('nickname', myNickname);
      if (e1) throw e1;
      const battleIds = (myPlayerRows || []).map((r) => r.battle_id);
      if (battleIds.length === 0) return [];

      // 2) 해당 battle_id들의 battle 정보 가져오기
      const { data: battles, error: e2 } = await sb
        .from('battles')
        .select('*')
        .in('id', battleIds)
        .order('created_at', { ascending: false });
      if (e2) throw e2;
      return (battles || []).map((b) => {
        const myRow = myPlayerRows.find((r) => r.battle_id === b.id);
        return { ...b, _isCreator: myRow ? myRow.is_creator : false };
      });
    } catch (err) {
      console.error('내 배틀 fetch 실패:', err);
      // 실패 시 localStorage fallback
      try { return JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); }
      catch { return []; }
    }
  }
  try { return JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); }
  catch { return []; }
}

async function renderMyBattles() {
  const list = await loadMyBattles();
  if (list.length === 0) {
    $battleList.innerHTML = '<p class="battle-empty">아직 참여한 배틀이 없어요.</p>';
    return;
  }
  $battleList.innerHTML = list.map((b) => {
    const modeLabel = b.mode === 'common' ? '공통 작업' : '따로 가챠';
    const statusLabel = b.status === 'waiting' ? '친구 대기 중' : (b.status === 'active' ? '진행 중' : '완료');
    const taskLabel = b.mode === 'common' ? escapeHtml(b.task_common || '') : '(각자 가챠)';
    const minutes = Math.round(b.duration_sec / 60);
    const roleLabel = b._isCreator ? '내가 만듦' : '초대받음';
    // 삭제 버튼은 생성자만
    const deleteBtn = b._isCreator
      ? `<button class="btn-mini btn-danger-mini" data-action="delete" data-id="${b.id}">🗑 삭제</button>`
      : '';
    return `
      <div class="battle-card" data-id="${b.id}">
        <div class="battle-card-top">
          <span class="battle-card-mode">${modeLabel} · ${roleLabel}</span>
          <span class="battle-card-status ${b.status}">${statusLabel}</span>
        </div>
        <div class="battle-card-task">${taskLabel}</div>
        <div class="battle-card-meta">시간 ${minutes}분 · ID ${b.id}</div>
        <div class="battle-card-actions">
          <button class="btn-mini" data-action="open" data-id="${b.id}">열기</button>
          <button class="btn-mini" data-action="invite" data-id="${b.id}">초대 링크</button>
          ${deleteBtn}
        </div>
      </div>
    `;
  }).join('');
}

// 배틀 삭제 (생성자만)
async function deleteBattle(battleId) {
  if (!sb) return;
  if (!confirm('이 배틀을 삭제할까요? 되돌릴 수 없어요.')) return;
  // battle_players는 ON DELETE CASCADE로 자동 삭제됨
  const { error } = await sb.from('battles').delete().eq('id', battleId);
  if (error) {
    alert('삭제 실패: ' + error.message);
    return;
  }
  // localStorage 캐시에서도 제거
  let cached = [];
  try { cached = JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); } catch {}
  cached = cached.filter((b) => b.id !== battleId);
  localStorage.setItem(BATTLE_STORAGE.myBattles, JSON.stringify(cached));
  renderMyBattles();
}

$battleList.addEventListener('click', async (e) => {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  if (!action || !id) return;

  if (action === 'invite') {
    const list = await loadMyBattles();
    const battle = list.find((b) => b.id === id);
    if (battle) openInviteModal(battle);
  } else if (action === 'open') {
    openBattleRoom(id);
  } else if (action === 'delete') {
    deleteBattle(id);
  }
});

// 초대 링크 모달
function openInviteModal(battle) {
  const link = makeInviteLink(battle.id);
  const modeLabel = battle.mode === 'common' ? '공통 작업' : '따로 가챠';
  const taskLabel = battle.mode === 'common' ? ` · "${battle.task_common}"` : '';
  const minutes = Math.round(battle.duration_sec / 60);
  $inviteSummary.textContent = `${modeLabel}${taskLabel} · ${minutes}분`;
  $inviteLinkInput.value = link;

  // Web Share API 지원 시 공유 버튼 표시
  $inviteShareBtn.hidden = !navigator.share;

  if (typeof $inviteModal.showModal === 'function') $inviteModal.showModal();
  else $inviteModal.setAttribute('open', '');
}

function makeInviteLink(battleId) {
  const base = location.origin + location.pathname;
  return `${base}?battle=${battleId}`;
}

function closeInviteModal() {
  if (typeof $inviteModal.close === 'function') $inviteModal.close();
  else $inviteModal.removeAttribute('open');
}

$inviteCloseBtn.addEventListener('click', closeInviteModal);

$inviteCopyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($inviteLinkInput.value);
    const original = $inviteCopyBtn.textContent;
    $inviteCopyBtn.textContent = '복사됨 ✓';
    setTimeout(() => { $inviteCopyBtn.textContent = original; }, 1500);
  } catch {
    $inviteLinkInput.select();
    document.execCommand('copy');
  }
});

$inviteShareBtn.addEventListener('click', async () => {
  if (!navigator.share) return;
  try {
    await navigator.share({
      title: 'Tomotto 친구 배틀',
      text: '같이 작업할래? 시간 정해서 같이 집중하기.',
      url: $inviteLinkInput.value,
    });
  } catch {}
});

// v0.1.14 — 배틀 룸 모달 요소
const $battleRoomModal = document.getElementById('battleRoomModal');
const $battleRoomTitle = document.getElementById('battleRoomTitle');
const $battleRoomSummary = document.getElementById('battleRoomSummary');
const $battleRoomPlayers = document.getElementById('battleRoomPlayers');
const $battleRoomTask = document.getElementById('battleRoomTask');
const $battleRoomStatus = document.getElementById('battleRoomStatus');
const $battleRoomCancelBtn = document.getElementById('battleRoomCancelBtn');
const $battleRoomAcceptBtn = document.getElementById('battleRoomAcceptBtn');
const $battleRoomStartBtn = document.getElementById('battleRoomStartBtn');

let currentBattleId = null;
let currentBattleData = null;

async function openBattleRoom(battleId) {
  currentBattleId = battleId;
  $battleRoomSummary.textContent = '불러오는 중...';
  $battleRoomPlayers.innerHTML = '';
  $battleRoomTask.textContent = '';
  $battleRoomTask.className = 'battle-room-task empty';
  $battleRoomStatus.textContent = '';
  $battleRoomStatus.classList.remove('error');
  $battleRoomAcceptBtn.hidden = true;
  $battleRoomStartBtn.hidden = true;

  if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
  else $battleRoomModal.setAttribute('open', '');

  if (!sb) {
    $battleRoomSummary.textContent = 'Supabase가 연결되지 않았어요.';
    $battleRoomStatus.textContent = 'SDK 로드를 확인해주세요.';
    $battleRoomStatus.classList.add('error');
    return;
  }

  // 닉네임 없으면 먼저 받기
  if (!myNickname) {
    closeBattleRoom();
    openNickModal('first');
    // 닉네임 저장 후 다시 열기
    const reopen = () => {
      if (myNickname) {
        openBattleRoom(battleId);
        document.removeEventListener('nick-saved', reopen);
      }
    };
    document.addEventListener('nick-saved', reopen);
    return;
  }

  await refreshBattleRoom();
}

async function refreshBattleRoom() {
  if (!currentBattleId) return;
  const result = await fetchBattle(currentBattleId);
  if (!result || !result.battle) {
    $battleRoomSummary.textContent = '배틀을 찾을 수 없어요.';
    $battleRoomStatus.textContent = '링크가 잘못됐거나 만든 사람이 삭제했을 수 있어요.';
    $battleRoomStatus.classList.add('error');
    return;
  }
  currentBattleData = result;
  renderBattleRoom();
}

function renderBattleRoom() {
  const { battle, players } = currentBattleData;
  const minutes = Math.round(battle.duration_sec / 60);
  const modeLabel = battle.mode === 'common' ? '공통 작업' : '따로 가챠';
  const statusLabel = battle.status === 'waiting' ? '친구 대기 중' : (battle.status === 'active' ? '진행 중' : '완료');

  $battleRoomSummary.textContent = `${modeLabel} · ${minutes}분 · ${statusLabel}`;

  // 플레이어 카드 — 정확히 2칸 (생성자 + 친구)
  const creator = players.find((p) => p.is_creator);
  const friend = players.find((p) => !p.is_creator);
  const meIsCreator = creator && creator.nickname === myNickname;
  const meIsFriend = friend && friend.nickname === myNickname;
  const alreadyJoined = meIsCreator || meIsFriend;

  $battleRoomPlayers.innerHTML = `
    <div class="battle-player ${meIsCreator ? 'is-me' : ''}">
      <div class="battle-player-nick">${creator ? escapeHtml(creator.nickname) : '—'}</div>
      <div class="battle-player-role">만든 사람${meIsCreator ? ' (나)' : ''}</div>
    </div>
    <div class="battle-vs">VS</div>
    <div class="battle-player ${friend ? (meIsFriend ? 'is-me' : '') : 'empty'}">
      <div class="battle-player-nick">${friend ? escapeHtml(friend.nickname) : '대기 중'}</div>
      <div class="battle-player-role">${friend ? `친구${meIsFriend ? ' (나)' : ''}` : '아직 수락 안 함'}</div>
    </div>
  `;

  // 작업 표시 — 공통 모드일 때
  if (battle.mode === 'common' && battle.task_common) {
    $battleRoomTask.textContent = `오늘의 공통 작업: ${battle.task_common}`;
    $battleRoomTask.className = 'battle-room-task';
  } else if (battle.mode === 'separate') {
    $battleRoomTask.textContent = '각자 가챠 모드 — 각자 카테고리에서 가챠 돌리기';
    $battleRoomTask.className = 'battle-room-task';
  }

  // 버튼 상태 결정
  $battleRoomAcceptBtn.hidden = true;
  $battleRoomStartBtn.hidden = true;

  if (!alreadyJoined && !friend) {
    // 아직 참여 안 했고 자리 비어있으면 수락 가능
    $battleRoomAcceptBtn.hidden = false;
    $battleRoomStatus.textContent = '이 배틀에 참여하시겠어요?';
  } else if (alreadyJoined && !friend) {
    $battleRoomStatus.textContent = '친구가 링크를 열고 수락하길 기다리는 중...';
  } else if (alreadyJoined && friend) {
    $battleRoomStatus.textContent = '둘 다 준비됐어요. 시작하면 타이머가 돌아가요.';
    $battleRoomStartBtn.hidden = false;
  } else if (!alreadyJoined && friend) {
    $battleRoomStatus.textContent = '이미 두 사람이 참여한 배틀이에요. 새 배틀을 만들어주세요.';
    $battleRoomStatus.classList.add('error');
  }
}

async function acceptBattle() {
  if (!sb || !currentBattleId || !myNickname) return;
  $battleRoomAcceptBtn.disabled = true;
  $battleRoomStatus.textContent = '참여 등록 중...';

  const { error } = await sb.from('battle_players').insert({
    battle_id: currentBattleId,
    nickname: myNickname,
    is_creator: false,
  });

  $battleRoomAcceptBtn.disabled = false;
  if (error) {
    $battleRoomStatus.textContent = '참여 등록 실패: ' + error.message;
    $battleRoomStatus.classList.add('error');
    return;
  }

  await refreshBattleRoom();
}

function startBattleTimer() {
  if (!currentBattleData) return;
  const { battle } = currentBattleData;
  // 메인 타이머에 배틀 작업 적용
  let task = battle.task_common;
  if (battle.mode === 'separate') {
    task = '각자 가챠 모드 (개인 가챠 돌려서 작업 정해주세요)';
  }
  currentTask = task;
  localStorage.setItem(STORAGE.currentTask, task);
  showGachaResult(task, false);

  // 시간 설정
  timer.duration = battle.duration_sec;
  timer.remaining = battle.duration_sec;
  updateTimerDisplay();

  closeBattleRoom();

  // 타이머 시작 (기존 메인 타이머 사용)
  startTimer();

  // 메인 타이머 섹션으로 스크롤
  document.querySelector('.timer-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeBattleRoom() {
  if (typeof $battleRoomModal.close === 'function') $battleRoomModal.close();
  else $battleRoomModal.removeAttribute('open');
}

$battleRoomCancelBtn.addEventListener('click', closeBattleRoom);
$battleRoomAcceptBtn.addEventListener('click', acceptBattle);
$battleRoomStartBtn.addEventListener('click', startBattleTimer);

// 닉네임 저장 후 이벤트 (배틀 룸 열기 재시도용)
function dispatchNickSaved() {
  document.dispatchEvent(new CustomEvent('nick-saved'));
}

// 페이지 로드 시 닉네임 + 내 배틀 복원, ?battle=ID 있으면 배틀 룸 자동 열기
window.addEventListener('load', () => {
  loadNickname();
  renderMyBattles();

  // URL에 ?battle=ID 있으면 배틀 룸 모달 자동 열기
  const params = new URLSearchParams(location.search);
  const battleId = params.get('battle');
  if (battleId) {
    setTimeout(() => openBattleRoom(battleId), 400);
  }
});

// 페이지 로드 시 한 번 자동 재생 + 클릭 시 다시 재생
window.addEventListener('load', () => {
  setTimeout(playHifive, 400);  // 페이지 그리기 끝나고 살짝 후
});
if ($logoWrap) {
  $logoWrap.addEventListener('click', playHifive);
}

// v0.1.10 — 인앱 카메라 모달
const $cameraModal = document.getElementById('cameraModal');
const $cameraVideo = document.getElementById('cameraVideo');
const $cameraPreview = document.getElementById('cameraPreview');
const $cameraCanvas = document.getElementById('cameraCanvas');
const $cameraHint = document.getElementById('cameraHint');
const $cameraShootBtn = document.getElementById('cameraShootBtn');
const $cameraRetryBtn = document.getElementById('cameraRetryBtn');
const $cameraSaveBtn = document.getElementById('cameraSaveBtn');
const $cameraCancelBtn = document.getElementById('cameraCancelBtn');
const $cameraGalleryBtn = document.getElementById('cameraGalleryBtn');
let cameraStream = null;
let lastCapturedDataUrl = null;

// localStorage 키
const STORAGE = {
  categories: 'tomotto_categories',
  gachaCount: 'tomotto_gachaCount',
  duration: 'tomotto_duration',
  customDuration: 'tomotto_customDuration',  // v0.1.8 — 사용자 지정 시간 (초)
  currentTask: 'tomotto_currentTask',
  timerState: 'tomotto_timerState',
  completedCount: 'tomotto_completedCount',  // v0.1.8 — 누적 완료 횟수
  lastCapture: 'tomotto_lastCapture',        // v0.1.8 — 마지막 인증샷 (data URL, 작게 압축)
};

// ====== localStorage 마이그레이션 (pomocha_* → tomotto_*) ======
// 2026-05-21 앱 이름 Pomocha → Tomotto 변경.
// 옛 키에 저장된 데이터를 새 키로 한 번만 옮기고 옛 키는 정리.
function migrateStorage() {
  const renames = {
    pomocha_categories: 'tomotto_categories',
    pomocha_gachaCount: 'tomotto_gachaCount',
    pomocha_duration: 'tomotto_duration',
    pomocha_currentTask: 'tomotto_currentTask',
    pomocha_timerState: 'tomotto_timerState',
  };
  try {
    for (const [oldKey, newKey] of Object.entries(renames)) {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal === null) continue;
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldVal);
      }
      localStorage.removeItem(oldKey);
    }
  } catch {}
}

// 상태
let categories = [];
let gachaCount = 0;
let currentTask = null;
let completedCount = 0;             // v0.1.8 — 누적 완료
let editingCategoryIndex = -1;      // v0.1.8 — 카테고리 인라인 편집 진행 중인 인덱스
let timer = {
  duration: 1500,    // 초 단위 (25분 기본)
  remaining: 1500,
  endTime: null,     // running 상태일 때 종료 시각 (ms)
  intervalId: null,
  isRunning: false,
};

// ====== 초기화 — 페이지 로드 ======
window.addEventListener('load', () => {
  // 옛 키(pomocha_*) 데이터를 새 키로 이전 — 첫 로드 때 한 번
  migrateStorage();

  // 카테고리 복원
  try {
    categories = JSON.parse(localStorage.getItem(STORAGE.categories) || '[]');
  } catch { categories = []; }
  renderCategories();

  // 가챠 카운트 복원
  const savedGacha = parseInt(localStorage.getItem(STORAGE.gachaCount) || '0', 10);
  gachaCount = Number.isFinite(savedGacha) && savedGacha >= 0 ? savedGacha : 0;
  updateGachaCounter();

  // 타이머 길이 복원 — select option에 있는 값만 받기 (NaN/구버전 방어)
  const validValues = Array.from($durationSelect.options).map(o => o.value);
  const savedDuration = localStorage.getItem(STORAGE.duration);
  if (savedDuration === 'custom') {
    // 커스텀 시간 모드 복원 (시:분 분리)
    $durationSelect.value = 'custom';
    const savedCustom = parseInt(localStorage.getItem(STORAGE.customDuration) || '1500', 10);
    const customSec = Number.isFinite(savedCustom) && savedCustom > 0 ? savedCustom : 1500;
    timer.duration = customSec;
    const totalMin = Math.round(customSec / 60);
    $customHours.value = String(Math.floor(totalMin / 60));
    $customMinutes.value = String(totalMin % 60);
    $customDurationWrap.hidden = false;
  } else if (savedDuration && validValues.includes(savedDuration)) {
    $durationSelect.value = savedDuration;
    const parsed = parseInt(savedDuration, 10);
    timer.duration = Number.isFinite(parsed) && parsed > 0 ? parsed : 1500;
    $customDurationWrap.hidden = true;  // 명시 hide (v0.1.10 hotfix)
  } else {
    // 디폴트 25분 (1500초) — select.value도 명시
    $durationSelect.value = '1500';
    timer.duration = 1500;
    if (savedDuration) localStorage.setItem(STORAGE.duration, '1500');
    $customDurationWrap.hidden = true;  // 명시 hide
  }
  timer.remaining = timer.duration;

  // v0.1.8 — 누적 완료 카운트 복원
  const savedCompleted = parseInt(localStorage.getItem(STORAGE.completedCount) || '0', 10);
  completedCount = Number.isFinite(savedCompleted) && savedCompleted >= 0 ? savedCompleted : 0;
  updateCompletedDisplay();

  // v0.1.8 — 마지막 인증샷 복원
  const savedCapture = localStorage.getItem(STORAGE.lastCapture);
  if (savedCapture) {
    $lastCaptureImg.src = savedCapture;
    $lastCapture.hidden = false;
  }

  // 마지막 작업 복원
  currentTask = localStorage.getItem(STORAGE.currentTask);
  if (currentTask) {
    showGachaResult(currentTask, false);
  }

  // 타이머 상태 복원 (persistent timer)
  restoreTimerState();

  updateTimerDisplay();
});

// ====== 타이머 상태 복원 ======
function restoreTimerState() {
  let state;
  try {
    state = JSON.parse(localStorage.getItem(STORAGE.timerState) || 'null');
  } catch { state = null; }

  if (!state) {
    $startBtn.disabled = !currentTask;
    return;
  }

  // running 상태로 저장돼 있었음 → endTime 기준으로 남은 시간 계산
  if (state.status === 'running' && state.endTime) {
    const now = Date.now();
    timer.duration = state.duration;
    currentTask = state.task || currentTask;

    if (now >= state.endTime) {
      // 이미 끝났음
      timer.remaining = 0;
      timer.endTime = null;
      $timerStatus.textContent = `✓ "${currentTask}" 자리 비운 사이 시간이 끝났어요`;
      $timerStatus.classList.add('success');
      $timerDisplay.classList.add('finished');
      $startBtn.disabled = true;
      $pauseBtn.disabled = true;
      $resetBtn.disabled = false;
      // 완료 상태로 저장
      localStorage.setItem(STORAGE.timerState, JSON.stringify({
        status: 'finished',
        duration: state.duration,
        task: state.task,
        finishedAt: state.endTime,
      }));
    } else {
      // 남은 시간으로 계속 진행
      timer.remaining = Math.ceil((state.endTime - now) / 1000);
      timer.endTime = state.endTime;
      $timerStatus.textContent = `⟳ "${currentTask}" 자리 비운 사이도 계속 돌아가는 중...`;
      $timerStatus.classList.add('resumed');
      startTimerInternal();  // 자동 재개
    }
  }
  // paused 상태로 저장돼 있었음 → 남은 시간 복원, 시작 안 함
  else if (state.status === 'paused' && state.remaining > 0) {
    timer.duration = state.duration;
    timer.remaining = state.remaining;
    currentTask = state.task || currentTask;
    $startBtn.disabled = false;
    $pauseBtn.disabled = true;
    $resetBtn.disabled = false;
    $timerStatus.textContent = '⏸ 일시정지 — 시작 누르면 이어서';
  }
  // finished 상태였으면 그대로 표시
  else if (state.status === 'finished') {
    timer.duration = state.duration;
    timer.remaining = 0;
    currentTask = state.task || currentTask;
    $timerStatus.textContent = `✓ "${currentTask}" 완료! 수고하셨어요`;
    $timerStatus.classList.add('success');
    $timerDisplay.classList.add('finished');
    $startBtn.disabled = true;
    $pauseBtn.disabled = true;
    $resetBtn.disabled = false;
    // v0.1.8 — 완료 후 페이지 다시 열렸을 때도 인증샷 첨부 가능
    $captureRow.hidden = false;
  }
  else {
    $startBtn.disabled = !currentTask;
  }
}

// ====== 카테고리 ======
function renderCategories() {
  $catList.innerHTML = '';
  categories.forEach((cat, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="cat-text" data-index="${i}" title="탭하면 수정">${escapeHtml(cat)}</span> <button class="remove-btn" data-index="${i}" title="삭제">✕</button>`;
    $catList.appendChild(li);
  });
  $emptyHint.classList.toggle('hidden', categories.length >= 2);
  $gachaBtn.disabled = categories.length < 2;
  saveCategories();
  editingCategoryIndex = -1;
}

// v0.1.9 — 카테고리 편집 모달
function openEditModal(index) {
  if (index < 0 || index >= categories.length) return;
  editingCategoryIndex = index;
  $catEditInput.value = categories[index];
  if (typeof $catEditModal.showModal === 'function') {
    $catEditModal.showModal();
  } else {
    // 구버전 브라우저 fallback
    $catEditModal.setAttribute('open', '');
  }
  // 모달 열린 직후 input focus + 전체 선택
  setTimeout(() => {
    $catEditInput.focus();
    $catEditInput.select();
  }, 50);
}

function closeEditModal() {
  if (typeof $catEditModal.close === 'function') {
    $catEditModal.close();
  } else {
    $catEditModal.removeAttribute('open');
  }
  editingCategoryIndex = -1;
}

function saveEditModal() {
  const index = editingCategoryIndex;
  if (index < 0 || index >= categories.length) {
    closeEditModal();
    return;
  }
  const newText = $catEditInput.value.trim();
  const oldText = categories[index];

  if (!newText) {
    // 빈 값으로 저장 → 삭제 확인
    if (!confirm('빈 값으로 저장하면 이 카테고리가 삭제돼요. 진행할까요?')) return;
    categories.splice(index, 1);
  } else if (newText !== oldText) {
    // 중복 체크 (자기 자신 제외)
    const dup = categories.some((c, i) => i !== index && c === newText);
    if (dup) {
      alert('이미 있는 카테고리예요.');
      return;  // 모달 유지
    }
    if (newText.length > 30) {
      alert('30자 이내로 적어주세요.');
      return;
    }
    categories[index] = newText;
  }
  renderCategories();
  closeEditModal();
}

function deleteEditModal() {
  const index = editingCategoryIndex;
  if (index < 0 || index >= categories.length) {
    closeEditModal();
    return;
  }
  if (!confirm(`"${categories[index]}" 카테고리를 삭제할까요?`)) return;
  categories.splice(index, 1);
  renderCategories();
  closeEditModal();
}

// 모달 이벤트
$catEditSave.addEventListener('click', saveEditModal);
$catEditCancel.addEventListener('click', closeEditModal);
$catEditDelete.addEventListener('click', deleteEditModal);
$catEditInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    saveEditModal();
  }
});
// Esc 키는 dialog 자체가 처리 (close 이벤트 발생)
$catEditModal.addEventListener('close', () => {
  editingCategoryIndex = -1;
});
// backdrop 클릭 시 닫기
$catEditModal.addEventListener('click', (e) => {
  if (e.target === $catEditModal) closeEditModal();
});

function saveCategories() {
  localStorage.setItem(STORAGE.categories, JSON.stringify(categories));
}

function addCategory() {
  const v = $catInput.value.trim();
  if (!v) return;
  if (categories.includes(v)) {
    alert('이미 있는 카테고리예요.');
    return;
  }
  if (v.length > 30) {
    alert('30자 이내로 적어주세요.');
    return;
  }
  categories.push(v);
  $catInput.value = '';
  renderCategories();
  const newLi = $catList.lastElementChild;
  if (newLi) {
    newLi.classList.add('highlight');
    setTimeout(() => newLi.classList.remove('highlight'), 600);
  }
}

$addBtn.addEventListener('click', addCategory);
$catInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addCategory();
});

$catList.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const i = parseInt(e.target.dataset.index, 10);
    categories.splice(i, 1);
    renderCategories();
    return;
  }
  // v0.1.9 — 카테고리 텍스트 탭 시 편집 모달 열기
  if (e.target.classList.contains('cat-text')) {
    const i = parseInt(e.target.dataset.index, 10);
    openEditModal(i);
  }
});

// ====== 가챠 — 슬롯머신 스타일 ======
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// v0.1.9 — 가챠 카운트는 "이번 사이클 N/3" 표시. 3 도달 → 다음엔 광고 사이클 시작.
function updateGachaCounter() {
  $gachaCount.textContent = String(gachaCount);
  $adHint.hidden = gachaCount < 3;
  localStorage.setItem(STORAGE.gachaCount, String(gachaCount));
}

function showGachaResult(task, animate = true) {
  currentTask = task;
  localStorage.setItem(STORAGE.currentTask, task);
  $gachaResult.classList.remove('spinning');
  $gachaResult.classList.add('revealed');
  $gachaResult.innerHTML = `
    <div class="gacha-result-inner">
      <span class="gacha-label">오늘의 작업</span>
      <div class="gacha-winner">${escapeHtml(task)}</div>
    </div>
  `;
  if (animate) {
    spawnConfetti();
  }
}

// 폭죽 — 결과 글자 중심에서 색 조각 사방으로 튀기
function spawnConfetti() {
  // 토마토 톤 + 포인트 초록 색 팔레트
  const colors = ['#d94e3a', '#ff7a5c', '#ffaa3a', '#6ba368', '#8b2a1f', '#f5c542'];
  const shapes = ['', 'circle', 'star'];
  const count = 18;

  const burst = document.createElement('div');
  burst.className = 'confetti-burst';
  $gachaResult.appendChild(burst);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    const shapeClass = shapes[Math.floor(Math.random() * shapes.length)];
    piece.className = 'confetti-piece' + (shapeClass ? ' ' + shapeClass : '');

    // 각도 — 360도 균등 + 약간 랜덤
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    // 거리 — 70~120px 사이
    const distance = 70 + Math.random() * 50;
    const x = Math.cos(angle) * distance;
    // y는 위로 더 가게 (자연스럽게 튀어오르는 느낌)
    const y = Math.sin(angle) * distance - 10;
    const rot = (Math.random() - 0.5) * 720;

    piece.style.setProperty('--x', `${x}px`);
    piece.style.setProperty('--y', `${y}px`);
    piece.style.setProperty('--rot', `${rot}deg`);
    piece.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--delay', `${Math.random() * 0.08}s`);

    // star 모양은 border-bottom 색만 적용
    if (shapeClass === 'star') {
      piece.style.borderBottomColor = colors[Math.floor(Math.random() * colors.length)];
    }

    burst.appendChild(piece);
  }

  // 1.2초 후 정리
  setTimeout(() => burst.remove(), 1300);
}

// 슬롯머신 reel 방식 — 카테고리들이 위→아래로 흐르다가 점점 느려져 멈춤
async function spinGacha() {
  if (categories.length < 2) return;

  // v0.1.9 — 사이클 3 도달 시 자동 리셋. 운영 모드면 광고 confirm 후 리셋.
  if (gachaCount >= 3) {
    if (SHOW_AD_PROMPT) {
      const confirmAd = confirm(
        '이번 사이클(3회) 다 썼어요!\n광고 보고 새 사이클 시작?\n\n(현재는 시뮬레이션 — 실제 광고는 W3-W4에 연동 예정)'
      );
      if (!confirmAd) return;
    }
    // 테스트 모드: 조용히 리셋. 운영 모드: 광고 본 것으로 처리하고 리셋.
    gachaCount = 0;
    updateGachaCounter();
  }

  $gachaBtn.disabled = true;
  $gachaBtn.classList.add('rolling');
  $gachaResult.classList.add('spinning');
  $gachaResult.classList.remove('revealed');

  // 최종 결과 미리 결정
  const winner = categories[Math.floor(Math.random() * categories.length)];

  // 슬롯 설정
  const ITEM_HEIGHT = 80;             // px — CSS와 동기
  const TOTAL_FILL = 40;              // 시퀀스 길이 (40개 + winner)
  const SPIN_DURATION = 1800;         // ms — 1.8초 (1.5초는 너무 급함, 2초는 약간 길어서 절충)

  // 시퀀스 생성 — 직전과 같은 카테고리 안 나오게
  const sequence = [];
  let lastIdx = -1;
  for (let i = 0; i < TOTAL_FILL; i++) {
    let idx;
    do {
      idx = Math.floor(Math.random() * categories.length);
    } while (categories.length > 1 && idx === lastIdx);
    lastIdx = idx;
    sequence.push(categories[idx]);
  }
  // 마지막에 winner
  sequence.push(winner);
  const targetIndex = sequence.length - 1;

  // 슬롯 윈도우 + reel 렌더
  $gachaResult.innerHTML = `
    <div class="slot-window">
      <div class="slot-reel" id="slotReel">
        ${sequence.map((c, i) => `
          <div class="slot-item${i === targetIndex ? ' winner-item' : ''}" data-idx="${i}">
            ${escapeHtml(c)}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const $reel = document.getElementById('slotReel');

  // 시작 위치 (transition 없이 즉시 적용)
  $reel.style.transition = 'none';
  $reel.style.transform = 'translateY(0)';

  // 강제 reflow → transition 적용 보장
  // eslint-disable-next-line no-unused-expressions
  $reel.offsetHeight;
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(r));

  // 타겟 위치 계산 — winner가 윈도우 중앙(=120px 지점 = 두 번째 슬롯)에 오게
  // reel top이 -((targetIndex - 1) * ITEM_HEIGHT) 일 때 sequence[targetIndex]가 중앙
  const targetY = -(targetIndex - 1) * ITEM_HEIGHT;

  // 슬롯 스핀 — 점점 느려지면서 정확히 자리에 정착 (overshoot/bounce 없음)
  $reel.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.5, 0.18, 1)`;
  $reel.style.transform = `translateY(${targetY}px)`;

  await new Promise(r => setTimeout(r, SPIN_DURATION));

  // 정착 직후 winner 강조 + lock pop 애니메이션 (뽑힌 느낌)
  const $winnerEl = $reel.querySelector('.winner-item');
  if ($winnerEl) {
    $winnerEl.classList.add('locked', 'is-center');
  }

  // 살짝 여운
  await new Promise(r => setTimeout(r, 550));

  // 결과 박스로 전환 (폭죽 + 글로우 발사)
  gachaCount++;
  updateGachaCounter();
  showGachaResult(winner, true);

  // 타이머 리셋 (새 작업)
  resetTimer();

  $gachaBtn.classList.remove('rolling');
  $gachaBtn.disabled = false;
}

$gachaBtn.addEventListener('click', spinGacha);

// ====== 타이머 ======
function formatTime(seconds) {
  // NaN / undefined / 비정상 값 방어 → 0으로 fallback
  if (!Number.isFinite(seconds)) seconds = 0;
  seconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  // v0.1.9 — 60분 이상이면 H:MM:SS, 미만은 기존 MM:SS
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  $timerDisplay.textContent = formatTime(timer.remaining);
}

function saveTimerState(state) {
  if (!state) {
    localStorage.removeItem(STORAGE.timerState);
  } else {
    localStorage.setItem(STORAGE.timerState, JSON.stringify(state));
  }
}

// 내부 함수 — 실제 인터벌 시작 (endTime 기반)
function startTimerInternal() {
  if (timer.intervalId) clearInterval(timer.intervalId);

  timer.isRunning = true;
  $timerDisplay.classList.add('running');
  $timerDisplay.classList.remove('finished');
  $startBtn.disabled = true;
  $pauseBtn.disabled = false;
  $resetBtn.disabled = false;

  // 250ms마다 endTime 기반 계산 (백그라운드에서도 정확)
  timer.intervalId = setInterval(() => {
    const now = Date.now();
    const remainingMs = timer.endTime - now;
    timer.remaining = Math.max(0, Math.ceil(remainingMs / 1000));
    updateTimerDisplay();
    if (remainingMs <= 0) {
      finishTimer();
    }
  }, 250);
}

function startTimer() {
  if (timer.isRunning) return;
  if (!currentTask) {
    alert('먼저 가챠를 돌려서 작업을 정해주세요.');
    return;
  }
  if (timer.remaining <= 0) {
    timer.remaining = timer.duration;
  }

  // 알림 권한 요청
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // endTime 계산 + 저장
  timer.endTime = Date.now() + timer.remaining * 1000;
  saveTimerState({
    status: 'running',
    endTime: timer.endTime,
    duration: timer.duration,
    task: currentTask,
  });

  $timerStatus.textContent = `"${currentTask}" 작업 중...`;
  $timerStatus.classList.remove('success', 'resumed');

  startTimerInternal();
}

function pauseTimer() {
  if (!timer.isRunning) return;
  clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.isRunning = false;
  timer.endTime = null;
  $timerDisplay.classList.remove('running');
  $startBtn.disabled = false;
  $pauseBtn.disabled = true;
  $timerStatus.textContent = '⏸ 일시정지됨 — 시작 누르면 이어서';
  $timerStatus.classList.remove('success', 'resumed');

  saveTimerState({
    status: 'paused',
    remaining: timer.remaining,
    duration: timer.duration,
    task: currentTask,
  });
}

function resetTimer() {
  if (timer.intervalId) clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.isRunning = false;
  timer.endTime = null;
  timer.duration = getCurrentDurationSeconds();
  timer.remaining = timer.duration;
  updateTimerDisplay();
  $timerDisplay.classList.remove('running', 'finished');
  $startBtn.disabled = !currentTask;
  $pauseBtn.disabled = true;
  $resetBtn.disabled = true;
  $timerStatus.textContent = '';
  $timerStatus.classList.remove('success', 'resumed');

  // v0.1.8 — 인증샷 첨부 버튼 숨기기 (완료 후에만 보임)
  $captureRow.hidden = true;

  saveTimerState(null);
}

// v0.1.9 — select·custom input(시·분) 종합해서 현재 적용 시간(초) 반환
function getCurrentDurationSeconds() {
  if ($durationSelect.value === 'custom') {
    const h = parseInt($customHours.value, 10);
    const m = parseInt($customMinutes.value, 10);
    const hours = Number.isFinite(h) && h >= 0 ? h : 0;
    const mins = Number.isFinite(m) && m >= 0 ? m : 0;
    const totalSec = (hours * 60 + mins) * 60;
    return totalSec > 0 ? totalSec : 1500;  // 최소 25분 fallback
  }
  const sec = parseInt($durationSelect.value, 10);
  return Number.isFinite(sec) && sec > 0 ? sec : 1500;
}

function finishTimer() {
  if (timer.intervalId) clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.isRunning = false;
  timer.remaining = 0;
  timer.endTime = null;
  updateTimerDisplay();
  $timerDisplay.classList.remove('running');
  $timerDisplay.classList.add('finished');
  $startBtn.disabled = true;
  $pauseBtn.disabled = true;
  $resetBtn.disabled = false;
  $timerStatus.textContent = `✓ "${currentTask}" 완료! 수고하셨어요`;
  $timerStatus.classList.add('success');
  $timerStatus.classList.remove('resumed');

  // v0.1.8 — 누적 완료 카운트 증가 + 인증샷 첨부 버튼 표시
  completedCount++;
  localStorage.setItem(STORAGE.completedCount, String(completedCount));
  updateCompletedDisplay();
  $captureRow.hidden = false;

  saveTimerState({
    status: 'finished',
    duration: timer.duration,
    task: currentTask,
    finishedAt: Date.now(),
  });

  // 브라우저 알림
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('Tomotto 타이머 완료!', {
        body: `"${currentTask}" 작업 시간 끝!`,
      });
    } catch {}
  }

  // 사운드 (간단한 beep)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.value = 0.1;
    o.start();
    setTimeout(() => { o.frequency.value = 1100; }, 150);
    setTimeout(() => o.stop(), 350);
  } catch {}
}

// 탭이 다시 보일 때 즉시 업데이트 (백그라운드 throttle 보정)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && timer.isRunning && timer.endTime) {
    const now = Date.now();
    const remainingMs = timer.endTime - now;
    timer.remaining = Math.max(0, Math.ceil(remainingMs / 1000));
    updateTimerDisplay();
    if (remainingMs <= 0) {
      finishTimer();
    }
  }
});

$startBtn.addEventListener('click', startTimer);
$pauseBtn.addEventListener('click', pauseTimer);
$resetBtn.addEventListener('click', resetTimer);

$durationSelect.addEventListener('change', () => {
  localStorage.setItem(STORAGE.duration, $durationSelect.value);
  // v0.1.9 — 직접 입력 모드 토글 (시:분 분리)
  if ($durationSelect.value === 'custom') {
    $customDurationWrap.hidden = false;
    if (!$customHours.value && !$customMinutes.value) {
      $customHours.value = '0';
      $customMinutes.value = '25';  // 기본 25분
    }
    setTimeout(() => $customHours.focus(), 50);
  } else {
    $customDurationWrap.hidden = true;
  }
  if (!timer.isRunning) {
    timer.duration = getCurrentDurationSeconds();
    timer.remaining = timer.duration;
    updateTimerDisplay();
  }
});

// v0.1.9 — 커스텀 시간 input(시·분) 변경
function onCustomDurationChange() {
  // 시간 0~23, 분 0~59 클램프
  let h = parseInt($customHours.value, 10);
  let m = parseInt($customMinutes.value, 10);
  if (Number.isFinite(h)) {
    if (h < 0) { h = 0; $customHours.value = '0'; }
    if (h > 23) { h = 23; $customHours.value = '23'; }
  }
  if (Number.isFinite(m)) {
    if (m < 0) { m = 0; $customMinutes.value = '0'; }
    if (m > 59) { m = 59; $customMinutes.value = '59'; }
  }
  const sec = getCurrentDurationSeconds();
  localStorage.setItem(STORAGE.customDuration, String(sec));
  if (!timer.isRunning) {
    timer.duration = sec;
    timer.remaining = sec;
    updateTimerDisplay();
  }
}
$customHours.addEventListener('input', onCustomDurationChange);
$customMinutes.addEventListener('input', onCustomDurationChange);

// ====== v0.1.8 — 완료 카운트 ======
function updateCompletedDisplay() {
  $completedCount.textContent = String(completedCount);
}

// ====== v0.1.8 — 인증샷 ======
// v0.1.10: 인증샷 첨부 → 인앱 카메라 모달 우선. 모달 안에 갤러리 옵션도 있음.
$captureBtn.addEventListener('click', () => {
  openCameraModal();
});

// ====== v0.1.10 — 인앱 카메라 (셔터 소리 X, getUserMedia 기반) ======
async function openCameraModal() {
  lastCapturedDataUrl = null;
  // 초기 UI 상태 (촬영 모드)
  $cameraVideo.hidden = false;
  $cameraPreview.hidden = true;
  $cameraShootBtn.hidden = false;
  $cameraRetryBtn.hidden = true;
  $cameraSaveBtn.hidden = true;
  $cameraHint.textContent = '카메라 준비 중...';
  $cameraHint.classList.remove('error');

  if (typeof $cameraModal.showModal === 'function') {
    $cameraModal.showModal();
  } else {
    $cameraModal.setAttribute('open', '');
  }

  // 카메라 stream 시작
  await startCameraStream();
}

async function startCameraStream() {
  // getUserMedia 지원 확인
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    $cameraHint.textContent = '이 브라우저는 인앱 카메라를 지원하지 않아요. 갤러리에서 선택해주세요.';
    $cameraHint.classList.add('error');
    $cameraShootBtn.hidden = true;
    return;
  }
  try {
    stopCameraStream();
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },  // 후면 우선
      audio: false,  // 오디오 0 → 셔터 소리 원천 X
    });
    $cameraVideo.srcObject = cameraStream;
    // video 메타데이터 로드 후 hint
    await $cameraVideo.play().catch(() => {});
    $cameraHint.textContent = '준비 완료. 촬영 버튼을 눌러주세요.';
    $cameraHint.classList.remove('error');
  } catch (err) {
    let msg = '카메라를 열 수 없어요.';
    if (err && err.name === 'NotAllowedError') {
      msg = '카메라 권한이 거부됐어요. 브라우저 설정에서 허용 후 다시 시도하거나 갤러리를 사용해주세요.';
    } else if (err && err.name === 'NotFoundError') {
      msg = '카메라를 찾지 못했어요. 갤러리에서 사진을 선택해주세요.';
    } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      msg = '카메라는 HTTPS에서만 동작해요. 갤러리 옵션을 이용해주세요.';
    }
    $cameraHint.textContent = msg;
    $cameraHint.classList.add('error');
    $cameraShootBtn.hidden = true;
  }
}

function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((t) => {
      try { t.stop(); } catch {}
    });
    cameraStream = null;
  }
  $cameraVideo.srcObject = null;
}

function captureFromVideo() {
  const video = $cameraVideo;
  const canvas = $cameraCanvas;
  const w = video.videoWidth || 720;
  const h = video.videoHeight || 720;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  lastCapturedDataUrl = dataUrl;

  // 미리보기 모드로 전환
  $cameraPreview.src = dataUrl;
  $cameraPreview.hidden = false;
  $cameraVideo.hidden = true;
  $cameraShootBtn.hidden = true;
  $cameraRetryBtn.hidden = false;
  $cameraSaveBtn.hidden = false;
  $cameraHint.textContent = '괜찮으면 저장, 마음에 안 들면 다시 찍기';
}

function retryCamera() {
  lastCapturedDataUrl = null;
  $cameraPreview.hidden = true;
  $cameraVideo.hidden = false;
  $cameraShootBtn.hidden = false;
  $cameraRetryBtn.hidden = true;
  $cameraSaveBtn.hidden = true;
  $cameraHint.textContent = '준비 완료. 촬영 버튼을 눌러주세요.';
}

function saveCameraCapture() {
  if (!lastCapturedDataUrl) return;
  saveCaptureToStorage(lastCapturedDataUrl);
  closeCameraModal();
}

function closeCameraModal() {
  stopCameraStream();
  if (typeof $cameraModal.close === 'function') {
    $cameraModal.close();
  } else {
    $cameraModal.removeAttribute('open');
  }
}

// 압축 + localStorage 저장 (기존 인증샷 저장 로직 분리)
function saveCaptureToStorage(dataUrl) {
  compressImage(dataUrl, 800, 0.7).then((compressedUrl) => {
    $lastCaptureImg.src = compressedUrl;
    $lastCapture.hidden = false;
    try {
      localStorage.setItem(STORAGE.lastCapture, compressedUrl);
    } catch (err) {
      compressImage(dataUrl, 480, 0.5).then((smaller) => {
        $lastCaptureImg.src = smaller;
        try { localStorage.setItem(STORAGE.lastCapture, smaller); } catch {}
      });
    }
  });
}

// 카메라 모달 핸들러
$cameraShootBtn.addEventListener('click', captureFromVideo);
$cameraRetryBtn.addEventListener('click', retryCamera);
$cameraSaveBtn.addEventListener('click', saveCameraCapture);
$cameraCancelBtn.addEventListener('click', closeCameraModal);
$cameraGalleryBtn.addEventListener('click', () => {
  closeCameraModal();
  $captureInput.click();
});
// backdrop 클릭 시 닫기 + stream 정리
$cameraModal.addEventListener('click', (e) => {
  if (e.target === $cameraModal) closeCameraModal();
});
$cameraModal.addEventListener('close', () => {
  stopCameraStream();
});

$captureInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // 파일을 Data URL로 읽고 → 압축 후 저장 (v0.1.10: 카메라/갤러리 공통 함수 사용)
  const reader = new FileReader();
  reader.onload = (ev) => {
    saveCaptureToStorage(ev.target.result);
  };
  reader.readAsDataURL(file);

  // 같은 파일 다시 선택 가능하게 input value 초기화
  $captureInput.value = '';
});

$removeCaptureBtn.addEventListener('click', () => {
  if (!confirm('마지막 인증샷을 지울까요?')) return;
  $lastCaptureImg.src = '';
  $lastCapture.hidden = true;
  localStorage.removeItem(STORAGE.lastCapture);
});

// v0.1.8 — 이미지 압축 (canvas 사용)
// maxDim: 가로/세로 중 긴 변 기준 최대 px / quality: 0~1 JPEG 품질
function compressImage(dataUrl, maxDim, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round(height * maxDim / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round(width * maxDim / height);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);  // 실패 시 원본
    img.src = dataUrl;
  });
}
