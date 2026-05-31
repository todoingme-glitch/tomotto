// ============================================================
// Tomotto v0.1.180 — 가챠 뽀모도로
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
const $completionNote = document.getElementById('completionNote'); // v0.1.20 — 소감
const $noteUploadBtn  = document.getElementById('noteUploadBtn');  // v0.1.22 — 소감 저장
// v0.1.22 — 라이트박스 dialog
const $imgLightboxDialog = document.getElementById('imgLightboxDialog');
const $imgLightboxWrap   = document.getElementById('imgLightboxWrap');
const $imgLightboxImg    = document.getElementById('imgLightboxImg');
const $imgLightboxNote   = document.getElementById('imgLightboxNote');
const $imgLightboxClose  = document.getElementById('imgLightboxClose');
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
// ====== Kakao SDK 초기화 ======
if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init('0ff430907d39f38f5c4957efca92293b');
}

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
// v0.1.15 — 공통 작업 text input 제거, 가챠 결과 미리보기로 대체
const $battleTaskPreviewField = document.getElementById('battleTaskPreviewField');
const $battleTaskText = document.getElementById('battleTaskText');
const $battleTaskLabel = document.getElementById('battleTaskLabel');
const $battleTaskHint = document.getElementById('battleTaskHint');
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
  completionNote: 'tomotto_completion_note', // v0.1.20 — 완료 소감
  order: 'tomotto_battle_order',           // v0.1.26 — 사용자 정의 드래그 순서 (ID 배열)
  knownPartners: 'tomotto_battle_knownPartners', // v0.1.64 — 배틀카드 삭제 후에도 리더보드 유지
  completedIds: 'tomotto_battle_completedIds',   // v0.1.65 — 완료된 배틀 ID (새로고침 후에도 필터링)
};

// 파트너 닉네임을 로컬에 누적 저장 (배틀 삭제 후에도 리더보드에서 조회 가능하도록)
function saveKnownPartner(nick) {
  if (!nick || nick === myNickname) return;
  let known = [];
  try { known = JSON.parse(localStorage.getItem(BATTLE_STORAGE.knownPartners) || '[]'); } catch {}
  if (!known.includes(nick)) {
    known.push(nick);
    localStorage.setItem(BATTLE_STORAGE.knownPartners, JSON.stringify(known));
  }
}
function getKnownPartners() {
  try { return JSON.parse(localStorage.getItem(BATTLE_STORAGE.knownPartners) || '[]'); } catch { return []; }
}

let myNickname = '';

// v0.1.26 — 배틀카드 편집 모드 (Pointer Events 드래그 + Touch Events 드래그 + 다중선택 삭제)
let battleEditMode = false;
const selectedBattleIds = new Set();
let cdDragging = null;   // 현재 드래그 중인 카드 element (Pointer Events용)
let cdHandle  = null;    // 드래그 핸들 element (pointer capture용)
let touchDragging = null; // 현재 드래그 중인 카드 element (Touch Events용)

// v0.1.17 — 배틀 결과 모달
const $battleResultModal = document.getElementById('battleResultModal');
const $battleResultSummary = document.getElementById('battleResultSummary');
const $battleResultPlayers = document.getElementById('battleResultPlayers');
const $battleResultCloseBtn = document.getElementById('battleResultCloseBtn');
const $battleResultBtn = document.getElementById('battleResultBtn');

// v0.1.11 — SVG 로고 + 하이파이브 애니메이션
const $logoSvg = document.getElementById('tomottoLogo');
const $logoWrap = document.getElementById('logoWrap');

// v0.1.17 — 단일 얼굴 미니 SVG 생성 헬퍼
function makeFaceSvg(faceEl, viewBox, size = '80px') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.style.cssText = `width:${size};height:auto;flex-shrink:0;filter:drop-shadow(0 2px 8px rgba(217,78,58,0.35))`;
  const defsEl = $logoSvg ? $logoSvg.querySelector('defs') : null;
  if (defsEl) svg.appendChild(defsEl.cloneNode(true));
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'tomotto-svg');
  g.appendChild(faceEl.cloneNode(true));
  svg.appendChild(g);
  // CSS 클래스 미적용 fallback — stroke path(입 등) 인라인 스타일 강제 적용
  svg.querySelectorAll('.cls-2').forEach(el => {
    el.style.fill = 'none';
    el.style.stroke = '#5a1010';
    el.style.strokeWidth = '2.5px';
    el.style.strokeLinecap = 'round';
    el.style.strokeLinejoin = 'round';
  });
  svg.querySelectorAll('.cls-1').forEach(el => {
    el.style.fill = 'none';
    el.style.stroke = '#5a1010';
    el.style.strokeWidth = '2px';
    el.style.strokeLinecap = 'round';
    el.style.strokeLinejoin = 'round';
  });
  return svg;
}

// v0.1.34 — 탭 아이콘에 실제 로고 얼굴 주입
function initTabIcons() {
  const tomFaceEl = document.getElementById('tom-face');
  const mottoFaceEl = document.getElementById('motto-face');
  if (!tomFaceEl || !mottoFaceEl) return;

  function makeTabFace(faceEl, viewBox, size) {
    const svg = makeFaceSvg(faceEl, viewBox, size);
    svg.style.filter = 'none';
    svg.style.display = 'block';
    svg.style.width = size;
    svg.style.height = size;
    return svg;
  }

  // 로고 기준: motto-face=왼쪽(톰/안경), tom-face=오른쪽(모토)
  const $tabPersonal = document.getElementById('tabIconPersonal');
  if ($tabPersonal) {
    $tabPersonal.innerHTML = '';
    $tabPersonal.appendChild(makeTabFace(mottoFaceEl, '237 45 98 95', '26px'));
  }

  const $tabMotto = document.getElementById('tabIconMotto');
  if ($tabMotto) {
    $tabMotto.innerHTML = '';
    $tabMotto.appendChild(makeTabFace(mottoFaceEl, '237 45 98 95', '24px'));
  }

  const $tabTom = document.getElementById('tabIconTom');
  if ($tabTom) {
    $tabTom.innerHTML = '';
    $tabTom.appendChild(makeTabFace(tomFaceEl, '405 45 98 95', '24px'));
  }
}

// =====================================================
// v0.1.34 — Shepherd.js 온보딩 투어
// =====================================================
const STORAGE_ONBOARDED = 'tomotto_onboarded';

// 얼굴 SVG HTML 문자열 (투어 팝오버용)
let _onbTomHtml = '';
let _onbMotoHtml = '';

function _buildOnbFaceHtml(faceEl, viewBox, size) {
  const svg = makeFaceSvg(faceEl, viewBox, size);
  svg.style.filter = 'none';
  svg.style.display = 'block';
  svg.style.width = size;
  svg.style.height = size;
  return svg.outerHTML;
}

function _onbStep(faceName, msg) {
  const face = faceName === 'tom' ? _onbTomHtml : _onbMotoHtml;
  const name = faceName === 'tom' ? '🍅 톰' : '🍅 모토';
  return `
    <div class="onb-body">
      <div class="onb-face">${face}</div>
      <div class="onb-speech">
        <p class="onb-name">${name}</p>
        <p class="onb-msg">${msg}</p>
      </div>
    </div>`;
}

function initOnboarding() {
  if (!window.Shepherd) return;
  if (localStorage.getItem(STORAGE_ONBOARDED)) return;

  // 얼굴 HTML 생성 (initTabIcons 이후에 호출되므로 요소 존재 확인)
  const tomFaceEl  = document.getElementById('tom-face');    // 오른쪽/모토 SVG
  const mottoFaceEl = document.getElementById('motto-face'); // 왼쪽/톰(안경) SVG
  if (tomFaceEl && mottoFaceEl) {
    _onbTomHtml  = _buildOnbFaceHtml(mottoFaceEl, '237 45 98 95', '54px'); // 톰 = motto-face
    _onbMotoHtml = _buildOnbFaceHtml(tomFaceEl,   '405 45 98 95', '54px'); // 모토 = tom-face
  }

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: 'shepherd-theme-tomotto',
      cancelIcon: { enabled: true },
      scrollTo: { behavior: 'smooth', block: 'center' },
      buttons: [
        {
          text: '건너뛰기',
          classes: 'onb-btn-skip',
          action() { tour.cancel(); }
        },
        {
          text: '다음 →',
          action() { tour.next(); }
        }
      ]
    }
  });

  // Step 1 — 웰컴 (no attach)
  tour.addStep({
    id: 'welcome',
    text: `
      <div class="onb-welcome">
        <div class="onb-welcome-faces">
          ${_onbTomHtml}
          ${_onbMotoHtml}
        </div>
        <p class="onb-welcome-title">토마또에 온 걸 환영해! 🍅</p>
        <p class="onb-welcome-sub">우리는 <strong>톰</strong>이랑 <strong>모토</strong>야.<br>같이 집중해보자, 잠깐만 설명할게!</p>
      </div>`,
    buttons: [
      { text: '건너뛰기', classes: 'onb-btn-skip', action() { tour.cancel(); } },
      { text: '시작! →', action() { tour.next(); } }
    ]
  });

  // Step 2 — 카테고리
  tour.addStep({
    id: 'category',
    text: _onbStep('tom', '먼저 <strong>오늘 할 일의 카테고리</strong>를 추가해봐.<br>예: \'공부\', \'운동\', \'디자인\' 같은 것들!'),
    attachTo: { element: '.category-section', on: 'bottom' }
  });

  // Step 3 — 가챠
  tour.addStep({
    id: 'gacha',
    text: _onbStep('moto', '카테고리를 만들었으면 <strong>가챠</strong>를 돌려봐!<br>오늘 뭐 할지 랜덤으로 뽑아줄게 🎰'),
    attachTo: { element: '#gachaBtn', on: 'top' }
  });

  // Step 4 — 타이머
  tour.addStep({
    id: 'timer',
    text: _onbStep('tom', '뽑힌 할 일, 이제 집중 시작!<br><strong>뽀모도로 타이머</strong>로 25분 달려봐 ⏱'),
    attachTo: { element: '.timer-section', on: 'top' }
  });

  // Step 5 — 탭 소개
  tour.addStep({
    id: 'tabs',
    text: _onbStep('moto', '<strong>소셜 탭</strong>에서 친구랑 배틀,<br><strong>기록 탭</strong>에서 인증샷 & 로그 확인!<br>다 여기서 할 수 있어 👊📸'),
    attachTo: { element: '#bottomTab', on: 'top' },
    buttons: [
      { text: '건너뛰기', classes: 'onb-btn-skip', action() { tour.cancel(); } },
      { text: '완료!', action() { tour.complete(); } }
    ]
  });

  tour.on('complete', () => localStorage.setItem(STORAGE_ONBOARDED, '1'));
  tour.on('cancel',   () => localStorage.setItem(STORAGE_ONBOARDED, '1'));

  // 살짝 딜레이 후 시작 (페이지 렌더 완료 대기)
  setTimeout(() => tour.start(), 600);
}

// =====================================================
// v0.1.34 — 툴팁 온보딩 (커스텀, 라이브러리 없음)
// =====================================================
const STORAGE_ONBOARDED_TT  = 'tomotto_onboarded_tt';
const STORAGE_DATA_BACKUP   = 'tomotto_data_backup';
const STORAGE_HIDE_DATA     = 'tomotto_hide_data';

// onComplete: 온보딩 완료(또는 건너뛰기) 후 호출할 콜백. 이미 온보딩된 유저면 즉시 호출.
function initOnboardingTooltip(onComplete) {
  const tomFaceEl   = document.getElementById('tom-face');
  const mottoFaceEl = document.getElementById('motto-face');
  if (!tomFaceEl || !mottoFaceEl) { onComplete?.(); return; }
  if (localStorage.getItem(STORAGE_ONBOARDED_TT)) { onComplete?.(); return; }

  // 개인 탭 요소들을 정확히 잡기 위해 개인 탭으로 전환
  switchTab('personal');

  // 온보딩 중 스크롤 잠금
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
  const _preventTouch = (e) => e.preventDefault();
  document.addEventListener('touchmove', _preventTouch, { passive: false });

  // 톰 = motto-face(왼쪽/안경), 모토 = tom-face(오른쪽)
  const tomHtml  = _buildOnbFaceHtml(mottoFaceEl, '237 45 98 95', '48px');
  const motoHtml = _buildOnbFaceHtml(tomFaceEl,   '405 45 98 95', '48px');

  const STEPS = [
    {
      target: null,
      speaker: 'both',
      msg: '안녕! 우리는 <strong>톰</strong>이랑 <strong>모토</strong>야.<br>토모토에 온 걸 환영해!<br>잠깐 같이 둘러볼까?'
    },
    {
      target: '.category-section',
      speaker: 'tom', name: '톰',
      msg: '먼저 <strong>카테고리</strong>를 추가해봐.<br>오늘 할 일의 종류를 여기서 설정해!',
      pos: 'bottom'
    },
    {
      target: '#gachaBtn',
      speaker: 'moto', name: '모토',
      msg: '할 일을 정했다면 <strong>가챠</strong>를 돌려봐!<br>지금 할 작업을 랜덤으로 뽑아줄게',
      pos: 'top'
    },
    {
      target: '#pauseBtn',
      highlightTarget: '.timer-section',
      speaker: 'tom', name: '톰',
      msg: '뽑힌 할 일로 <strong>뽀모도로 집중!</strong><br>기본 25분, 원하는 시간으로<br>조절할 수 있어!',
      pos: 'bottom'
    },
    {
      target: '#bottomTab',
      speaker: 'moto', name: '모토',
      msg: '<strong>소셜</strong>에서 배틀, <strong>기록</strong>에서 로그!<br>자, 이제 시작해봐 🍅',
      pos: 'top'
    }
  ];

  // DOM 생성
  const overlay   = document.createElement('div');
  const highlight = document.createElement('div');
  const ttEl      = document.createElement('div');
  overlay.className   = 'onb-tt-overlay';
  highlight.className = 'onb-tt-highlight';
  highlight.style.display = 'none';
  ttEl.className  = 'onb-tt';
  document.body.append(overlay, highlight, ttEl);

  function faceHtml(speaker) {
    return speaker === 'tom' ? tomHtml : motoHtml;
  }

  function buildContent(step) {
    if (step.speaker === 'both') {
      return `<div class="onb-tt-welcome">
        <div class="onb-tt-faces">
          <div class="onb-tt-face-wrap">${tomHtml}</div>
          <div class="onb-tt-face-wrap">${motoHtml}</div>
        </div>
        <p class="onb-tt-msg">${step.msg}</p>
      </div>`;
    }
    return `<div class="onb-tt-body">
      <div class="onb-tt-face">${faceHtml(step.speaker)}</div>
      <div class="onb-tt-content">
        <p class="onb-tt-name">${step.name}</p>
        <p class="onb-tt-msg">${step.msg}</p>
      </div>
    </div>`;
  }

  // v0.1.40 — rAF 기반 하이라이트 실시간 추적 (스크롤 길이와 무관하게 항상 정확)
  let _trackRafId = null;
  function stopTracking() {
    if (_trackRafId !== null) { cancelAnimationFrame(_trackRafId); _trackRafId = null; }
  }

  function position(step) {
    stopTracking();

    if (!step.target) {
      highlight.style.display = 'none';
      ttEl.style.transform = 'none';
      const TT_W = 272;
      const ttH  = ttEl.offsetHeight || 180;
      ttEl.style.left = Math.round((window.innerWidth  - TT_W) / 2) + 'px';
      ttEl.style.top  = Math.round((window.innerHeight - ttH)  / 2) + 'px';
      ttEl.removeAttribute('data-pos');
      requestAnimationFrame(() => { ttEl.style.opacity = '1'; });
      return;
    }

    const el = document.querySelector(step.target);
    if (!el) return;

    highlight.style.display = 'none';
    ttEl.style.transform = 'none';

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const PAD = 4;
    const GAP = 22;
    const TT_W = 272;

    // 하이라이트 + 말풍선 — rAF로 매 프레임 실시간 추적 (스크롤 중에도 항상 따라감)
    const hlEl = step.highlightTarget ? document.querySelector(step.highlightTarget) : el;
    highlight.style.display = 'block';
    ttEl.setAttribute('data-pos', step.pos || 'bottom');

    // 말풍선은 스크롤이 완전히 멈춘 후 페이드인 (스크롤 중간에 튀는 것 방지)
    let _opacityDone  = false;
    let _prevHlTop    = null;
    let _stableFrames = 0;

    const trackAll = () => {
      // 하이라이트 위치
      const r = (hlEl || el).getBoundingClientRect();
      highlight.style.top    = (r.top    - PAD) + 'px';
      highlight.style.left   = (r.left   - PAD) + 'px';
      highlight.style.width  = (r.width  + PAD * 2) + 'px';
      highlight.style.height = (r.height + PAD * 2) + 'px';

      // 말풍선 위치 — hlEl이 있으면 전체 하이라이트 박스 기준으로 위치 결정
      const rect   = el.getBoundingClientRect();
      const hlRect = hlEl ? hlEl.getBoundingClientRect() : rect;
      const ttH    = ttEl.offsetHeight || 150;
      let top, posAttr;

      if (step.pos === 'top') {
        // 기본: 하이라이트 박스 위쪽
        top = hlRect.top - ttH - GAP;
        posAttr = 'top';
        if (top < 8) { top = hlRect.bottom + GAP; posAttr = 'bottom'; }
      } else {
        // 기본: el 아래쪽 (pos: 'bottom')
        top = rect.bottom + GAP;
        posAttr = 'bottom';
        // 화면 아래로 넘치면 → 하이라이트 박스 위쪽으로 완전히 올림 (테두리 바깥)
        if (top + ttH > window.innerHeight - 8) {
          top = hlRect.top - ttH - GAP;
          posAttr = 'top';
        }
      }

      if (top < 8) top = 8;
      ttEl.setAttribute('data-pos', posAttr);

      // 가로 위치: 하이라이트 박스 중앙 기준
      let left = hlRect.left + hlRect.width / 2 - TT_W / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - TT_W - 8));
      ttEl.style.top  = top  + 'px';
      ttEl.style.left = left + 'px';

      // 말풍선 opacity: 하이라이트 위치가 연속 6프레임 안정되면 페이드인
      if (!_opacityDone) {
        if (_prevHlTop !== null && Math.abs(r.top - _prevHlTop) < 0.5) {
          _stableFrames++;
          if (_stableFrames >= 6) { ttEl.style.opacity = '1'; _opacityDone = true; }
        } else {
          _stableFrames = 0;
        }
        _prevHlTop = r.top;
      }

      _trackRafId = requestAnimationFrame(trackAll);
    };
    _trackRafId = requestAnimationFrame(trackAll);
  }

  function render(idx) {
    const step   = STEPS[idx];
    const isLast = idx === STEPS.length - 1;

    // 1) 현재 말풍선 페이드아웃
    ttEl.style.opacity = '0';

    // 2) 페이드아웃 완료 후 내용 교체 + 위치 계산
    setTimeout(() => {
      const dots = STEPS.map((_, i) =>
        `<span class="onb-tt-dot${i === idx ? ' active' : ''}"></span>`
      ).join('');

      ttEl.innerHTML = `
        ${buildContent(step)}
        <div class="onb-tt-footer">
          <button class="onb-tt-btn onb-tt-skip">건너뛰기</button>
          <span class="onb-tt-dots">${dots}</span>
          <button class="onb-tt-btn onb-tt-next">${isLast ? '완료!' : '다음 →'}</button>
        </div>`;

      ttEl.querySelector('.onb-tt-skip').onclick = finish;
      ttEl.querySelector('.onb-tt-next').onclick = isLast ? finish : () => render(idx + 1);

      position(step);
    }, 200); // opacity 0.2s transition 완료 후
  }

  function finish() {
    stopTracking();
    // 스크롤 잠금 해제
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.removeEventListener('touchmove', _preventTouch);

    overlay.remove();
    highlight.remove();
    ttEl.remove();
    localStorage.setItem(STORAGE_ONBOARDED_TT, '1');

    // 맨 위로 스크롤 (배틀링크 진입이면 onComplete에서 소셜탭 전환)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onComplete?.();
  }

  setTimeout(() => render(0), 600);
}

function playHifive() {
  if (!$logoSvg) return;

  // SVG 자체에 will-change → 브라우저가 SVG 전체를 올바른 devicePixelRatio로 래스터화.
  // 자식(팔·이펙트)은 SVG 레이어 안에서 컴포지팅 → 선명도 유지.
  // 자식에 개별 will-change를 걸면 부모 SVG도 낮은 해상도로 재래스터화되어 전체가 뿌옇게 됨.
  $logoSvg.style.willChange = 'transform';

  // SVG는 offsetWidth reflow가 안 먹힘 → 더블 rAF로 클래스 재트리거
  $logoSvg.classList.remove('play');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      $logoSvg.classList.add('play');
      setTimeout(() => {
        $logoSvg.style.willChange = 'auto';
        $logoSvg.classList.remove('play');
        // .play 제거 후 #hifive는 CSS 기본값(opacity:1)으로 복귀 → 이펙트 유지
      }, 1400);
    });
  });
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
  // 설정 모달 닉네임도 같이 갱신
  const $settingsNick = document.getElementById('settingsNickDisplay');
  if ($settingsNick) $settingsNick.textContent = myNickname || '(미설정)';

  // 설정 모달 칭호 갱신
  const $settingsTitle = document.getElementById('settingsTitleDisplay');
  if ($settingsTitle) {
    const title = getCurrentTitle();
    $settingsTitle.textContent = title ? `${title.emoji} ${title.name}` : '—'; // 설정 모달은 textContent 그대로
  }

  const $battleMeEl = $battleNick.closest('.battle-me');
  if (myNickname) {
    $battleNick.textContent = myNickname;
    $battleNick.style.color = '';
    const isMobileNow = window.matchMedia('(max-width: 480px)').matches;
    const isLong = myNickname.length > 10;
    $battleMeEl?.classList.toggle('battle-me--long', isMobileNow && isLong);
    if (isMobileNow && isLong) {
      $battleNick.style.fontSize = '12px';
    } else {
      $battleNick.style.fontSize = '';
    }
  } else {
    $battleNick.textContent = '(미설정)';
    $battleNick.style.color = 'var(--text-muted)';
    $battleNick.style.fontSize = '';
    $battleMeEl?.classList.remove('battle-me--long');
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

async function saveNickname() {
  const v = $nickInput.value.trim();
  if (!v) { alert('닉네임을 입력해주세요.'); return; }
  if (v.length > 20) { alert('20자 이내로 적어주세요.'); return; }
  const oldNickname = myNickname;
  myNickname = v;
  localStorage.setItem(BATTLE_STORAGE.nickname, v);
  renderBattleNickname();
  closeNickModal();
  // v0.1.69 — 첫 닉네임 설정 업적
  if (!oldNickname) unlockAchievement('A-4');
  // v0.1.66 — 닉네임 변경 시 DB 기존 데이터 마이그레이션 (리더보드 횟수 유지)
  // v0.1.95 — partner_stats 자기 행 마이그레이션 + 닉네임 이력 기록
  if (sb && oldNickname && oldNickname !== v) {
    try {
      await sb.from('user_stats').update({ nickname: v }).eq('nickname', oldNickname);
      await sb.from('battle_players').update({ nickname: v }).eq('nickname', oldNickname);
      await sb.from('user_partner_stats').update({ nickname: v }).eq('nickname', oldNickname);
      const { error: histErr } = await sb.from('nickname_history')
        .insert({ old_nickname: oldNickname, new_nickname: v });
      if (histErr) console.warn('[닉네임 변경] nickname_history 기록 실패:', histErr.message);
      console.log('[닉네임 변경] DB 마이그레이션:', oldNickname, '→', v);
    } catch (err) {
      console.warn('[닉네임 변경] DB 마이그레이션 실패:', err);
    }
    renderLeaderboard();
  }
  // v0.1.14 — 닉네임 저장 후 대기 중인 곳(배틀 룸 등)에 알림
  document.dispatchEvent(new CustomEvent('nick-saved'));
}

$nickSaveBtn.addEventListener('click', saveNickname);
$nickCancelBtn.addEventListener('click', closeNickModal);
$nickInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); saveNickname(); }
});
// v0.1.66 — 카카오톡 인앱 브라우저 IME 조합 중 maxlength 무시 문제 대응
$nickInput.addEventListener('input', () => {
  if ($nickInput.value.length > 20) $nickInput.value = $nickInput.value.slice(0, 20);
});

$battleNickEditBtn.addEventListener('click', () => openNickModal('edit'));
// 닉네임 텍스트 직접 클릭/탭으로도 수정 모달 열기 (웹·모바일 공통)
$battleNick.addEventListener('click', () => openNickModal('edit'));

// =====================================================
// v0.1.35 — 설정 모달
// =====================================================
const STORAGE_STATUS_PUBLIC = 'tomotto_status_public';

const $settingsModal    = document.getElementById('settingsModal');
const $settingsBtn      = document.getElementById('settingsBtn');
const $settingsCloseBtn = document.getElementById('settingsCloseBtn');
const $settingsNickEditBtn = document.getElementById('settingsNickEditBtn');
const $settingsStatusToggle = document.getElementById('settingsStatusToggle');

// 활동 상태 공개 여부 (localStorage 복원)
let isStatusPublic = localStorage.getItem(STORAGE_STATUS_PUBLIC) !== 'false'; // 기본 true
if ($settingsStatusToggle) $settingsStatusToggle.checked = isStatusPublic;

$settingsBtn?.addEventListener('click', () => {
  if (typeof $settingsModal.showModal === 'function') $settingsModal.showModal();
  else $settingsModal.setAttribute('open', '');
  renderBattleNickname(); // 닉네임 최신값 반영
});

$settingsCloseBtn?.addEventListener('click', () => {
  if (typeof $settingsModal.close === 'function') $settingsModal.close();
  else $settingsModal.removeAttribute('open');
});

$settingsModal?.addEventListener('click', (e) => {
  if (e.target === $settingsModal) {
    if (typeof $settingsModal.close === 'function') $settingsModal.close();
    else $settingsModal.removeAttribute('open');
  }
});

$settingsNickEditBtn?.addEventListener('click', () => {
  if (typeof $settingsModal.close === 'function') $settingsModal.close();
  else $settingsModal.removeAttribute('open');
  openNickModal('edit');
});

$settingsStatusToggle?.addEventListener('change', () => {
  isStatusPublic = $settingsStatusToggle.checked;
  localStorage.setItem(STORAGE_STATUS_PUBLIC, String(isStatusPublic));
  // DB에도 즉시 반영
  if (sb && myNickname) {
    sb.from('user_presence')
      .upsert({ nickname: myNickname, status_public: isStatusPublic, updated_at: new Date().toISOString() },
               { onConflict: 'nickname' })
      .then(({ error }) => { if (error) console.warn('[presence] status_public 업데이트 실패:', error.message); });
  }
});

// 개발자 옵션 — 온보딩 초기화
document.getElementById('devResetOnboardingBtn')?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_ONBOARDED_TT);
  const btn = document.getElementById('devResetOnboardingBtn');
  btn.textContent = '✓ 초기화 완료! 새로고침하면 온보딩 시작';
  btn.disabled = true;
});

// 개발자 옵션 — 업적 토스트 미리보기 모드
let devAchPreview = false;
document.getElementById('devAchPreviewToggle')?.addEventListener('change', e => {
  devAchPreview = e.target.checked;
  if (!document.getElementById('tab-log')?.classList.contains('tab-panel-hidden')) {
    renderAchievementsTab();
  }
});

// 개발자 옵션 — 순위·라이벌 토스트 미리보기 버튼
document.getElementById('devRankToast1')?.addEventListener('click', () => _showRankMilestoneToast(1));
document.getElementById('devTop3Toast')?.addEventListener('click',  () => _showRankMilestoneToast(3));
document.getElementById('devRivalToast')?.addEventListener('click', () => _showRivalOvertakeToast('테스트닉'));

// v0.1.64 — 전체 초기화
document.getElementById('fullResetBtn')?.addEventListener('click', async () => {
  if (!confirm('정말 모든 데이터를 삭제할까요?\n\n카테고리, 기록, 완료 횟수, 배틀 목록, 닉네임이 모두 사라져요. 되돌릴 수 없어요.')) return;

  const btn = document.getElementById('fullResetBtn');
  btn.textContent = '초기화 중···';
  btn.disabled = true;

  // 1. Supabase — 내 닉네임 관련 데이터 삭제
  const nick = myNickname;
  if (sb && nick) {
    try {
      await sb.from('user_stats').delete().eq('nickname', nick);
      await sb.from('battle_players').delete().eq('nickname', nick);
      // 내가 만든 배틀 중 상대방 없는 것도 정리
      const { data: myBattles } = await sb.from('battle_players').select('battle_id').eq('nickname', nick);
      // 이미 위에서 삭제했으므로, 고아 battles 직접 조회해서 삭제
      const myBattleIds = JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]')
        .filter(b => b._isCreator)
        .map(b => b.id);
      if (myBattleIds.length) {
        await sb.from('battles').delete().in('id', myBattleIds);
      }
    } catch (e) {
      console.warn('[fullReset] Supabase 삭제 중 오류:', e);
    }
  }

  // 2. localStorage 전체 삭제 (tomotto_* 키)
  Object.keys(localStorage)
    .filter(k => k.startsWith('tomotto_') || k.startsWith('pomocha_'))
    .forEach(k => localStorage.removeItem(k));

  // 3. 페이지 새로고침
  location.reload();
});

// 배틀 생성 모달
$battleCreateBtn.addEventListener('click', () => {
  // 닉네임 없으면 먼저 입력받음
  if (!myNickname) {
    openNickModal('first');
    return;
  }
  openBattleCreateModal();
});

// v0.1.15 — 배틀 생성 모달: 모드에 따라 가챠 결과 미리보기 업데이트
function updateBattleTaskPreview(mode) {
  if (mode === 'common') {
    $battleTaskLabel.textContent = '🍅 TOM MODE — 공통 작업 (내 가챠 결과가 자동으로 사용돼요)';
  } else if (mode === 'shuffle') {
    $battleTaskLabel.textContent = '🔀 SHUFFLE MODE — 둘의 할일 합쳐서 가챠';
    // 셔플: 가챠 결과 불필요, 카테고리 유무만 체크
    if (categories.length > 0) {
      $battleTaskText.textContent = `내 할일 ${categories.length}개 풀에 제공`;
      $battleTaskText.className = 'has-task';
      $battleTaskHint.textContent = '수락한 친구의 할일도 합쳐져서 섞인 풀에서 랜덤 뽑기!';
      $battleTaskHint.style.color = '';
      $battleCreateConfirmBtn.disabled = false;
      $battleCreateConfirmBtn.textContent = '만들기';
      delete $battleCreateConfirmBtn.dataset.noGacha;
    } else {
      $battleTaskText.textContent = '할일 없음';
      $battleTaskText.className = 'no-task';
      $battleTaskHint.textContent = '⚠ 먼저 할일을 카테고리에 추가해주세요!';
      $battleTaskHint.style.color = 'var(--accent)';
      $battleCreateConfirmBtn.disabled = true;
      $battleCreateConfirmBtn.textContent = '만들기';
      delete $battleCreateConfirmBtn.dataset.noGacha;
    }
    return; // 셔플은 여기서 종료
  } else {
    $battleTaskLabel.textContent = '🎲 MOTO MODE — 내 가챠 결과 (친구는 각자 가챠를 돌려요)';
  }

  if (currentTask) {
    $battleTaskText.textContent = currentTask;
    $battleTaskText.className = 'has-task';
    $battleTaskHint.textContent = mode === 'common'
      ? `"${currentTask}"이 친구에게 공통 미션으로 공유돼요.`
      : `내 미션: "${currentTask}". 친구는 본인 가챠로 정해요.`;
    $battleTaskHint.style.color = '';
    $battleCreateConfirmBtn.disabled = false;
    $battleCreateConfirmBtn.textContent = '만들기';
    delete $battleCreateConfirmBtn.dataset.noGacha;
  } else {
    $battleTaskText.textContent = '가챠 결과 없음';
    $battleTaskText.className = 'no-task';
    $battleTaskHint.textContent = '⚠ 먼저 가챠를 돌려서 작업을 정해주세요!';
    $battleTaskHint.style.color = 'var(--accent)';
    $battleCreateConfirmBtn.disabled = false;
    $battleCreateConfirmBtn.textContent = '🎰 가챠 먼저 돌리기';
    $battleCreateConfirmBtn.dataset.noGacha = 'true';
  }
}

function openBattleCreateModal() {
  document.querySelector('input[name="battleMode"][value="common"]').checked = true;
  $battleDuration.value = '1500';
  $battleCustomWrap.hidden = true;
  updateBattleTaskPreview('common');
  if (typeof $battleCreateModal.showModal === 'function') $battleCreateModal.showModal();
  else $battleCreateModal.setAttribute('open', '');
}

function closeBattleCreateModal() {
  if (typeof $battleCreateModal.close === 'function') $battleCreateModal.close();
  else $battleCreateModal.removeAttribute('open');
}

// 모드 변경 시 가챠 결과 미리보기 업데이트 (v0.1.15)
document.querySelectorAll('input[name="battleMode"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    updateBattleTaskPreview(e.target.value);
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
  // 가챠 없는 상태에서 '가챠 먼저 돌리기' 버튼 클릭 시
  if ($battleCreateConfirmBtn.dataset.noGacha === 'true') {
    closeBattleCreateModal();
    switchTab('personal');
    document.getElementById('gachaBtn')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const mode = document.querySelector('input[name="battleMode"]:checked').value;
  const durationSec = getBattleDurationSec();
  let taskCommon = null;

  // v0.1.15 — TOM/MOTO는 가챠 결과 필수, SHUFFLE은 카테고리 유무 체크
  if (mode === 'shuffle') {
    if (categories.length === 0) {
      closeBattleCreateModal();
      switchTab('personal');
      return;
    }
  } else if (!currentTask) {
    closeBattleCreateModal();
    switchTab('personal');
    return;
  }

  if (mode === 'common') {
    taskCommon = currentTask;  // 가챠 결과 자동 사용
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

  // 셔플 모드: 창조자의 카테고리 배열을 shared_pool에 저장
  if (mode === 'shuffle') {
    battle.shared_pool = JSON.stringify(categories);
  }

  // 저장 — 일단 localStorage (Supabase 연동되면 서버로)
  await saveBattle(battle);

  // 내 배틀 목록에 추가
  addToMyBattles(battle);

  // 모달 닫고 초대 링크 표시
  closeBattleCreateModal();
  openInviteModal(battle);
  await renderMyBattles();

  // v0.1.27 — watchChannel로 교체: 다른 배틀 룸을 열어도 이 구독이 유지됨
  subscribeWatchBattle(battle.id);
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
    // battle_players에 생성자 등록 (MOTO MODE면 가챠 task도 함께)
    const { error: e2 } = await sb.from('battle_players').insert({
      battle_id: battle.id,
      nickname: battle.creator_nickname,
      is_creator: true,
      task: battle.mode === 'separate' ? (currentTask || null) : null, // v0.1.22
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
        .select('battle_id, is_creator, task')
        .eq('nickname', myNickname);
      if (e1) throw e1;
      const battleIds = (myPlayerRows || []).map((r) => r.battle_id);
      if (battleIds.length === 0) return [];

      // 2) 해당 battle_id들의 battle 정보 가져오기 (done 제외 + 공개방 제외 — 친구 배틀만)
      const { data: battles, error: e2 } = await sb
        .from('battles')
        .select('*')
        .in('id', battleIds)
        .eq('is_public', false)   // 공개 배틀방은 친구 배틀 목록에서 완전 분리
        .neq('status', 'done')
        .order('created_at', { ascending: false });
      if (e2) throw e2;
      const mapped = (battles || []).map((b) => {
        const myRow = myPlayerRows.find((r) => r.battle_id === b.id);
        return { ...b, _isCreator: myRow ? myRow.is_creator : false, _myTask: myRow?.task || null };
      });

      // v0.1.65 — 쿼리 자체에서 done 제외 (.neq('status','done'))
      // locallyCompletedBattleIds: Supabase done 업데이트 in-flight 중인 배틀도 숨김 (안전망)
      const completedSet = getLocallyCompletedIds();
      const activeBattles = mapped.filter(b => !completedSet.has(b.id));

      // 24시간 이상 된 done 배틀 자동 삭제 (백그라운드, 별도 쿼리)
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      sb.from('battles').select('id, updated_at, created_at').in('id', battleIds).eq('status', 'done')
        .then(({ data: doneBattles }) => {
          if (!doneBattles) return;
          doneBattles.filter(b => (now - new Date(b.updated_at || b.created_at).getTime()) >= oneDayMs)
                     .forEach(b => { console.log('[배틀 정리] 자동 삭제:', b.id); deleteBattleSilent(b.id); });
        });

      // v0.1.26 — 저장된 드래그 순서 적용
      return applyBattleOrder(activeBattles);
    } catch (err) {
      console.error('내 배틀 fetch 실패:', err);
      // 실패 시 localStorage fallback
      try { return JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); }
      catch { return []; }
    }
  }
  try {
    const all = JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]');
    // v0.1.64 — done 배틀은 항상 표시에서 제외, 탭 닫고 재진입 시 정리
    const done = all.filter(b => b.status === 'done');
    const active = all.filter(b => b.status !== 'done');
    if (done.length > 0 && !sessionStorage.getItem(CLEANED_DONE_KEY) && !$battleRoomModal?.open) {
      sessionStorage.setItem(CLEANED_DONE_KEY, '1');
      done.forEach(b => deleteBattleSilent(b.id));
    }
    return active;
  }
  catch { return []; }
}

