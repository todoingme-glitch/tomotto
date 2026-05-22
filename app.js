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
  } else {
    // 디폴트 25분 (1500초) — select.value도 명시
    $durationSelect.value = '1500';
    timer.duration = 1500;
    if (savedDuration) localStorage.setItem(STORAGE.duration, '1500');
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
$captureBtn.addEventListener('click', () => {
  $captureInput.click();
});

$captureInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  // 파일을 Data URL로 읽고 → 작게 압축해서 localStorage 저장
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    compressImage(dataUrl, 800, 0.7).then((compressedUrl) => {
      $lastCaptureImg.src = compressedUrl;
      $lastCapture.hidden = false;
      try {
        localStorage.setItem(STORAGE.lastCapture, compressedUrl);
      } catch (err) {
        // QuotaExceeded — 더 작게 재시도
        compressImage(dataUrl, 480, 0.5).then((smaller) => {
          $lastCaptureImg.src = smaller;
          try { localStorage.setItem(STORAGE.lastCapture, smaller); } catch {}
        });
      }
    });
  };
  reader.readAsDataURL(file);

  // 같은 파일 다시 선택할 수 있게 input value 초기화
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