// v0.1.26 — 저장된 드래그 순서(ID 배열)로 배틀 목록 정렬. 순서에 없는 신규 배틀은 앞에 추가.
function applyBattleOrder(battles) {
  let savedOrder = [];
  try { savedOrder = JSON.parse(localStorage.getItem(BATTLE_STORAGE.order) || '[]'); } catch {}
  if (savedOrder.length === 0) return battles;

  const orderMap = {};
  savedOrder.forEach((id, i) => { orderMap[id] = i; });

  const inOrder   = battles.filter(b =>  orderMap[b.id] !== undefined)
                           .sort((a, b) => orderMap[a.id] - orderMap[b.id]);
  const newBattles = battles.filter(b => orderMap[b.id] === undefined);
  return [...newBattles, ...inOrder];
}

// v0.1.31 — 배틀카드 상태 표시 재정의
// '진행 중' = 내 로컬 타이머가 이 배틀로 실제로 돌아가는 상태
// '완료'   = battles.status === 'done' OR 타이머가 막 끝난 상태 (remaining=0)
// '대기 중' = 나머지 전부 (waiting / active-but-not-my-timer)
function getBattleDisplayStatus(b) {
  if (b.status === 'done') return { label: '완료', cls: 'done' };
  if (locallyCompletedBattleIds.has(b.id)) return { label: '완료', cls: 'done' }; // v0.1.65 — 이번 세션 완료분
  if (activeBattleId === b.id && !timer.isRunning && timer.remaining === 0) return { label: '완료', cls: 'done' }; // v0.1.65 — 타이머 완료 직후
  if (timer.isRunning && activeBattleId === b.id) return { label: '진행 중', cls: 'running' };
  return { label: '대기 중', cls: 'waiting' };
}

// ====== v0.1.33 — 기록 탭 ======

// 현재 보고 있는 달 (초기값: 오늘)
const _logToday = new Date();
let logViewYear  = _logToday.getFullYear();
let logViewMonth = _logToday.getMonth();   // 0-indexed

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLogsFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE.logs) || '[]'); } catch { return []; }
}

function saveLog(entry) {
  const logs = getLogsFromStorage();
  logs.unshift(entry);
  if (logs.length > 500) logs.splice(500);
  localStorage.setItem(STORAGE.logs, JSON.stringify(logs));
}

// 소감 저장 시 가장 최신 로그 항목에 note 업데이트
function updateLatestLogNote(note) {
  const logs = getLogsFromStorage();
  if (logs.length > 0) {
    logs[0].note = note;
    localStorage.setItem(STORAGE.logs, JSON.stringify(logs));
    checkAchievementsOnNote(); // v0.1.69
  }
}

// v0.1.34 — 인증샷 찍으면 가장 최신 로그에 사진 연결
function updateLatestLogCapture(dataUrl) {
  const logs = getLogsFromStorage();
  if (logs.length === 0) return;
  const latestId = String(logs[0].id);
  let captures = {};
  try { captures = JSON.parse(localStorage.getItem(STORAGE.logCaptures) || '{}'); } catch {}
  captures[latestId] = dataUrl;
  // 최대 20개 유지 (오래된 것부터 삭제)
  const keys = Object.keys(captures).sort((a, b) => Number(a) - Number(b));
  if (keys.length > 20) keys.slice(0, keys.length - 20).forEach(k => delete captures[k]);
  try {
    localStorage.setItem(STORAGE.logCaptures, JSON.stringify(captures));
    checkAchievementsOnCapture(); // v0.1.70 — B-8
  } catch (e) {
    console.warn('인증샷 로그 저장 실패 (용량 부족):', e);
  }
}

function renderLogCalendar() {
  const $section = document.getElementById('logCalendarSection');
  if (!$section) return;

  const logs = getLogsFromStorage();
  const countMap = {};
  const battleDates = new Set();
  logs.forEach(l => {
    if (l.date) {
      countMap[l.date] = (countMap[l.date] || 0) + 1;
      if (l.type === 'battle') battleDates.add(l.date);
    }
  });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr  = formatDateStr(today);
  const year      = logViewYear;
  const month     = logViewMonth;   // 0-indexed
  const lastDate  = new Date(year, month + 1, 0).getDate();
  // 올해 12월까지는 다음 달로 이동 가능
  const isCurMonth    = year === today.getFullYear() && month === today.getMonth();
  const isLastAllowed = year === today.getFullYear() && month === 11; // 12월

  // 날짜 셀 배열
  const days = [];
  for (let d = 1; d <= lastDate; d++) {
    const dateStr  = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isFuture = new Date(year, month, d) > today;
    const cnt      = countMap[dateStr] || 0;
    const level    = isFuture ? 'f' : cnt === 0 ? '0' : cnt === 1 ? '1' : cnt <= 3 ? '2' : '3';
    const hasBattle = battleDates.has(dateStr);
    days.push({ d, dateStr, level, cnt, isToday: dateStr === todayStr, isFuture, hasBattle });
  }

  $section.innerHTML = `
    <div class="log-strip-wrap">
      <div class="log-strip-nav">
        <button class="log-nav-btn" id="logPrevBtn" title="이전 달">‹</button>
        <span class="log-strip-title">${year}년 ${month + 1}월</span>
        <button class="log-nav-btn" id="logNextBtn" title="다음 달" ${isLastAllowed ? 'disabled' : ''}>›</button>
      </div>
      <div class="log-strip">
        ${days.map(d => `
          <div class="log-strip-day lv${d.level}${d.isToday ? ' log-today' : ''}${d.isFuture ? '' : ' clickable'}${d.hasBattle ? ' has-battle' : ''}"
               data-date="${d.dateStr}"
               title="${month + 1}/${d.d}${d.cnt > 0 ? ' · ' + d.cnt + '회 완료' : ''}${d.hasBattle ? ' ⚔️' : ''}">
            <span class="log-strip-num">${d.d}</span>
          </div>`).join('')}
      </div>
    </div>
    <p class="log-hint">날짜를 탭하면 그날의 기록을 볼 수 있어요</p>
  `;

  // 이전/다음 달 버튼
  document.getElementById('logPrevBtn').addEventListener('click', () => {
    if (logViewMonth === 0) { logViewYear--; logViewMonth = 11; } else { logViewMonth--; }
    renderLogCalendar();
  });
  const $nextBtn = document.getElementById('logNextBtn');
  if ($nextBtn && !isLastAllowed) {
    $nextBtn.addEventListener('click', () => {
      if (logViewMonth === 11) { logViewYear++; logViewMonth = 0; } else { logViewMonth++; }
      renderLogCalendar();
    });
  }

  // 날짜 클릭
  $section.querySelectorAll('.log-strip-day.clickable').forEach(cell => {
    cell.addEventListener('click', () => {
      $section.querySelectorAll('.log-strip-day').forEach(c => c.removeAttribute('data-sel'));
      cell.setAttribute('data-sel', '');
      renderLogDay(cell.dataset.date);
    });
  });

  // v0.1.35 — 현재 달 보고 있으면 오늘 자동 선택
  if (isCurMonth) {
    const todayCell = $section.querySelector(`.log-strip-day[data-date="${todayStr}"]`);
    if (todayCell) {
      todayCell.setAttribute('data-sel', '');
      renderLogDay(todayStr);
    }
  }
}

async function renderLogPartnerRecord() {
  const $el = document.getElementById('logPartnerSection');
  if (!$el) return;

  const logs = getLogsFromStorage();
  const battleLogs = logs.filter(l => l.type === 'battle' && l.partner);

  if (battleLogs.length === 0) { $el.hidden = true; return; }

  // 닉네임 변경 이력 조회 — 로그에 기록된 구 닉네임을 현재 닉네임으로 정규화
  const rawNicks = [...new Set(battleLogs.map(l => l.partner))];
  const oldToNew = {}; // { 구닉네임: 현재닉네임 }
  if (sb) {
    try {
      const { data: hist } = await sb.from('nickname_history')
        .select('old_nickname, new_nickname')
        .in('old_nickname', rawNicks)
        .order('changed_at', { ascending: true }); // 오래된 순으로 체인 추적
      if (hist?.length) {
        // 직접 매핑 먼저 구성
        const direct = {};
        for (const h of hist) direct[h.old_nickname] = h.new_nickname;
        // 체인 추적: A→B→C 이면 A도 C로 매핑
        for (const old of Object.keys(direct)) {
          let cur = direct[old];
          const seen = new Set([old]);
          while (direct[cur] && !seen.has(cur)) { seen.add(cur); cur = direct[cur]; }
          oldToNew[old] = cur;
        }
      }
    } catch { /* nickname_history 없으면 무시 */ }
  }

  // 현재 닉네임 기준으로 집계 (변경된 닉네임은 현재 닉네임으로 병합)
  const partnerMap = {};
  battleLogs.forEach(l => {
    const nick = oldToNew[l.partner] || l.partner; // 구 닉네임이면 현재 닉네임으로
    if (!partnerMap[nick]) partnerMap[nick] = { count: 0, lastAt: 0, tom: 0, moto: 0 };
    partnerMap[nick].count++;
    const at = l.completedAt || 0;
    if (at > partnerMap[nick].lastAt) partnerMap[nick].lastAt = at;
    if (l.battleMode === 'common')   partnerMap[nick].tom++;
    else if (l.battleMode === 'separate') partnerMap[nick].moto++;
  });

  // 3회 이상 함께한 파트너만, 횟수 순 상위 3명만 표시
  const sorted = Object.entries(partnerMap)
    .filter(([, d]) => d.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3);

  if (sorted.length === 0) { $el.hidden = true; return; }

  const rows = sorted.map(([nick, d]) => {
    const lastDate = d.lastAt
      ? new Date(d.lastAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
      : '—';
    const tier = getPartnerTier(d.count);
    const tierBadge = tier
      ? `<span class="partner-tier-badge">${tier.emoji} ${tier.label}</span>`
      : '';
    return `<div class="partner-row">
      <div class="partner-row-top">
        <span class="partner-row-nick">${escapeHtml(nick)}</span>
        ${tierBadge}
      </div>
      <span class="partner-row-stats">${d.count}회 · 마지막 배틀 ${lastDate}</span>
    </div>`;
  }).join('');

  $el.innerHTML = `<p class="log-section-label">⚔️ 배틀 파트너</p>${rows}`;
  $el.hidden = false;
}

function renderLogNarrative() {
  const $el = document.getElementById('logNarrativeSection');
  if (!$el) return;

  const logs = getLogsFromStorage();
  if (logs.length < 3) { $el.hidden = true; return; }

  const now = new Date();
  const stats = [];

  // 이번 주 시작 (월요일)
  const weekStart = new Date(now);
  const dow = now.getDay();
  weekStart.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
  weekStart.setHours(0, 0, 0, 0);

  const weekLogs = logs.filter(l => l.completedAt && new Date(l.completedAt) >= weekStart);

  // 1. 이번 주 최다 카테고리
  if (weekLogs.length > 0) {
    const taskCount = {};
    weekLogs.forEach(l => { if (l.task) taskCount[l.task] = (taskCount[l.task] || 0) + 1; });
    const top = Object.entries(taskCount).sort((a, b) => b[1] - a[1])[0];
    if (top) stats.push({ icon: '📌', text: `이번 주는 <b>${escapeHtml(top[0])}</b>랑 제일 많이 씨름했어요` });
  }

  // 2. 이번 달 집중 일수 + 총 분
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLogs = logs.filter(l => l.date && l.date.startsWith(ym));
  if (monthLogs.length > 0) {
    const days = new Set(monthLogs.map(l => l.date)).size;
    const totalMins = Math.round(monthLogs.reduce((s, l) => s + (l.durationSec || 0), 0) / 60);
    const timeText = totalMins >= 60
      ? `${Math.floor(totalMins / 60)}시간 ${totalMins % 60}분`
      : `${totalMins}분`;
    stats.push({ icon: '🗓', text: `이번 달 <b>${days}일</b> 달렸고, 총 <b>${timeText}</b> 집중했어요` });
  }

  // 3. 시간대 패턴
  const timedLogs = logs.filter(l => l.completedAt);
  if (timedLogs.length >= 5) {
    const dist = { 새벽: 0, 오전: 0, 오후: 0, 야간: 0 };
    timedLogs.forEach(l => {
      const h = new Date(l.completedAt).getHours();
      if (h < 6) dist['새벽']++;
      else if (h < 12) dist['오전']++;
      else if (h < 18) dist['오후']++;
      else dist['야간']++;
    });
    const top = Object.entries(dist).sort((a, b) => b[1] - a[1])[0];
    const msg = {
      새벽: '새벽에 제일 잘 달리는 타입이에요 🌙',
      오전: '오전이 골든타임인 타입이에요 ☀️',
      오후: '오후에 집중력이 올라오는 타입이에요 🌤',
      야간: '밤에 혼자 달리는 스타일이에요 🌃',
    };
    stats.push({ icon: '⏰', text: msg[top[0]] });
  }

  if (stats.length === 0) { $el.hidden = true; return; }

  $el.hidden = false;
  $el.innerHTML = `<div class="log-narrative-list">${
    stats.map(s => `<div class="log-narrative-item"><span class="log-narrative-icon">${s.icon}</span><span class="log-narrative-text">${s.text}</span></div>`).join('')
  }</div>`;
}

function renderLogDay(dateStr) {
  const $detail = document.getElementById('logDayDetail');
  const $title  = document.getElementById('logDayTitle');
  const $list   = document.getElementById('logDayList');
  if (!$detail || !$title || !$list) return;

  // v0.1.59 — 오름차순 정렬 (먼저 완료한 것이 위)
  const dayLogs = getLogsFromStorage()
    .filter(l => l.date === dateStr)
    .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0));
  const [, m, d] = dateStr.split('-');
  $title.textContent = `${parseInt(m)}월 ${parseInt(d)}일 · ${dayLogs.length}회 완료`;

  // v0.1.34 — 인증샷 맵 로드
  let captures = {};
  try { captures = JSON.parse(localStorage.getItem(STORAGE.logCaptures) || '{}'); } catch {}

  if (dayLogs.length === 0) {
    $list.innerHTML = '<p class="log-empty-day">이 날은 기록이 없어요.</p>';
  } else {
    $list.innerHTML = dayLogs.map((log, idx) => {
      const mins = Math.round((log.durationSec || 0) / 60);
      const icon = log.type === 'battle' ? '⚔️' : '🍅';
      const partnerText = log.partner ? ` · ${escapeHtml(log.partner)}님과` : '';
      const noteHtml = log.note
        ? `<div class="log-item-note">"${escapeHtml(log.note)}"</div>` : '';
      const timeStr = log.completedAt
        ? new Date(log.completedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        : '';
      const captureUrl = captures[String(log.id)];
      const captureHtml = captureUrl
        ? `<img class="log-item-capture" src="${captureUrl}" alt="인증샷" loading="lazy">`
        : '';
      // v0.1.61 — 아코디언: 사진·소감 있는 항목만 펼치기 표시
      const hasDetail = !!(captureUrl || log.note);
      const detailHtml = hasDetail
        ? `<div class="log-item-detail" id="log-detail-${log.id}">${captureHtml}${noteHtml}</div>`
        : '';
      const toggleAttr = hasDetail ? ` data-log-toggle="${log.id}"` : '';
      const chevron = hasDetail ? `<span class="log-item-chevron"><svg viewBox="17.36 24.85 105.76 95.08" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M58.9,111.8c6.26,10.85,16.42,10.85,22.68,0l38.86-67.3c6.26-10.85,1.18-19.64-11.34-19.64H31.38c-12.52,0-17.6,8.79-11.34,19.64l38.86,67.3Z"/></svg></span>` : '';
      return `<div class="log-item${log.type === 'battle' ? ' log-item--battle' : ''}${hasDetail ? ' has-detail' : ''}" data-log-id="${log.id}">
        <div class="log-item-row"${toggleAttr}>
          <div class="log-item-icon-col">
            <span class="log-item-icon">${icon}</span>
            ${chevron}
          </div>
          <span class="log-item-task">${escapeHtml(log.task || '무제')}</span>
          <div class="log-item-right">
            <span class="log-item-meta">${mins}분${partnerText}</span>
            <span class="log-item-time">${timeStr}</span>
          </div>
        </div>
        ${detailHtml}
      </div>`;
    }).join('');

    // 아코디언 토글 이벤트
    $list.querySelectorAll('[data-log-toggle]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.logToggle;
        const detail = document.getElementById(`log-detail-${id}`);
        const item = row.closest('.log-item');
        if (!detail) return;
        const isOpen = item.classList.toggle('log-item--open');
        detail.hidden = !isOpen;
      });
    });
    // 기본 닫힘 상태
    $list.querySelectorAll('.log-item-detail').forEach(d => { d.hidden = true; });
    // 짧은 닉네임으로 카드 높이가 작은 경우 compact 클래스 부여
    requestAnimationFrame(() => {
      $list.querySelectorAll('.log-item').forEach(item => {
        const right = item.querySelector('.log-item-right');
        if (right && right.getBoundingClientRect().height < 42) {
          item.classList.add('log-item--compact');
        }
      });
    });
  }

  $detail.hidden = false;
}

let _renderMyBattlesRunning = false; // v0.1.65 — 동시 호출 방지
async function renderMyBattles() {
  if (_renderMyBattlesRunning) return;
  _renderMyBattlesRunning = true;
  let list;
  try { list = await loadMyBattles(); } finally { _renderMyBattlesRunning = false; }
  if (!list) return;
  if (list.length === 0) {
    battleEditMode = false;
    selectedBattleIds.clear();
    $battleList.innerHTML = '<p class="battle-empty">아직 참여한 배틀이 없어요.</p>';
    return;
  }

  // 없어진 배틀 ID 선택 해제
  const existIds = new Set(list.map(b => b.id));
  for (const id of selectedBattleIds) { if (!existIds.has(id)) selectedBattleIds.delete(id); }

  // v0.1.27 — 창조자 여부 무관하게 배틀이 하나라도 있으면 편집 버튼 표시
  const selCount = selectedBattleIds.size;
  // 선택된 항목 중 창조자/비창조자 구분 (일괄 액션 레이블 결정용)
  const selHasCreator = selCount > 0 && [...selectedBattleIds].some(id => list.find(b => b.id === id)?._isCreator);
  const selHasGuest   = selCount > 0 && [...selectedBattleIds].some(id => !list.find(b => b.id === id)?._isCreator);
  const bulkLabel = selHasCreator && selHasGuest ? '삭제 / 나가기'
                  : selHasGuest ? '🚪 나가기'
                  : `🗑 ${selCount}개 삭제`;

  // 툴바: 편집 토글 + 일괄 액션 버튼
  const toolbarHtml = `
    <div class="battle-list-toolbar">
      <button class="btn-mini btn-edit-toggle" id="battleEditToggle">
        ${battleEditMode ? '완료' : '편집'}
      </button>
      ${battleEditMode && selCount > 0
        ? `<button class="btn-mini btn-danger-mini" id="battleSelectDeleteBtn">${bulkLabel}</button>`
        : ''}
    </div>
  `;

  $battleList.innerHTML = toolbarHtml + list.map((b, idx) => {
    const modeLabel  = b.mode === 'common' ? '🍅 TOM MODE'
      : b.mode === 'shuffle' ? '🔀 SHUFFLE MODE'
      : '🎲 MOTO MODE';
    const { label: statusLabel, cls: statusCls } = getBattleDisplayStatus(b);
    const taskLabel  = b.mode === 'common' || b.mode === 'shuffle'
      ? escapeHtml(b.task_common || (b.mode === 'shuffle' ? '가챠 전' : ''))
      : escapeHtml(b._myTask || '가챠 전');
    const minutes    = Math.round(b.duration_sec / 60);
    const roleLabel  = b._isCreator ? '내가 만듦' : '초대받음';
    const isSelected = selectedBattleIds.has(b.id);

    if (battleEditMode) {
      // 편집 모드: [드래그핸들] [카드내용] [체크박스(창조자=삭제, 비창조자=나가기)]
      const checkbox = `<input type="checkbox" class="battle-select-cb" data-id="${b.id}" data-creator="${b._isCreator ? '1' : '0'}" ${isSelected ? 'checked' : ''}>`;
      return `
        <div class="battle-card draggable${isSelected ? ' selected' : ''}" data-id="${b.id}" data-idx="${idx}">
          <span class="drag-handle" aria-hidden="true">⠿</span>
          <div class="battle-card-body">
            <div class="battle-card-top">
              <span class="battle-card-mode">${modeLabel} · ${roleLabel}</span>
              <span class="battle-card-status" data-status="${statusCls}">${statusLabel}</span>
            </div>
            <div class="battle-card-task">${taskLabel}</div>
            <div class="battle-card-meta">시간 ${minutes}분 · ID ${b.id}</div>
          </div>
          ${checkbox}
        </div>`;
    }

    // 일반 모드
    const deleteBtn = b._isCreator
      ? `<button class="btn-mini btn-danger-mini" data-action="delete" data-id="${b.id}">🗑 삭제</button>`
      : '';
    return `
      <div class="battle-card" data-id="${b.id}" data-idx="${idx}">
        <div class="battle-card-top">
          <span class="battle-card-mode">${modeLabel} · ${roleLabel}</span>
          <span class="battle-card-status" data-status="${statusCls}">${statusLabel}</span>
        </div>
        <div class="battle-card-task">${taskLabel}</div>
        <div class="battle-card-meta">시간 ${minutes}분 · ID ${b.id}</div>
        <div class="battle-card-actions">
          <button class="btn-mini" data-action="open" data-id="${b.id}">열기</button>
          <button class="btn-mini" data-action="invite" data-id="${b.id}">초대 링크</button>
          ${deleteBtn}
        </div>
      </div>`;
  }).join('');

  // 편집 모드: 드래그 핸들에 이벤트 연결
  // — 마우스: Pointer Events (cdStart에서 touch는 제외)
  // — 터치: Touch Events (iOS Safari Pointer Events 불안정 대응)
  if (battleEditMode) {
    $battleList.querySelectorAll('.drag-handle').forEach(handle => {
      handle.addEventListener('pointerdown', cdStart, { passive: false });
      handle.addEventListener('touchstart',  cdTouchStart, { passive: false });
    });
  }
}

// v0.1.27 — 배틀 나가기 (비창조자 전용: 내 battle_players 행만 삭제)
async function leaveBattleSilent(battleId) {
  if (sb && myNickname) {
    const { error } = await sb.from('battle_players')
      .delete()
      .eq('battle_id', battleId)
      .eq('nickname', myNickname);
    if (error) { console.error('나가기 실패:', error); return false; }
  }
  // localStorage + order 에서도 제거
  let cached = [];
  try { cached = JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); } catch {}
  cached = cached.filter(b => b.id !== battleId);
  localStorage.setItem(BATTLE_STORAGE.myBattles, JSON.stringify(cached));
  let order = [];
  try { order = JSON.parse(localStorage.getItem(BATTLE_STORAGE.order) || '[]'); } catch {}
  order = order.filter(id => id !== battleId);
  localStorage.setItem(BATTLE_STORAGE.order, JSON.stringify(order));
  return true;
}

// 배틀 삭제 내부 로직 (confirm 없음 — 단일/일괄 삭제 공유)
async function deleteBattleSilent(battleId) {
  // 공개 배틀 채널이 열려있으면 참가자들에게 방 삭제 broadcast (DB 삭제 전에 전송)
  if (publicLobbyBattleId === battleId && publicLobbyChannel) {
    try { publicLobbyChannel.send({ type: 'broadcast', event: 'room-deleted', payload: {} }); } catch (_) {}
    await new Promise(r => setTimeout(r, 250)); // broadcast 전달 대기
  }
  if (sb) {
    const { error: playersError } = await sb.from('battle_players').delete().eq('battle_id', battleId);
    if (playersError) { console.error('battle_players 삭제 실패:', playersError); return false; }
    const { error } = await sb.from('battles').delete().eq('id', battleId);
    if (error) { console.error('battles 삭제 실패:', error); return false; }
  }
  let cached = [];
  try { cached = JSON.parse(localStorage.getItem(BATTLE_STORAGE.myBattles) || '[]'); } catch {}
  cached = cached.filter((b) => b.id !== battleId);
  localStorage.setItem(BATTLE_STORAGE.myBattles, JSON.stringify(cached));
  // v0.1.26 — 드래그 순서에서도 제거
  let order = [];
  try { order = JSON.parse(localStorage.getItem(BATTLE_STORAGE.order) || '[]'); } catch {}
  order = order.filter(id => id !== battleId);
  localStorage.setItem(BATTLE_STORAGE.order, JSON.stringify(order));
  return true;
}

// 배틀 삭제 (생성자만 — 단일, confirm 포함)
async function deleteBattle(battleId) {
  if (!confirm('이 배틀을 삭제할까요? 되돌릴 수 없어요.')) return;
  const ok = await deleteBattleSilent(battleId);
  if (!ok) { alert('삭제 중 오류가 발생했어요. 다시 시도해주세요.'); return; }
  await renderMyBattles();
}

$battleList.addEventListener('click', async (e) => {
  // 편집 토글
  if (e.target.id === 'battleEditToggle') {
    battleEditMode = !battleEditMode;
    if (!battleEditMode) selectedBattleIds.clear();
    await renderMyBattles();
    return;
  }
  // 다중선택 삭제/나가기 (v0.1.27 — 창조자=삭제, 비창조자=나가기)
  if (e.target.id === 'battleSelectDeleteBtn') {
    if (selectedBattleIds.size === 0) return;
    const currentList = await loadMyBattles();
    const ids = [...selectedBattleIds];
    const hasGuest = ids.some(id => !currentList.find(b => b.id === id)?._isCreator);
    const hasCreator = ids.some(id => currentList.find(b => b.id === id)?._isCreator);
    const confirmMsg = hasCreator && hasGuest
      ? `선택한 ${ids.length}개 중 내가 만든 배틀은 삭제, 초대받은 배틀은 나가기 처리됩니다. 계속할까요?`
      : hasGuest
      ? `선택한 배틀에서 나가시겠어요? 배틀 자체는 삭제되지 않아요.`
      : `선택한 ${ids.length}개 배틀을 삭제할까요? 되돌릴 수 없어요.`;
    if (!confirm(confirmMsg)) return;
    selectedBattleIds.clear();
    battleEditMode = false;
    for (const id of ids) {
      const b = currentList.find(b => b.id === id);
      if (!b) continue;
      if (b._isCreator) await deleteBattleSilent(id);
      else await leaveBattleSilent(id);
    }
    await renderMyBattles();
    return;
  }
  // 체크박스
  const cb = e.target.closest('.battle-select-cb');
  if (cb) {
    const id = cb.dataset.id;
    cb.checked ? selectedBattleIds.add(id) : selectedBattleIds.delete(id);
    await renderMyBattles();
    return;
  }
  // 일반 액션 버튼
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
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

// ====== v0.1.26 — 드래그 헬퍼: 현재 DOM 순서를 order 키로 저장 ======
function saveBattleOrderFromDOM() {
  const ids = [...$battleList.querySelectorAll('.battle-card[data-id]')].map(c => c.dataset.id);
  localStorage.setItem(BATTLE_STORAGE.order, JSON.stringify(ids));
}

// ====== v0.1.26 — Pointer Events 드래그 (마우스/펜 전용, touch는 Touch Events로 처리) ======
function cdStart(e) {
  // 터치 입력은 cdTouchStart에서 처리
  if (e.pointerType === 'touch') return;
  // 체크박스는 드래그 안 함
  if (e.target.closest('.battle-select-cb')) return;
  e.preventDefault();
  const handle = e.currentTarget;
  const card = handle.closest('.battle-card.draggable');
  if (!card) return;

  cdHandle   = handle;
  cdDragging = card;
  card.classList.add('dragging');

  // 포인터 캡처: 핸들 밖으로 나가도 pointermove/up 수신
  try { handle.setPointerCapture(e.pointerId); } catch {}
  handle.addEventListener('pointermove', cdMove, { passive: false });
  handle.addEventListener('pointerup',   cdEnd);
  handle.addEventListener('pointercancel', cdEnd);
}

function cdMove(e) {
  if (!cdDragging) return;
  e.preventDefault();
  cdHighlight(e.clientY, cdDragging);
}

async function cdEnd(e) {
  if (!cdDragging) return;
  const handle = cdHandle;
  handle.removeEventListener('pointermove', cdMove);
  handle.removeEventListener('pointerup',   cdEnd);
  handle.removeEventListener('pointercancel', cdEnd);
  try { handle.releasePointerCapture(e.pointerId); } catch {}

  const srcId = cdDragging.dataset.id;
  cdDragging.classList.remove('dragging');
  cdDragging = null;
  cdHandle   = null;

  cdCommitOrder(srcId); // drag-over 제거 + 순서 저장
  await renderMyBattles();
}

// ====== v0.1.26 — 공통: Y좌표로 drag-over 카드 하이라이트 ======
function cdHighlight(y, draggingCard) {
  const others = [...$battleList.querySelectorAll('.battle-card.draggable')]
    .filter(c => c !== draggingCard);
  $battleList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  for (const c of others) {
    const r = c.getBoundingClientRect();
    if (y >= r.top && y < r.bottom) { c.classList.add('drag-over'); break; }
  }
}

// ====== v0.1.26 — 공통: 드래그 종료 시 순서 저장 ======
function cdCommitOrder(srcId) {
  const overCard = $battleList.querySelector('.battle-card.drag-over');
  const tgtId = overCard ? overCard.dataset.id : null;
  $battleList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

  if (tgtId && tgtId !== srcId) {
    const currentOrder = [...$battleList.querySelectorAll('.battle-card[data-id]')].map(c => c.dataset.id);
    const si = currentOrder.indexOf(srcId);
    const ti = currentOrder.indexOf(tgtId);
    if (si >= 0 && ti >= 0) {
      currentOrder.splice(si, 1);
      currentOrder.splice(ti, 0, srcId);
      localStorage.setItem(BATTLE_STORAGE.order, JSON.stringify(currentOrder));
      return true;
    }
  }
  return false;
}

// ====== v0.1.26 — Touch Events 드래그 (모바일 전용) ======
function cdTouchStart(e) {
  if (e.target.closest('.battle-select-cb')) return;
  e.preventDefault(); // 스크롤 방지
  const handle = e.currentTarget;
  const card = handle.closest('.battle-card.draggable');
  if (!card) return;

  touchDragging = card;
  card.classList.add('dragging');

  document.addEventListener('touchmove', cdTouchMove, { passive: false });
  document.addEventListener('touchend',  cdTouchEnd);
  document.addEventListener('touchcancel', cdTouchEnd);
}

function cdTouchMove(e) {
  if (!touchDragging) return;
  e.preventDefault();
  const touch = e.touches[0];
  cdHighlight(touch.clientY, touchDragging);
}

async function cdTouchEnd() {
  if (!touchDragging) return;
  document.removeEventListener('touchmove', cdTouchMove);
  document.removeEventListener('touchend',  cdTouchEnd);
  document.removeEventListener('touchcancel', cdTouchEnd);

  const srcId = touchDragging.dataset.id;
  touchDragging.classList.remove('dragging');
  touchDragging = null;

  cdCommitOrder(srcId);
  await renderMyBattles();
}

// 초대 링크 모달
function openInviteModal(battle) {
  // v0.1.70 — A-5 초대장 발송: 처음 초대 링크를 생성하는 순간 달성
  unlockAchievement('A-5');

  const link = makeInviteLink(battle.id);
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE'
    : battle.mode === 'shuffle' ? '🔀 SHUFFLE MODE'
    : '🎲 MOTO MODE';
  const taskLabel = battle.mode === 'common' ? ` · "${battle.task_common}"` : '';
  const minutes = Math.round(battle.duration_sec / 60);
  $inviteSummary.textContent = `${modeLabel}${taskLabel} · ${minutes}분`;
  $inviteLinkInput.value = link;

  // 공유 버튼 항상 표시
  $inviteShareBtn.hidden = false;
  // 공유 메뉴 닫힌 상태로 초기화
  const $shareMenu = document.getElementById('shareMenu');
  if ($shareMenu) $shareMenu.hidden = true;

  if (typeof $inviteModal.showModal === 'function') $inviteModal.showModal();
  else $inviteModal.setAttribute('open', '');
}

function makeInviteLink(battleId) {
  const h = location.hostname;
  // Capacitor 앱은 localhost에서 실행되지만 실제 로컬 개발 환경이 아님
  const isCapacitor = !!(window.Capacitor?.isNativePlatform?.());
  const isLocal = !isCapacitor && (h === 'localhost' || h === '127.0.0.1');
  // 로컬 외 모든 환경(Vercel preview, Capacitor 포함)은 production URL 고정
  // — preview URL은 Vercel 로그인 요구 + 카카오 도메인 미등록 문제 발생
  const base = isLocal
    ? (location.origin + location.pathname)
    : 'https://tomotto.vercel.app/';
  return `${base}?battle=${battleId}`;
}

// ── v0.1.127 Capacitor 딥링크 핸들러 ────────────────────────────────────
// Android App Links (assetlinks.json) 배포 후 활성화됨.
// 그 전까지는 KakaoTalk 링크가 IAB(웹버전)로 열리므로 이 핸들러는 미동작.
function _handleDeepLinkUrl(url) {
  if (!url) return;
  const m = url.match(/[?&]battle=([^&]+)/);
  if (!m) return;
  const battleId = m[1];
  switchTab('social', { skipScroll: true });
  setTimeout(() => openBattleRoom(battleId), 600);
}

if (window.Capacitor?.isNativePlatform?.()) {
  // 앱이 포그라운드 상태에서 링크로 다시 열렸을 때
  window.Capacitor?.Plugins?.App?.addListener?.('appUrlOpen', (data) => {
    _handleDeepLinkUrl(data?.url);
  });
  // 앱이 완전히 종료된 상태에서 링크로 실행됐을 때
  window.Capacitor?.Plugins?.App?.getLaunchUrl?.()
    ?.then?.((data) => _handleDeepLinkUrl(data?.url))
    ?.catch?.(() => {});
}
// ─────────────────────────────────────────────────────────────────────────

function closeInviteModal() {
  if (typeof $inviteModal.close === 'function') $inviteModal.close();
  else $inviteModal.removeAttribute('open');
  // 공유 메뉴도 닫기
  const $sm = document.getElementById('shareMenu');
  if ($sm) $sm.hidden = true;
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

// 인앱 공유 메뉴 핸들러
const $shareMenu = document.getElementById('shareMenu');

// 모바일 여부 — navigator.share가 실제로 네이티브 시트를 띄워주는 환경인지 판단
const _isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

$inviteShareBtn.addEventListener('click', async () => {
  const link = $inviteLinkInput.value;

  // 모바일: 네이티브 공유시트 (카카오톡 등 앱 목록 직접 표시)
  if (_isMobile && navigator.share) {
    try {
      await navigator.share({
        title: 'Tomotto 친구 배틀',
        text: '같이 작업할래? 시간 정해서 같이 집중하기.',
        url: link,
      });
      return; // 성공
    } catch (err) {
      if (err.name === 'AbortError') return; // 사용자가 직접 닫음 → 무시
      // 그 외 실패 → 폴백 메뉴로 떨어짐
    }
  }

  // 데스크탑(또는 모바일 폴백): 인앱 공유 메뉴 토글
  if ($shareMenu) {
    $shareMenu.hidden = !$shareMenu.hidden;
  }
});

// 공유 메뉴 각 항목 클릭
$shareMenu?.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-share]');
  if (!btn) return;
  const link = $inviteLinkInput.value;
  const type = btn.dataset.share;

  if (type === 'kakao') {
    if (window.Kakao && window.Kakao.isInitialized()) {
      // Kakao SDK로 직접 공유 (앱/웹 카카오톡 공유 시트 열림)
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '🍅 Tomotto 친구 배틀',
            description: '같이 집중 타이머 돌릴래? 배틀에 초대해!',
            imageUrl: 'https://tomotto.vercel.app/assets/og.png',
            link: { mobileWebUrl: link, webUrl: link },
          },
          buttons: [{ title: '배틀 참가하기', link: { mobileWebUrl: link, webUrl: link } }],
        });
        $shareMenu.hidden = true;
        return;
      } catch (err) {
        console.warn('[Kakao Share] 실패, 링크 복사로 폴백:', err);
      }
    }
    // 폴백: 링크 복사
    try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    btn.querySelector('span:nth-child(3)').textContent = '복사됐어요 ✓';
    setTimeout(() => {
      btn.querySelector('span:nth-child(3)').textContent = '링크 복사 후 붙여넣기';
    }, 2000);
  } else if (type === 'line') {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(link)}`;
    window.open(url, '_blank', 'noopener,width=600,height=600');
    $shareMenu.hidden = true;
  }
});

// v0.1.15 — 배틀 잠금 배너 요소 (B안)
const $battleLockBanner = document.getElementById('battleLockBanner');
const $battleLockOpenBtn = document.getElementById('battleLockOpenBtn');
const $battleLockDismissBtn = document.getElementById('battleLockDismissBtn');

// v0.1.14 — 배틀 룸 모달 요소
const $battleRoomModal = document.getElementById('battleRoomModal');
const $battleRoomTitle = document.getElementById('battleRoomTitle');
const $battleRoomSummary = document.getElementById('battleRoomSummary');
const $battleRoomPlayers = document.getElementById('battleRoomPlayers');
const $battleRoomTask = document.getElementById('battleRoomTask');
const $battleRoomStatus = document.getElementById('battleRoomStatus');
const $battleRoomCancelBtn = document.getElementById('battleRoomCancelBtn');
const $battleRoomAcceptBtn = document.getElementById('battleRoomAcceptBtn');
const $battleRoomGachaBtn = document.getElementById('battleRoomGachaBtn');  // v0.1.15
const $battleRoomStartBtn = document.getElementById('battleRoomStartBtn');

let currentBattleId = null;
let currentBattleData = null;
let activeBattleId = null;   // v0.1.17 — 배틀 타이머 진행 중인 battle ID (인증샷 업로드용)
const locallyCompletedBattleIds = new Set(); // v0.1.65 — 이번 세션에서 완료된 배틀 ID (Supabase 타이밍 무관하게 필터링)

// v0.1.65 — localStorage에도 완료 ID 저장 (새로고침 후에도 필터링 유지)
function markBattleCompletedLocally(battleId) {
  if (!battleId) return;
  locallyCompletedBattleIds.add(battleId);
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem(BATTLE_STORAGE.completedIds) || '[]'); } catch {}
  if (!ids.includes(battleId)) {
    ids.push(battleId);
    localStorage.setItem(BATTLE_STORAGE.completedIds, JSON.stringify(ids));
  }
}
function getLocallyCompletedIds() {
  let stored = [];
  try { stored = JSON.parse(localStorage.getItem(BATTLE_STORAGE.completedIds) || '[]'); } catch {}
  stored.forEach(id => locallyCompletedBattleIds.add(id));
  return locallyCompletedBattleIds;
}
let realtimeChannel = null;    // v0.1.18 — battle_players INSERT 구독 채널 (룸 뷰용)
let battleStartChannel = null; // v0.1.19 — battles UPDATE 구독 채널 (친구 쪽 동시 시작용)
let isStartingBattle = false;  // v0.1.19 — 중복 시작 방지 플래그
let watchChannel = null;       // v0.1.27 — 배틀 생성 후 친구 수락 대기 전용 채널 (룸 뷰 채널과 독립)
let watchBattleId = null;      // v0.1.27 — watchChannel이 감시 중인 battleId
let battleRoomPollInterval = null; // v0.1.67 — Realtime 폴링 백업 (카카오톡 등 WebSocket 불안정 브라우저용)

// v0.1.15 — 배틀 초대 URL로 들어온 경우 타이머 잠금 (B안)
let lockedBattleId = null;

// v0.1.64 — 완료 배틀 자동 정리: sessionStorage로 탭 세션 내 스킵
// 탭 닫고 새로 열었을 때만 실행 (새로고침은 같은 세션이므로 스킵)
const CLEANED_DONE_KEY = 'tomotto_cleaned_done_battles';

// v0.1.64 — 유저가 의도적으로 배틀룸을 닫았을 때 true (가챠 먼저 돌리기 등)
// → room_opened_at 신호로 인한 자동 재오픈 방지
let battleRoomUserDismissed = false;

function showBattleLock(battleId) {
  lockedBattleId = battleId;
  $battleLockBanner.hidden = false;
  $startBtn.disabled = !currentTask;
  updateBattleLockBanner();
}

function hideBattleLock() {
  lockedBattleId = null;
  $battleLockBanner.hidden = true;
  $startBtn.disabled = !currentTask;
}

function updateBattleLockBanner() {
  if (!lockedBattleId) return;
  const lockText = $battleLockBanner.querySelector('.battle-lock-text');
  if (currentTask) {
    lockText.textContent = '✓ 가챠 완료! 이제 배틀을 시작할 수 있어요';
    $battleLockOpenBtn.textContent = '배틀 시작 ▶';
  } else {
    lockText.textContent = '⚔️ 배틀 연결됨 — 가챠 후 [배틀 열기] 버튼을 눌러주세요';
    $battleLockOpenBtn.textContent = '배틀 열기';
  }
}

// v0.1.32 — 잠금 배너 버튼: 항상 배틀 룸 모달만 열기
// (가챠 완료 상태면 renderBattleRoom이 '▶ 타이머 시작' 버튼을 표시)
$battleLockOpenBtn.addEventListener('click', async () => {
  if (lockedBattleId) await openBattleRoom(lockedBattleId);
});

$battleLockDismissBtn.addEventListener('click', () => {
  hideBattleLock();
});

async function openBattleRoom(battleId) {
  battleRoomUserDismissed = false;  // v0.1.64 — 유저가 직접 열었으므로 dismissal 초기화
  currentBattleId = battleId;
  $battleRoomSummary.textContent = '불러오는 중···';
  $battleRoomPlayers.innerHTML = '';
  $battleRoomTask.textContent = '';
  $battleRoomTask.className = 'battle-room-task empty';
  $battleRoomStatus.textContent = '';
  $battleRoomStatus.classList.remove('error');
  $battleRoomCancelBtn.hidden = false; // v0.1.27 — 카운트다운 후 hidden 상태 복원
  $battleRoomAcceptBtn.hidden = true;
  $battleRoomStartBtn.hidden = true;
  // 셔플 슬롯 초기화 (이전 배틀 결과 잔류 방지)
  const _shuffleSlot = document.getElementById('battleRoomShuffleSlot');
  if (_shuffleSlot) { _shuffleSlot.hidden = true; _shuffleSlot.innerHTML = ''; }

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

  // v0.1.63 — 배틀룸 열었음을 DB에 기록 (파트너 재접속/새탭 감지용)
  if (sb && myNickname) {
    sb.from('battle_players')
      .update({ room_opened_at: new Date().toISOString() })
      .eq('battle_id', battleId)
      .eq('nickname', myNickname)
      .then(() => console.log('[RoomSignal] room_opened_at 업데이트'));
  }

  // v0.1.71 — 배틀룸 열리면 room signal 폴링 중지 (모달 켜졌으니 불필요)
  stopRoomSignalPolling();

  // v0.1.18 — 배틀 룸 열리면 Realtime 구독 시작 (배틀 완료 전까지만)
  console.log('[Realtime] openBattleRoom — status:', currentBattleData?.battle?.status);
  if (currentBattleData?.battle?.status !== 'done') {
    subscribeBattleRoom(battleId);
    startBattleRoomPolling(battleId); // v0.1.67 — WebSocket 백업 폴링
  }
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
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE'
    : battle.mode === 'shuffle' ? '🔀 SHUFFLE MODE'
    : '🎲 MOTO MODE';
  // v0.1.31 — 로컬 타이머 상태 기준
  const { label: statusLabel } = getBattleDisplayStatus(battle);

  $battleRoomSummary.textContent = `${modeLabel} · ${minutes}분 · ${statusLabel}`;

  // 플레이어 카드 — 정확히 2칸 (생성자 + 친구)
  const creator = players.find((p) => p.is_creator);
  const friend = players.find((p) => !p.is_creator);
  const meIsCreator = creator && creator.nickname === myNickname;
  const meIsFriend = friend && friend.nickname === myNickname;
  const alreadyJoined = meIsCreator || meIsFriend;

  // v0.1.64 — 파트너 닉네임 로컬 캐시 (배틀 삭제 후에도 리더보드 유지)
  if (meIsCreator && friend?.nickname) saveKnownPartner(friend.nickname);
  if (meIsFriend && creator?.nickname) saveKnownPartner(creator.nickname);

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

  // 작업 표시
  if (battle.mode === 'common' && battle.task_common) {
    $battleRoomTask.textContent = `🍅 오늘의 공통 미션: ${battle.task_common}`;
    $battleRoomTask.className = 'battle-room-task';
  } else if (battle.mode === 'shuffle') {
    const _taskCommon = battle.task_common;
    $battleRoomTask.textContent = _taskCommon
      ? `🔀 SHUFFLE 미션: ${_taskCommon}`
      : `🔀 SHUFFLE — 내 할 일 ${categories.length}개, 둘이 합쳐서 한번에 가챠!`;
    $battleRoomTask.className = 'battle-room-task';
  } else if (battle.mode === 'separate') {
    $battleRoomTask.textContent = '🎲 MOTO MODE — 각자 카테고리에서 가챠 돌리기';
    $battleRoomTask.className = 'battle-room-task';
  }

  // 버튼 상태 결정
  $battleRoomAcceptBtn.hidden = true;
  $battleRoomGachaBtn.hidden = true;
  $battleRoomStartBtn.hidden = true;
  $battleRoomStatus.classList.remove('error');

  if (!alreadyJoined && !friend) {
    // 아직 참여 안 했고 자리 비어있으면 수락 가능
    $battleRoomAcceptBtn.hidden = false;
    $battleRoomStatus.textContent = '이 배틀에 참여하시겠어요?';
  } else if (alreadyJoined && !friend) {
    // v0.1.18 — LIVE dot: 새로고침 불필요하다는 시각적 표시
    $battleRoomStatus.innerHTML = '친구가 링크를 열고 수락하길 기다리는 중··· <span class="live-dot" title="자동 새로고침 중">●</span>';
  } else if (alreadyJoined && friend) {
    // 배틀이 이미 진행 중인 경우 — 재접속한 유저가 모달을 열었을 때
    if (battle.status === 'active') {
      if (timer.isRunning && activeBattleId === battle.id) {
        $battleRoomStatus.textContent = '⏱ 배틀 진행 중이에요. 타이머 화면으로 이동하세요.';
      } else {
        $battleRoomStatus.innerHTML = '⏱ 배틀 진행 중! 타이머 동기화 중··· <span class="live-dot">●</span>';
        setTimeout(() => syncActiveBattleTimer(battle), 0);
      }
      return;
    }

    // v0.1.67 — MOTO MODE 가챠 체크: DB의 battle_players.task 우선
    // v0.1.70 — DB 미싱 시 localStorage currentTask fallback + DB 즉시 동기화
    const myDbTask = meIsCreator ? creator?.task : friend?.task;
    const effectiveMyTask = myDbTask || (battle.mode === 'separate' ? currentTask : null);
    if (battle.mode === 'separate' && !myDbTask && effectiveMyTask && currentBattleId && sb && myNickname) {
      // localStorage에 가챠 결과 있는데 DB에 없으면 동기화 (재수락 후 task null 케이스)
      sb.from('battle_players').update({ task: effectiveMyTask })
        .eq('battle_id', currentBattleId).eq('nickname', myNickname)
        .then(() => console.log('[Sync] currentTask → battle_players.task 동기화'));
    }

    // 셔플: task_common 없으면 가챠 필요 / MOTO: 개인 task 없으면 가챠 필요
    const _needsGacha = battle.mode === 'shuffle' ? !battle.task_common : (battle.mode === 'separate' && !currentTask);

    // 셔플 task_common이 이미 설정돼 있으면 결과 표시 복원 (모달 닫았다 재오픈 시 유지)
    if (battle.mode === 'shuffle' && battle.task_common) {
      const $slot = document.getElementById('battleRoomShuffleSlot');
      if ($slot && $slot.innerHTML === '') {
        $slot.hidden = false;
        $slot.innerHTML = `<div class="shuffle-gacha-done">🎰 ${escapeHtml(battle.task_common)}</div>`;
      }
    }

    if (_needsGacha) {
      $battleRoomGachaBtn.hidden = false;
      $battleRoomGachaBtn.textContent = battle.mode === 'shuffle' ? '🎰 가챠 돌리기' : '🎰 가챠 먼저 돌리기';
      $battleRoomStatus.textContent = battle.mode === 'shuffle'
        ? '🔀 먼저 누르는 사람이 공통 미션을 뽑아요!'
        : '가챠를 먼저 돌려서 내 작업을 정해주세요!';
    } else if (meIsCreator) {
      if (battle.mode === 'separate') {
        const friendHasTask = !!(friend?.task);
        if (!friendHasTask) {
          $battleRoomStatus.innerHTML = '친구가 가챠를 돌리길 기다리는 중··· <span class="live-dot">●</span>';
        } else {
          $battleRoomStartBtn.hidden = false;
          $battleRoomStatus.innerHTML = '둘 다 준비됐어요! 시작하면 친구도 동시에 카운트다운돼요. <span class="live-dot">●</span>';
        }
      } else if (battle.mode === 'shuffle') {
        // task_common 확정 → 둘 다 바로 시작 가능
        $battleRoomStartBtn.hidden = false;
        $battleRoomStatus.innerHTML = '공통 미션 확정! 시작하면 친구도 동시에 시작돼요. <span class="live-dot">●</span>';
      } else {
        $battleRoomStartBtn.hidden = false;
        $battleRoomStatus.textContent = '둘 다 준비됐어요. 시작하면 친구도 동시에 시작돼요.';
      }
    } else {
      // 친구(수락자): 가챠 완료 or TOM MODE or SHUFFLE(task_common 확정)
      $battleRoomStatus.innerHTML = battle.mode === 'shuffle'
        ? '공통 미션 확정! 시작하면 친구도 동시에 시작돼요. <span class="live-dot">●</span>'
        : '둘 다 준비됐어요. 시작하면 친구도 동시에 시작돼요. <span class="live-dot">●</span>';
      $battleRoomStartBtn.hidden = false;
      $battleRoomStartBtn.textContent = '▶ 타이머 시작';
    }
  } else if (!alreadyJoined && friend) {
    $battleRoomStatus.textContent = '이미 두 사람이 참여한 배틀이에요. 새 배틀을 만들어주세요.';
    $battleRoomStatus.classList.add('error');
  }
}

async function acceptBattle() {
  if (!sb || !currentBattleId || !myNickname) return;
  $battleRoomAcceptBtn.disabled = true;
  $battleRoomStatus.textContent = '참여 등록 중···';

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

  // 셔플 모드: 수락자의 카테고리를 창조자의 shared_pool에 병합
  if (currentBattleData?.battle?.mode === 'shuffle' && categories.length > 0) {
    try {
      const existing = JSON.parse(currentBattleData.battle.shared_pool || '[]');
      const merged = [...new Set([...existing, ...categories])].slice(0, 50); // 중복 제거, 최대 50개
      const mergedJson = JSON.stringify(merged);
      await sb.from('battles').update({ shared_pool: mergedJson }).eq('id', currentBattleId);
      if (currentBattleData.battle) currentBattleData.battle.shared_pool = mergedJson;
    } catch (e) {
      console.warn('[Shuffle] 풀 병합 실패:', e);
    }
  }

  await refreshBattleRoom();

  // v0.1.17 — 수락자 쪽 localStorage에도 배틀 저장 (Supabase SELECT 정책 없을 때 fallback 보장)
  // 공개 배틀은 친구 배틀 목록에 저장하지 않음 (분리)
  if (currentBattleData?.battle && !currentBattleData.battle.is_public) {
    addToMyBattles({ ...currentBattleData.battle, _isCreator: false });
  }
  if (!currentBattleData?.battle?.is_public) {
    await renderMyBattles();  // 수락자 쪽 배틀카드 목록에도 추가
  }

  // v0.1.62 — 수락자도 watchBattle 구독: 창조자가 배틀룸 열었을 때 Broadcast 수신 보장
  if (currentBattleId) subscribeWatchBattle(currentBattleId);
}

/** SHUFFLE MODE 전용: 배틀룸 모달 안에서 인라인 가챠 스핀 */
async function spinShuffleGacha() {
  let pool = [];
  try { pool = JSON.parse(currentBattleData?.battle?.shared_pool || '[]'); } catch {}
  if (pool.length < 1) { alert('할 일 풀이 비어있어요. 잠시 후 다시 시도해주세요.'); return; }

  const $slot = document.getElementById('battleRoomShuffleSlot');
  if (!$slot) return;

  $battleRoomGachaBtn.disabled = true;
  $slot.hidden = false;

  const ITEM_HEIGHT = 80;
  const TOTAL_FILL = 30;
  const SPIN_DURATION = 1800;

  // 결과 결정 (연속 중복 방지)
  let winner = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length >= 2 && winner === currentTask) {
    do { winner = pool[Math.floor(Math.random() * pool.length)]; } while (winner === currentTask);
  }

  // 릴 시퀀스 생성
  const sequence = [];
  let lastIdx = -1;
  for (let i = 0; i < TOTAL_FILL; i++) {
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && idx === lastIdx);
    lastIdx = idx;
    sequence.push(pool[idx]);
  }
  sequence.push(winner);
  const targetIndex = sequence.length - 1;

  $slot.innerHTML = `
    <div class="slot-window">
      <div class="slot-reel" id="shuffleSlotReel">
        ${sequence.map((c, i) => `
          <div class="slot-item${i === targetIndex ? ' winner-item' : ''}" data-idx="${i}">
            ${escapeHtml(c)}
          </div>
        `).join('')}
      </div>
    </div>`;

  const $reel = document.getElementById('shuffleSlotReel');
  $reel.style.transition = 'none';
  $reel.style.transform = 'translateY(0)';
  $reel.offsetHeight; // force reflow
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => requestAnimationFrame(r));

  // 80px 단일 창 — winner가 창 정상(position 0)에 오게 (240px 3칸 창과 달리 -1 오프셋 불필요)
  const targetY = -targetIndex * ITEM_HEIGHT;
  $reel.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.5, 0.18, 1)`;
  $reel.style.transform = `translateY(${targetY}px)`;

  await new Promise(r => setTimeout(r, SPIN_DURATION));

  const $winnerEl = $reel.querySelector('.winner-item');
  if ($winnerEl) $winnerEl.classList.add('locked', 'is-center');

  await new Promise(r => setTimeout(r, 450));

  // 결과 저장: battle_players.task 아닌 battles.task_common (공유 결과)
  currentTask = winner;
  localStorage.setItem(STORAGE.currentTask, winner);
  if (sb && currentBattleId) {
    try {
      await sb.from('battles').update({ task_common: winner }).eq('id', currentBattleId);
      if (currentBattleData?.battle) currentBattleData.battle.task_common = winner;
    } catch (e) { console.warn('[Shuffle] task_common 저장 실패:', e); }
  }

  // 슬롯 → 결과 표시 교체
  $slot.innerHTML = `<div class="shuffle-gacha-done">🎰 ${escapeHtml(winner)}</div>`;

  // 가챠 버튼 → 타이머 시작 버튼 (친구도 Realtime으로 자동 갱신됨)
  $battleRoomGachaBtn.hidden = true;
  $battleRoomStartBtn.hidden = false;
  $battleRoomStartBtn.textContent = '▶ 타이머 시작';
  $battleRoomStatus.innerHTML = '공통 미션 확정! 친구도 같은 결과를 받았어요. <span class="live-dot">●</span>';
}

// v0.1.17 — 3·2·1 카운트다운 (얼굴 양 옆 배치)
// v0.1.72 — scheduledStartAt: 양쪽이 동일한 미래 시각에 동시 출발 (스텝 스킵 없음)
// v0.1.78 — scheduledStartAt 파라미터:
//   null  → 창조자(버튼 클릭): DB 업데이트 + Broadcast 신호 발송 후 즉시 카운트다운
//   1     → 수신자(상대방 신호 받은 쪽): 신호 수신 후 즉시 카운트다운 (DB/Broadcast 재발송 없음)
async function startBattleWithCountdown(scheduledStartAt = null) {
  if (!currentBattleData || isStartingBattle || timer.isRunning) return;
  // v0.1.30 — MOTO MODE에서 내 가챠가 아직 안 됐으면 카운트다운 차단
  // v0.1.68 — localStorage currentTask 대신 DB값(battle_players.task) 사용 (stale 방지)
  const _meRow = currentBattleData?.players?.find(p => p.nickname === myNickname);
  const _myDbTask = _meRow?.task || null;
  // MOTO MODE만 개인 가챠 완료 필요, SHUFFLE은 task_common 사용
  if (currentBattleData.battle?.mode === 'separate' && !_myDbTask) return;
  isStartingBattle = true;

  // v0.1.19/75/78 — 창조자만 DB 업데이트 + Broadcast 발송
  if (scheduledStartAt === null) {
    // Broadcast로 상대방에게 즉시 신호 (DB 이벤트보다 빠름)
    const _bcast = { type: 'broadcast', event: 'countdown-start', payload: {} };
    realtimeChannel?.send(_bcast);
    watchChannel?.send(_bcast);
    console.log('[Countdown] 시작 신호 Broadcast 전송');

    // DB 업데이트 (fire-and-forget) — Realtime 이벤트로 상대방에게 전달되는 백업 경로
    if (sb && currentBattleId) {
      sb.from('battles')
        .update({ status: 'active', countdown_started_at: new Date().toISOString() })
        .eq('id', currentBattleId)
        .then(({ error }) => {
          if (error) sb.from('battles').update({ status: 'active' }).eq('id', currentBattleId);
        });
    }
  }

  $battleRoomStartBtn.hidden = true;
  $battleRoomCancelBtn.hidden = true;
  // v0.1.78 — 준비 중 단계 삭제: 양쪽 즉시 3-2-1 시작

  const countEl = document.createElement('div');
  countEl.className = 'battle-countdown';
  $battleRoomModal.querySelector('.modal-actions').before(countEl);

  const mottoFaceEl = document.getElementById('motto-face');
  const tomFaceEl = document.getElementById('tom-face');

  // 모토(왼쪽) · 숫자 · 톰(오른쪽) 가로 배치
  function renderCountRow(content) {
    countEl.innerHTML = '';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:10px;padding:4px 0';

    if (mottoFaceEl) row.appendChild(makeFaceSvg(mottoFaceEl, '237 45 98 95', '80px'));

    const mid = document.createElement('div');
    mid.className = 'battle-countdown-num';
    mid.innerHTML = content;
    row.appendChild(mid);

    if (tomFaceEl) row.appendChild(makeFaceSvg(tomFaceEl, '405 45 98 95', '80px'));

    countEl.appendChild(row);
  }

  // 양쪽 모두 스킵 없이 3·2·1·시작! 풀 카운트다운
  for (let n = 3; n >= 1; n--) {
    renderCountRow(n);
    await new Promise(r => setTimeout(r, 900));
  }
  renderCountRow('시작!');
  playHifive();
  await new Promise(r => setTimeout(r, 750));

  countEl.remove();
  startBattleTimer();
}

// 재접속 동기화: countdown_started_at 기준으로 남은 시간 계산 후 타이머 직접 시작
// 카운트다운 애니메이션 없이 현재 진행 시점에서 합류
function syncActiveBattleTimer(battle) {
  if (!battle?.countdown_started_at || isStartingBattle || timer.isRunning) return false;
  const battleStartMs = new Date(battle.countdown_started_at).getTime() + 4000; // 3-2-1-GO ≈ 4초
  const remainingMs = (battleStartMs + battle.duration_sec * 1000) - Date.now();
  if (remainingMs <= 0) return false;
  console.log('[Sync] 재접속 타이머 동기화:', Math.ceil(remainingMs / 1000), '초 남음');
  isStartingBattle = true;
  startBattleTimer(Math.ceil(remainingMs / 1000));
  return true;
}

function startBattleTimer(overrideRemaining = null) {
  if (!currentBattleData) return;
  stopBattleRoomPolling(); // v0.1.67
  hideBattleLock();  // v0.1.15 — 배틀 시작 시 타이머 잠금 해제
  const { battle } = currentBattleData;
  activeBattleId = battle.id;   // v0.1.17 — 인증샷 업로드용
  localStorage.setItem('tomotto_activeBattleId', battle.id);

  // v0.1.17 — 새 배틀 시작 시 이전 인증샷 초기화 (다른 배틀의 스크린샷 잔류 방지)
  $lastCaptureImg.src = '';
  $lastCapture.hidden = true;
  localStorage.removeItem(STORAGE.lastCapture);
  lastCapturedDataUrl = null;
  // URL에서 ?battle= 제거 — 새로고침 시 모달 재오픈 방지
  if (location.search.includes('battle=')) {
    history.replaceState({}, '', location.pathname);
  }
  // 메인 타이머에 배틀 작업 적용
  // MOTO: 본인 가챠 결과 / TOM·SHUFFLE: task_common (공통 미션)
  let task = battle.mode === 'separate' ? currentTask : battle.task_common;
  currentTask = task;
  localStorage.setItem(STORAGE.currentTask, task);
  showGachaResult(task, false);

  // 시간 설정 — overrideRemaining은 재접속 동기화 시 경과 시간을 제외한 실제 남은 시간
  timer.duration = battle.duration_sec;
  timer.remaining = overrideRemaining ?? battle.duration_sec;
  updateTimerDisplay();

  closeBattleRoom();

  // 타이머 시작 (기존 메인 타이머 사용)
  startTimer();

  unsubscribeBattleRoom();   // v0.1.18 — battle_players 구독 해제
  unsubscribeBattleStart();  // v0.1.19 — battles UPDATE 구독 해제
  unsubscribeWatchBattle();  // v0.1.27 — 친구 수락 대기 채널 해제
  isStartingBattle = false;  // v0.1.19 — 플래그 초기화

  // v0.1.17 — 배틀 시작 시 개인 탭으로 자동 전환 + 타이머 섹션으로 스크롤
  switchTab('personal');
  document.querySelector('.timer-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeBattleRoom() {
  // v0.1.18 — 모달만 닫고 구독은 유지 (배틀 시작 전까지 친구 수락 감지 계속)
  battleRoomUserDismissed = true;  // v0.1.64 — 유저가 의도적으로 닫음 → room_opened_at 자동 재오픈 방지
  stopBattleRoomPolling(); // v0.1.67
  if (typeof $battleRoomModal.close === 'function') $battleRoomModal.close();
  else $battleRoomModal.removeAttribute('open');
  // v0.1.63 — room_opened_at 초기화 (닫은 후 파트너 재접속 시 stale 신호 방지)
  if (sb && myNickname && currentBattleId) {
    sb.from('battle_players')
      .update({ room_opened_at: null })
      .eq('battle_id', currentBattleId)
      .eq('nickname', myNickname)
      .then(() => {});
  }
}

// v0.1.18/19 — Supabase Realtime 구독: battle_players INSERT + battles UPDATE 동시 감지
function subscribeBattleRoom(battleId) {
  console.log('[Realtime] subscribeBattleRoom 호출됨 | battleId:', battleId, '| sb 있음:', !!sb);
  if (!sb || !battleId) {
    console.warn('[Realtime] 중단 — sb:', !!sb, '/ battleId:', battleId);
    return;
  }
  unsubscribeBattleRoom();  // 기존 채널 먼저 해제

  realtimeChannel = sb.channel(`battle-room-${battleId}`)
    // ① 친구 수락 감지 (battle_players INSERT)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'battle_players', filter: `battle_id=eq.${battleId}` },
      async (payload) => {
        console.log('[Realtime] 친구 수락 INSERT 감지:', payload);
        renderMyBattles();

        if ($battleRoomModal.open && currentBattleId === battleId) {
          await refreshBattleRoom();
        } else {
          currentBattleId = battleId;
          await openBattleRoom(battleId);
        }
      }
    )
    // ② 친구 task/room_opened_at 변경 감지 (battle_players UPDATE)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'battle_players', filter: `battle_id=eq.${battleId}` },
      async (payload) => {
        console.log('[Realtime] battle_players UPDATE 감지:', payload);
        // v0.1.63 — 파트너의 room_opened_at 변경 → 배틀룸 자동 오픈
        if (payload.new?.room_opened_at && payload.new?.nickname !== myNickname && !$battleRoomModal.open && !battleRoomUserDismissed) {
          console.log('[RoomSignal] 파트너 배틀룸 열림 → 자동 오픔:', payload.new?.nickname);
          currentBattleId = battleId;
          // v0.1.68 — subscribeWatchBattle과 동일하게 openBattleRoom() 직접 호출
          await openBattleRoom(battleId);
          return;
        }
        if ($battleRoomModal.open && currentBattleId === battleId) {
          await refreshBattleRoom();  // 친구 task 반영 → 시작 버튼 표시 여부 갱신
        }
      }
    )
    // ③ 누가 먼저 시작하든 상대방 자동 카운트다운 (battles UPDATE) — v0.1.19 양방향
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battleId}` },
      async (payload) => {
        console.log('[Realtime] battles UPDATE 감지:', payload);
        // 셔플 task_common 업데이트 → 파트너 화면에 결과 반영
        if (payload.new?.mode === 'shuffle' && payload.new?.task_common && payload.new?.status !== 'active') {
          if ($battleRoomModal.open && currentBattleId === battleId) {
            await refreshBattleRoom();
          }
          return;
        }
        if (payload.new?.status !== 'active') return;
        if (isStartingBattle || timer.isRunning) return;  // 내가 이미 시작 중이면 무시

        unsubscribeBattleRoom();  // 중복 트리거 방지

        // 배틀 룸 모달이 닫혀있으면 데이터 로드 후 열기
        if (!$battleRoomModal.open) {
          currentBattleId = battleId;
          const result = await fetchBattle(battleId);
          if (result?.battle) currentBattleData = result;
          if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
          else $battleRoomModal.setAttribute('open', '');
        }
        await startBattleWithCountdown(1);  // v0.1.78 — 수신자: 즉시 시작
      }
    )
    // ④ v0.1.62 — Broadcast: 상대방이 배틀룸을 열면 나도 자동으로 모달 열기
    .on('broadcast', { event: 'room-opened' }, async ({ payload }) => {
      if (payload?.by === myNickname) return;  // 내가 보낸 건 무시
      if ($battleRoomModal.open) return;        // 이미 열려있으면 무시
      console.log('[Broadcast] 파트너가 배틀룸 열었음 → 나도 열기:', payload?.by);
      currentBattleId = battleId;
      const result = await fetchBattle(battleId);
      if (result?.battle) currentBattleData = result;
      if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
      else $battleRoomModal.setAttribute('open', '');
      await refreshBattleRoom();
    })
    // ⑤ v0.1.75/78 — Broadcast: 카운트다운 시작 신호 수신
    .on('broadcast', { event: 'countdown-start' }, async () => {
      if (isStartingBattle || timer.isRunning) return;
      console.log('[Broadcast] countdown-start 수신 → 즉시 시작');
      if (!$battleRoomModal.open) {
        currentBattleId = battleId;
        const result = await fetchBattle(battleId);
        if (result?.battle) currentBattleData = result;
        if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
        else $battleRoomModal.setAttribute('open', '');
      }
      await startBattleWithCountdown(1);  // v0.1.78 — 수신자: 즉시 시작
    })
    .subscribe(async (status) => {
      console.log('[Realtime] 구독 상태:', status, '/ battleId:', battleId);
      if (status === 'SUBSCRIBED') {
        updateRealtimeStatusDot(true);
        // v0.1.63 — 구독 직후 파트너 room_opened_at 확인 (새탭/새로고침 케이스)
        if (sb && myNickname && !$battleRoomModal.open && !battleRoomUserDismissed) {
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          sb.from('battle_players')
            .select('nickname, room_opened_at')
            .eq('battle_id', battleId)
            .neq('nickname', myNickname)
            .then(({ data }) => {
              const partnerInRoom = data?.some(r => r.room_opened_at && r.room_opened_at > fiveMinAgo);
              if (partnerInRoom && !$battleRoomModal.open && !battleRoomUserDismissed) {
                console.log('[RoomSignal] 구독 시점에 파트너 이미 배틀룸 → 자동 오픔');
                fetchBattle(battleId).then(result => {
                  if (result?.battle) currentBattleData = result;
                  if (!$battleRoomModal.open && !battleRoomUserDismissed) {
                    if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
                    else $battleRoomModal.setAttribute('open', '');
                    refreshBattleRoom();
                  }
                });
              }
            });
        }
        // 구독 시점에 이미 battles.status = active인 경우
        // v0.1.128 — countdown_started_at null이어도 카운트다운 시작 (버그 수정)
        if (sb && !timer.isRunning && !isStartingBattle) {
          try {
            const { data: bData } = await sb.from('battles')
              .select('status, countdown_started_at')
              .eq('id', battleId).single();
            if (bData?.status === 'active') {
              const _satMs = bData.countdown_started_at
                ? new Date(bData.countdown_started_at).getTime() : 0;
              const _isRecent = !_satMs || (Date.now() - _satMs < 10000);
              if (_isRecent) {
                console.log('[Realtime] 구독 시 battles.status=active 감지 → 즉시 카운트다운');
                await startBattleWithCountdown(1);
              } else if (currentBattleData?.battle) {
                console.log('[Realtime] 구독 시 배틀 진행 중 감지 → 재접속 타이머 동기화');
                syncActiveBattleTimer(currentBattleData.battle);
              }
            }
          } catch (_e) { /* 무시 */ }
        }
        // v0.1.62 — Broadcast (보조 수단 유지)
        if (myNickname) {
          realtimeChannel?.send({
            type: 'broadcast',
            event: 'room-opened',
            payload: { by: myNickname },
          });
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('[Realtime] 구독 실패 또는 타임아웃. SELECT 정책 확인 필요.');
        updateRealtimeStatusDot(false);
      }
    });
}

function unsubscribeBattleRoom() {
  if (realtimeChannel && sb) {
    sb.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

// v0.1.67 — 폴링 백업: Realtime WebSocket 불안정 시 타이머 동기화 보장 (카카오톡 등)
function startBattleRoomPolling(battleId) {
  stopBattleRoomPolling();
  const knownStatus = currentBattleData?.battle?.status;
  if (knownStatus === 'active' || knownStatus === 'done') {
    console.log('[Poll] status가 이미', knownStatus, '— 폴링 건너뜀');
    return;
  }
  console.log('[Poll] 배틀룸 폴링 시작 | battleId:', battleId, '| 초기 status:', knownStatus);
  battleRoomPollInterval = setInterval(async () => {
    // v0.1.128 — dialog.open 대신 hasAttribute로 확인 (일부 WebView 환경 호환성)
    const _modalOpen = $battleRoomModal.open || $battleRoomModal.hasAttribute('open');
    if (timer.isRunning || isStartingBattle || !_modalOpen) {
      stopBattleRoomPolling(); return;
    }
    if (!sb || !battleId) return;
    try {
      const { data } = await sb.from('battles').select('status, countdown_started_at').eq('id', battleId).single();
      if (!data) return;
      if (data.status === 'done') { stopBattleRoomPolling(); return; }
      if (data.status === 'active' && !timer.isRunning && !isStartingBattle) {
        const _satMs = data.countdown_started_at
          ? new Date(data.countdown_started_at).getTime() : 0;
        const _isRecent = !_satMs || (Date.now() - _satMs < 10000); // v0.1.128 — null이면 최신으로 간주
        stopBattleRoomPolling();
        const result = await fetchBattle(battleId);
        if (result?.battle) currentBattleData = result;
        if (_isRecent) {
          console.log('[Poll] battles.status=active 감지 → 카운트다운 시작');
          await startBattleWithCountdown(1);
        } else {
          console.log('[Poll] 배틀 진행 중 감지 → 재접속 타이머 동기화');
          syncActiveBattleTimer(currentBattleData?.battle);
        }
      }
    } catch (err) { console.warn('[Poll] 폴링 오류:', err); }
  }, 2000);  // v0.1.75 — 5초→2초 (타이머 동기화 반응성 개선)
}

function stopBattleRoomPolling() {
  if (battleRoomPollInterval) {
    clearInterval(battleRoomPollInterval);
    battleRoomPollInterval = null;
    console.log('[Poll] 배틀룸 폴링 중지');
  }
}

// v0.1.128 — 카카오톡 IAB 등 백그라운드 throttling 대응:
// 화면이 다시 활성화될 때 즉시 배틀 상태 확인
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) return;
  if (!sb || !currentBattleId || timer.isRunning || isStartingBattle) return;
  const _modalOpen = $battleRoomModal?.open || $battleRoomModal?.hasAttribute('open');
  if (!_modalOpen) return;
  try {
    const { data } = await sb.from('battles')
      .select('status, countdown_started_at')
      .eq('id', currentBattleId).single();
    if (!data || data.status !== 'active') return;
    console.log('[Visibility] 화면 복귀 시 battles.status=active 감지 → 동기화');
    const _satMs = data.countdown_started_at
      ? new Date(data.countdown_started_at).getTime() : 0;
    const _isRecent = !_satMs || (Date.now() - _satMs < 10000);
    const result = await fetchBattle(currentBattleId);
    if (result?.battle) currentBattleData = result;
    if (_isRecent) {
      await startBattleWithCountdown(1);
    } else if (currentBattleData?.battle) {
      syncActiveBattleTimer(currentBattleData.battle);
    }
  } catch (_e) { /* 무시 */ }
});

// v0.1.27 — 배틀 생성 후 친구 수락 대기 전용 채널 (룸 뷰 채널과 독립)
// openBattleRoom 호출 시 realtimeChannel이 교체돼도 이 채널은 유지됨
function subscribeWatchBattle(battleId) {
  if (!sb || !battleId) return;
  if (watchChannel && sb) { sb.removeChannel(watchChannel); watchChannel = null; }
  watchBattleId = battleId;
  watchChannel = sb.channel(`battle-watch-${battleId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'battle_players', filter: `battle_id=eq.${battleId}` },
      async (payload) => {
        console.log('[Watch] 친구 수락 감지:', payload);
        renderMyBattles();
        if (!$battleRoomModal.open) {
          currentBattleId = battleId;
          await openBattleRoom(battleId);
        } else if (currentBattleId === battleId) {
          await refreshBattleRoom();
        }
      }
    )
    // v0.1.29 — MOTO MODE: 나나가 배틀 시작 버튼 누르면 솜솜 쪽 자동 카운트다운
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battleId}` },
      async (payload) => {
        console.log('[Watch] battles UPDATE 감지:', payload);
        // 셔플 task_common 업데이트 → 파트너 화면 반영
        if (payload.new?.mode === 'shuffle' && payload.new?.task_common && payload.new?.status !== 'active') {
          if ($battleRoomModal.open && currentBattleId === battleId) await refreshBattleRoom();
          return;
        }
        if (payload.new?.status !== 'active') return;
        if (isStartingBattle || timer.isRunning) return;

        unsubscribeWatchBattle();  // 중복 트리거 방지

        if (!$battleRoomModal.open) {
          currentBattleId = battleId;
          const result = await fetchBattle(battleId);
          if (result?.battle) currentBattleData = result;
          if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
          else $battleRoomModal.setAttribute('open', '');
        }
        await startBattleWithCountdown(1);  // v0.1.78 — 수신자: 즉시 시작
      }
    )
    // v0.1.63 — battle_players UPDATE: 파트너 room_opened_at 감지 (watchChannel 경로)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'battle_players', filter: `battle_id=eq.${battleId}` },
      async (payload) => {
        if (payload.new?.room_opened_at && payload.new?.nickname !== myNickname && !$battleRoomModal.open && !battleRoomUserDismissed) {
          console.log('[Watch RoomSignal] 파트너 배틀룸 열림 → 자동 오픔:', payload.new?.nickname);
          currentBattleId = battleId;
          await openBattleRoom(battleId);
        }
      }
    )
    // v0.1.62 — Broadcast (보조 수단 유지)
    .on('broadcast', { event: 'room-opened' }, async ({ payload }) => {
      if (payload?.by === myNickname) return;
      if ($battleRoomModal.open) return;
      if (battleRoomUserDismissed) return;  // v0.1.64 — 유저가 직접 닫은 경우 재오픈 방지
      console.log('[Watch Broadcast] 파트너 배틀룸 열림 → 나도 열기:', payload?.by);
      currentBattleId = battleId;
      await openBattleRoom(battleId);
    })
    // v0.1.75/78 — Broadcast: 카운트다운 시작 신호 수신 (watchChannel 경로)
    .on('broadcast', { event: 'countdown-start' }, async () => {
      if (isStartingBattle || timer.isRunning) return;
      console.log('[Watch Broadcast] countdown-start 수신 → 즉시 시작');
      if (!$battleRoomModal.open) {
        currentBattleId = battleId;
        const result = await fetchBattle(battleId);
        if (result?.battle) currentBattleData = result;
        if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
        else $battleRoomModal.setAttribute('open', '');
      }
      await startBattleWithCountdown(1);  // v0.1.78 — 수신자: 즉시 시작
    })
    .subscribe(async (status) => {
      console.log('[Watch] 구독 상태:', status, '/ battleId:', battleId);
      if (status === 'SUBSCRIBED' && myNickname) {
        // v0.1.63 — 구독 직후 파트너 room_opened_at 확인
        if (sb && !$battleRoomModal.open) {
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          sb.from('battle_players')
            .select('nickname, room_opened_at')
            .eq('battle_id', battleId)
            .neq('nickname', myNickname)
            .then(({ data }) => {
              const partnerInRoom = data?.some(r => r.room_opened_at && r.room_opened_at > fiveMinAgo);
              if (partnerInRoom && !$battleRoomModal.open && !battleRoomUserDismissed) {
                console.log('[Watch RoomSignal] 구독 시점에 파트너 이미 배틀룸 → 자동 오픔');
                openBattleRoom(battleId);
              }
            });
        }
        // 구독 시점에 이미 battles.status = active인 경우
        // v0.1.128 — countdown_started_at null이어도 카운트다운 시작 (버그 수정)
        if (sb && !timer.isRunning && !isStartingBattle) {
          try {
            const { data: bData } = await sb.from('battles')
              .select('status, countdown_started_at')
              .eq('id', battleId).single();
            if (bData?.status === 'active') {
              const _satMs = bData.countdown_started_at
                ? new Date(bData.countdown_started_at).getTime() : 0;
              const _isRecent = !_satMs || (Date.now() - _satMs < 10000);
              if (_isRecent) {
                console.log('[Watch] 구독 시 battles.status=active 감지 → 즉시 카운트다운');
                await startBattleWithCountdown(1);
              } else if (currentBattleData?.battle) {
                console.log('[Watch] 배틀 진행 중 감지 → 재접속 타이머 동기화');
                syncActiveBattleTimer(currentBattleData.battle);
              }
            }
          } catch (_e) { /* 무시 */ }
        }
        // Broadcast (보조)
        watchChannel?.send({
          type: 'broadcast',
          event: 'room-opened',
          payload: { by: myNickname },
        });
      }
    });
}

function unsubscribeWatchBattle() {
  if (watchChannel && sb) { sb.removeChannel(watchChannel); watchChannel = null; }
  watchBattleId = null;
}

// 배틀 룸 상태 메시지에 LIVE 표시 업데이트
function updateRealtimeStatusDot(isLive) {
  const dot = $battleRoomStatus.querySelector('.live-dot');
  if (!dot) return;
  dot.style.opacity = isLive ? '1' : '0.3';
  dot.title = isLive ? '자동 새로고침 중' : '연결 중···';
}

// v0.1.19 — battles UPDATE 구독: 창조자 시작 시 친구 자동 카운트다운
function subscribeBattleStart(battleId) {
  if (!sb || !battleId) return;
  unsubscribeBattleStart();

  battleStartChannel = sb.channel(`battle-start-${battleId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'battles',
        filter: `id=eq.${battleId}`,
      },
      async (payload) => {
        console.log('[Realtime] battles UPDATE 감지:', payload);
        if (payload.new?.status !== 'active') return;
        if (isStartingBattle || timer.isRunning) return;  // 이미 시작 중이면 무시

        // 구독 즉시 해제 (중복 트리거 방지)
        unsubscribeBattleStart();

        // 배틀 룸 모달이 닫혀있으면 열기
        if (!$battleRoomModal.open) {
          currentBattleId = battleId;
          const result = await fetchBattle(battleId);
          if (result?.battle) currentBattleData = result;
          if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
          else $battleRoomModal.setAttribute('open', '');
        }

        // 카운트다운 시작 (isStartingBattle은 startBattleWithCountdown 안에서 세팅)
        await startBattleWithCountdown();
      }
    )
    .subscribe((s) => console.log('[Realtime] battle-start 구독 상태:', s, '/ battleId:', battleId));
}

function unsubscribeBattleStart() {
  if (battleStartChannel && sb) {
    sb.removeChannel(battleStartChannel);
    battleStartChannel = null;
  }
}

// v0.1.29 — 소감 저장 버튼 (저장 후 textarea 잠금, 수정 버튼으로 전환)
if ($noteUploadBtn) {
  $noteUploadBtn.addEventListener('click', async () => {
    // v0.1.29 — 수정 모드: textarea가 비활성화 상태면 다시 활성화
    if ($completionNote?.disabled) {
      $completionNote.disabled = false;
      $completionNote.focus();
      $noteUploadBtn.textContent = '저장';
      return;
    }

    const note = $completionNote?.value?.trim();
    if (!note) return;
    $noteUploadBtn.disabled = true;
    $noteUploadBtn.textContent = '저장 중···';

    if (activeBattleId && sb && myNickname) {
      const { error } = await sb.from('battle_players')
        .update({ note })
        .eq('battle_id', activeBattleId)
        .eq('nickname', myNickname);
      if (error) {
        console.warn('[Supabase] note 저장 실패:', error.message);
        $noteUploadBtn.textContent = '⚠ 저장 실패';
        $noteUploadBtn.disabled = false;
        return;
      }
    }
    localStorage.setItem(BATTLE_STORAGE.completionNote, note);
    updateLatestLogNote(note);  // v0.1.33 — 기록 탭 로그에도 소감 반영
    // v0.1.29 — 저장 완료: textarea 잠금 + 수정 버튼으로 전환 (딜레이 없음)
    if ($completionNote) $completionNote.disabled = true;
    $noteUploadBtn.disabled = false;
    $noteUploadBtn.textContent = '수정';
  });
}

// v0.1.20 — 배틀 파트너 닉네임 + 모드 반환
function getBattlePartnerInfo() {
  if (!currentBattleData) return null;
  const { battle, players } = currentBattleData;
  const creator = players.find(p => p.is_creator);
  const friend = players.find(p => !p.is_creator);
  const meIsCreator = creator?.nickname === myNickname;
  const partner = meIsCreator ? friend : creator;
  return partner ? { mode: battle.mode, partnerNick: partner.nickname } : null;
}

$battleRoomCancelBtn.addEventListener('click', closeBattleRoom);
// v0.1.33 — 기록 탭 일별 상세 닫기
document.getElementById('logDayClose')?.addEventListener('click', () => {
  const $detail = document.getElementById('logDayDetail');
  if ($detail) $detail.hidden = true;
  document.querySelectorAll('.log-cal-day[data-sel]').forEach(c => c.removeAttribute('data-sel'));
});
$battleRoomAcceptBtn.addEventListener('click', acceptBattle);
// v0.1.15 — 가챠 유도: 모달 닫고 개인 탭 → 가챠 섹션으로 이동
$battleRoomGachaBtn.addEventListener('click', () => {
  // 셔플 모드: 모달 안에서 인라인 가챠
  if (currentBattleData?.battle?.mode === 'shuffle') {
    spinShuffleGacha();
    return;
  }
  // MOTO 등 기존 모드: 개인 탭으로 이동
  showBattleLock(currentBattleId);
  closeBattleRoom();
  switchTab('personal');
  document.querySelector('.category-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$battleRoomStartBtn.addEventListener('click', () => startBattleWithCountdown());  // v0.1.77 — MouseEvent 전달 방지 (scheduledStartAt=null 보장)

// 닉네임 저장 후 이벤트 (배틀 룸 열기 재시도용)
function dispatchNickSaved() {
  document.dispatchEvent(new CustomEvent('nick-saved'));
}

// ====== v0.1.17 — 하단 탭 네비게이션 ======
// 외부(배틀 타이머 등)에서 탭 전환 가능하도록 전역 노출
let switchTab = () => {};

loadNickname(); // v0.1.65 — IIFE보다 먼저 실행해서 리더보드 첫 렌더에 닉네임 반영
(function initBottomTab() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const TAB_STORAGE_KEY = 'tomotto_active_tab';

  switchTab = function(tabId, opts = {}) {
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('tab-panel-hidden', panel.id !== `tab-${tabId}`);
    });
    // 탭 전환 시 스크롤 맨 위로 (초기 로드 제외)
    if (!opts.skipScroll) window.scrollTo(0, 0);
    localStorage.setItem(TAB_STORAGE_KEY, tabId);
    // 플로팅 타이머 바: 개인 탭이면 숨김, 다른 탭이면 타이머 실행 중일 때 표시
    updateFloatingTimerBar();
    // v0.1.32 — 소셜 탭으로 전환 시 배틀카드 상태 즉시 갱신 (timer.isRunning 반영)
    if (tabId === 'social') { renderMyBattles(); renderLeaderboard(); renderFocusFeed(); renderPublicBattles(); }
    // v0.1.33 — 기록 탭으로 전환 시 캘린더 갱신
    // v0.1.70 fix — renderAchievementsTab은 ACHIEVEMENT_DEFS가 선언된 후(스크립트 파싱 완료 후)
    // 실행돼야 함. 탭 초기화 IIFE에서 호출 시 TDZ 에러 방지를 위해 setTimeout(0) 사용.
    if (tabId === 'log') { renderLogCalendar(); renderLogNarrative(); renderLogPartnerRecord(); setTimeout(() => { renderTitlesTab(); renderAchievementsTab(); }, 0); }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) switchTab(btn.dataset.tab);
    });
  });

  // 소셜 탭에서 배틀 초대 링크로 들어왔을 때 자동 전환 (초기 로드: 스크롤 유지)
  const params = new URLSearchParams(location.search);
  const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
  if (params.has('battle')) {
    switchTab('social', { skipScroll: true });
  } else if (savedTab) {
    switchTab(savedTab, { skipScroll: true });
  }
  // 기본값(personal)은 HTML에서 이미 active 클래스로 설정돼 있음
})();

// v0.1.40 — 인앱 브라우저(카카오톡 등) 감지 → 외부 브라우저 유도 배너
function checkInAppBrowser() {
  const ua = navigator.userAgent || '';
  const isKakao = /KAKAOTALK/i.test(ua);
  const isOtherInApp = /NAVER|Instagram|FB_IAB|FBAN|Line\/|Snapchat/i.test(ua);
  if (!isKakao && !isOtherInApp) return;
  if (!localStorage.getItem('tomotto_iab_ok')) showIabBanner(isKakao);
}

function showIabBanner(isKakao) {
  if (document.getElementById('iabBanner')) return; // 중복 방지
  const banner = document.createElement('div');
  banner.className = 'iab-banner';
  banner.id = 'iabBanner';

  const msg = isKakao
    ? '카카오톡 브라우저에서는 일부 기능이 불안정해요.<br>크롬으로 열면 훨씬 잘 돼요 🙏'
    : '더 나은 경험을 위해 Chrome에서 열어주세요 🙏';

  banner.innerHTML =
    `<span class="iab-msg">${msg}</span>` +
    '<button class="iab-open-btn" id="iabCopyBtn">링크 복사</button>' +
    '<button class="iab-close-btn" id="iabCloseBtn">✕</button>';
  document.body.prepend(banner);

  document.getElementById('iabCopyBtn').addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(location.href)
        .then(() => alert('링크 복사됐어요!\nChrome 주소창에 붙여넣어 주세요.'));
    } else {
      prompt('아래 링크를 복사해서 Chrome에서 열어주세요', location.href);
    }
  });
  document.getElementById('iabCloseBtn').addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('tomotto_iab_ok', '1');
  });
}

// v0.1.69 — 앱 초기 로드 시 파트너 배틀룸 입장 여부 DB 직접 확인
// Realtime 채널 없이도 동작 → 창 닫고 새로 들어온 경우 커버
// v0.1.71 — 파트너 미입장 시 watchBattle 구독 + 주기적 폴링 추가
let _roomSignalPollInterval = null;

function stopRoomSignalPolling() {
  if (_roomSignalPollInterval) { clearInterval(_roomSignalPollInterval); _roomSignalPollInterval = null; }
}

async function checkPartnerInRoomOnInit() {
  if (!sb || !myNickname) return;
  if ($battleRoomModal?.open || battleRoomUserDismissed) return;

  let battles;
  try { battles = await loadMyBattles(); } catch (e) { return; }
  if (!battles?.length) return;

  // 공개 배틀방은 friend battle watch 시스템에서 제외 (watchBattle이 공개방 JOIN INSERT에 반응해 battleRoomModal 여는 버그 방지)
  const activeBattles = battles.filter(b => b.status !== 'done' && !b.is_public);
  if (!activeBattles.length) return;

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  let autoOpened = false;

  for (const b of activeBattles) {
    if ($battleRoomModal?.open || battleRoomUserDismissed) break;

    const { data } = await sb.from('battle_players')
      .select('nickname, room_opened_at')
      .eq('battle_id', b.id)
      .neq('nickname', myNickname);

    const partnerInRoom = data?.some(r => r.room_opened_at && r.room_opened_at > fiveMinAgo);
    if (partnerInRoom) {
      console.log('[InitCheck] 파트너 배틀룸 감지 → 자동 오픔:', b.id);
      currentBattleId = b.id;
      await openBattleRoom(b.id);
      autoOpened = true;
      break;
    }
  }

  if (!autoOpened) {
    const firstActive = activeBattles[0];
    // ① watchBattle 구독: 파트너가 나중에 배틀룸 열면 이벤트 수신
    if (!watchChannel) {
      console.log('[InitSubscribe] watchBattle 구독 시작:', firstActive.id);
      subscribeWatchBattle(firstActive.id);
    }
    // ② 주기적 DB 폴링 (15s): WebSocket 불안정 환경(카카오톡 등) 백업
    stopRoomSignalPolling();
    _roomSignalPollInterval = setInterval(async () => {
      if ($battleRoomModal?.open || battleRoomUserDismissed || timer.isRunning) {
        stopRoomSignalPolling(); return;
      }
      const freshFiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      for (const b of activeBattles) {
        if ($battleRoomModal?.open || battleRoomUserDismissed) break;
        const { data } = await sb.from('battle_players')
          .select('nickname, room_opened_at')
          .eq('battle_id', b.id)
          .neq('nickname', myNickname);
        const partnerInRoom = data?.some(r => r.room_opened_at && r.room_opened_at > freshFiveMinAgo);
        if (partnerInRoom) {
          console.log('[RoomPoll] 파트너 배틀룸 감지 → 자동 오픔:', b.id);
          stopRoomSignalPolling();
          currentBattleId = b.id;
          await openBattleRoom(b.id);
          break;
        }
      }
    }, 15000);
  }
}

// 페이지 로드 시 닉네임 + 내 배틀 복원 + 온보딩 순서 처리
// v0.1.76 — PWA 롤백: 이전에 등록된 서비스 워커 제거 (캐시 충돌 방지)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.warn('[SW] 등록 실패:', err);
  });
  // 알림 클릭 시 SW로부터 메시지 수신 → 타이머 섹션으로 이동
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIF_CLICK_FOCUS_TIMER') {
      switchTab('personal');
      requestAnimationFrame(() => {
        document.querySelector('.timer-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
}

window.addEventListener('load', () => {
  loadNickname(); // 이미 IIFE 전에 호출됐지만 재호출로 확실히 반영
  // v0.1.65/66 — 탭별 초기 렌더 (닉네임 로드 후)
  const _activeTab = localStorage.getItem('tomotto_active_tab');
  if (_activeTab === 'social') {
    renderMyBattles();
    renderLeaderboard();
    renderFocusFeed();
    renderPublicBattles();
  } else if (_activeTab === 'log') {
    renderLogCalendar(); renderLogNarrative(); renderLogPartnerRecord();
  } else {
    renderMyBattles();
  }
  setTimeout(playHifive, 400);
  initTabIcons();               // v0.1.34 — 탭 아이콘에 실제 로고 얼굴 주입
  checkInAppBrowser();          // v0.1.40 — 인앱 브라우저 감지
  initTitleAccordion();         // v0.1.85 — 칭호 아코디언 상태 복원
  initAchievementAccordion();   // v0.1.69 — 업적 아코디언 상태 복원
  subscribeFocusFeed();         // v0.1.79 B — 집중 피드 실시간 구독
  subscribePublicBattles();     // v0.1.79 C — 공개 배틀방 실시간 구독

  const params = new URLSearchParams(location.search);
  // v0.1.128 — URL 파라미터(웹/IAB) + AndroidBridge(네이티브 앱) 모두 확인
  let battleId = params.get('battle');
  if (!battleId && window.AndroidBridge) {
    // Capacitor 네이티브: MainActivity가 Android Intent에서 추출한 battle ID
    const nativeId = window.AndroidBridge.getLaunchBattleId?.();
    if (nativeId) battleId = nativeId;
  }

  if (battleId) {
    // v0.1.70 — 실제 참여자인 경우에만 잠금 배너 표시 (카드 삭제 후 재진입 버그 방지)
    loadMyBattles().then(list => {
      if (list?.some(b => b.id === battleId)) showBattleLock(battleId);
    });
    // 온보딩 완료 후 소셜탭으로 이동하고 배틀룸 오픔
    // (초대받은 신규 유저도 앱 설명을 먼저 봐야 하므로 온보딩 유지)
    initOnboardingTooltip(() => {
      switchTab('social');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => openBattleRoom(battleId), 300);
    });
  } else {
    // 일반 진입: 온보딩 + v0.1.69 파트너 배틀룸 입장 확인
    // initOnboarding();        // v0.1.34 — Shepherd.js 버전 (보관)
    initOnboardingTooltip();
    // 배틀 카드 로드 완료 후 파트너 room_opened_at 체크
    setTimeout(() => checkPartnerInRoomOnInit(), 1500);
  }
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
  logs: 'tomotto_logs',                      // v0.1.33 — 완료 로그 (기록 탭)
  logCaptures: 'tomotto_log_captures',       // v0.1.34 — 로그ID → 인증샷 data URL 맵
  achievements: 'tomotto_achievements',      // v0.1.69 — 업적 달성 상태
  totalGachaCount: 'tomotto_total_gacha',    // v0.1.69 — 전체 가챠 누적 횟수
  noRerollStreak: 'tomotto_noreroll_streak', // v0.1.69 — 연속 리롤 없이 완료 횟수
  noRerollTotal:  'tomotto_noreroll_total',  // v0.1.70 — 누적 리롤 없이 완료 횟수 (C-2)
  pauseFreeCount: 'tomotto_pause_free',      // v0.1.70 — 일시정지 없이 완료 횟수 (B-4/B-5)
  hiddenTabCount: 'tomotto_hidden_tab',      // v0.1.70 — 타이머 중 탭 이탈 횟수 (E-1)
};

// ====== 금칙어 필터 (친구 배틀·공개방 제목에만 적용) ======
// 카테고리 이름(개인 탭)은 필터링 대상이 아님

const BANNED_WORDS = [
  '씨발','시발','씨바','시바','씨팔','시팔','쉬발','쉬팔',
  '개새끼','개새','병신','미친놈','미친년','지랄','꺼져',
  '새끼','존나','좆','보지','자지','젖','개년','개놈','썅',
  '엿같','닥쳐','꺼지','개소리','개같은','ㅅㅂ','ㅂㅅ','ㅈㄹ','ㅂㅈ',
  'fuck','shit','bitch','asshole','cunt',
];

/** 금칙어 포함 여부 검사 — 공백 제거 후 소문자 비교 */
function hasBannedWord(text) {
  if (!text) return false;
  const normalized = text.replace(/\s+/g, '').toLowerCase();
  return BANNED_WORDS.some(w => normalized.includes(w.toLowerCase()));
}

// ====== 공개 배틀방 숨기기 ======
const STORAGE_HIDDEN_BATTLES = 'tomotto_hidden_battles';

// ====== 칭호 수동 선택 ======
const STORAGE_SELECTED_TITLE = 'tomotto_selected_title';

function getHiddenBattleIds() {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_HIDDEN_BATTLES) || '[]')); }
  catch { return new Set(); }
}

function toggleHiddenBattle(battleId) {
  const hidden = getHiddenBattleIds();
  if (hidden.has(battleId)) { hidden.delete(battleId); } else { hidden.add(battleId); }
  localStorage.setItem(STORAGE_HIDDEN_BATTLES, JSON.stringify([...hidden]));
}

function isHiddenBattle(battleId) {
  return getHiddenBattleIds().has(battleId);
}

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
let totalGachaCount = 0;            // v0.1.69 — 전체 누적 가챠 횟수 (업적용)
let _spinsSinceReset = 0;           // v0.1.69 — 리셋 후 가챠 횟수 (A-3 판별)
let _notifTimeoutId = null;  // 웹 알림 예약 타임아웃 ID

let _pausedThisSession = false;     // v0.1.70 — 이번 세션 일시정지 여부 (B-4/B-5)
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

  // v0.1.69 — 전체 가챠 횟수 복원
  const savedTotalGacha = parseInt(localStorage.getItem(STORAGE.totalGachaCount) || '0', 10);
  totalGachaCount = Number.isFinite(savedTotalGacha) && savedTotalGacha >= 0 ? savedTotalGacha : 0;

  // 타이머 길이 — 새로고침 시 항상 25분(1500초)으로 초기화
  // (직접 입력 등 이전 설정값은 복원하지 않음)
  $durationSelect.value = '1500';
  timer.duration = 1500;
  timer.remaining = 1500;
  $customDurationWrap.hidden = true;

  // v0.1.8 — 누적 완료 카운트 복원
  const savedCompleted = parseInt(localStorage.getItem(STORAGE.completedCount) || '0', 10);
  completedCount = Number.isFinite(savedCompleted) && savedCompleted >= 0 ? savedCompleted : 0;
  updateCompletedDisplay();

  // v0.1.8 — 마지막 인증샷 복원
  // v0.1.27 — lastCapture가 captureRow 안으로 이동했으므로 captureRow도 같이 표시
  const savedCapture = localStorage.getItem(STORAGE.lastCapture);
  if (savedCapture) {
    $lastCaptureImg.src = savedCapture;
    $lastCapture.hidden = false;
    $captureRow.hidden = false;
  }

  // 마지막 작업 복원
  currentTask = localStorage.getItem(STORAGE.currentTask);
  if (currentTask) {
    showGachaResult(currentTask, false);
  }

  // v0.1.17 — 배틀 ID 복원 (새로고침 후에도 인증샷 업로드 가능하게)
  activeBattleId = localStorage.getItem('tomotto_activeBattleId') || null;

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
      $timerStatus.textContent = `✓ "${currentTask}" 완료! 수고하셨어요`;
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
      // 앱 스와이프 종료로 서비스가 중단된 경우 → 일시정지 상태로 복원
      const interruptedMs = window.AndroidBridge?.getInterruptedTimerRemaining
        ? (() => { try { return window.AndroidBridge.getInterruptedTimerRemaining(); } catch { return 0; } })()
        : 0;

      if (interruptedMs > 0) {
        // 스와이프 종료 시 저장한 남은 시간으로 일시정지 복원
        timer.remaining = Math.ceil(interruptedMs / 1000);
        timer.endTime = null;
        $timerStatus.textContent = '⏸ 앱이 종료되어 일시정지됨 — 시작 누르면 이어서';
        $timerStatus.classList.remove('success', 'resumed');
        $startBtn.disabled = false;
        $pauseBtn.disabled = true;
        $resetBtn.disabled = false;
        saveTimerState({ status: 'paused', remaining: timer.remaining, duration: timer.duration, task: currentTask });
      } else {
        // 남은 시간으로 계속 진행
        timer.remaining = Math.ceil((state.endTime - now) / 1000);
        timer.endTime = state.endTime;
        $timerStatus.textContent = `⟳ "${currentTask}" 자리 비운 사이도 계속 돌아가는 중···`;
        $timerStatus.classList.add('resumed');
        startTimerInternal();  // 자동 재개
      }
    }
  }
  // paused 상태로 저장돼 있었음 → 남은 시간 복원, 시작 안 함
  else if (state.status === 'paused' && state.remaining > 0) {
    timer.duration = state.duration;
    timer.remaining = state.remaining;
    currentTask = state.task || currentTask;
    _pausedThisSession = true;  // v0.1.70 — 이미 일시정지했었으므로 플래그 복원
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
    // v0.1.55 — 새로고침 후에도 소감란 oninput·저장버튼 복원
    if ($completionNote) {
      const savedNote = localStorage.getItem(BATTLE_STORAGE.completionNote) || '';
      $completionNote.value = savedNote;
      $completionNote.disabled = !!savedNote;  // 저장된 소감 있으면 잠금
      $completionNote.oninput = () => {
        localStorage.setItem(BATTLE_STORAGE.completionNote, $completionNote.value);
        if ($noteUploadBtn) $noteUploadBtn.hidden = !$completionNote.value.trim();
      };
      if ($noteUploadBtn) {
        $noteUploadBtn.disabled = false;
        if (savedNote) {
          $noteUploadBtn.hidden = false;
          $noteUploadBtn.textContent = '수정';
        } else {
          $noteUploadBtn.hidden = true;
          $noteUploadBtn.textContent = '저장';
        }
      }
    }
    // v0.1.17 — 배틀 결과 버튼 복원 (새로고침 후에도 유지)
    if (activeBattleId) {
      $battleResultBtn.hidden = false;
      $battleResultBtn.dataset.battleId = activeBattleId;
    }
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
  $emptyHint.classList.toggle('hidden', categories.length >= 1);
  $gachaBtn.disabled = categories.length < 1;
  saveCategories();
  editingCategoryIndex = -1;

  // 카테고리가 모두 사라지면 가챠 결과도 초기화
  if (categories.length === 0 && currentTask) {
    currentTask = null;
    localStorage.removeItem(STORAGE.currentTask);
    $gachaResult.className = 'gacha-result';
    $gachaResult.innerHTML = '<p class="gacha-placeholder">아직 안 돌렸어요. 할 일 등록 후 버튼을 눌러보세요.</p>';
    $startBtn.disabled = true;
    updateBattleLockBanner();
  }
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
  checkAchievementsOnCategoryChange(); // v0.1.69
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

function truncMid(str, max = 13) {
  if (str.length <= max) return str;
  const left = Math.ceil((max - 1) / 2);
  const right = Math.floor((max - 1) / 2);
  return str.slice(0, left) + '…' + str.slice(-right);
}

function truncEnd(str, max = 12) {
  return str.length > max ? str.slice(0, max) + '···' : str;
}

function splitCond(cond) {
  if (!cond) return '';
  const words = cond.split(' ');
  if (words.length < 3) return cond;
  const mid = Math.ceil(words.length / 2);
  // 공백을 <br> 앞에 유지해야 데스크탑(br display:none)에서 띄어쓰기가 사라지지 않음
  return words.slice(0, mid).join(' ') + ' <br>' + words.slice(mid).join(' ');
}

// v0.1.9 — 가챠 카운트는 "이번 사이클 N/3" 표시. 3 도달 → 다음엔 광고 사이클 시작.
function updateGachaCounter() {
  $gachaCount.textContent = String(gachaCount);
  $adHint.hidden = gachaCount < 5;
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
    // v0.1.15 — 배틀 초대 링크로 들어온 사람이 가챠 완료 시 배너 상태 전환
    if (lockedBattleId) updateBattleLockBanner();
    // v0.1.22 — MOTO MODE 친구: 가챠 완료 시 task를 Supabase에 저장 (창조자가 준비 상태 감지용)
    const battleIdForTask = lockedBattleId || currentBattleId;
    if (battleIdForTask && sb && myNickname) {
      sb.from('battle_players')
        .update({ task })
        .eq('battle_id', battleIdForTask)
        .eq('nickname', myNickname)
        .then(({ error }) => { if (error) console.warn('[Supabase] task 저장 실패:', error.message); });
    }
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
  // 셔플 배틀 중(대기 포함)이면 shared_pool 사용, 아니면 개인 categories
  // activeBattleId는 타이머 시작 후 설정, 대기 중엔 currentBattleId 사용
  let pool = categories;
  if ((activeBattleId || currentBattleId) && currentBattleData?.battle?.mode === 'shuffle') {
    try {
      const sharedPool = JSON.parse(currentBattleData.battle.shared_pool || '[]');
      if (sharedPool.length > 0) pool = sharedPool;
    } catch {}
  }
  if (pool.length < 1) return;

  // v0.1.9 — 사이클 5 도달 시 자동 리셋. 운영 모드면 광고 confirm 후 리셋.
  if (gachaCount >= 5) {
    if (SHOW_AD_PROMPT) {
      const confirmAd = confirm(
        '이번 사이클(5회) 다 썼어요!\n광고 보고 새 사이클 시작?\n\n(현재는 시뮬레이션 — 실제 광고는 추후 연동 예정)'
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

  // 최종 결과 미리 결정 — 직전 결과와 연속 중복 방지
  let winner = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length >= 2 && winner === currentTask) {
    do {
      winner = pool[Math.floor(Math.random() * pool.length)];
    } while (winner === currentTask);
  }

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
      idx = Math.floor(Math.random() * pool.length);
    } while (pool.length > 1 && idx === lastIdx);
    lastIdx = idx;
    sequence.push(pool[idx]);
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
  // v0.1.69 — 전체 가챠 횟수 + 업적
  totalGachaCount++;
  _spinsSinceReset++;
  localStorage.setItem(STORAGE.totalGachaCount, String(totalGachaCount));
  checkAchievementsOnGacha();
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
  updateFloatingTimerBar();
  updatePipBtn();
}

// ── Picture-in-Picture ───────────────────────────────────────
// Document PiP (Chrome 116+/Edge): 실제 HTML 렌더 — LIVE 배지 없음
// Canvas PiP (Safari 등): canvas captureStream fallback
const pip = {
  active: false, type: null, rafId: null,
  // canvas pip
  canvas: null, video: null,
  // document pip
  docWindow: null,
};

function _docPipSupported() { return !!window.documentPictureInPicture; }
function _canvasPipSupported() { return 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled; }
function _pipSupported() { return _docPipSupported() || _canvasPipSupported(); }

function updatePipBtn() {
  const btn = document.getElementById('pipBtn');
  if (!btn || !_pipSupported()) return;
  const canShow = timer.isRunning ||
    (!timer.isRunning && timer.remaining > 0 && timer.remaining < timer.duration);
  btn.hidden = !canShow;
  btn.disabled = !canShow;
  btn.title = pip.active ? '미니 창 닫기' : '미니 창으로 보기 (PiP)';
  btn.classList.toggle('pip-active', pip.active);
}

// ── Document PiP 렌더 (DOM 업데이트) ──
function _pipRenderDoc() {
  const w = pip.docWindow;
  if (!w || w.closed) return;
  const d = w.document;
  const minsEl  = d.getElementById('dppMins');
  const secsEl  = d.getElementById('dppSecs');
  const taskEl  = d.getElementById('dppTask');
  const fillEl  = d.getElementById('dppFill');
  if (minsEl && secsEl) { const p = formatTime(timer.remaining).split(':'); minsEl.textContent = p.slice(0,-1).join(':'); secsEl.textContent = p[p.length-1]; }
  if (fillEl) {
    const pct = timer.duration > 0 ? (timer.duration - timer.remaining) / timer.duration * 100 : 0;
    fillEl.style.width = pct + '%';
  }
  if (taskEl) taskEl.textContent = currentTask || '';
  const ctrlBarEl = d.getElementById('dppCtrlBar');
  if (ctrlBarEl) {
    const paused = !timer.isRunning && timer.remaining > 0;
    ctrlBarEl.textContent = timer.isRunning ? '⏸' : (paused ? '▶' : '');
    ctrlBarEl.style.opacity = paused ? '0.85' : '0.25';
    ctrlBarEl.style.color = '#d94e3a';
  }
}

// ── Canvas PiP 렌더 ──
function _pipRenderCanvas() {
  if (!pip.canvas) return;
  const ctx = pip.canvas.getContext('2d');
  const W = pip.canvas.width;
  const H = pip.canvas.height;
  // 배경 (라이트)
  ctx.fillStyle = '#fffaf9';
  ctx.fillRect(0, 0, W, H);
  // 좌측 accent 바
  ctx.fillStyle = '#d94e3a';
  ctx.fillRect(0, 0, 3, H);
  // 🍅 brand mark
  ctx.font = '15px serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('🍅', 14, 14);
  // 일시정지 배지
  if (!timer.isRunning && timer.remaining > 0) {
    ctx.fillStyle = '#f5ebe8';
    ctx.beginPath();
    ctx.roundRect(W - 82, 10, 70, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#c07060';
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⏸  일시정지', W - 47, 21);
  }
  // 타이머 숫자
  ctx.fillStyle = '#d94e3a';
  ctx.font = 'bold 58px "Helvetica Neue", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(formatTime(timer.remaining).replace(':', ' : '), W / 2, currentTask ? 95 : 108);
  // 할일 텍스트
  if (currentTask) {
    ctx.fillStyle = '#a07060';
    ctx.font = '500 15px "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const task = currentTask.length > 30 ? currentTask.slice(0, 30) + '…' : currentTask;
    ctx.fillText(task, W / 2, 148);
  }
  // 하단 progress 바
  const pct = timer.duration > 0 ? (timer.duration - timer.remaining) / timer.duration : 0;
  ctx.fillStyle = '#f0e0da';
  ctx.fillRect(3, H - 4, W - 3, 4);
  if (pct > 0) { ctx.fillStyle = '#d94e3a'; ctx.fillRect(3, H - 4, (W - 3) * pct, 4); }
}

function _pipDraw() {
  if (!pip.active) return;
  if (pip.type === 'doc') { _pipRenderDoc(); } else { _pipRenderCanvas(); }
  pip.rafId = requestAnimationFrame(_pipDraw);
}

// ── Document PiP 시작 ──
async function startDocPip() {
  const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 320, height: 160 });

  const style = pipWindow.document.createElement('style');
  style.textContent = `
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#fffaf9;font-family:"Helvetica Neue",Arial,sans-serif;overflow:hidden;height:100vh;display:flex;flex-direction:column}
    .dpp-root{flex:1;display:flex;flex-direction:column;position:relative;}
    .dpp-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 16px 0;gap:3px}
    .dpp-emoji{font-size:13px;position:absolute;top:8px;left:12px;line-height:1}
    .dpp-time{font-size:58px;font-weight:800;color:#d94e3a;letter-spacing:-0.03em;display:flex;align-items:center;line-height:1}
    .dpp-colon{padding:0 0.09em;line-height:1}
    .dpp-task{font-size:15px;font-weight:500;color:#a07060;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .dpp-pause{position:absolute;top:8px;right:10px;background:#f5ebe8;color:#c07060;font-size:10px;font-weight:700;padding:2px 7px;border-radius:8px}
    .dpp-bottom{display:flex;align-items:center;padding:6px 16px 10px;gap:8px;justify-content:center}
    .dpp-ctrl-bar{font-size:13px;color:#d94e3a;cursor:pointer;opacity:0.3;transition:opacity 0.15s;user-select:none;flex-shrink:0;width:16px;text-align:center}
    .dpp-ctrl-bar:hover{opacity:1}
    .dpp-progress{flex:1;max-width:160px;height:3px;background:#f0e0da;border-radius:2px}
    .dpp-progress-fill{height:100%;background:#d94e3a;transition:width 0.5s linear;border-radius:2px}
  `;
  pipWindow.document.head.appendChild(style);

  pipWindow.document.body.innerHTML = `
    <div class="dpp-root" id="dppRoot">
      <div class="dpp-body">
        <span class="dpp-emoji">🍅</span>
        <div class="dpp-time"><span id="dppMins"></span><span class="dpp-colon">:</span><span id="dppSecs"></span></div>
        <div class="dpp-task" id="dppTask">${escapeHtml(currentTask || '')}</div>
      </div>
      <div class="dpp-bottom"><span class="dpp-ctrl-bar" id="dppCtrlBar"></span><div class="dpp-progress"><div class="dpp-progress-fill" id="dppFill"></div></div></div>
    </div>`;

  pip.docWindow = pipWindow;
  pip.active = true;
  pip.type = 'doc';
  pipWindow.addEventListener('pagehide', stopPip, { once: true });
  pipWindow.document.getElementById('dppCtrlBar')?.addEventListener('click', () => { if (timer.isRunning) pauseTimer(); else startTimer(); _pipRenderDoc(); });
  _pipDraw();
  updatePipBtn();
}

// ── Canvas PiP 시작 (Safari fallback) ──
async function startCanvasPip() {
  pip.canvas = document.createElement('canvas');
  pip.canvas.width = 400;
  pip.canvas.height = 240;
  pip.active = true;
  pip.type = 'canvas';
  _pipRenderCanvas();

  pip.video = document.createElement('video');
  pip.video.muted = true;
  pip.video.srcObject = pip.canvas.captureStream(1);
  pip.video.addEventListener('leavepictureinpicture', stopPip, { once: true });

  try {
    await pip.video.play();
    await pip.video.requestPictureInPicture();
  } catch (err) {
    console.warn('[PiP] Canvas PiP 실패:', err);
    stopPip();
    return;
  }
  _pipDraw();
  updatePipBtn();
}

async function startPip() {
  if (!_pipSupported()) return;
  if (_docPipSupported()) {
    try { await startDocPip(); return; } catch (err) {
      console.warn('[PiP] Document PiP 실패, Canvas로 fallback:', err);
    }
  }
  if (_canvasPipSupported()) await startCanvasPip();
}

function stopPip() {
  if (!pip.active && !pip.docWindow && !pip.video) return;
  pip.active = false;
  if (pip.rafId) { cancelAnimationFrame(pip.rafId); pip.rafId = null; }
  if (pip.type === 'doc') {
    try { if (pip.docWindow && !pip.docWindow.closed) pip.docWindow.close(); } catch (_e) {}
    pip.docWindow = null;
  } else {
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    if (pip.video?.srcObject) { pip.video.srcObject.getTracks().forEach(t => t.stop()); pip.video.srcObject = null; }
    pip.canvas = null;
    pip.video = null;
  }
  pip.type = null;
  updatePipBtn();
}

// ── 플로팅 타이머 바 ──────────────────────────────────────────
function _isPersonalTabActive() {
  return !!document.querySelector('.tab-btn[data-tab="personal"].active');
}

function updateFloatingTimerBar() {
  const bar = document.getElementById('floatingTimerBar');
  if (!bar) return;
  // PiP 지원 환경(데스크탑 Chrome 등)에서는 플로팅 바 대신 PiP 사용
  if (_pipSupported()) { bar.hidden = true; document.querySelector('.container')?.classList.remove('ftb-visible'); return; }
  // timer가 초기화되기 전(initBottomTab IIFE 조기 호출) 에는 숨김 처리
  let isRunning = false;
  let remaining = 0;
  let duration = 1500;
  try { isRunning = timer.isRunning; remaining = timer.remaining; duration = timer.duration || 1500; } catch (_e) { return; }
  // 타이머가 실행 중이거나 일시정지 상태(남은 시간 있고 duration과 다름)일 때 표시
  const isPaused = !isRunning && remaining > 0 && remaining < duration;
  const show = (isRunning || isPaused) && !_isPersonalTabActive();
  bar.hidden = !show;
  // 컨테이너 하단 패딩 토글 — 바가 내용 가리지 않도록
  document.querySelector('.container')?.classList.toggle('ftb-visible', show);
  if (!show) { return; }

  const timeEl      = document.getElementById('ftbTime');
  const taskEl      = document.getElementById('ftbTask');
  const progressBar = document.getElementById('ftbProgressBar');
  const pauseShape  = document.getElementById('ftbPauseShape');
  const playShape   = document.getElementById('ftbPlayShape');

  if (timeEl) timeEl.textContent = formatTime(remaining);
  if (taskEl) taskEl.textContent = currentTask || '';

  // 진행 바: 경과 시간 비율로 너비 조정 (붉은색 = 경과, 회색 배경 = 남은 시간)
  if (progressBar) {
    const elapsed = Math.max(0, duration - remaining);
    const pct = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;
    progressBar.style.width = pct + '%';
  }

  // 버튼 도형 전환 (일시정지↔재생)
  if (pauseShape) pauseShape.hidden = !isRunning;
  if (playShape)  playShape.hidden  = isRunning;
}


// PiP 버튼 이벤트
window.addEventListener('load', () => {
  const pipBtn = document.getElementById('pipBtn');
  if (pipBtn) {
    pipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pip.active) { stopPip(); } else { startPip(); }
    });
  }
});

// 리더보드 호칭 안내 다이얼로그
window.addEventListener('load', () => {
  const infoBtn   = document.getElementById('lbInfoBtn');
  const dialog    = document.getElementById('lbInfoDialog');
  const closeBtn  = document.getElementById('lbInfoCloseBtn');
  if (!infoBtn || !dialog) return;
  infoBtn.addEventListener('click', () => dialog.showModal());
  closeBtn?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
});

// 플로팅 바 이벤트 (window.load 이후 등록)
window.addEventListener('load', () => {
  const bar       = document.getElementById('floatingTimerBar');
  const toggleBtn = document.getElementById('ftbToggleBtn');

  // 토글 버튼: 클릭 시 일시정지/재생 (이벤트 버블링 차단)
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (timer.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
      updateFloatingTimerBar();
    });
  }

  // 바 전체 탭: 개인 탭으로 이동 후 타이머 섹션으로 즉시 이동 (애니메이션 없음)
  if (bar) {
    bar.addEventListener('click', () => {
      switchTab('personal');
      requestAnimationFrame(() => {
        const timerSection = document.querySelector('.timer-section');
        if (timerSection) timerSection.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
    });
  }
});


async function scheduleNotification(task) {
  cancelNotification();
  // Android는 AndroidBridge.startTimerNotification() + TimerForegroundService가 처리
  if (window.Capacitor?.isNativePlatform()) return;

  // 웹 (Service Worker showNotification)
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const ms = timer.endTime ? timer.endTime - Date.now() : 0;
  if (ms <= 0) return;
  const title = 'Tomotto 🍅 타이머 완료!';
  const body  = task ? `"${task}" 완료! 수고하셨어요 🎉` : '집중 시간이 끝났어요! 수고하셨어요 🎉';
  _notifTimeoutId = setTimeout(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body, icon: 'assets/icon-192.png', badge: 'assets/icon-192.png',
          tag: 'tomotto-timer', renotify: true,
        });
      } else {
        new Notification(title, { body, icon: 'assets/icon-192.png' });
      }
    } catch (e) { console.warn('[Notification] 표시 실패:', e); }
  }, ms);
}

function cancelNotification() {
  if (_notifTimeoutId) { clearTimeout(_notifTimeoutId); _notifTimeoutId = null; }
}

// 타이머 완료 시 즉시 웹 알림 표시
async function showWebNotificationNow(task) {
  if (window.Capacitor?.isNativePlatform()) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const title = 'Tomotto 🍅 타이머 완료!';
  const body  = task ? `"${task}" 완료! 수고하셨어요 🎉` : '집중 시간이 끝났어요! 수고하셨어요 🎉';
  const opts  = { body, icon: 'assets/icon-192.png', badge: 'assets/icon-192.png', tag: 'tomotto-timer' };
  // SW가 페이지를 제어 중이면 SW 알림 (백그라운드 탭 지원), 아니면 new Notification() fallback
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, opts);
      return;
    } catch (e) { console.warn('[SW Notification] 실패, fallback:', e); }
  }
  try { new Notification(title, opts); } catch (e) { console.warn('[Notification] 표시 실패:', e); }
}

function saveTimerState(state) {
  if (!state) {
    localStorage.removeItem(STORAGE.timerState);
  } else {
    localStorage.setItem(STORAGE.timerState, JSON.stringify(state));
  }
}

// ── 활동 상태 업서트 ──────────────────────────────────────────
// isFocusing: true = 타이머 시작, false = 종료/리셋
async function upsertPresence(isFocusing) {
  if (!sb || !myNickname) return;
  const payload = {
    nickname: myNickname,
    is_focusing: isFocusing,
    updated_at: new Date().toISOString(),
  };
  // 칭호 이모지는 항상 최신 값 기록 (리더보드에서 상대 배지 표시에 사용)
  payload.title_emoji = getCurrentTitle()?.emoji ?? null;
  if (isFocusing) {
    payload.status_public = isStatusPublic;
  }
  const { error } = await sb.from('user_presence')
    .upsert(payload, { onConflict: 'nickname' });
  if (error) {
    if (error.code === '42703' || error.code === 'PGRST204') {
      // title_emoji 컬럼 미존재 → title_emoji만 제거 후 재시도
      const { title_emoji, ...noEmoji } = payload;
      const { error: e2 } = await sb.from('user_presence')
        .upsert(noEmoji, { onConflict: 'nickname' });
      if (e2?.code === '42703' || e2?.code === 'PGRST204') {
        // status_public도 없음 → 최소 필드로 최종 재시도
        const { status_public, ...minimal } = noEmoji;
        const { error: e3 } = await sb.from('user_presence')
          .upsert(minimal, { onConflict: 'nickname' });
        if (e3) console.warn('[presence] upsert 실패 (minimal):', e3.message);
      } else if (e2) {
        console.warn('[presence] upsert 실패 (no emoji):', e2.message);
      }
    } else {
      console.error('[presence] upsert 실패 (code:', error.code, '):', error.message);
    }
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

  // 알림 권한 요청 — 최초 1회만 (localStorage 플래그로 중복 방지)
  if ('Notification' in window &&
      Notification.permission === 'default' &&
      !localStorage.getItem('tomotto_notif_asked')) {
    localStorage.setItem('tomotto_notif_asked', '1');
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

  $timerStatus.textContent = `"${currentTask}" 작업 중···`;
  $timerStatus.classList.remove('success', 'resumed');

  // v0.1.28 — 완료 후 새 타이머 시작 시 소감·인증샷 초기화 (captureRow가 보이는 상태 = 완료 직후)
  if (!$captureRow.hidden) {
    $captureRow.hidden = true;
    if ($completionNote) {
      $completionNote.value = '';
      $completionNote.disabled = false;  // v0.1.29 — 잠금 해제
      localStorage.removeItem(BATTLE_STORAGE.completionNote);
    }
    if ($noteUploadBtn) {
      $noteUploadBtn.hidden = true;
      $noteUploadBtn.disabled = false;
      $noteUploadBtn.textContent = '저장';
    }
    $lastCaptureImg.src = '';
    $lastCapture.hidden = true;
    localStorage.removeItem(STORAGE.lastCapture);
    lastCapturedDataUrl = null;
  }

  // v0.1.17 — 새 타이머 시작 시 배틀 결과 버튼 숨김 (이전 배틀 결과 클리어)
  $battleResultBtn.hidden = true;
  $battleResultBtn.dataset.battleId = '';

  // 활동 상태 표시 — 집중 시작
  upsertPresence(true);

  // v0.1.70 — B-4/B-5: 새 세션(풀 타이머) 시작 시에만 _pausedThisSession 리셋
  // 일시정지 후 Resume은 remaining < duration이므로 리셋 안 함
  if (timer.remaining === timer.duration) _pausedThisSession = false;

  // v0.1.69 — A-3 고민 끝! : 가챠 1회 후 바로 시작 (리롤 없음)
  if (_spinsSinceReset === 1) unlockAchievement('A-3');
  _spinsSinceReset = 0; // 체크 직후 초기화 (spinGacha 내부 resetTimer 호출과 분리)

  // 알림 영역 타이머 서비스 시작 (Android APK 전용)
  if (window.AndroidBridge?.startTimerNotification) {
    try { window.AndroidBridge.startTimerNotification(timer.endTime, currentTask || ''); } catch (_e) {}
  }

  startTimerInternal();
  scheduleNotification(currentTask);
}

function pauseTimer() {
  if (!timer.isRunning) return;
  _pausedThisSession = true;  // v0.1.70 — B-4/B-5 무결점 판별
  clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.isRunning = false;
  timer.endTime = null;
  // 일시정지 시 알림 서비스 중지
  if (window.AndroidBridge?.stopTimerNotification) {
    try { window.AndroidBridge.stopTimerNotification(); } catch (_e) {}
  }
  cancelNotification();
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
  // v0.1.69 — E-2 토마토 탈주: 실행 중이었고 10초 이하 남겼을 때 리셋
  if (timer.isRunning && timer.remaining > 0 && timer.remaining <= 10) {
    unlockAchievement('E-2');
  }
  // 주의: _spinsSinceReset은 여기서 초기화하지 않음
  // spinGacha()가 내부적으로 resetTimer()를 호출하므로 여기서 초기화하면 A-3 판별 불가
  // 초기화는 startTimer() 체크 직후 및 finishTimer() 완료 시에만 수행

  if (timer.intervalId) clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.isRunning = false;
  timer.endTime = null;
  stopPip();
  // 리셋 시 알림 서비스 중지
  if (window.AndroidBridge?.stopTimerNotification) {
    try { window.AndroidBridge.stopTimerNotification(); } catch (_e) {}
  }
  cancelNotification();
  timer.duration = getCurrentDurationSeconds();
  timer.remaining = timer.duration;
  updateTimerDisplay();
  $timerDisplay.classList.remove('running', 'finished');
  $startBtn.disabled = !currentTask;
  $pauseBtn.disabled = true;
  $resetBtn.disabled = true;
  $timerStatus.textContent = '';
  $timerStatus.classList.remove('success', 'resumed');

  // v0.1.28 — 리셋 시 소감/인증샷 유지 (시작 버튼 누를 때까지 보존)
  // $captureRow.hidden = true; ← 제거됨
  // v0.1.17 — 배틀 결과 버튼은 리셋 시 숨기지 않음 (새 배틀 시작 전까지 유지)

  // 활동 상태 표시 — 타이머 취소 시에도 집중 종료로 처리
  upsertPresence(false);

  saveTimerState(null);
  const prevBattleId = activeBattleId;
  activeBattleId = null;   // v0.1.17 — 배틀 세션 종료
  localStorage.removeItem('tomotto_activeBattleId');
  if (prevBattleId) renderMyBattles(); // v0.1.65 — 완료 배틀카드 즉시 숨김 갱신
}

// v0.1.9 — select·custom input(시·분) 종합해서 현재 적용 시간(초) 반환
function getCurrentDurationSeconds() {
  if ($durationSelect.value === 'custom') {
    const h = parseInt($customHours.value, 10);
    const m = parseInt($customMinutes.value, 10);
    const hours = Number.isFinite(h) && h >= 0 ? h : 0;
    const mins = Number.isFinite(m) && m >= 0 ? m : 0;
    const totalSec = (hours * 60 + mins) * 60;
    return totalSec;  // 0:00도 허용 — 직접 입력 시 00:00 표시
  }
  const sec = parseInt($durationSelect.value, 10);
  return Number.isFinite(sec) && sec > 0 ? sec : 1500;
}

function finishTimer() {
  if (timer.intervalId) clearInterval(timer.intervalId);
  timer.intervalId = null;
  timer.isRunning = false;
  stopPip();
  // 타이머 완료 — 서비스가 자체적으로 완료 알림을 표시하고 종료하지만 안전하게 stop도 호출
  if (window.AndroidBridge?.stopTimerNotification) {
    try { window.AndroidBridge.stopTimerNotification(); } catch (_e) {}
  }
  cancelNotification();        // web setTimeout 취소 + Android 예약 취소
  showWebNotificationNow(currentTask); // 웹: 즉시 표시 (setTimeout 경쟁 조건 우회)
  timer.remaining = 0;
  timer.endTime = null;
  updateTimerDisplay();
  $timerDisplay.classList.remove('running');
  $timerDisplay.classList.add('finished');
  $startBtn.disabled = true;
  $pauseBtn.disabled = true;
  $resetBtn.disabled = false;
  // v0.1.20 — 배틀 모드면 파트너 닉네임 포함
  // v0.1.56 — activeBattleId 없으면(배틀 모달만 열었다 닫은 경우) 개인 작업으로 처리
  const battlePartner = activeBattleId ? getBattlePartnerInfo() : null;
  if (battlePartner) {
    const who = escapeHtml(battlePartner.partnerNick);
    // v0.1.28 — 두 모드 모두 '님과' 통일
    $timerStatus.textContent = `✓ ${who}님과 함께한 "${currentTask}" 완료! 수고하셨어요`;
  } else {
    $timerStatus.textContent = `✓ "${currentTask}" 완료! 수고하셨어요`;
  }
  $timerStatus.classList.add('success');
  $timerStatus.classList.remove('resumed');

  // v0.1.8 — 누적 완료 카운트 증가 + 인증샷 첨부 버튼 표시
  completedCount++;
  localStorage.setItem(STORAGE.completedCount, String(completedCount));
  updateCompletedDisplay();
  $captureRow.hidden = false;
  // v0.1.65 — 인증샷 버튼 항상 초기화 (이전 배틀 '업로드 완료' 문구 잔류 방지)
  $captureBtn.textContent = '📷 인증샷 첨부 (선택)';
  $captureBtn.disabled = false;

  // 활동 상태 표시 — 집중 종료
  upsertPresence(false);

  // v0.1.69 — 타이머 완료 업적 체크
  checkAchievementsOnTimerComplete();

  // v0.1.36 — 소셜 리더보드 통계 동기화
  syncUserStats();

  // v0.1.93 — 파트너 통계 업데이트 (양방향 상호작용 기반)
  if (activeBattleId && sb && myNickname) {
    const dur = timer.duration || 0;
    if (battlePartner?.partnerNick) {
      // 1:1 배틀
      upsertPartnerStats(battlePartner.partnerNick, dur);
    } else if (currentBattleData?.battle?.is_public && currentBattleData?.players?.length) {
      // 공개 배틀 — 함께한 모든 참여자 기록
      currentBattleData.players
        .filter(p => p.nickname !== myNickname)
        .forEach(p => upsertPartnerStats(p.nickname, dur));
    }
  }

  // v0.1.33 — 기록 탭 로그 저장
  const _now = Date.now();
  saveLog({
    id: _now,
    date: formatDateStr(new Date(_now)),
    task: currentTask || '',
    durationSec: timer.duration,
    type: activeBattleId ? 'battle' : 'solo',
    battleMode: currentBattleData?.battle?.mode || null,
    isPublic: currentBattleData?.battle?.is_public || false,
    partner: battlePartner?.partnerNick || null,
    note: null,   // 소감은 저장 버튼 클릭 시 updateLatestLogNote()로 채워짐
    completedAt: _now,
  });
  // v0.1.29 — 소감란: 항상 빈 상태로 시작 (이전 소감 미복원), textarea 활성화
  if ($completionNote) {
    $completionNote.value = '';
    $completionNote.disabled = false;
    localStorage.removeItem(BATTLE_STORAGE.completionNote);
    $completionNote.oninput = () => {
      localStorage.setItem(BATTLE_STORAGE.completionNote, $completionNote.value);
      if ($noteUploadBtn) $noteUploadBtn.hidden = !$completionNote.value.trim();
    };
    if ($noteUploadBtn) {
      $noteUploadBtn.hidden = true;    // 빈 상태이므로 버튼 숨김
      $noteUploadBtn.disabled = false;
      $noteUploadBtn.textContent = '저장';
    }
  }

  // v0.1.17 — 배틀 중이었으면 결과 보기 버튼 표시
  if (activeBattleId) {
    markBattleCompletedLocally(activeBattleId); // v0.1.65 — 로컬 완료 Set+localStorage에 추가 (리셋/새로고침 후에도 숨김 유지)
    $battleResultBtn.hidden = false;
    $battleResultBtn.dataset.battleId = activeBattleId;
    // v0.1.29 — 배틀 완료 시 status 'done' 업데이트 (여러 카드 '진행 중' 버그 수정)
    // v0.1.65 — updated_at 함께 기록 (24시간 후 자동 삭제 기준으로 사용)
    if (sb) {
      sb.from('battles')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', activeBattleId)
        .then(({ error }) => {
          if (error) console.warn('[Supabase] battles done 업데이트 실패:', error.message);
          else {
            console.log('[Supabase] battles status → done:', activeBattleId);
            renderMyBattles(); // v0.1.65 — 완료 후 카드 상태 즉시 갱신
          }
        });
    } else {
      renderMyBattles(); // v0.1.65 — 오프라인 모드도 갱신
    }
  }

  saveTimerState({
    status: 'finished',
    duration: timer.duration,
    task: currentTask,
    finishedAt: Date.now(),
  });

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

// =====================================================
// v0.1.36 — 소셜 리더보드
// =====================================================

function getWeekKey(date = new Date()) {
  // ISO 주차: 월요일 기준
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** 배틀 횟수 기반 파트너 성장 칭호 */
function getPartnerTier(count) {
  if (count >= 20) return { emoji: '⚡', label: '전설의 라이벌' };
  if (count >= 10) return { emoji: '🌙', label: '단골 파트너' };
  if (count >= 5)  return { emoji: '🏃', label: '페이스메이커' };
  return null;
}

// ── 파트너 통계 단방향 upsert (내 쪽 기록만, 상대방도 자신이 완료 시 자신 기록)
async function upsertPartnerStats(partnerNick, durationSec = 0) {
  if (!sb || !myNickname || !partnerNick || partnerNick === myNickname) return;
  try {
    await sb.rpc('increment_partner_stats', {
      p_me:      myNickname,
      p_partner: partnerNick,
      p_sec:     Math.round(durationSec),
    });
  } catch (e) {
    // RPC 미생성 시 fallback: 기존 값 조회 후 +1 증가 (이전 bug: 항상 1로 덮어쓰던 것 수정)
    try {
      const { data: cur } = await sb.from('user_partner_stats')
        .select('battle_count, total_sec')
        .eq('nickname', myNickname).eq('partner', partnerNick)
        .maybeSingle();
      await sb.from('user_partner_stats').upsert({
        nickname:        myNickname,
        partner:         partnerNick,
        battle_count:    (cur?.battle_count ?? 0) + 1,
        total_sec:       (cur?.total_sec ?? 0) + Math.round(durationSec),
        last_battled_at: new Date().toISOString(),
      }, { onConflict: 'nickname,partner' });
    } catch {}
  }
}

// 타이머 완료 시 Supabase user_stats에 카운트 업데이트
let _lastSyncedTimestamp = 0;  // 중복 호출 방지
async function syncUserStats() {
  if (!sb || !myNickname) return;
  const tsNow = Date.now();
  if (tsNow - _lastSyncedTimestamp < 5000) return;  // 5초 이내 재호출 무시
  _lastSyncedTimestamp = tsNow;
  const now = new Date();
  const periods = [
    { period_type: 'week',  period_key: getWeekKey(now)  },
    { period_type: 'month', period_key: getMonthKey(now) },
  ];
  for (const p of periods) {
    try {
      // count + total_seconds(초 단위) 함께 조회 (컬럼 없으면 count만)
      let existing = null;
      const { data: ex1, error: selErr } = await sb.from('user_stats')
        .select('count, total_seconds')
        .eq('nickname', myNickname).eq('period_type', p.period_type).eq('period_key', p.period_key)
        .maybeSingle();
      if (selErr?.code === '42703' || selErr?.code === 'PGRST204') {
        const { data: ex2 } = await sb.from('user_stats').select('count')
          .eq('nickname', myNickname).eq('period_type', p.period_type).eq('period_key', p.period_key)
          .maybeSingle();
        existing = ex2;
      } else { existing = ex1; }

      const sessionSecs = timer.duration || 0; // 초 단위 그대로 저장 (분 반올림 시 10초=0 버그 방지)
      const payload = {
        nickname: myNickname,
        period_type: p.period_type,
        period_key: p.period_key,
        count: (existing?.count ?? 0) + 1,
        title_emoji: getCurrentTitle()?.emoji ?? null,
        total_seconds: (existing?.total_seconds ?? 0) + sessionSecs,
        updated_at: new Date().toISOString(),
      };
      // 컬럼 미존재 시 점진적 fallback: total_seconds → title_emoji 순으로 제거
      let err = (await sb.from('user_stats').upsert(payload)).error;
      if (err?.code === '42703' || err?.code === 'PGRST204') {
        const { total_seconds, ...p2 } = payload;
        err = (await sb.from('user_stats').upsert(p2)).error;
      }
      if (err?.code === '42703' || err?.code === 'PGRST204') {
        const { title_emoji, total_seconds, ...p3 } = payload;
        err = (await sb.from('user_stats').upsert(p3)).error;
      }
      if (err) console.warn('[syncUserStats] 최종 실패:', err.message);
    } catch (err) {
      console.warn('[syncUserStats] 실패:', err);
    }
  }
  // v0.1.103 — 주간 리더보드 앞지르기 감지
  checkAndNotifyOvertake();
}

// =====================================================
// v0.1.105 — 리더보드 앞지르기 감지 (stateless)
// =====================================================

const _overtakeShownThisSession = new Set(); // 세션 내 라이벌 토스트 표시한 nick

// =====================================================
// 이모지 비 효과 — 로비 파트너 카드 집중 (v0.1.119)
// =====================================================
/** 인사 이모지 샤워: 화면 상단→중단(55vh). showToast=true면 수신 토스트도 표시 */
function showEmojiRainGreeting(fromNick, showToast = true, emojis = ['🔥', '✨', '⚡', '💥']) {
  const dlg = document.createElement('dialog');
  dlg.className = 'emoji-rain-host-dialog';
  dlg.addEventListener('cancel', e => e.preventDefault());
  document.body.appendChild(dlg);

  const overlay = document.createElement('div');
  overlay.className = 'emoji-rain-overlay';
  dlg.appendChild(overlay);
  dlg.showModal();

  const COUNT = 32;
  const centerX = window.innerWidth / 2;
  const dy = Math.round(window.innerHeight * 0.55) + 40; // 화면 중단까지

  for (let i = 0; i < COUNT; i++) {
    const span = document.createElement('span');
    span.className = 'emoji-rain-drop';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const spread = (Math.random() - 0.5) * window.innerWidth * 0.85;
    const dur    = (0.7 + Math.random() * 0.8).toFixed(2);
    const delay  = (Math.random() * 1.2).toFixed(2);
    const r0     = Math.round((Math.random() - 0.5) * 30);
    const r1     = Math.round((Math.random() - 0.5) * 60);
    span.style.cssText = [
      `left:${(centerX + spread).toFixed(0)}px`,
      `font-size:${(1.1 + Math.random() * 1.3).toFixed(1)}rem`,
      `--dur:${dur}s`,
      `--delay:${delay}s`,
      `--dy:${dy}px`,
      `--r0:${r0}deg`,
      `--r1:${r1}deg`,
    ].join(';');
    overlay.appendChild(span);
  }
  setTimeout(() => { dlg.close(); dlg.remove(); }, 3200);

  // 인사 수신 토스트 (로비 닫혀있을 때만)
  if (showToast && fromNick) {
    _showNotifToast('achievement-toast--greet', '👋', '인사 도착!', `${escapeHtml(fromNick)}님이 인사를 보냈어요`, 4000);
  }
}
function showEmojiRainOnElement(targetEl, emojis = ['🔥', '✨', '⚡', '💥']) {
  if (!targetEl) return;
  const rect = targetEl.getBoundingClientRect();
  // 요소가 화면에 표시 안 된 상태(로비 닫힘/hidden)면 조기 종료
  if (rect.width === 0 && rect.height === 0) return;
  const centerX = rect.left + rect.width / 2;
  const dy = rect.bottom + 40; // top:-40px 기준으로 카드 하단까지 낙하 거리

  // 새 <dialog>를 top-layer에 올려서 로비 modal 위에 표시
  // (나중에 showModal()한 dialog가 top-layer 스택 위에 쌓임)
  const dlg = document.createElement('dialog');
  dlg.className = 'emoji-rain-host-dialog';
  dlg.addEventListener('cancel', e => e.preventDefault()); // ESC로 닫히지 않게
  document.body.appendChild(dlg);

  const overlay = document.createElement('div');
  overlay.className = 'emoji-rain-overlay';
  dlg.appendChild(overlay);
  dlg.showModal();

  const COUNT = 28;
  for (let i = 0; i < COUNT; i++) {
    const span = document.createElement('span');
    span.className = 'emoji-rain-drop';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const spread = (Math.random() - 0.5) * Math.max(rect.width * 2, 100);
    const dur    = (0.55 + Math.random() * 0.65).toFixed(2);
    const delay  = (Math.random() * 1.0).toFixed(2);
    const r0     = Math.round((Math.random() - 0.5) * 30);
    const r1     = Math.round((Math.random() - 0.5) * 60);
    span.style.cssText = [
      `left:${(centerX + spread).toFixed(0)}px`,
      `font-size:${(1.0 + Math.random() * 1.2).toFixed(1)}rem`,
      `--dur:${dur}s`,
      `--delay:${delay}s`,
      `--dy:${dy}px`,
      `--r0:${r0}deg`,
      `--r1:${r1}deg`,
    ].join(';');
    overlay.appendChild(span);
  }

  // 첫 이모지가 카드에 닿는 타이밍(~450ms)에 카드 bounce
  setTimeout(() => {
    targetEl.style.transition = 'transform 0.12s ease';
    targetEl.style.transform = 'scale(1.06)';
    setTimeout(() => {
      targetEl.style.transform = '';
      setTimeout(() => { targetEl.style.transition = ''; }, 200);
    }, 170);
  }, 450);

  setTimeout(() => { dlg.close(); dlg.remove(); }, 2800);
}

// 알림 토스트: 스택 컨테이너에 동시 표시 (v0.1.110)
// 1위 토스트 + 라이벌 토스트가 동시에 쌓여서 보임
function _showNotifToast(className, icon, label, name, duration = 4000) {
  let container = document.getElementById('notif-toast-stack');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-toast-stack';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `achievement-toast achievement-toast--stacked ${className}`;
  toast.innerHTML = `
    <span class="achievement-toast-icon">${icon}</span>
    <div class="achievement-toast-body">
      <div class="achievement-toast-label">${label}</div>
      <div class="achievement-toast-name">${name}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('achievement-toast--show'), 30);
  setTimeout(() => {
    toast.classList.remove('achievement-toast--show');
    toast.classList.add('achievement-toast--hide');
    setTimeout(() => {
      toast.remove();
      if (!container.children.length) container.remove();
    }, 350);
  }, duration);
}

// syncUserStats()가 upsert 완료 후 호출.
// 공식: 내 새 count = N → 방금 앞지른 사람 = count가 정확히 N-1인 사람들
// → 리더보드를 직접 보지 않아도 동작.
async function checkAndNotifyOvertake() {
  if (!sb || !myNickname) return;
  try {
    const now = new Date();
    const periodKey = getWeekKey(now);

    // 내 현재 count (upsert 완료 후)
    const { data: myRow } = await sb.from('user_stats').select('count')
      .eq('nickname', myNickname).eq('period_type', 'week').eq('period_key', periodKey)
      .maybeSingle();
    const myCount = myRow?.count ?? 0;
    if (!myCount) return;

    // ① 탑 3 / 1위 진입 체크
    // gte: 동점자도 "나보다 위"로 처리 → 동점 상태에선 진입 토스트 안 뜸
    const { count: numAbove } = await sb.from('user_stats')
      .select('*', { count: 'exact', head: true })
      .eq('period_type', 'week').eq('period_key', periodKey)
      .gte('count', myCount).neq('nickname', myNickname);
    const myRank = (numAbove ?? 0) + 1;
    if (myRank <= 3) _checkRankMilestoneToast(myRank, periodKey);

    // ② 라이벌(배틀 파트너) 앞지르기 — 세션당 1번
    // 내 이전 count = myCount-1, 그 count에 있던 사람 = 방금 내가 앞지른 사람
    if (myCount >= 2) {
      const { data: justPassedRows } = await sb.from('user_stats').select('nickname')
        .eq('period_type', 'week').eq('period_key', periodKey)
        .eq('count', myCount - 1).limit(30);
      const justPassed = (justPassedRows || []).map(r => r.nickname)
        .filter(n => n !== myNickname && !_overtakeShownThisSession.has(n));
      // 구면(3회+ 배틀) 중 방금 추월한 사람에게만 토스트
      if (justPassed.length > 0) {
        const partnerSet = await _fetchMyPartnerNicks();
        const rivalPassed = justPassed.filter(n => partnerSet.has(n));
        if (rivalPassed.length > 0) {
          _showRivalOvertakeToast(rivalPassed[0]);
          _overtakeShownThisSession.add(rivalPassed[0]);
        }
      }
    }
  } catch (e) {
    console.warn('[checkOvertake] 실패:', e);
  }
}

// 구면(battle_count >= 3) 파트너 닉네임 Set 반환
async function _fetchMyPartnerNicks() {
  try {
    const { data } = await sb.from('user_partner_stats')
      .select('partner, battle_count')
      .eq('nickname', myNickname)
      .gte('battle_count', 3); // 구면 조건: 3회 이상 함께 배틀 완료
    return new Set((data || []).map(r => r.partner));
  } catch { return new Set(); }
}

// 탑 3 / 1위 진입 토스트 — 이번 주 처음 해당 마일스톤 달성 시만
// • rank 1 → "1위 달성!" 1번
// • rank 2~3 → "탑 3 진입!" 1번
// (주당 최대 2번: 탑3 진입 + 1위 달성)
function _checkRankMilestoneToast(rank, periodKey) {
  // 탑3 진입(처음) / 1위 달성(처음) — 주 1회씩
  // 이미 탑3 안에 있는 상태에서 순위가 오르는 건 토스트 없음
  const key = `tomotto_lb_rank_${periodKey}`;
  const notified = JSON.parse(localStorage.getItem(key) || '{}');
  if (rank === 1 && !notified.no1) {
    notified.no1 = true;
    localStorage.setItem(key, JSON.stringify(notified));
    _showRankMilestoneToast(1);
    return; // 1위 달성 시 탑3 토스트 중복 생략
  }
  if (rank <= 3 && !notified.top3) {
    notified.top3 = true;
    localStorage.setItem(key, JSON.stringify(notified));
    _showRankMilestoneToast(rank);
  }
}

function _showRankMilestoneToast(rank) {
  const medals = ['🥇', '🥈', '🥉'];
  const labels = ['1위 달성!', '순위 상승!', '순위 상승!'];
  const msgs   = ['이번 주 1위에 올랐어요!', '탑 3에 진입했어요!', '탑 3에 진입했어요!'];
  _showNotifToast('achievement-toast--overtake', medals[rank - 1], labels[rank - 1], msgs[rank - 1]);
}

// 라이벌(배틀 파트너) 앞지르기 토스트 — 주황색
function _showRivalOvertakeToast(nick) {
  _showNotifToast('achievement-toast--rival', '⚔️', '라이벌 추월!', `${escapeHtml(nick)}님을 앞질렀어요!`);
}

var lbPeriod = 'week'; // var 호이스팅 — initBottomTab() 초기화 시 TDZ 방지

// v0.1.80 — 글로벌 랭킹 (파트너 한정 → 전체)
async function renderLeaderboard() {
  const $body = document.getElementById('leaderboardBody');
  if (!$body) return;
  if (!sb) {
    $body.innerHTML = '<p class="lb-empty">오프라인 상태에서는 랭킹을 불러올 수 없어요.</p>';
    return;
  }

  $body.innerHTML = '<p class="lb-loading">불러오는 중···</p>';

  const now = new Date();
  const periodKey = lbPeriod === 'week' ? getWeekKey(now) : getMonthKey(now);
  const TOP_N = 10;

  let rows = [];
  try {
    const { data, error } = await sb.from('user_stats')
      .select('nickname, count, title_emoji, total_seconds')
      .eq('period_type', lbPeriod).eq('period_key', periodKey)
      .order('count', { ascending: false }).limit(TOP_N);
    if (error?.code === '42703' || error?.code === 'PGRST204') {
      const { data: d2, error: e2 } = await sb.from('user_stats')
        .select('nickname, count, title_emoji')
        .eq('period_type', lbPeriod).eq('period_key', periodKey)
        .order('count', { ascending: false }).limit(TOP_N);
      if (e2?.code === '42703' || e2?.code === 'PGRST204') {
        const { data: d3 } = await sb.from('user_stats').select('nickname, count')
          .eq('period_type', lbPeriod).eq('period_key', periodKey)
          .order('count', { ascending: false }).limit(TOP_N);
        if (d3) rows = d3;
      } else if (d2) { rows = d2; }
    } else if (!error && data) { rows = data; }
  } catch {}

  if (!rows.length) {
    $body.innerHTML = '<p class="lb-empty">아직 기록이 없어요. 타이머를 완료하면 집계돼요!</p>';
    return;
  }

  // 동률 시 "나"를 후순위로 — DB 2차 정렬 기준 없음 보정
  // 규칙: 같은 횟수면 먼저 도달한 사람이 위, 나는 초과해야 앞서기 가능
  rows.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (a.nickname === myNickname) return 1;   // 나는 뒤로
    if (b.nickname === myNickname) return -1;
    return 0; // 타인 간 동률은 DB 순서 유지
  });

  const isMobile = window.matchMedia?.('(max-width: 480px)').matches ?? false;
  const medalEmojis = ['🥇', '🥈', '🥉'];
  const myInTop = rows.findIndex(r => r.nickname === myNickname);
  let myRankRow = null;

  if (myNickname && myInTop === -1) {
    let myCount = 0, myTotalSecs = 0;
    try {
      const { data: myData } = await sb.from('user_stats').select('count, total_seconds')
        .eq('nickname', myNickname).eq('period_type', lbPeriod).eq('period_key', periodKey)
        .maybeSingle();
      if (myData) { myCount = myData.count ?? 0; myTotalSecs = myData.total_seconds ?? 0; }
    } catch {}
    let aboveMe = 0;
    try {
      const { count } = await sb.from('user_stats')
        .select('nickname', { count: 'exact', head: true })
        .eq('period_type', lbPeriod).eq('period_key', periodKey)
        .gte('count', myCount).neq('nickname', myNickname);
      aboveMe = count ?? 0;
    } catch {}
    myRankRow = { nick: myNickname, count: myCount, rank: aboveMe + 1, totalSecs: myTotalSecs };
  }

  // 세션 유형 라벨 (평균 집중 분 기준)
  function getSessionLabel(avgMin) {
    if (avgMin > 0 && avgMin < 10) return '방울토마토 러너';
    if (avgMin >= 20 && avgMin <= 35) return '정석 수확러';
    if (avgMin >= 60) return '장기 숙성 토마토';
    return '';
  }

  function buildRow(nick, count, rank, emoji = '', totalSecs = 0) {
    const isMe = nick === myNickname;
    const rankBadge = rank <= 3
      ? `<span style="font-size:1.4rem;line-height:1;display:inline-flex;align-items:center;justify-content:center;width:28px;flex-shrink:0">${medalEmojis[rank - 1]}</span>`
      : `<span class="lb-rank-badge" style="background:#e0dbd8;color:#888">${rank}</span>`;
    const countColor = rank <= 3 ? 'color:var(--accent);' : '';
    const titleEmoji = isMe
      ? (getCurrentTitle()?.emoji || emoji || '')
      : (emoji || '');
    const nickText = titleEmoji ? `${titleEmoji} ${escapeHtml(nick)}` : escapeHtml(nick);

    // 보조 정보 — total_seconds 있을 때만 표시
    let subHtml = '';
    if (totalSecs > 0 && count > 0) {
      const totalMins = Math.floor(totalSecs / 60);
      const avgMin = totalMins > 0 ? Math.round(totalMins / count) : 0;
      const label = getSessionLabel(avgMin);
      const labelHtml = label ? `<span class="lb-session-label">${label}</span>` : '';
      const totalText = totalMins >= 60
        ? `총 ${Math.floor(totalMins / 60)}시간 ${totalMins % 60}분`
        : `총 ${totalMins}분`;
      subHtml = `<span class="lb-sub">${totalText}${labelHtml ? ' · ' + labelHtml : (avgMin > 0 ? ` · 평균 ${avgMin}분` : '')}</span>`;
    }

    return `
      <div class="lb-row${isMe ? ' lb-row-me' : ''}">
        ${rankBadge}
        <div class="lb-info">
          <span class="lb-nick"><span class="lb-nick-text">${nickText}</span></span>
          ${subHtml}
        </div>
        <span class="lb-count" style="${countColor}">${count}회</span>
      </div>`;
  }

  let html = rows.map((r, i) => buildRow(r.nickname, r.count, i + 1, r.title_emoji || '', r.total_seconds || 0)).join('');
  // 11위 이상일 때만 말줄임표 + 내 순위 표시 (10위 이내면 위 목록에 포함되거나 생략)
  if (myRankRow && myRankRow.rank > 10) {
    html += '<div class="league-my-rank-sep">···</div>';
    html += buildRow(myRankRow.nick, myRankRow.count, myRankRow.rank, getCurrentTitle()?.emoji || '', myRankRow.totalSecs || 0);
  }
  $body.innerHTML = html;
}

// 리더보드 기간 탭 이벤트
document.querySelectorAll('.lb-period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lb-period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    lbPeriod = btn.dataset.period;
    renderLeaderboard();
  });
});

// =====================================================
// v0.1.79 B — 집중 피드 (소셜 탭)
// =====================================================

let focusFeedChannel = null;

async function renderFocusFeed() {
  const $body = document.getElementById('focusFeedBody');
  if (!$body) return;

  if (!sb) {
    $body.innerHTML = '<p class="lb-empty">오프라인 상태입니다.</p>';
    return;
  }

  let rows = [];
  try {
    // title_emoji 컬럼 포함 쿼리 (없으면 fallback)
    // status_public = true 또는 null(미설정) 유저 모두 포함, false인 유저만 제외
    const { data, error } = await sb
      .from('user_presence')
      .select('nickname, title_emoji')
      .eq('is_focusing', true)
      .or('status_public.is.null,status_public.eq.true')
      .order('updated_at', { ascending: false });

    if (error?.code === '42703' || error?.code === 'PGRST204') {
      // title_emoji 컬럼 없음 → 닉네임만 조회
      const r2 = await sb.from('user_presence')
        .select('nickname')
        .eq('is_focusing', true)
        .or('status_public.is.null,status_public.eq.true')
        .order('updated_at', { ascending: false });
      if (r2.error?.code === '42703' || r2.error?.code === 'PGRST204') {
        // status_public 컬럼 없음 → 필터 없이 최종 조회
        const r3 = await sb.from('user_presence')
          .select('nickname')
          .eq('is_focusing', true)
          .order('updated_at', { ascending: false });
        rows = r3.data ?? [];
      } else {
        rows = r2.data ?? [];
      }
    } else if (data) {
      rows = data;
    } else if (error) {
      console.error('[focusFeed] 쿼리 실패:', error.code, error.message);
    }
  } catch {}

  if (!rows.length) {
    $body.innerHTML = '<p class="lb-empty focus-empty-text">아직 집중 중인 유저가 없어요 😴</p>';
    return;
  }

  const MAX_VIS = 12;
  const visible = rows.slice(0, MAX_VIS);
  const extra   = rows.length - MAX_VIS;

  const pillsHtml = visible.map(r => {
    const isMe  = r.nickname === myNickname;
    const nick  = escapeHtml(r.nickname || '?');
    // title_emoji: DB에 있으면 사용, 내 계정은 로컬 계산으로 보정
    const emoji = isMe
      ? (getCurrentTitle()?.emoji ?? r.title_emoji ?? '')
      : (r.title_emoji ?? '');
    const badgeHtml = emoji ? `<span class="focus-nick-title">${emoji}</span>` : '';
    return `<span class="focus-nick-pill${isMe ? ' focus-nick-pill-me' : ''}">${badgeHtml}${nick}</span>`;
  }).join('');

  const extraHtml = extra > 0
    ? `<span class="focus-nick-pill focus-nick-pill-extra">+${extra}</span>`
    : '';

  const countText = rows.length === 1
    ? `지금 <strong>1명</strong>이 집중 중이에요 🍅`
    : `지금 <strong>${rows.length}명</strong>이 함께 집중 중이에요 🍅`;

  $body.innerHTML = `
    <div class="focus-nicks">${pillsHtml}${extraHtml}</div>
    <p class="focus-count-text">${countText}</p>`;
}

function subscribeFocusFeed() {
  if (!sb) return;
  if (focusFeedChannel) { sb.removeChannel(focusFeedChannel); focusFeedChannel = null; }
  focusFeedChannel = sb.channel('focus-feed-global')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'user_presence' },
      () => {
        if (!document.getElementById('tab-social')?.classList.contains('tab-panel-hidden')) {
          renderFocusFeed();
        }
      }
    )
    .subscribe();
}

// =====================================================
// v0.1.79 C — 공개 배틀방 (리그 탭)
// =====================================================

let publicBattleChannel = null;
let pubBattleEditMode   = false; // 편집 모드 (방 숨기기·신고)

async function renderPublicBattles() {
  const $body = document.getElementById('publicBattleBody');
  if (!$body) return;

  if (!sb) {
    $body.innerHTML = '<p class="lb-empty">오프라인 상태입니다.</p>';
    return;
  }

  let rows = [];
  let colMissing = false;
  try {
    const { data, error } = await sb
      .from('battles')
      .select('id, creator_nickname, mode, task_common, duration_sec, max_players, created_at, battle_players(nickname, is_ready)')
      .eq('is_public', true)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      if (error.code === '42703') colMissing = true;
    } else if (data) {
      rows = data;
    }
  } catch {}

  if (colMissing) {
    $body.innerHTML = `<p class="lb-empty lb-empty-code">Supabase SQL 에디터에서 아래를 실행해주세요:<br>
<code>ALTER TABLE battles ADD COLUMN is_public boolean DEFAULT false;</code><br>
<code>ALTER TABLE battles ADD COLUMN max_players int DEFAULT 2;</code></p>`;
    return;
  }

  // 숨긴 방 필터 — 편집 모드에서도 항상 숨긴 방은 표시하지 않음
  const hiddenIds = getHiddenBattleIds();
  const visibleRows = rows.filter(b => !hiddenIds.has(b.id));

  if (!visibleRows.length) {
    $body.innerHTML = '<p class="lb-empty">공개 배틀방이 없어요. 먼저 만들어보세요!</p>';
    return;
  }

  $body.innerHTML = visibleRows.map(b => {
    const isMe    = b.creator_nickname === myNickname;
    const isHidden = hiddenIds.has(b.id);
    const mins = Math.round(b.duration_sec / 60);
    const nick = escapeHtml(truncEnd(b.creator_nickname, 10));
    const task = b.task_common ? escapeHtml(truncEnd(b.task_common, 16)) : '목표 미정';
    const currentPlayers = Array.isArray(b.battle_players) ? b.battle_players.length : 1;
    const maxPlayers = b.max_players ?? 2;
    const isFull = currentPlayers >= maxPlayers;

    let actionHtml;
    if (pubBattleEditMode && !isMe) {
      // 편집 모드: 숨기기 / 신고 버튼
      actionHtml = `
        <button class="btn-mini btn-hide-battle${isHidden ? ' btn-hide-battle--active' : ''}" data-battle-id="${b.id}" type="button">${isHidden ? '보이기' : '숨기기'}</button>
        <button class="btn-mini btn-report-battle" data-battle-id="${b.id}" data-creator="${escapeHtml(b.creator_nickname)}" type="button">🚩</button>`;
    } else if (isMe) {
      // 방장: 본인 제외 전원 준비 완료 시 초록, 아니면 회색
      const bPlayers = b.battle_players ?? [];
      const others = bPlayers.filter(p => p.nickname !== myNickname);
      const allOthersReady = others.length > 0 && others.every(p => p.is_ready);
      actionHtml = allOthersReady
        ? `<button class="btn-mini btn-mini-green btn-reopen-lobby" data-battle-id="${b.id}" type="button">준비 완료!</button>`
        : `<button class="btn-mini btn-reopen-lobby" data-battle-id="${b.id}" type="button">대기 중</button>`;
    } else {
      // 참여자: battle_players에 내 닉네임이 있으면 이미 방에 있는 것 → '대기 중'
      const imParticipant = (b.battle_players ?? []).some(p => p.nickname === myNickname);
      if (imParticipant) {
        // btn-join-public 제거: 두 핸들러 동시 부착 방지 (중복 openPublicLobby 호출 → 팝업 2번)
        actionHtml = `<button class="btn-mini btn-reopen-lobby" data-battle-id="${b.id}" type="button">대기 중</button>`;
      } else if (isFull) {
        actionHtml = '<span class="pb-full">마감</span>';
      } else {
        actionHtml = `<button class="btn-mini btn-join-public" data-battle-id="${b.id}" type="button">참여하기</button>`;
      }
    }

    // 삭제 버튼: 편집 모드일 때만 방장 카드에 표시
    const deleteBtn = (isMe && pubBattleEditMode)
      ? `<button class="btn-mini btn-delete-public" data-battle-id="${b.id}" type="button" title="방 삭제">🗑</button>`
      : '';

    return `<div class="public-battle-row${isMe ? ' lb-row-me' : ''}${isHidden ? ' pb-row-hidden' : ''}">
      <span class="pb-mode">🍅 ${mins}분</span>
      <span class="pb-nick"><span class="pb-nick-text">${nick}${isMe ? ' <span class="lb-me-badge">나</span>' : ''}</span><span class="pb-task">${task}</span></span>
      <span class="pb-count">${currentPlayers}/${maxPlayers}명</span>
      ${actionHtml}
      ${deleteBtn}
    </div>`;
  }).join('');

  $body.querySelectorAll('.btn-join-public').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!myNickname) { alert('닉네임을 먼저 설정해주세요.'); return; }
      openPublicLobby(btn.dataset.battleId);
    });
  });

  // "로비 열기" — 방장이 창을 닫았다가 다시 열 때
  $body.querySelectorAll('.btn-reopen-lobby').forEach(btn => {
    btn.addEventListener('click', () => { openPublicLobby(btn.dataset.battleId); });
  });

  // 편집 모드 — 방 숨기기
  $body.querySelectorAll('.btn-hide-battle').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleHiddenBattle(btn.dataset.battleId);
      renderPublicBattles();
    });
  });

  // 편집 모드 — 신고
  $body.querySelectorAll('.btn-report-battle').forEach(btn => {
    btn.addEventListener('click', () => {
      const creator = btn.dataset.creator || '(알 수 없음)';
      if (confirm(`"${creator}"의 방을 신고할까요?\n운영팀이 확인 후 조치합니다.`)) {
        // TODO: Supabase에 신고 데이터 저장 (battle_reports 테이블)
        alert('신고가 접수됐어요. 운영팀이 확인할게요.');
      }
    });
  });

  $body.querySelectorAll('.btn-delete-public').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('이 공개 방을 삭제할까요?')) return;
      const ok = await deleteBattleSilent(btn.dataset.battleId);
      if (!ok) { alert('삭제 중 오류가 발생했어요.'); return; }
      await renderMyBattles();
      renderPublicBattles();
    });
  });
}

// ====== v0.1.81 — 공개 배틀 로비 / 레디 시스템 ======

let publicLobbyBattleId   = null;
let publicLobbyBattle     = null;
let publicLobbyChannel    = null;
let isStartingPublicLobby = false;

/** 공개 배틀방 로비 열기 (참여 or 생성 후 호출) */
async function openPublicLobby(battleId) {
  if (!sb || !myNickname) return;

  const $modal = document.getElementById('publicLobbyModal');

  // 잔재 카운트다운 제거 + 액션 버튼 복원 (이전 세션 잔재 방지)
  $modal?.querySelectorAll('.pub-lobby-countdown').forEach(el => el.remove());
  const $actions = $modal?.querySelector('.pub-lobby-actions');
  if ($actions) $actions.style.display = '';

  // ── 방장이 자신의 방을 다시 열기 ──────────────────────────
  if (publicLobbyBattleId === battleId && publicLobbyChannel) {
    const { data } = await sb.from('battle_players')
      .select('*').eq('battle_id', battleId).order('created_at', { ascending: true });
    const players = data ?? currentBattleData?.players ?? [];
    currentBattleData = { battle: publicLobbyBattle, players };
    renderPublicLobby(publicLobbyBattle, players);
    enrichLobbyWithPartnerBadges(players); // 배지 갱신
    if ($modal && typeof $modal.showModal === 'function') $modal.showModal();
    return;
  }

  // ── 새로 참여 / 방 만든 직후 진입 ────────────────────────
  publicLobbyBattleId = battleId;

  const result = await fetchBattle(battleId);
  if (!result?.battle) {
    publicLobbyBattleId = null; // 잘못 선점한 ID 초기화
    renderPublicBattles();      // 삭제된 방 목록에서 제거
    alert('방장이 방을 삭제했어요.');
    return;
  }

  publicLobbyBattle = result.battle;
  let players = result.players ?? [];

  // 아직 내가 battle_players에 없으면 참여 등록
  const alreadyIn = players.some(p => p.nickname === myNickname);
  if (!alreadyIn) {
    const { error } = await sb.from('battle_players').insert({
      battle_id: battleId,
      nickname: myNickname,
      is_creator: false,
      is_ready: false,
    });
    if (error) { alert('참여 실패: ' + error.message); return; }
    unlockAchievement('F-2');   // 공개방 첫 참여
    const r = await sb.from('battle_players').select('*').eq('battle_id', battleId).order('created_at', { ascending: true });
    players = r.data ?? players;
  }

  // 기존 타이머 시스템과 상태 공유
  currentBattleId   = battleId;
  currentBattleData = { battle: publicLobbyBattle, players };

  renderPublicLobby(publicLobbyBattle, players);
  enrichLobbyWithPartnerBadges(players); // 참여자도 입장 즉시 배지 표시
  subscribePublicLobby(battleId);

  if ($modal && typeof $modal.showModal === 'function') $modal.showModal();
}

/** 로비 플레이어 목록에 파트너 이력 배지 추가 (비동기, 렌더 후 호출) */
async function enrichLobbyWithPartnerBadges(players) {
  // 플레이어 없음(방 삭제 or 빈 방) → 잔류 인사 버튼 제거 후 종료
  if (!players?.length) {
    document.getElementById('publicLobbyModal')?.querySelector('.pub-lobby-greet-btn')?.remove();
    return;
  }
  if (!sb || !myNickname) return;
  const others = players.filter(p => p.nickname !== myNickname).map(p => p.nickname);
  if (!others.length) {
    // 혼자 있는 방: 이전 방에서 남은 인사 버튼 제거
    const $modal = document.getElementById('publicLobbyModal');
    $modal?.querySelector('.pub-lobby-greet-btn')?.remove();
    return;
  }
  try {
    // 닉네임 체인 추적: 다단계 변경(A→B→C)까지 모두 역추적
    // oldToCurrentNick: { 이전닉네임: 현재로비닉네임 }
    // currentToLatestOld: { 현재로비닉네임: 바로이전닉네임 (배지 표시용) }
    const oldToCurrentNick = {};
    const currentToLatestOld = {};
    try {
      let frontier = [...others];
      const visited = new Set(others);
      while (frontier.length > 0) {
        const { data: hist } = await sb.from('nickname_history')
          .select('old_nickname, new_nickname')
          .in('new_nickname', frontier)
          .order('changed_at', { ascending: false });
        if (!hist?.length) break;
        const nextFrontier = [];
        for (const h of hist) {
          if (!visited.has(h.old_nickname)) {
            visited.add(h.old_nickname);
            const curNick = oldToCurrentNick[h.new_nickname] || h.new_nickname;
            oldToCurrentNick[h.old_nickname] = curNick;
            if (!currentToLatestOld[curNick]) currentToLatestOld[curNick] = h.old_nickname;
            nextFrontier.push(h.old_nickname);
          }
        }
        frontier = nextFrontier;
      }
    } catch { /* nickname_history 없으면 무시 */ }

    // 역방향 보완: 내 user_partner_stats의 저장된 구 닉네임 → nickname_history 앞방향 → 현재 로비 닉네임
    // (forward chain에서 못 찾은 경우를 보완)
    try {
      const { data: myAllStats } = await sb.from('user_partner_stats')
        .select('partner').eq('nickname', myNickname);
      const unresolved = (myAllStats || []).map(d => d.partner)
        .filter(n => !visited.has(n)); // forward chain이 이미 처리한 닉네임 제외

      if (unresolved.length > 0) {
        const { data: fwd } = await sb.from('nickname_history')
          .select('old_nickname, new_nickname')
          .in('old_nickname', unresolved)
          .order('changed_at', { ascending: true });

        if (fwd?.length) {
          // 체인 구성: old → (chain) → current lobby nick
          const directFwd = {};
          for (const h of fwd) { directFwd[h.old_nickname] = h.new_nickname; }

          for (const startNick of unresolved) {
            if (!directFwd[startNick]) continue;
            let cur = directFwd[startNick];
            const seen = new Set([startNick]);
            while (cur && !seen.has(cur)) {
              if (others.includes(cur)) {
                oldToCurrentNick[startNick] = cur;
                if (!currentToLatestOld[cur]) currentToLatestOld[cur] = startNick;
                break;
              }
              seen.add(cur);
              cur = directFwd[cur];
            }
          }
        }
      }
    } catch { /* 무시 */ }

    // 현재 닉네임 + 모든 이전 닉네임으로 파트너 통계 조회, 현재 닉네임 기준 집계
    const allLookups = [...new Set([...others, ...Object.keys(oldToCurrentNick)])];
    const { data } = await sb.from('user_partner_stats')
      .select('partner, battle_count, total_sec')
      .eq('nickname', myNickname)
      .in('partner', allLookups);
    if (!data?.length) return;
    const statsMap = {}; // { 현재로비닉네임: { battle_count, total_sec } }
    for (const d of data) {
      const curNick = oldToCurrentNick[d.partner] || d.partner;
      if (!statsMap[curNick]) {
        statsMap[curNick] = { battle_count: d.battle_count, total_sec: d.total_sec || 0 };
      } else {
        statsMap[curNick].battle_count += d.battle_count;
        statsMap[curNick].total_sec    += d.total_sec || 0;
      }
    }

    const $list = document.getElementById('pubLobbyPlayers');
    if (!$list) return;
    const knownInLobby = []; // 이번 로비에서 발견한 파트너

    $list.querySelectorAll('.pub-lobby-player:not(.is-me)').forEach(el => {
      if (el.querySelector('.pub-lobby-partner-badge')) return;
      // data-nick 속성 우선 사용 — 16자 초과 닉네임이 truncEnd로 잘려도 원본 닉 유지
      const nick = el.dataset.nick || el.querySelector('.pub-lobby-nick')?.firstChild?.textContent?.trim();
      if (!nick) return;
      const s = statsMap[nick]; // 이미 현재 닉네임 기준으로 집계됨
      if (!s) return;

      const tier    = getPartnerTier(s.battle_count);
      const oldHint = currentToLatestOld[nick] ? ` (구: ${currentToLatestOld[nick]})` : '';

      // 배지: 5회+(tier 있을 때)만 표시
      if (tier) {
        const badge = document.createElement('span');
        badge.className = 'pub-lobby-partner-badge';
        badge.textContent = `${tier.emoji} ${tier.label} · ${s.battle_count}번${oldHint}`;
        el.appendChild(badge);
      }
      knownInLobby.push({ nick, count: s.battle_count, tier, el });
    });

    // 파트너 발견 시 인사 버튼 (두 줄: 파트너 메시지 + 힌트)
    const $modal  = document.getElementById('publicLobbyModal');
    $modal?.querySelector('.pub-lobby-partner-msg')?.remove();
    $modal?.querySelector('.pub-lobby-greet-btn')?.remove();
    if (knownInLobby.length > 0) {
      const top = knownInLobby.sort((a, b) => b.count - a.count)[0];

      // 파트너 메시지 텍스트 결정
      let msgText;
      if (knownInLobby.length > 1) {
        msgText = `🔥 아는 파트너가 ${knownInLobby.length}명이나 있어요!`;
      } else {
        const { nick, count } = top;
        if (count >= 20)      msgText = `⚡ ${escapeHtml(nick)}님과는 이미 숙명의 맞수예요!`;
        else if (count >= 10) msgText = `🌙 ${escapeHtml(nick)}님과 떼려야 뗄 수 없는 사이!`;
        else if (count >= 5)  msgText = `🏃 ${escapeHtml(nick)}님과 자주 달리는 사이예요`;
        else if (count >= 2)  msgText = `🔥 ${escapeHtml(nick)}님과 또 만났네요!`;
        else                  msgText = `👋 ${escapeHtml(nick)}님, 저번에 같이 달렸었죠!`;
      }

      // 두 줄 버튼: 파트너 메시지 + 인사 힌트
      const $greetBtn = document.createElement('button');
      $greetBtn.className = 'pub-lobby-greet-btn';
      $greetBtn.type = 'button';
      $greetBtn.innerHTML =
        `<span class="greet-msg-line">${msgText}</span>` +
        `<span class="greet-hint-line">버튼을 눌러 인사를 보내세요!</span>`;

      let _rainBusy = false;
      $greetBtn.addEventListener('click', () => {
        if (_rainBusy) return;
        const $m = document.getElementById('publicLobbyModal');
        if (!$m?.open) return;
        _rainBusy = true;
        // 내 화면: 이모지 샤워 (토스트 없음)
        showEmojiRainGreeting('', false);
        // 상대방에게 broadcast
        publicLobbyChannel?.send({
          type: 'broadcast', event: 'emoji_rain', payload: { from: myNickname }
        });
        setTimeout(() => { _rainBusy = false; }, 2800);
      });

      document.getElementById('pubLobbyStatus')?.insertAdjacentElement('beforebegin', $greetBtn);
    }
  } catch {}
}

/** 로비 모달 UI 렌더링 */
function renderPublicLobby(battle, players) {
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE' : '🎲 MOTO MODE';
  const mins      = Math.round(battle.duration_sec / 60);
  const readyCount = players.filter(p => p.is_ready).length;

  const $title = document.getElementById('pubLobbyTitle');
  const $info  = document.getElementById('pubLobbyInfo');
  const $list  = document.getElementById('pubLobbyPlayers');
  const $status = document.getElementById('pubLobbyStatus');
  const $readyBtn = document.getElementById('pubLobbyReadyBtn');
  if (!$list) return;

  if ($title) $title.textContent = `${modeLabel} · ${mins}분`;
  // 준비 정보 제거 — 접속 인원만 표시
  if ($info)  $info.textContent  = `접속 ${players.length} / ${battle.max_players}명`;

  $list.innerHTML = players.map(p => {
    const isMe = p.nickname === myNickname;
    const nickDisplay = escapeHtml(truncEnd(p.nickname ?? '', 16)); // 16자 초과 시 말줄임표
    return `<div class="pub-lobby-player${isMe ? ' is-me' : ''}${p.is_ready ? ' is-ready' : ''}" data-nick="${escapeHtml(p.nickname ?? '')}">
      <span class="pub-lobby-icon">${p.is_ready ? '✅' : '⏳'}</span>
      <span class="pub-lobby-nick">${nickDisplay}${isMe ? ' <span class="lb-me-badge">나</span>' : ''}</span>
      ${p.is_creator ? '<span class="pub-lobby-badge">방장</span>' : ''}
    </div>`;
  }).join('');

  const myPlayer  = players.find(p => p.nickname === myNickname);
  const allReady  = players.length >= 2 && players.every(p => p.is_ready);
  const waiting   = players.length < 2;

  // "닫기": 항상 창만 닫기 (방·채널 유지)
  // "방 나가기": 비방장만 표시 — 실제로 방에서 제거
  const $leaveBtn = document.getElementById('pubLobbyLeaveBtn');
  const $quitBtn  = document.getElementById('pubLobbyQuitBtn');
  if ($leaveBtn) $leaveBtn.textContent = '창 닫기';
  if ($quitBtn)  $quitBtn.style.display = myPlayer?.is_creator ? 'none' : '';

  if ($readyBtn) {
    if (myPlayer?.is_ready) {
      $readyBtn.textContent  = '준비 취소';
      $readyBtn.className    = 'btn-modal btn-modal-secondary';
    } else {
      $readyBtn.textContent  = '준비 완료';
      $readyBtn.className    = 'btn-modal btn-modal-basil'; // 초록
    }
    $readyBtn.disabled = false;
  }

  if ($status) {
    if (allReady) {
      $status.textContent = '모두 준비됐어요! 곧 시작돼요···';
      $status.className   = 'pub-lobby-status pub-lobby-status--go';
    } else if (waiting) {
      $status.textContent = '다른 플레이어를 기다리는 중···';
      $status.className   = 'pub-lobby-status';
    } else {
      $status.textContent = `${players.filter(p => !p.is_ready).length}명이 아직 준비 중이에요.`;
      $status.className   = 'pub-lobby-status';
    }
  }
}

/** 로비 Realtime 구독 */
function subscribePublicLobby(battleId) {
  if (publicLobbyChannel && sb) { sb.removeChannel(publicLobbyChannel); publicLobbyChannel = null; }
  if (!sb) return;

  async function _refreshLobbyPlayers() {
    const { data: players } = await sb.from('battle_players')
      .select('*').eq('battle_id', battleId).order('created_at', { ascending: true });
    if (!publicLobbyBattle) return;

    // 방장이 방 삭제 시 battle_players 전체 삭제 → 내 row 사라짐 → 로비 강제 종료
    if (players !== null && !players.some(p => p.nickname === myNickname)) {
      _cleanupLobbyState();
      const $modal = document.getElementById('publicLobbyModal');
      if ($modal?.open) {
        if (typeof $modal.close === 'function') $modal.close();
        else $modal.removeAttribute('open');
      }
      renderPublicBattles();
      return;
    }

    currentBattleData = { battle: publicLobbyBattle, players: players ?? [] };
    renderPublicLobby(publicLobbyBattle, players ?? []);
    enrichLobbyWithPartnerBadges(players ?? []);
    // 공개 배틀 목록의 방장 버튼도 ready 상태 반영
    renderPublicBattles();

    // 전원 레디 → 방장만 카운트다운 트리거
    const allReady = (players?.length >= 2) && players.every(p => p.is_ready);
    const isCreator = players?.find(p => p.nickname === myNickname)?.is_creator;
    if (allReady && isCreator && !isStartingPublicLobby) {
      startPublicLobbyCountdown(false);
    }
  }

  publicLobbyChannel = sb.channel(`pub-lobby-${battleId}`)
    // battle_players 변경(참여·레디·나가기) 감지
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'battle_players', filter: `battle_id=eq.${battleId}` },
      () => _refreshLobbyPlayers()
    )
    // battles 업데이트 감지 (참가자 나가기 시 battles.updated_at 업데이트 → 즉시 반영)
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'battles', filter: `id=eq.${battleId}` },
      () => _refreshLobbyPlayers()
    )
    // 수신자: 방장이 방 삭제 — 로비 종료 처리
    .on('broadcast', { event: 'room-deleted' }, () => {
      const $modal = document.getElementById('publicLobbyModal');
      $modal?.querySelector('.pub-lobby-greet-btn')?.remove();
      if ($modal?.open) {
        // 모달 열려있음 → 삭제 메시지 표시 후 2초 뒤 닫기
        const $list = document.getElementById('pubLobbyPlayers');
        if ($list) $list.innerHTML =
          '<p style="text-align:center;color:var(--text-sub,#888);padding:28px 0;font-size:0.9rem;">방장이 방을 삭제했어요.</p>';
        const $readyBtn = document.getElementById('pubLobbyReadyBtn');
        if ($readyBtn) $readyBtn.disabled = true;
        setTimeout(() => {
          _cleanupLobbyState();
          if ($modal.open) { if (typeof $modal.close === 'function') $modal.close(); else $modal.removeAttribute('open'); }
          renderPublicBattles();
        }, 2000);
      } else {
        // 모달 닫혀있음 → 즉시 상태 정리
        _cleanupLobbyState();
        renderPublicBattles();
      }
    })
    // 수신자: 방장의 카운트다운 시작 신호 수신
    .on('broadcast', { event: 'pub-lobby-start' }, async () => {
      if (isStartingPublicLobby || timer.isRunning) return;
      const result = await fetchBattle(battleId);
      if (result?.battle) currentBattleData = result;
      startPublicLobbyCountdown(true);
    })
    // 수신자: 파트너가 인사 버튼을 누름
    .on('broadcast', { event: 'emoji_rain' }, ({ payload }) => {
      if (!payload?.from || payload.from === myNickname) return;
      const $modal = document.getElementById('publicLobbyModal');
      if ($modal?.open) {
        // 로비 열려있음 → 이모지 샤워 (토스트 없음, 상대가 눈앞에 있으니)
        showEmojiRainGreeting(payload.from, false);
      } else {
        // 로비 닫혀있음 → 이모지 샤워 + 인사 도착 토스트
        showEmojiRainGreeting(payload.from, true);
      }
    })
    .subscribe();
}

/** 준비 상태 토글 */
async function togglePublicReady() {
  if (!sb || !publicLobbyBattleId || !myNickname) return;
  const myPlayer = currentBattleData?.players?.find(p => p.nickname === myNickname);
  const newReady = !myPlayer?.is_ready;
  document.getElementById('pubLobbyReadyBtn').disabled = true;
  await sb.from('battle_players')
    .update({ is_ready: newReady })
    .eq('battle_id', publicLobbyBattleId)
    .eq('nickname', myNickname);
  // renderPublicLobby는 subscribePublicLobby 콜백에서 자동 호출됨
}

/** 로비 카운트다운 + 타이머 시작 */
async function startPublicLobbyCountdown(isReceiver = false) {
  if (isStartingPublicLobby || timer.isRunning) return;
  isStartingPublicLobby = true;

  const $modal   = document.getElementById('publicLobbyModal');
  const $actions = $modal?.querySelector('.pub-lobby-actions');

  // 모달이 닫혀 있으면(창 닫고 대기 중이던 방장) 다시 열어줌
  if ($modal && !$modal.open) $modal.showModal();

  if (!isReceiver) {
    // 방장: 시작 신호 Broadcast + DB 업데이트
    publicLobbyChannel?.send({ type: 'broadcast', event: 'pub-lobby-start', payload: {} });
    if (sb && currentBattleId) {
      sb.from('battles')
        .update({ status: 'active', countdown_started_at: new Date().toISOString() })
        .eq('id', currentBattleId)
        .then();
    }
  }

  // 모달 버튼 숨기고 카운트다운 표시
  if ($actions) $actions.style.display = 'none';
  const countEl = document.createElement('div');
  countEl.className = 'battle-countdown pub-lobby-countdown';
  $modal?.appendChild(countEl);

  for (let n = 3; n >= 1; n--) {
    countEl.innerHTML = `<div class="battle-countdown-num">${n}</div>`;
    await new Promise(r => setTimeout(r, 900));
  }
  countEl.innerHTML = `<div class="battle-countdown-num">시작!</div>`;
  playHifive();
  await new Promise(r => setTimeout(r, 750));

  // 카운트다운 요소 제거 + 버튼 복원 (다음 오픈 시 잔재 방지)
  countEl.remove();
  if ($actions) $actions.style.display = '';

  // 정리 후 타이머 시작
  if (publicLobbyChannel && sb) { sb.removeChannel(publicLobbyChannel); publicLobbyChannel = null; }
  publicLobbyBattleId   = null;
  publicLobbyBattle     = null;
  isStartingPublicLobby = false;
  if ($modal) $modal.close();

  startBattleTimer();  // currentBattleData / currentBattleId 그대로 사용
}

/** 로비 상태 완전 초기화 (방 삭제 or 나가기 시) */
function _cleanupLobbyState() {
  if (publicLobbyChannel && sb) { sb.removeChannel(publicLobbyChannel); publicLobbyChannel = null; }
  publicLobbyBattleId   = null;
  publicLobbyBattle     = null;
  isStartingPublicLobby = false;
}

/** 로비 닫기
 *  deleteRoom=true  → 방 삭제 (DB에서 전체 제거)
 *  leaveRoom=true   → 일반 참여자 나가기 (내 행만 삭제)
 *  둘 다 false      → 창만 닫기, 방/채널 유지 (방장용)
 */
async function closePublicLobby(deleteRoom = false, leaveRoom = false) {
  if (deleteRoom && publicLobbyBattleId) {
    await deleteBattleSilent(publicLobbyBattleId);
    _cleanupLobbyState();
    renderPublicBattles();
  } else if (leaveRoom && publicLobbyBattleId && sb && myNickname) {
    const leavingBattleId = publicLobbyBattleId;
    // 일반 참여자 — 내 행만 삭제
    await sb.from('battle_players')
      .delete()
      .eq('battle_id', leavingBattleId)
      .eq('nickname', myNickname);
    // battles.updated_at 업데이트 → 남은 참가자들의 battles 구독 트리거 → 즉시 UI 반영
    sb.from('battles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', leavingBattleId)
      .then();
    _cleanupLobbyState();
  }
  // 방장이 그냥 닫기: 아무것도 안 함 (publicLobbyBattleId·channel 유지)
  document.getElementById('publicLobbyModal')?.close();
}

// 로비 버튼 이벤트
(function initPublicLobbyEvents() {
  document.getElementById('pubLobbyReadyBtn')?.addEventListener('click', togglePublicReady);

  // "닫기" — 방장·참가자 모두: 창만 닫고 채널·상태 유지 (나중에 다시 열 수 있음)
  document.getElementById('pubLobbyLeaveBtn')?.addEventListener('click', async () => {
    await closePublicLobby(false, false);
    renderPublicBattles(); // "로비 열기" 버튼 반영
  });

  // "방 나가기" — 비방장 전용: 방에서 실제로 나가기
  document.getElementById('pubLobbyQuitBtn')?.addEventListener('click', async () => {
    if (!confirm('방을 나가면 다시 참가해야 해요. 나가시겠어요?')) return;
    await closePublicLobby(false, true);
    // 공개 배틀은 친구 배틀 목록과 무관 — renderMyBattles() 호출 제거
    renderPublicBattles();
  });
})();

function subscribePublicBattles() {
  if (!sb) return;
  if (publicBattleChannel) { sb.removeChannel(publicBattleChannel); publicBattleChannel = null; }
  publicBattleChannel = sb.channel('public-battles-global')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'battles' },
      (payload) => {
        if ((payload.new?.is_public || payload.old?.is_public) &&
            !document.getElementById('tab-social')?.classList.contains('tab-panel-hidden')) {
          renderPublicBattles();
        }
      }
    )
    .subscribe();
}

// 공개 방 만들기 모달 이벤트
(function initPublicBattleModal() {
  const $modal = document.getElementById('publicBattleCreateModal');
  const $confirm = document.getElementById('pubBattleConfirmBtn');
  const $cancel = document.getElementById('pubBattleCancelBtn');
  if (!$modal) return;

  let selectedMaxPlayers = 2;
  const MIN_PLAYERS = 2, MAX_PLAYERS = 10;

  function updateStepperDisplay() {
    const $count = document.getElementById('pubPlayerCount');
    if ($count) $count.textContent = selectedMaxPlayers;
    const $minus = document.getElementById('pubPlayerMinus');
    const $plus  = document.getElementById('pubPlayerPlus');
    if ($minus) $minus.disabled = selectedMaxPlayers <= MIN_PLAYERS;
    if ($plus)  $plus.disabled  = selectedMaxPlayers >= MAX_PLAYERS;
  }

  document.getElementById('pubPlayerMinus')?.addEventListener('click', () => {
    if (selectedMaxPlayers > MIN_PLAYERS) { selectedMaxPlayers--; updateStepperDisplay(); }
  });
  document.getElementById('pubPlayerPlus')?.addEventListener('click', () => {
    if (selectedMaxPlayers < MAX_PLAYERS) { selectedMaxPlayers++; updateStepperDisplay(); }
  });

  // 모달 열기 — TOM MODE 전용: 현재 task 미리보기 표시
  document.getElementById('createPublicBattleBtn')?.addEventListener('click', () => {
    if (!myNickname) { alert('닉네임을 먼저 설정해주세요.'); return; }
    selectedMaxPlayers = 2;
    updateStepperDisplay();
    // task 미리보기 업데이트
    const $preview = document.getElementById('pubBattleTaskPreview');
    if ($preview) {
      if (currentTask) {
        $preview.textContent = `"${currentTask}"`;
        $preview.className   = 'pub-battle-task-preview pub-battle-task-preview--set';
      } else {
        $preview.textContent = '⚠ 먼저 가챠를 돌려서 오늘의 목표를 정해주세요!';
        $preview.className   = 'pub-battle-task-preview pub-battle-task-preview--empty';
      }
    }
    if ($confirm) $confirm.disabled = !currentTask;
    $modal.showModal();
  });

  // 편집 버튼 — 방 목록 편집 모드 토글 (숨기기·신고)
  const $editBtn = document.getElementById('editPublicBattleBtn');
  $editBtn?.addEventListener('click', async () => {
    pubBattleEditMode = !pubBattleEditMode;
    if ($editBtn) {
      $editBtn.textContent = pubBattleEditMode ? '완료' : '편집';
      $editBtn.classList.toggle('btn-mini--editing', pubBattleEditMode);
    }
    await renderPublicBattles();
    if (pubBattleEditMode) {
      document.getElementById('publicBattleBody')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  $cancel?.addEventListener('click', () => $modal.close());

  $confirm?.addEventListener('click', async () => {
    const durationSec = parseInt(document.getElementById('pubBattleDuration')?.value || '1500', 10);
    // TOM MODE 전용 — 방장의 현재 가챠 결과를 공통 목표로 사용
    if (!currentTask) { alert('가챠를 먼저 돌려주세요!'); return; }
    // 금칙어 필터 — 공개방 제목으로 사용 시 검사
    if (hasBannedWord(currentTask)) {
      alert('공개방 목표에 사용할 수 없는 단어가 포함되어 있어요.\n다른 목표로 가챠를 돌려주세요.');
      return;
    }

    const battleId = makeBattleId();
    const battle = {
      id: battleId,
      creator_nickname: myNickname,
      mode: 'common',
      task_common: currentTask,
      duration_sec: durationSec,
      status: 'waiting',
      is_public: true,
      max_players: selectedMaxPlayers,
      created_at: new Date().toISOString(),
    };

    $modal.close();
    $confirm.disabled = true;

    try {
      await saveBattle(battle);
      // 공개 배틀은 친구 배틀 localStorage에 저장하지 않음 (분리)
      unlockAchievement('F-1');   // 공개방 첫 생성
      await renderPublicBattles();
      // 만든 직후 로비 열기 (subscribeWatchBattle 대신 publicLobby 구독)
      await openPublicLobby(battleId);
    } catch (e) {
      alert('공개 방 만들기 실패: ' + (e.message || e));
    } finally {
      $confirm.disabled = false;
    }
  });
})();

// 탭 이탈/복귀 처리
document.addEventListener('visibilitychange', () => {
  // E-1 몰래 딴짓: 타이머 진행 중 탭 숨김 5회 누적
  if (document.hidden && timer.isRunning) {
    const cnt = parseInt(localStorage.getItem(STORAGE.hiddenTabCount) || '0', 10) + 1;
    localStorage.setItem(STORAGE.hiddenTabCount, String(cnt));
    if (cnt >= 5) unlockAchievement('E-1');
  }

  // 탭이 다시 보일 때 즉시 업데이트 (백그라운드 throttle 보정)
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
    setTimeout(() => $customHours.focus(), 50); // 시간 입력란에 커서 이동
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
  const $titleEl = document.getElementById('userTitleDisplay');
  if ($titleEl) {
    const title = getCurrentTitle();
    if (title) {
      $titleEl.innerHTML = `<span class="user-title-emoji">${title.emoji}</span><span>${escapeHtml(title.name)}</span>`;
      $titleEl.dataset.titleId = title.id;
      $titleEl.hidden = false;
    } else {
      $titleEl.hidden = true;
    }
  }
}

// ====== v0.1.17 — 인증샷 Supabase Storage 업로드 ======

// dataUrl → Blob 변환 헬퍼
function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

// Supabase Storage proofs 버킷에 업로드 → { ok, publicUrl, reason } 반환
async function uploadProofToSupabase(dataUrl, battleId) {
  if (!sb || !myNickname || !battleId) return { ok: false, reason: 'no-config' };
  try {
    const blob = dataUrlToBlob(dataUrl);
    // 한글 등 특수문자 닉네임 → ASCII만 남김 (Storage key InvalidKey 방지)
    const safeName = (myNickname.replace(/[^\w-]/g, '_') || 'player').slice(0, 40);
    // timestamp 추가 → 항상 고유한 경로 → upsert(UPDATE 권한) 불필요
    const path = `${battleId}/${safeName}_${Date.now()}.jpg`;

    // 1) Storage 업로드 (upsert 제거 — INSERT 정책만으로 충분)
    const { error: uploadError } = await sb.storage
      .from('proofs')
      .upload(path, blob, { contentType: 'image/jpeg' });
    if (uploadError) {
      console.error('Storage 업로드 실패:', uploadError);
      return { ok: false, reason: 'storage', message: uploadError.message };
    }

    // 2) public URL 획득
    const { data: { publicUrl } } = sb.storage.from('proofs').getPublicUrl(path);

    // 3) battle_players 에 proof_url + 업로드 시각 저장
    const { error: updateError } = await sb.from('battle_players')
      .update({
        proof_url: publicUrl,
        proof_uploaded_at: new Date().toISOString(),
      })
      .eq('battle_id', battleId)
      .eq('nickname', myNickname);
    if (updateError) {
      console.error('proof_url DB 저장 실패:', updateError);
      return { ok: false, reason: 'db', message: updateError.message };
    }

    return { ok: true, publicUrl };
  } catch (err) {
    console.error('uploadProofToSupabase 오류:', err);
    return { ok: false, reason: 'exception', message: err.message };
  }
}

// ====== v0.1.17 — 배틀 결과 화면 ======

async function openBattleResult(battleId) {
  $battleResultSummary.textContent = '결과 불러오는 중···';
  $battleResultPlayers.innerHTML = '';
  if (typeof $battleResultModal.showModal === 'function') $battleResultModal.showModal();
  else $battleResultModal.setAttribute('open', '');

  if (!sb) {
    $battleResultSummary.textContent = 'Supabase가 연결되지 않았어요.';
    return;
  }

  const result = await fetchBattle(battleId);
  if (!result) {
    $battleResultSummary.textContent = '배틀 정보를 불러올 수 없어요.';
    return;
  }

  const { battle, players } = result;
  const minutes = Math.round(battle.duration_sec / 60);
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE'
    : battle.mode === 'shuffle' ? '🔀 SHUFFLE MODE'
    : '🎲 MOTO MODE';
  $battleResultSummary.textContent = `${modeLabel} · ${minutes}분 · ${battle.task_common || '각자 랜덤 가챠'}`;

  // 1:1 → VS 레이아웃 / 3명+ → 순위 리스트형
  const isBigPublic = players.length >= 3;

  function playerCard(player, showRole = true) {
    if (!player) {
      return `<div class="battle-result-card empty">
        <div class="battle-result-nick">—</div>
        <div class="battle-result-role">아직 참여 안 함</div>
        <div class="battle-result-proof empty-proof">—</div>
      </div>`;
    }
    const isMe = player.nickname === myNickname;
    const roleLabel = isMe ? '나' : (player.is_creator ? '방장' : '참가자');
    const proofHtml = player.proof_url
      ? `<img class="battle-result-img" src="${escapeHtml(player.proof_url)}" alt="인증샷">`
      : `<div class="battle-result-proof empty-proof">인증샷 없음</div>`;
    const noteHtml = player.note
      ? `<div class="battle-result-note">${escapeHtml(player.note)}</div>`
      : '';
    return `<div class="battle-result-card${isMe ? ' is-me' : ''}">
      <div class="battle-result-nick">${escapeHtml(player.nickname)}</div>
      ${showRole ? `<div class="battle-result-role">${roleLabel}</div>` : ''}
      ${proofHtml}
      ${noteHtml}
      ${player.proof_uploaded_at ? `<div class="battle-result-time">${new Date(player.proof_uploaded_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
    </div>`;
  }

  if (isBigPublic) {
    // 5명+ — 순위 리스트형 (완료자 → 미완료자 순)
    const medals = ['🥇','🥈','🥉'];
    const done   = players.filter(p => p.proof_url)
      .sort((a, b) => new Date(a.proof_uploaded_at) - new Date(b.proof_uploaded_at));
    const undone = players.filter(p => !p.proof_url);
    const ranked = [...done, ...undone];

    $battleResultPlayers.className = 'battle-result-list';
    // 나의 순위 미리 계산 (메시지용)
    const myRankIdx = ranked.findIndex(p => p.nickname === myNickname);
    $battleResultPlayers.innerHTML = ranked.map((p, i) => {
      const isMe     = p.nickname === myNickname;
      // 완료자는 메달/숫자, 미완료자도 순위 번호 표시 (흐리게)
      const rankNum  = i + 1;
      const rankText = i < done.length
        ? (medals[i] ?? `<span class="brl-rank-num">${rankNum}</span>`)
        : `<span class="brl-rank-num brl-rank-none">${rankNum}</span>`;
      const nickHtml = escapeHtml(truncEnd(p.nickname, 12))
        + (isMe ? ' <span class="lb-me-badge">나</span>' : '')
        + (p.is_creator ? ' <span class="brl-host-badge">방장</span>' : '');
      const hasProof = !!p.proof_url;
      const hasNote  = !!p.note;
      // ── 4가지 케이스 분기 ──
      let rightHtml = '';
      if (hasProof && hasNote) {
        // 케이스 4: 인증샷+소감 → 🪶 이모지 + 썸네일 (소감은 라이트박스에서)
        rightHtml = `<div class="brl-right">
          <span class="brl-note-emoji" aria-label="소감 있음">🪶</span>
          <div class="brl-thumb-frame">
            <img class="battle-result-img brl-thumb" src="${escapeHtml(p.proof_url)}" alt="인증샷">
          </div>
        </div>`;
      } else if (hasProof) {
        // 케이스 2: 인증샷만 → 썸네일만
        rightHtml = `<div class="brl-right">
          <div class="brl-thumb-frame">
            <img class="battle-result-img brl-thumb" src="${escapeHtml(p.proof_url)}" alt="인증샷">
          </div>
        </div>`;
      } else if (hasNote) {
        // 케이스 3: 소감만 → 오른쪽 정렬 텍스트 (끝이 썸네일 위치와 맞춤)
        rightHtml = `<div class="brl-right brl-right--note-only">
          <button class="brl-note-hint" type="button">🪶 소감 보기</button>
        </div>`;
      }
      // 케이스 1: 둘 다 없음 → rightHtml 없음 (닉네임만)
      return `<div class="brl-row${isMe ? ' brl-row--me' : ''}${!hasProof ? ' brl-row--undone' : ''}" data-note="${escapeHtml(p.note || '')}">
        <span class="brl-rank">${rankText}</span>
        <span class="brl-nick">${nickHtml}</span>
        ${rightHtml}
      </div>`;
    }).join('');

    // 결과 메시지 — 내가 완료한 경우만 표시
    if (myRankIdx >= 0 && myRankIdx < done.length) {
      let resultMsg = '';
      if (myRankIdx === 0) {
        resultMsg = `🎉 오늘은 내가 먼저 완주했어요!`;
      } else {
        const winner = ranked[0];
        const prevTogether = getLogsFromStorage()
          .filter(l => l.type === 'battle' && l.partner === winner.nickname).length;
        resultMsg = prevTogether > 0
          ? `⚔️ ${escapeHtml(truncEnd(winner.nickname, 10))}님이 또 앞질렀어요!`
          : `⚔️ ${escapeHtml(truncEnd(winner.nickname, 10))}님이 먼저 완주했어요!`;
      }
      $battleResultPlayers.insertAdjacentHTML('beforeend',
        `<div class="brl-result-msg">${resultMsg}</div>`);
    }

  } else {
    // 1:1 친구 배틀 — 기존 VS 레이아웃
    const creator = players.find(p => p.is_creator);
    const friend  = players.find(p => !p.is_creator);
    $battleResultPlayers.className = 'battle-result-players';
    $battleResultPlayers.innerHTML = `
      ${playerCard(creator, false)}
      <div class="battle-vs">VS</div>
      ${playerCard(friend, false)}
    `;
  }
}

$battleResultCloseBtn.addEventListener('click', () => {
  if (typeof $battleResultModal.close === 'function') $battleResultModal.close();
  else $battleResultModal.removeAttribute('open');
});

// v0.1.22 — 배틀 결과 인증샷 / 소감 → 라이트박스
$battleResultPlayers.addEventListener('click', (e) => {
  const img      = e.target.closest('.battle-result-img');
  const noteBtn  = e.target.closest('.brl-note-hint');
  if (!img && !noteBtn) return;
  if ($imgLightboxDialog.open) { $imgLightboxDialog.close(); return; }

  const note = (img || noteBtn).closest('[data-note]')?.dataset.note || '';

  if (img) {
    // 인증샷 있음: 이미지 표시 + 소감(있으면) 하단 오버레이
    $imgLightboxWrap?.classList.remove('lightbox-img-wrap--text-only');
    $imgLightboxImg.src = img.src;
    $imgLightboxImg.hidden = false;
    $imgLightboxNote?.classList.remove('lightbox-note--text-only');
  } else {
    // 소감만 있음: wrapper를 flex로 전환, 소감 텍스트 중앙 표시
    $imgLightboxWrap?.classList.add('lightbox-img-wrap--text-only');
    $imgLightboxImg.src = '';
    $imgLightboxImg.hidden = true;
    $imgLightboxNote?.classList.add('lightbox-note--text-only');
  }
  if ($imgLightboxNote) {
    $imgLightboxNote.textContent = note ? `"${note}"` : '';
    $imgLightboxNote.hidden = !note;
  }
  if (typeof $imgLightboxDialog.showModal === 'function') $imgLightboxDialog.showModal();
  else $imgLightboxDialog.setAttribute('open', '');
});
// 배경(dialog 자체) 클릭 → 닫기
$imgLightboxDialog.addEventListener('click', (e) => {
  if (e.target === $imgLightboxDialog) $imgLightboxDialog.close();
});
// ✕ 버튼 클릭 → 닫기
if ($imgLightboxClose) {
  $imgLightboxClose.addEventListener('click', () => $imgLightboxDialog.close());
}

document.getElementById('battleResultRefreshBtn').addEventListener('click', () => {
  const id = $battleResultBtn.dataset.battleId || activeBattleId;
  if (id) openBattleResult(id);
});

$battleResultBtn.addEventListener('click', () => {
  const id = $battleResultBtn.dataset.battleId || activeBattleId;
  if (id) openBattleResult(id);
});

// ====== v0.1.8 — 인증샷 ======
// 📷 인증샷 버튼 — 모바일(카카오톡 제외): 인앱 카메라 모달(셔터 소리 없음) / 데스크톱·카카오톡: 파일 선택창
// 카카오톡 WebView는 getUserMedia 권한을 매번 요청 → 파일 선택창(셔터 소리는 OS 수준)으로 우회
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isKakaoTalk = /KAKAOTALK/i.test(navigator.userAgent);
$captureBtn.addEventListener('click', () => {
  if (isMobile && !isKakaoTalk) {
    openCameraModal();
  } else {
    $captureInput.click();
  }
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
  $cameraHint.textContent = '카메라 준비 중···';
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
    // v0.1.55 — 이미 살아있는 스트림이 있으면 재사용 (매번 권한 팝업 방지)
    if (cameraStream && cameraStream.getTracks().some(t => t.readyState === 'live')) {
      $cameraVideo.srcObject = cameraStream;
      await $cameraVideo.play().catch(() => {});
      $cameraHint.textContent = '준비 완료. 촬영 버튼을 눌러주세요.';
      $cameraHint.classList.remove('error');
      return;
    }
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

// 압축 + localStorage 저장 + (배틀 중이면) Supabase Storage 업로드
function saveCaptureToStorage(dataUrl) {
  compressImage(dataUrl, 800, 0.7).then(async (compressedUrl) => {
    $lastCaptureImg.src = compressedUrl;
    $lastCapture.hidden = false;
    try {
      localStorage.setItem(STORAGE.lastCapture, compressedUrl);
      updateLatestLogCapture(compressedUrl);  // v0.1.34 — 기록 탭 로그에 연결
    } catch (err) {
      compressImage(dataUrl, 480, 0.5).then((smaller) => {
        $lastCaptureImg.src = smaller;
        try { localStorage.setItem(STORAGE.lastCapture, smaller); } catch {}
      });
    }
    // v0.1.17 — 배틀 중이면 Supabase Storage에도 업로드
    if (activeBattleId && sb) {
      $captureBtn.textContent = '📤 업로드 중···';
      $captureBtn.disabled = true;
      const result = await uploadProofToSupabase(compressedUrl, activeBattleId);
      if (result.ok) {
        $captureBtn.textContent = '✓ 업로드 완료! (결과창 새로고침하세요)';
      } else if (result.reason === 'db') {
        $captureBtn.textContent = '⚠ DB 저장 실패 — Supabase UPDATE 정책 확인';
        $captureBtn.disabled = false;
        console.warn('힌트: battle_players UPDATE 정책이 없을 수 있어요.', result.message);
      } else if (result.reason === 'storage') {
        $captureBtn.textContent = '⚠ 파일 업로드 실패 — Storage 정책 확인';
        $captureBtn.disabled = false;
      } else {
        $captureBtn.textContent = '⚠ 업로드 실패 (콘솔 확인)';
        $captureBtn.disabled = false;
      }
    }
  });
}

// 카메라 모달 핸들러
$cameraShootBtn.addEventListener('click', captureFromVideo);
$cameraRetryBtn.addEventListener('click', retryCamera);
$cameraSaveBtn.addEventListener('click', saveCameraCapture);
$cameraCancelBtn.addEventListener('click', closeCameraModal);
$cameraGalleryBtn.addEventListener('click', () => {
  // v0.1.128 — Capacitor WebView 대응:
  // 모달 닫기 전에 파일 피커를 선제 클릭 → 사용자 제스처 컨텍스트 유지
  // (300ms 딜레이 방식은 Capacitor에서 gesture context 만료로 클릭 무시됨)
  const tmpInput = document.createElement('input');
  tmpInput.type = 'file';
  tmpInput.accept = 'image/*';
  tmpInput.multiple = false;
  tmpInput.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  tmpInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => saveCaptureToStorage(ev.target.result);
      reader.readAsDataURL(file);
    }
    tmpInput.remove();
  });
  document.body.appendChild(tmpInput);
  tmpInput.click(); // 제스처 컨텍스트 살아있는 동안 즉시 클릭

  // 파일 피커 열린 후 카메라 스트림 정리
  stopCameraStream();
  if (typeof $cameraModal.close === 'function') $cameraModal.close();
  else $cameraModal.removeAttribute('open');

  // 선택 취소 시 클린업
  setTimeout(() => { if (tmpInput.parentNode) tmpInput.remove(); }, 60000);
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
  $captureInput.value = '';
  // 모달이 아직 열려 있으면 닫기 (인앱 카메라에서 갤러리로 전환한 경우 등)
  if ($cameraModal.open) closeCameraModal();
});

$removeCaptureBtn.addEventListener('click', () => {
  if ($lastCaptureImg) $lastCaptureImg.src = '';
  if ($lastCapture)    $lastCapture.hidden = true;
  localStorage.removeItem(STORAGE.lastCapture);
  lastCapturedDataUrl = null;
  if ($captureBtn) {
    $captureBtn.textContent = '\ud83d\udcf7 인증샷 첨부 (선택)';
    $captureBtn.disabled = false;
  }
  // v0.1.20 — 버튼 상태 초기화 → 재업로드 가능
  $captureBtn.textContent = '📷 인증샷 첨부 (선택)';
  $captureBtn.disabled = false;
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

// ═══════════════════════════════════════════════════════════
// 도전과제 시스템 v0.1.69
// ═══════════════════════════════════════════════════════════

const ACHIEVEMENT_DEFS = {
  // id: { name, desc(토스트용), cond(카드 조건 설명, null=hidden), icon, hidden }

  // ── A. 온보딩 ─────────────────────────────────────────
  'A-1': { name: '첫 수확',         desc: '첫 뽀모도로를 끝냈어요!',              cond: '타이머 1회 완료',               icon: '🌱', tier: 'normal', hidden: false },
  'A-2': { name: '도파민이 싹',      desc: '처음으로 가챠를 돌렸어요',              cond: '가챠 첫 사용',                  icon: '🎰', tier: 'normal', hidden: false },
  'A-3': { name: '고민 끝!',        desc: '나온 대로 리롤 없이 바로 시작했어요',   cond: '가챠 후 리롤 없이 바로 시작',   icon: '⚡', tier: 'normal', hidden: false },
  'A-4': { name: '이름표를 붙여줘',  desc: '닉네임을 설정했어요',                   cond: '닉네임 첫 설정',                icon: '🏷️', tier: 'normal', hidden: false },
  'A-5': { name: '배틀 좋아하세요?', desc: '친구에게 배틀을 제안했어요',        cond: '배틀 초대 링크 첫 생성',        icon: '✉️', tier: 'normal', hidden: false },
  'D-1': { name: '첫 하이파이브',   desc: '첫 배틀을 완주했어요!',                 cond: '배틀 첫 완료',                  icon: '🙌', tier: 'normal', hidden: false },

  // ── B. Tom 계열 — 집중·꾸준함 ────────────────────────
  'B-1': { name: '3연벙',           desc: '3일 연속으로 집중했어요',               cond: '3일 연속 타이머 완료',          icon: '🔥', tier: 'normal', hidden: false },
  'B-2': { name: '일주일 농부',     desc: '7일을 꾸준히 수확했어요',               cond: '7일 연속 타이머 완료',          icon: '📅', tier: 'rare',   hidden: false },
  'B-3': { name: '한 달 수확',      desc: '30일 연속 집중의 기록!',                cond: '30일 연속 타이머 완료',         icon: '🏅', tier: 'rare',   hidden: false },
  'B-4': { name: '무결점 수확',     desc: '멈추지 않고 끝냈어요',                  cond: '일시정지 없이 완료 5회',        icon: '🛡️', tier: 'normal', hidden: false },
  'B-5': { name: '시간의 지배자',   desc: '단 한 번도 멈추지 않았어요',            cond: '일시정지 없이 완료 10회',       icon: '⚔️', tier: 'rare',   hidden: false },
  'B-6': { name: '바쁘다 바빠',        desc: '할 일을 10개나 등록했어요',           cond: '할 일 10개 이상 등록',          icon: '📁', tier: 'normal', hidden: false },
  'B-7': { name: '전원일기',         desc: '완료 후 소감을 10번 남겼어요',           cond: '완료 소감 10회 작성',           icon: '📓', tier: 'normal', hidden: false },
  'B-8': { name: '남는 건 사진 뿐', desc: '열심히 한 걸 사진으로 증명했어요',       cond: '인증샷 5회 업로드',             icon: '📷', tier: 'normal', hidden: false },
  'B-9': { name: '장거리 러너',    desc: '쉬지 않고 60분을 달렸어요',              cond: '60분 이상 타이머 완료 1회',     icon: '🏃', tier: 'rare',   hidden: false },
  'B-10':{ name: '주말도 반납',    desc: '주말에도 열심히 달려왔어요',              cond: '주말에 완료 10회',              icon: '📅', tier: 'rare',   hidden: false },
  'B-11':{ name: '점심은 다음에', desc: '밥도 미루면서 집중했어요',                cond: '12~13시 완료 5회',              icon: '🍜', tier: 'rare',   hidden: false },
  'B-12':{ name: '오늘 좀 쉬어요', desc: '하루에 6번이나 집중했어요',              cond: '하루 완료 6회',                 icon: '😅', tier: 'rare',   hidden: false },

  // ── C. Moto 계열 — 랜덤·즉흥 ─────────────────────────
  'C-1': { name: '일단 돌려!',      desc: '가챠를 10번 돌렸어요',                  cond: '가챠 돌리기 10회',              icon: '🎲', tier: 'normal', hidden: false },
  'C-2': { name: '운명에 맡겨',     desc: '나온 대로 다 해냈어요',                 cond: '리롤 없이 완료 5회 누적',       icon: '🎯', tier: 'normal', hidden: false },
  'C-3': { name: '잡식성 토마토',     desc: '5가지 다른 일을 완료했어요',            cond: '서로 다른 작업 5가지 완료',     icon: '🌈', tier: 'normal', hidden: false },
  'C-4': { name: '가챠 중독',       desc: '멈출 수가 없어요',                      cond: '가챠 누적 50회',                icon: '🃏', tier: 'rare',   hidden: false },
  'C-5': { name: '국번 없이 1336',   desc: '랜덤을 진심으로 믿어요',                cond: '가챠 누적 100회',               icon: '🔮', tier: 'rare',   hidden: false },
  'C-7': { name: '외길 인생',      desc: '하나만 파는 사람이 있었어요',             cond: '같은 작업 10회 완료',           icon: '🎯', tier: 'rare',   hidden: false },

  // ── D. 배틀 계열 — 친구와 함께 ───────────────────────
  'D-2': { name: 'Tom 콤비',        desc: '함께 집중하고 함께 완료!',              cond: 'TOM MODE 배틀 첫 완료',         icon: '👓', tier: 'normal', hidden: false },
  'D-9': { name: '집중 3연전',      desc: 'TOM 모드를 세 번이나 완주했어요',       cond: 'TOM MODE 배틀 완료 3회',        icon: '🧠', tier: 'normal', hidden: false },
  'D-3': { name: 'Moto 듀오',       desc: '운명을 같이 받아들였어요',              cond: 'MOTO MODE 배틀 첫 완료',        icon: '🎮', tier: 'normal', hidden: false },
  'C-6': { name: '굴러도 완성',     desc: 'MOTO 배틀도 해냈어요',                  cond: 'MOTO MODE 배틀 완료 3회',       icon: '🎳', tier: 'normal', hidden: false },
  'D-4': { name: '또 뵙네요',        desc: '이 친구랑 자주 만나네요',               cond: '같은 파트너와 5회 배틀 완료',   icon: '🎟️', tier: 'normal', hidden: false },
  'D-5': { name: '저희 친해요',     desc: '진짜 단짝을 찾았어요',                  cond: '같은 파트너와 10회 배틀 완료',  icon: '💕', tier: 'rare',   hidden: false },
  'D-6': { name: '한 판 더!',       desc: '끝나자마자 바로 또 시작했어요',         cond: '완료 후 24시간 안에 같은 파트너와 재배틀', icon: '🔁', tier: 'normal', hidden: false },
  'D-7': { name: '새벽 농장',       desc: '새벽에도 함께 집중했어요',              cond: '새벽 1~5시 배틀 완료',          icon: '🌙', tier: 'rare',   hidden: false },
  'D-8': { name: '오늘도 같이',     desc: '7일 안에 3번 배틀했어요',               cond: '7일 이내 배틀 완료 3회',        icon: '🗓️', tier: 'normal', hidden: false },

  // ── F. 공개 배틀 계열 ────────────────────────────────
  'F-1': { name: '공개방 개설자',    desc: '첫 공개 배틀방을 만들었어요!',         cond: '공개 배틀방 첫 생성',              icon: '🏟️', tier: 'normal', hidden: false },
  'F-2': { name: '낯선 배틀',       desc: '공개 배틀방에 처음 참여했어요!',        cond: '공개 배틀방 첫 참여',              icon: '🚪', tier: 'normal', hidden: false },
  'F-3': { name: '공개 배틀 완주',  desc: '공개 배틀을 처음 완료했어요',           cond: '공개 배틀 첫 완료',                icon: '🎉', tier: 'normal', hidden: false },
  'F-4': { name: '셋이서 집중',     desc: '3명 이상이서 함께 달렸어요',             cond: '3인 이상 공개 배틀 완료',          icon: '👪', tier: 'normal', hidden: false },
  'F-5': { name: '단골 공개방',     desc: '공개 배틀을 5번이나 완료했어요',        cond: '공개 배틀 완료 5회',               icon: '🔄', tier: 'rare',   hidden: false },
  'F-6': { name: '만원 사례',       desc: '10명이 꽉 찬 방에서 완주했어요!',       cond: '10명 공개 배틀 완료',              icon: '🎪', tier: 'rare',   hidden: false },

  // ── E. 숨겨진 업적 ────────────────────────────────────
  'E-1': { name: '잠깐만요', desc: '타이머 켜놓고 딴 짓 했죠?',          cond: '타이머 실행 중 탭 전환 5회',       icon: '👀', tier: 'hidden', hidden: true,  charImg: 'assets/react-moto-relate.png',    charQuote: '어... 나도 그랬는데~ 괜찮아 괜찮아 😎' },
  'E-2': { name: '거의 다 왔는데',  desc: '10초 남기고 도망쳤어요',               cond: '10초 이하 남기고 취소',            icon: '🏃', tier: 'hidden', hidden: true  },
  'E-3': { name: '완전한 하루',    desc: '하루에 4번이나 집중했어요!',            cond: '하루 4회 이상 타이머 완료',        icon: '☀️', tier: 'hidden', hidden: true  },
  'E-4': { name: '새벽 감성',      desc: '새벽 4~6시에 혼자 집중했어요',         cond: '새벽 4~6시에 타이머 완료',        icon: '⭐', tier: 'hidden', hidden: true,  charImg: 'assets/react-tom-dawn.png',       charQuote: '하아암~ 오늘도 열일해야지...' },
  'E-5': { name: '찐찐막판',       desc: '자정이 다 되도록 멈추지 않았어요',     cond: '밤 11시 30분 이후 타이머 완료',   icon: '🕛', tier: 'hidden', hidden: true,  charImg: 'assets/react-tom-dawn.png',       charQuote: '이 시간까지 달렸어요... 🌙' },
  'E-6': { name: '전설의 토마토',  desc: '100회 수확의 전설',                    cond: '타이머 완료 100회',               icon: '👑', tier: 'hidden', hidden: true,  charImg: 'assets/react-both-celebrate.png', charQuote: '100번째 작업! 진짜 대단해요 🎉' },
  'E-7': { name: '그냥 간다',       desc: '리롤 없이 10번 연속 바로 시작',         cond: '가챠 리롤 없이 10회 연속 시작',   icon: '✨', tier: 'hidden', hidden: true  },
  'E-8': { name: '폴더 안에 폴더', desc: '할 일을 20개나 만들었어요',             cond: '할 일 20개 생성',                icon: '📚', tier: 'hidden', hidden: true  },
};

// ── 칭호 시스템 ───────────────────────────────────────────

const TITLE_DEFS = [
  // 상위 → 하위 순서: 가장 높은 달성 칭호를 반환
  { id: 'legend', emoji: '🏆', name: 'Tomotto Legend', check: () => {
    const all = getAchievements();
    return Object.entries(ACHIEVEMENT_DEFS).filter(([, d]) => !d.hidden).every(([id]) => all[id]?.unlocked);
  }},
  { id: 'golden',  emoji: '👑', name: '황금 토마토', check: () => completedCount >= 100 },
  { id: 'gacha',   emoji: '🎲', name: '가챠 신봉자', check: () => totalGachaCount >= 100 },
  { id: 'battle',  emoji: '⚔️', name: '배틀마스터',  check: () => getLogsFromStorage().filter(l => l.type === 'battle').length >= 20 },
  { id: 'focus',   emoji: '🔥', name: '집중왕',       check: () => getCompletionStreak() >= 7 },
  { id: 'ripe',    emoji: '🍅', name: '완숙토마토',  check: () => completedCount >= 50 },
  { id: 'green',   emoji: '🌼', name: '꽃 핀 토마토', check: () => completedCount >= 20 },
  { id: 'sprout',  emoji: '🌿', name: '새싹',         check: () => completedCount >= 5 },
  { id: 'seed',    emoji: '🌱', name: '씨앗',         check: () => completedCount >= 1 },
];

// 칭호 탭 표시용: 조건 텍스트 + 진행도 함수
const TITLE_PROGRESS = {
  'legend': { condText: '모든 공개 업적 달성', progressFn: () => {
    const all  = getAchievements();
    const defs = Object.entries(ACHIEVEMENT_DEFS).filter(([, d]) => !d.hidden);
    return { current: defs.filter(([id]) => all[id]?.unlocked).length, total: defs.length };
  }},
  'golden':  { condText: '집중 100회 완료',   progressFn: () => ({ current: completedCount,     total: 100 }) },
  'gacha':   { condText: '가챠 100회 사용',    progressFn: () => ({ current: totalGachaCount,    total: 100 }) },
  'battle':  { condText: '배틀 20회 완료',     progressFn: () => ({ current: getLogsFromStorage().filter(l => l.type === 'battle').length, total: 20 }) },
  'focus':   { condText: '7일 연속 집중',      progressFn: () => ({ current: getCompletionStreak(), total: 7 }) },
  'ripe':    { condText: '집중 50회 완료',     progressFn: () => ({ current: completedCount,     total: 50 }) },
  'green':   { condText: '집중 20회 완료',     progressFn: () => ({ current: completedCount,     total: 20 }) },
  'sprout':  { condText: '집중 5회 완료',      progressFn: () => ({ current: completedCount,     total: 5  }) },
  'seed':    { condText: '집중 1회 완료',      progressFn: () => ({ current: completedCount,     total: 1  }) },
};

function renderTitlesTab() {
  const $grid   = document.getElementById('titleGrid');
  const $badge  = document.getElementById('titleCurrentBadge');
  if (!$grid) return;

  const currentTitle = getCurrentTitle();
  const selectedId   = localStorage.getItem(STORAGE_SELECTED_TITLE);
  if ($badge) $badge.textContent = currentTitle ? `${currentTitle.emoji} ${currentTitle.name}` : '없음';

  // 씨앗(하위) → 전설(상위) 순서로 표시 — 성장 경로가 보임
  const ordered = [...TITLE_DEFS].reverse();

  $grid.innerHTML = ordered.map(t => {
    const unlocked  = (() => { try { return t.check(); } catch { return false; } })();
    const isCurrent = t.id === currentTitle?.id;
    const isSelected = t.id === selectedId;
    const info      = TITLE_PROGRESS[t.id];

    let progHtml = '';
    if (info?.progressFn) {
      try {
        const { current, total } = info.progressFn();
        const pct = Math.min(100, (current / total) * 100);
        const clamp = Math.min(current, total);
        progHtml = `
          <div class="title-prog-bar"><div class="title-prog-fill" style="width:${pct.toFixed(0)}%"></div></div>
          <div class="title-prog-text">${clamp} / ${total}</div>`;
      } catch {}
    }

    let nowHtml = '';
    if (isCurrent) {
      nowHtml = '<div class="title-now">현재 칭호 ✓</div>';
    } else if (unlocked) {
      nowHtml = '<div class="title-now title-now-hint">클릭해서 선택</div>';
    }

    return `<div class="title-card${unlocked ? ' title-card--unlocked' : ''}${isCurrent ? ' title-card--current' : ''}" data-title-id="${t.id}">
      <div class="title-emoji">${t.emoji}</div>
      <div class="title-name">${t.name}</div>
      <div class="title-cond">${info?.condText ?? ''}</div>
      ${unlocked ? '' : progHtml}
      ${nowHtml}
    </div>`;
  }).join('');

  // 달성한 칭호 카드 클릭 → 수동 선택
  $grid.querySelectorAll('.title-card--unlocked').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.titleId;
      if (localStorage.getItem(STORAGE_SELECTED_TITLE) === id) {
        // 같은 칭호 재클릭 → 선택 해제 (자동 선택으로 복귀)
        localStorage.removeItem(STORAGE_SELECTED_TITLE);
      } else {
        localStorage.setItem(STORAGE_SELECTED_TITLE, id);
      }
      renderTitlesTab();
      updateCompletedDisplay();
      if (sb && myNickname && timer.isRunning) upsertPresence(true).catch(() => {});
    });
  });
}

// 칭호 섹션 토글 (업적 아코디언과 동일한 패턴)
function initTitleAccordion() {
  const TITLE_OPEN_KEY = 'tomotto_title_open';
  const $toggle = document.getElementById('titleSectionToggle');
  const $grid   = document.getElementById('titleGrid');
  if (!$toggle || !$grid) return;

  const saved = localStorage.getItem(TITLE_OPEN_KEY);
  if (saved === 'false') {
    $grid.hidden = true;
    $toggle.setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    const isOpen  = $toggle.getAttribute('aria-expanded') !== 'false';
    const nextOpen = !isOpen;
    $toggle.setAttribute('aria-expanded', String(nextOpen));
    $grid.hidden = !nextOpen;
    localStorage.setItem(TITLE_OPEN_KEY, String(nextOpen));
  }

  $toggle.addEventListener('click', toggle);
  $toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
}

function getCurrentTitle() {
  try {
    // 수동 선택된 칭호 우선 확인
    const selectedId = localStorage.getItem(STORAGE_SELECTED_TITLE);
    if (selectedId) {
      const selected = TITLE_DEFS.find(t => t.id === selectedId);
      if (selected) {
        try {
          if (selected.check()) return selected;
        } catch {}
        // 조건을 더 이상 충족하지 않으면 선택 초기화
        localStorage.removeItem(STORAGE_SELECTED_TITLE);
      }
    }
    // 자동: 가장 높은 달성 칭호 반환
    for (const t of TITLE_DEFS) {
      try { if (t.check()) return t; } catch { /* ignore */ }
    }
  } catch { /* TITLE_DEFS 초기화 전 호출 시 무시 */ }
  return null;
}

// ── charImg 사전 캐싱 — 숨겨진 업적 이미지를 앱 시작 시 미리 로드 ──
(function _preloadAchievementImages() {
  Object.values(ACHIEVEMENT_DEFS).forEach(def => {
    if (def.charImg) { const img = new Image(); img.src = def.charImg; }
  });
})();

// ── 데이터 읽기/쓰기 ──────────────────────────────────────

function getAchievements() {
  try { return JSON.parse(localStorage.getItem(STORAGE.achievements) || '{}'); } catch { return {}; }
}

function isUnlocked(id) {
  return !!getAchievements()[id]?.unlocked;
}

function unlockAchievement(id) {
  if (!ACHIEVEMENT_DEFS[id] || isUnlocked(id)) return;
  const all = getAchievements();
  all[id] = { unlocked: true, unlockedAt: Date.now() };
  localStorage.setItem(STORAGE.achievements, JSON.stringify(all));
  _showAchievementToast(id);
  // 기록 탭이 열려 있으면 즉시 갱신
  if (!document.getElementById('tab-log')?.classList.contains('tab-panel-hidden')) {
    renderAchievementsTab();
  }
}

// ── 토스트 알림 ───────────────────────────────────────────

let _toastQueue = [];
let _toastShowing = false;
const collapsedTiers = new Set(); // 업적 티어 접힘 상태

function _showAchievementToast(id) {
  _toastQueue.push(id);
  if (!_toastShowing) _processToastQueue();
}

function _processToastQueue() {
  if (_toastQueue.length === 0) { _toastShowing = false; return; }
  _toastShowing = true;
  const id = _toastQueue.shift();
  const def = ACHIEVEMENT_DEFS[id];
  if (!def) { _processToastQueue(); return; }

  const isSecret = def.hidden;
  const isRare   = !def.hidden && def.tier === 'rare';
  const hasChar  = !!def.charImg;

  function _buildAndShow() {
    // 리더보드 토스트와 같은 스택 컨테이너 사용 → 동시 발생 시 겹침 없이 아래 쌓임
    let container = document.getElementById('notif-toast-stack');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notif-toast-stack';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast achievement-toast--stacked'
      + (isSecret ? ' achievement-toast--secret' : '')
      + (isRare   ? ' achievement-toast--rare'   : '')
      + (hasChar  ? ' achievement-toast--char'   : '');

    const label = isSecret ? '🔍 숨겨진 업적 발견!' : isRare ? '✨ 희귀 업적 달성!' : '🏅 업적 달성!';
    if (hasChar) {
      toast.innerHTML = `
        <img class="ach-toast-char-img" src="${def.charImg}" alt="">
        <div class="achievement-toast-body">
          <div class="achievement-toast-label">${label}</div>
          <div class="achievement-toast-name">${def.name}</div>
          <div class="achievement-toast-desc">${def.desc}</div>
          <div class="ach-toast-quote">"${def.charQuote}"</div>
        </div>
      `;
    } else {
      toast.innerHTML = `
        <span class="achievement-toast-icon">${def.icon}</span>
        <div class="achievement-toast-body">
          <div class="achievement-toast-label">${label}</div>
          <div class="achievement-toast-name">${def.name}</div>
          <div class="achievement-toast-desc">${def.desc}</div>
        </div>
      `;
    }
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('achievement-toast--show'), 30);

    const duration = hasChar ? 5500 : 4000;
    setTimeout(() => {
      toast.classList.remove('achievement-toast--show');
      toast.classList.add('achievement-toast--hide');
      setTimeout(() => {
        toast.remove();
        if (container && !container.children.length) container.remove();
        setTimeout(_processToastQueue, 150);
      }, 350);
    }, duration);
  }

  if (hasChar) {
    // 이미지 로드 완료 후 토스트 표시 — 캐시 히트 시 즉시, 미캐시 시 최대 1.5초 대기
    let shown = false;
    const showOnce = () => { if (!shown) { shown = true; _buildAndShow(); } };
    const preload = new Image();
    preload.onload  = showOnce;
    preload.onerror = showOnce; // 로드 실패해도 토스트는 표시
    preload.src = def.charImg;
    setTimeout(showOnce, 1500); // 1.5초 타임아웃 (네트워크 느려도 강제 표시)
  } else {
    _buildAndShow();
  }
}

// ── 스트릭 계산 ───────────────────────────────────────────

function getCompletionStreak() {
  const logs = getLogsFromStorage();
  if (!logs.length) return 0;

  // 완료 날짜 Set 만들기
  const dateCounts = {};
  for (const log of logs) {
    const d = log.date || formatDateStr(new Date(log.completedAt));
    dateCounts[d] = true;
  }

  let streak = 0;
  const msPerDay = 86400000;
  let check = new Date();
  const todayStr = formatDateStr(check);

  // 오늘 완료가 없어도 어제부터 streak 계산
  if (!dateCounts[todayStr]) check = new Date(check.getTime() - msPerDay);

  while (true) {
    const ds = formatDateStr(check);
    if (!dateCounts[ds]) break;
    streak++;
    check = new Date(check.getTime() - msPerDay);
  }
  return streak;
}

// ── 업적 아코디언 토글 ────────────────────────────────────

function initAchievementAccordion() {
  const ACH_OPEN_KEY = 'tomotto_ach_open';
  const $toggle = document.getElementById('achievementToggle');
  const $grid   = document.getElementById('achievementGrid');
  if (!$toggle || !$grid) return;

  // 저장된 상태 복원 (기본값: 열림)
  const saved = localStorage.getItem(ACH_OPEN_KEY);
  if (saved === 'false') {
    $grid.hidden = true;
    $toggle.setAttribute('aria-expanded', 'false');
  }

  function toggle() {
    const isOpen = $toggle.getAttribute('aria-expanded') !== 'false';
    const nextOpen = !isOpen;
    $toggle.setAttribute('aria-expanded', String(nextOpen));
    $grid.hidden = !nextOpen;
    localStorage.setItem(ACH_OPEN_KEY, String(nextOpen));
  }

  $toggle.addEventListener('click', toggle);
  $toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
}

// ── 기록 탭 업적 렌더 ─────────────────────────────────────

function renderAchievementsTab() {
  const $grid = document.getElementById('achievementGrid');
  const $count = document.getElementById('achievementCount');
  if (!$grid) return;

  const all = getAchievements();
  const total = Object.keys(ACHIEVEMENT_DEFS).length;
  const unlockedCount = Object.values(all).filter(v => v?.unlocked).length;
  if ($count) $count.textContent = `${unlockedCount} / ${total}`;

  // 티어별 그룹화
  const tiers = { normal: [], rare: [], hidden: [] };
  Object.entries(ACHIEVEMENT_DEFS).forEach(([id, def]) => {
    tiers[def.tier || 'normal'].push([id, def]);
  });

  const TIER_META = {
    normal: { label: '일반',  icon: '🍅', cls: ''        },
    rare:   { label: '희귀',  icon: '✨', cls: '--rare'   },
    hidden: { label: '히든',  icon: '🔍', cls: '--hidden' },
  };

  const CHEVRON = `<svg class="ach-section-chevron" viewBox="17.36 24.85 105.76 95.08" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M58.9,111.8c6.26,10.85,16.42,10.85,22.68,0l38.86-67.3c6.26-10.85,1.18-19.64-11.34-19.64H31.38c-12.52,0-17.6,8.79-11.34,19.64l38.86,67.3Z"/></svg>`;

  function renderCard(id, def) {
    const state = all[id];
    const unlocked = !!state?.unlocked;
    const tierClass = def.tier === 'rare' ? ' ach-card--rare' : def.tier === 'hidden' ? ' ach-card--secret' : '';
    if (unlocked) {
      const dateStr = new Date(state.unlockedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
      const condHtml = def.cond ? `<div class="ach-card-cond">${splitCond(def.cond)}</div>` : '';
      return `<div class="ach-card ach-card--unlocked${tierClass}" data-ach-id="${id}">
        <div class="ach-card-icon">${def.icon}</div>
        <div class="ach-card-name">${def.name}</div>
        ${condHtml}
        <div class="ach-card-date">${dateStr}</div>
      </div>`;
    } else {
      const isSecret = def.hidden;
      const condHtml = isSecret
        ? '<div class="ach-card-cond ach-card-cond--blank">&nbsp;<br>&nbsp;</div>'
        : (def.cond ? `<div class="ach-card-cond">${splitCond(def.cond)}</div>` : '');
      return `<div class="ach-card ach-card--locked${tierClass}" data-ach-id="${id}">
        <div class="ach-card-icon">🔒</div>
        <div class="ach-card-name">${isSecret ? '???' : def.name}</div>
        ${condHtml}
        <div class="ach-card-date">미달성</div>
      </div>`;
    }
  }

  let html = '';
  let isFirst = true;
  for (const [tierKey, entries] of Object.entries(tiers)) {
    if (entries.length === 0) continue;
    const meta = TIER_META[tierKey];
    const tierUnlocked = entries.filter(([id]) => all[id]?.unlocked).length;
    const collapsed = collapsedTiers.has(tierKey);
    html += `<div class="ach-tier${isFirst ? ' ach-tier--first' : ''}">
      <div class="ach-section-header${meta.cls ? ' ach-section-header' + meta.cls : ''}${collapsed ? ' ach-section-header--collapsed' : ''}"
        role="button" tabindex="0" data-tier="${tierKey}" aria-expanded="${!collapsed}">
        ${CHEVRON}
        <span class="ach-section-icon">${meta.icon}</span>
        <span class="ach-section-label">${meta.label}</span>
        <span class="ach-section-count">${tierUnlocked} / ${entries.length}</span>
      </div>
      ${collapsed ? '' : `<div class="ach-tier-grid">${entries.map(([id, def]) => renderCard(id, def)).join('')}</div>`}
    </div>`;
    isFirst = false;
  }

  $grid.innerHTML = html;

  $grid.querySelectorAll('.ach-section-header').forEach(header => {
    const toggle = () => {
      const tier = header.dataset.tier;
      if (collapsedTiers.has(tier)) collapsedTiers.delete(tier);
      else collapsedTiers.add(tier);
      renderAchievementsTab();
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  if (devAchPreview) {
    $grid.querySelectorAll('.ach-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.title = '클릭하면 토스트 미리보기';
      card.addEventListener('click', () => {
        const id = card.dataset.achId;
        if (id) { _toastQueue = []; _toastShowing = false; _showAchievementToast(id); }
      });
    });
  }
}

// ── 체크 함수들 ───────────────────────────────────────────

// 가챠 돌린 후
function checkAchievementsOnGacha() {
  if (totalGachaCount === 1)   unlockAchievement('A-2');
  if (totalGachaCount >= 10)   unlockAchievement('C-1');
  if (totalGachaCount >= 50)   unlockAchievement('C-4');
  if (totalGachaCount >= 100)  unlockAchievement('C-5');
}

// 인증샷 저장 후
function checkAchievementsOnCapture() {
  try {
    const captures = JSON.parse(localStorage.getItem(STORAGE.logCaptures) || '{}');
    if (Object.keys(captures).length >= 5) unlockAchievement('B-8');
  } catch {}
}

// 카테고리 추가/삭제 후
function checkAchievementsOnCategoryChange() {
  if (categories.length >= 10) unlockAchievement('B-6');
  if (categories.length >= 20) unlockAchievement('E-8');
}

// 소감 저장 후
function checkAchievementsOnNote() {
  const logs = getLogsFromStorage();
  const noteCount = logs.filter(l => l.note && l.note.trim()).length;
  if (noteCount >= 10) unlockAchievement('B-7');
}

// 배틀 로그 통계 헬퍼 (checkAchievementsOnTimerComplete에서 사용)
function _battleLogsWithPartner(logs, partnerNick) {
  return logs.filter(l => l.type === 'battle' && l.partner === partnerNick);
}

// 타이머 완료 후
function checkAchievementsOnTimerComplete() {
  // 주의: saveLog()가 이 함수 다음에 실행됨 → 현재 완료는 logs에 아직 없음
  const logs = getLogsFromStorage();
  const now = new Date();
  const h   = now.getHours();

  // ── A-1: 첫 완료 ──────────────────────────────────────
  if (completedCount === 1) unlockAchievement('A-1');

  // ── B: 스트릭 & 꾸준함 ──────────────────────────────
  const streak = getCompletionStreak();
  if (streak >= 3)  unlockAchievement('B-1');
  if (streak >= 7)  unlockAchievement('B-2');
  if (streak >= 30) unlockAchievement('B-3');

  // B-4, B-5: 일시정지 없이 완료
  if (!_pausedThisSession) {
    const pfc = parseInt(localStorage.getItem(STORAGE.pauseFreeCount) || '0', 10) + 1;
    localStorage.setItem(STORAGE.pauseFreeCount, String(pfc));
    if (pfc >= 5)  unlockAchievement('B-4');
    if (pfc >= 10) unlockAchievement('B-5');
  }

  // ── C: 다양성 & 가챠 ──────────────────────────────────
  // C-2: 리롤 없이 누적 5회
  // C-3: 다양한 카테고리
  const uniqueTasks = new Set(logs.map(l => l.task).filter(Boolean));
  if (uniqueTasks.size >= 5) unlockAchievement('C-3');

  // ── E 계열 (숨겨진) ───────────────────────────────────
  // E-3: 오늘 4회 이상
  const todayStr = formatDateStr(now);
  const todayCount = logs.filter(l => (l.date || formatDateStr(new Date(l.completedAt))) === todayStr).length;
  if (todayCount >= 3) unlockAchievement('E-3'); // 기존 로그 3개 + 현재 = 4회

  // E-4: 새벽 4~6시 (솔로만)
  if (h >= 4 && h < 6 && !activeBattleId) unlockAchievement('E-4');

  // E-5: 23:30 이후
  if (h === 23 && now.getMinutes() >= 30) unlockAchievement('E-5');

  // E-6: 100회 달성
  if (completedCount >= 100) unlockAchievement('E-6');

  // E-7: 연속 리롤 없이 완료
  const noRerollStreak = parseInt(localStorage.getItem(STORAGE.noRerollStreak) || '0', 10);
  if (_spinsSinceReset === 1) {
    // C-2: 누적 리롤 없이 5회
    const nrt = parseInt(localStorage.getItem(STORAGE.noRerollTotal) || '0', 10) + 1;
    localStorage.setItem(STORAGE.noRerollTotal, String(nrt));
    if (nrt >= 5) unlockAchievement('C-2');

    // E-7: 연속 10회
    const next = noRerollStreak + 1;
    localStorage.setItem(STORAGE.noRerollStreak, String(next));
    if (next >= 10) unlockAchievement('E-7');
  } else {
    localStorage.setItem(STORAGE.noRerollStreak, '0');
  }

  // ── D + C-6: 배틀 계열 ────────────────────────────────
  if (activeBattleId && currentBattleData?.battle) {
    const battle = currentBattleData.battle;
    const partnerInfo = getBattlePartnerInfo();
    const battleLogs = logs.filter(l => l.type === 'battle');  // 이전 배틀 로그들

    // D-1: 첫 배틀 완료
    if (battleLogs.length === 0) unlockAchievement('D-1');

    // D-2: Tom 콤비 (common 모드)
    if (battle.mode === 'common') unlockAchievement('D-2');

    // D-9: TOM MODE 배틀 3회
    if (battle.mode === 'common') {
      const tomBattles = logs.filter(l => l.type === 'battle' && l.battleMode === 'common').length;
      if (tomBattles + 1 >= 3) unlockAchievement('D-9');
    }

    // D-3: Moto 듀오 (separate 모드)
    if (battle.mode === 'separate') unlockAchievement('D-3');

    // C-6: MOTO MODE 배틀 3회
    if (battle.mode === 'separate') {
      const motoBattles = logs.filter(l => l.type === 'battle' && l.battleMode === 'separate').length;
      if (motoBattles + 1 >= 3) unlockAchievement('C-6');
    }

    // D-4, D-5: 같은 파트너와 N회
    if (partnerInfo) {
      const withPartner = _battleLogsWithPartner(logs, partnerInfo.partnerNick).length;
      if (withPartner + 1 >= 5)  unlockAchievement('D-4');
      if (withPartner + 1 >= 10) unlockAchievement('D-5');

      // D-6: 24시간 이내 같은 파트너 재도전
      const recent = logs.find(l =>
        l.type === 'battle' &&
        l.partner === partnerInfo.partnerNick &&
        (Date.now() - (l.completedAt || 0)) < 24 * 3600 * 1000
      );
      if (recent) unlockAchievement('D-6');
    }

    // D-7: 새벽 1~5시 배틀
    if (h >= 1 && h < 5) unlockAchievement('D-7');

    // D-8: 7일 이내 배틀 3회
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const recentBattles = logs.filter(l => l.type === 'battle' && (l.completedAt || 0) >= sevenDaysAgo).length;
    if (recentBattles + 1 >= 3) unlockAchievement('D-8');
  }

  // ── F: 공개 배틀 계열 ────────────────────────────────────
  if (activeBattleId && currentBattleData?.battle?.is_public) {
    const pubPlayers = currentBattleData.players ?? [];
    const pubBattleLogs = logs.filter(l => l.type === 'battle' && l.isPublic);

    // F-3: 공개 배틀 첫 완료
    if (pubBattleLogs.length === 0) unlockAchievement('F-3');

    // F-4: 3명 이상 공개 배틀 완료
    if (pubPlayers.length >= 3) unlockAchievement('F-4');

    // F-5: 공개 배틀 완료 5회
    if (pubBattleLogs.length + 1 >= 5) unlockAchievement('F-5');

    // F-6: 10명 만원 배틀 완료
    if (pubPlayers.length >= 10) unlockAchievement('F-6');
  }

  // ── B-9~12 / C-7: 추가 희귀 업적 ────────────────────────

  // B-9: 60분 이상 타이머 완료
  if (timer.duration >= 3600) unlockAchievement('B-9');

  // B-10: 주말(토/일) 완료 10회
  const isWeekend = (d) => { const day = d.getDay(); return day === 0 || day === 6; };
  const weekendCount = logs.filter(l => l.completedAt && isWeekend(new Date(l.completedAt))).length;
  if (weekendCount + (isWeekend(now) ? 1 : 0) >= 10) unlockAchievement('B-10');

  // B-11: 12~13시 완료 5회
  const noonCount = logs.filter(l => { const lh = new Date(l.completedAt).getHours(); return lh >= 12 && lh < 13; }).length;
  if (noonCount + (h >= 12 && h < 13 ? 1 : 0) >= 5) unlockAchievement('B-11');

  // B-12: 하루 6회 완료 (기존 로그 5개 + 현재)
  if (todayCount >= 5) unlockAchievement('B-12');

  // C-7: 같은 작업 10회 완료
  if (currentTask) {
    const sameTaskCount = logs.filter(l => l.task === currentTask).length;
    if (sameTaskCount + 1 >= 10) unlockAchievement('C-7');
  }

  // 완료 후 스핀 카운터 리셋
  _spinsSinceReset = 0;
}
