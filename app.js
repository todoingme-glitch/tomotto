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
const $completionNote = document.getElementById('completionNote'); // v0.1.20 — 소감
const $noteUploadBtn  = document.getElementById('noteUploadBtn');  // v0.1.22 — 소감 저장
// v0.1.22 — 라이트박스 dialog
const $imgLightboxDialog = document.getElementById('imgLightboxDialog');
const $imgLightboxImg    = document.getElementById('imgLightboxImg');
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
};

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
});

// 데이터 숨기기 토글
const $hideDataToggle = document.getElementById('settingsHideDataToggle');
if ($hideDataToggle) {
  $hideDataToggle.checked = !!localStorage.getItem(STORAGE_HIDE_DATA);
  $hideDataToggle.addEventListener('change', () => {
    if ($hideDataToggle.checked) {
      // 현재 모든 tomotto_ 데이터 백업 후 삭제 (온보딩·숨기기 플래그·백업키 제외)
      const backup = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('tomotto_') &&
            k !== STORAGE_HIDE_DATA && k !== STORAGE_DATA_BACKUP &&
            k !== STORAGE_ONBOARDED_TT) {
          backup[k] = localStorage.getItem(k);
        }
      }
      localStorage.setItem(STORAGE_DATA_BACKUP, JSON.stringify(backup));
      localStorage.setItem(STORAGE_HIDE_DATA, '1');
      Object.keys(backup).forEach(k => localStorage.removeItem(k));
      location.reload();
    } else {
      // 백업에서 복원
      const raw = localStorage.getItem(STORAGE_DATA_BACKUP);
      if (raw) {
        try {
          const backup = JSON.parse(raw);
          Object.entries(backup).forEach(([k, v]) => localStorage.setItem(k, v));
        } catch {}
        localStorage.removeItem(STORAGE_DATA_BACKUP);
      }
      localStorage.removeItem(STORAGE_HIDE_DATA);
      location.reload();
    }
  });
}

// 개발자 옵션 — 온보딩 초기화
document.getElementById('devResetOnboardingBtn')?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_ONBOARDED_TT);
  const btn = document.getElementById('devResetOnboardingBtn');
  btn.textContent = '✓ 초기화 완료! 새로고침하면 온보딩 시작';
  btn.disabled = true;
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

  // v0.1.15 — 두 모드 모두 가챠 결과 필수 (방어 코드)
  if (!currentTask) {
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
      const mapped = (battles || []).map((b) => {
        const myRow = myPlayerRows.find((r) => r.battle_id === b.id);
        return { ...b, _isCreator: myRow ? myRow.is_creator : false };
      });
      // v0.1.26 — 저장된 드래그 순서 적용
      return applyBattleOrder(mapped);
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
// '완료'   = battles.status === 'done'
// '대기 중' = 나머지 전부 (waiting / active-but-not-my-timer)
function getBattleDisplayStatus(b) {
  if (b.status === 'done') return { label: '완료', cls: 'done' };
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

function renderLogDay(dateStr) {
  const $detail = document.getElementById('logDayDetail');
  const $title  = document.getElementById('logDayTitle');
  const $list   = document.getElementById('logDayList');
  if (!$detail || !$title || !$list) return;

  const dayLogs = getLogsFromStorage().filter(l => l.date === dateStr);
  const [, m, d] = dateStr.split('-');
  $title.textContent = `${parseInt(m)}월 ${parseInt(d)}일 · ${dayLogs.length}회 완료`;

  // v0.1.34 — 인증샷 맵 로드
  let captures = {};
  try { captures = JSON.parse(localStorage.getItem(STORAGE.logCaptures) || '{}'); } catch {}

  if (dayLogs.length === 0) {
    $list.innerHTML = '<p class="log-empty-day">이 날은 기록이 없어요.</p>';
  } else {
    $list.innerHTML = dayLogs.map(log => {
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
        ? `<img class="log-item-capture" src="${captureUrl}" alt="인증샷">`
        : '';
      return `<div class="log-item${log.type === 'battle' ? ' log-item--battle' : ''}">
        <div class="log-item-row">
          <span class="log-item-icon">${icon}</span>
          <span class="log-item-task">${escapeHtml(log.task || '무제')}</span>
          <span class="log-item-meta">${mins}분${partnerText}</span>
          <span class="log-item-time">${timeStr}</span>
        </div>
        ${captureHtml}
        ${noteHtml}
      </div>`;
    }).join('');
  }

  $detail.hidden = false;
}

async function renderMyBattles() {
  const list = await loadMyBattles();
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
    const modeLabel  = b.mode === 'common' ? '🍅 TOM MODE' : '🎲 MOTO MODE';
    const { label: statusLabel, cls: statusCls } = getBattleDisplayStatus(b);
    const taskLabel  = b.mode === 'common' ? escapeHtml(b.task_common || '') : '각자 랜덤 가챠';
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
  const link = makeInviteLink(battle.id);
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE' : '🎲 MOTO MODE';
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
  // Vercel preview URL(커밋 해시 포함)에서 생성하면 로그인 요구됨.
  // preview URL 패턴: {project}-{8~12alphanum}-{team}.vercel.app
  // → 해시 제거해서 production URL로 교체
  const h = location.hostname;
  const previewMatch = h.match(/^(.+?)-[a-z0-9]{8,12}-(.+\.vercel\.app)$/);
  const base = previewMatch
    ? `https://${previewMatch[1]}-${previewMatch[2]}${location.pathname}`
    : location.origin + location.pathname;
  return `${base}?battle=${battleId}`;
}

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
let realtimeChannel = null;    // v0.1.18 — battle_players INSERT 구독 채널 (룸 뷰용)
let battleStartChannel = null; // v0.1.19 — battles UPDATE 구독 채널 (친구 쪽 동시 시작용)
let isStartingBattle = false;  // v0.1.19 — 중복 시작 방지 플래그
let watchChannel = null;       // v0.1.27 — 배틀 생성 후 친구 수락 대기 전용 채널 (룸 뷰 채널과 독립)
let watchBattleId = null;      // v0.1.27 — watchChannel이 감시 중인 battleId

// v0.1.15 — 배틀 초대 URL로 들어온 경우 타이머 잠금 (B안)
let lockedBattleId = null;

function showBattleLock(battleId) {
  lockedBattleId = battleId;
  $battleLockBanner.hidden = false;
  $startBtn.disabled = true;
}

function hideBattleLock() {
  lockedBattleId = null;
  $battleLockBanner.hidden = true;
  // currentTask 있으면 시작 버튼 복원, 없으면 그대로 비활성
  $startBtn.disabled = !currentTask;
}

// v0.1.15 — 가챠 완료 후 배너를 "준비됐어요! 배틀 시작" 상태로 전환
function updateBattleLockReady() {
  $battleLockBanner.querySelector('.battle-lock-text').textContent = '✓ 가챠 완료! 이제 배틀을 시작할 수 있어요';
  $battleLockOpenBtn.textContent = '배틀 시작 ▶';
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
  currentBattleId = battleId;
  $battleRoomSummary.textContent = '불러오는 중...';
  $battleRoomPlayers.innerHTML = '';
  $battleRoomTask.textContent = '';
  $battleRoomTask.className = 'battle-room-task empty';
  $battleRoomStatus.textContent = '';
  $battleRoomStatus.classList.remove('error');
  $battleRoomCancelBtn.hidden = false; // v0.1.27 — 카운트다운 후 hidden 상태 복원
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

  // v0.1.18 — 배틀 룸 열리면 Realtime 구독 시작 (배틀 완료 전까지만)
  console.log('[Realtime] openBattleRoom — status:', currentBattleData?.battle?.status);
  if (currentBattleData?.battle?.status !== 'done') {
    subscribeBattleRoom(battleId);
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
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE' : '🎲 MOTO MODE';
  // v0.1.31 — 로컬 타이머 상태 기준
  const { label: statusLabel } = getBattleDisplayStatus(battle);

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
    $battleRoomTask.textContent = `🍅 오늘의 공통 미션: ${battle.task_common}`;
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
    $battleRoomStatus.innerHTML = '친구가 링크를 열고 수락하길 기다리는 중... <span class="live-dot" title="자동 새로고침 중">●</span>';
  } else if (alreadyJoined && friend) {
    if (battle.mode === 'separate' && !currentTask) {
      // MOTO MODE: 내 가챠 결과 없음 → 가챠 유도
      $battleRoomGachaBtn.hidden = false;
      $battleRoomStatus.textContent = '가챠를 먼저 돌려서 내 작업을 정해주세요!';
    } else if (meIsCreator) {
      // 창조자: TOM MODE이거나 MOTO MODE에서 친구도 가챠 완료했을 때만 시작 가능
      if (battle.mode === 'separate') {
        const friendHasTask = !!(friend?.task);  // v0.1.22 — 친구 가챠 완료 여부
        if (!friendHasTask) {
          $battleRoomStatus.innerHTML = '친구가 가챠를 돌리길 기다리는 중... <span class="live-dot">●</span>';
          // 시작 버튼 숨김 유지
        } else {
          $battleRoomStartBtn.hidden = false;
          $battleRoomStatus.innerHTML = '둘 다 준비됐어요! 시작하면 친구도 동시에 카운트다운돼요. <span class="live-dot">●</span>';
        }
      } else {
        $battleRoomStartBtn.hidden = false;
        $battleRoomStatus.textContent = '둘 다 준비됐어요. 시작하면 친구도 동시에 시작돼요.';
      }
    } else {
      // v0.1.28 — 친구: 창조자 닉네임 표시 + TOM MODE는 창조자와 동일한 버튼
      if (battle.mode === 'separate' && !currentTask) {
        $battleRoomGachaBtn.hidden = false;
        $battleRoomStatus.textContent = '가챠를 먼저 돌려서 내 작업을 정해주세요!';
      } else {
        // v0.1.30 — 가챠 완료 상태: TOM/MOTO 모두 동일 문구·버튼으로 통일
        $battleRoomStatus.innerHTML = '둘 다 준비됐어요. 시작하면 친구도 동시에 시작돼요. <span class="live-dot">●</span>';
        $battleRoomStartBtn.hidden = false;
        $battleRoomStartBtn.textContent = '▶ 타이머 시작';
      }
    }
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

  // v0.1.17 — 수락자 쪽 localStorage에도 배틀 저장 (Supabase SELECT 정책 없을 때 fallback 보장)
  if (currentBattleData?.battle) {
    addToMyBattles({ ...currentBattleData.battle, _isCreator: false });
  }
  await renderMyBattles();  // 수락자 쪽 배틀카드 목록에도 추가 (await 추가)
}

// v0.1.17 — 3·2·1 카운트다운 (얼굴 양 옆 배치)
async function startBattleWithCountdown() {
  if (!currentBattleData || isStartingBattle || timer.running) return;
  // v0.1.30 — MOTO MODE에서 내 가챠가 아직 안 됐으면 카운트다운 차단
  // renderBattleRoom()이 이미 '가챠 먼저 돌리기' 버튼을 보여주고 있으므로 UI는 정상
  if (currentBattleData.battle?.mode === 'separate' && !currentTask) return;
  isStartingBattle = true;

  // v0.1.19 — battles 상태 'active'로 업데이트 → 상대방 Realtime 트리거
  if (sb && currentBattleId) {
    const { error } = await sb.from('battles')
      .update({ status: 'active' })
      .eq('id', currentBattleId);
    if (error) console.warn('[Supabase] battles UPDATE 실패:', error.message);
  }

  $battleRoomStartBtn.hidden = true;
  $battleRoomCancelBtn.hidden = true;
  $battleRoomStatus.textContent = '';

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

  for (let n = 3; n >= 1; n--) {
    renderCountRow(n);
    await new Promise(r => setTimeout(r, 900));
  }

  // 시작! — 얼굴 양옆 + 가운데 텍스트
  renderCountRow('시작!');
  playHifive();

  await new Promise(r => setTimeout(r, 750));
  countEl.remove();

  startBattleTimer();
}

function startBattleTimer() {
  if (!currentBattleData) return;
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
  // v0.1.15 — 따로 가챠 모드는 본인 가챠 결과 사용 (공통 작업은 task_common)
  let task = battle.mode === 'separate' ? currentTask : battle.task_common;
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
  if (typeof $battleRoomModal.close === 'function') $battleRoomModal.close();
  else $battleRoomModal.removeAttribute('open');
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
    // ② 친구 task 저장 감지 (battle_players UPDATE) — MOTO MODE 준비 상태 동기화
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'battle_players', filter: `battle_id=eq.${battleId}` },
      async (payload) => {
        console.log('[Realtime] battle_players UPDATE 감지 (task/note):', payload);
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
        if (payload.new?.status !== 'active') return;
        if (isStartingBattle || timer.running) return;  // 내가 이미 시작 중이면 무시

        unsubscribeBattleRoom();  // 중복 트리거 방지

        // 배틀 룸 모달이 닫혀있으면 데이터 로드 후 열기
        if (!$battleRoomModal.open) {
          currentBattleId = battleId;
          const result = await fetchBattle(battleId);
          if (result?.battle) currentBattleData = result;
          if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
          else $battleRoomModal.setAttribute('open', '');
        }
        await startBattleWithCountdown();
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] 구독 상태:', status, '/ battleId:', battleId);
      if (status === 'SUBSCRIBED') updateRealtimeStatusDot(true);
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
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
        if (payload.new?.status !== 'active') return;
        if (isStartingBattle || timer.running) return;

        unsubscribeWatchBattle();  // 중복 트리거 방지

        if (!$battleRoomModal.open) {
          currentBattleId = battleId;
          const result = await fetchBattle(battleId);
          if (result?.battle) currentBattleData = result;
          if (typeof $battleRoomModal.showModal === 'function') $battleRoomModal.showModal();
          else $battleRoomModal.setAttribute('open', '');
        }
        await startBattleWithCountdown();
      }
    )
    .subscribe((status) => {
      console.log('[Watch] 구독 상태:', status, '/ battleId:', battleId);
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
  dot.title = isLive ? '자동 새로고침 중' : '연결 중...';
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
        if (isStartingBattle || timer.running) return;  // 이미 시작 중이면 무시

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
    $noteUploadBtn.textContent = '저장 중...';

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
    $noteUploadBtn.textContent = '✏ 수정';
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
  showBattleLock(currentBattleId);   // 배너 유지 (없으면 새로 켜기)
  closeBattleRoom();
  switchTab('personal');  // v0.1.17 — 개인 탭 자동 전환
  document.querySelector('.category-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$battleRoomStartBtn.addEventListener('click', startBattleWithCountdown);

// 닉네임 저장 후 이벤트 (배틀 룸 열기 재시도용)
function dispatchNickSaved() {
  document.dispatchEvent(new CustomEvent('nick-saved'));
}

// ====== v0.1.17 — 하단 탭 네비게이션 ======
// 외부(배틀 타이머 등)에서 탭 전환 가능하도록 전역 노출
let switchTab = () => {};

(function initBottomTab() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const TAB_STORAGE_KEY = 'tomotto_active_tab';

  switchTab = function(tabId) {
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('tab-panel-hidden', panel.id !== `tab-${tabId}`);
    });
    localStorage.setItem(TAB_STORAGE_KEY, tabId);
    // v0.1.32 — 소셜 탭으로 전환 시 배틀카드 상태 즉시 갱신 (timer.isRunning 반영)
    if (tabId === 'social') { renderMyBattles(); renderLeaderboard(); }
    // v0.1.33 — 기록 탭으로 전환 시 캘린더 갱신
    if (tabId === 'log') renderLogCalendar();
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) switchTab(btn.dataset.tab);
    });
  });

  // 소셜 탭에서 배틀 초대 링크로 들어왔을 때 자동 전환
  const params = new URLSearchParams(location.search);
  const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
  if (params.has('battle')) {
    switchTab('social');
  } else if (savedTab) {
    switchTab(savedTab);
  }
  // 기본값(personal)은 HTML에서 이미 active 클래스로 설정돼 있음
})();

// v0.1.40 — 인앱 브라우저(카카오톡 등) 감지 → 외부 브라우저 유도 배너
function checkInAppBrowser() {
  if (localStorage.getItem('tomotto_iab_ok')) return;
  const ua = navigator.userAgent || '';
  const isInApp = /KAKAOTALK|NAVER|Instagram|FB_IAB|FBAN|Line\/|Snapchat/i.test(ua);
  if (!isInApp) return;
  const banner = document.createElement('div');
  banner.className = 'iab-banner';
  banner.innerHTML =
    '<span class="iab-msg">더 나은 경험을 위해 Chrome / Safari에서 열어주세요 🙏</span>' +
    '<button class="iab-open-btn" id="iabCopyBtn">링크 복사</button>' +
    '<button class="iab-close-btn" id="iabCloseBtn">✕</button>';
  document.body.prepend(banner);
  document.getElementById('iabCopyBtn').addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(location.href)
        .then(() => alert('링크 복사됐어요!\nChrome / Safari에 붙여넣어 주세요.'));
    } else {
      prompt('아래 링크를 복사해서 브라우저에서 열어주세요', location.href);
    }
  });
  document.getElementById('iabCloseBtn').addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('tomotto_iab_ok', '1');
  });
}

// 페이지 로드 시 닉네임 + 내 배틀 복원 + 온보딩 순서 처리
window.addEventListener('load', () => {
  loadNickname();
  renderMyBattles();
  setTimeout(playHifive, 400);
  initTabIcons();               // v0.1.34 — 탭 아이콘에 실제 로고 얼굴 주입
  checkInAppBrowser();          // v0.1.40 — 인앱 브라우저 감지

  const params = new URLSearchParams(location.search);
  const battleId = params.get('battle');

  if (battleId) {
    // 배틀 링크로 진입: 온보딩 먼저 → 완료 후 배틀 룸
    showBattleLock(battleId);
    // initOnboarding();        // v0.1.34 — Shepherd.js 버전 (보관)
    initOnboardingTooltip(() => {
      switchTab('social');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => openBattleRoom(battleId), 300);
    });
  } else {
    // 일반 진입: 온보딩만
    // initOnboarding();        // v0.1.34 — Shepherd.js 버전 (보관)
    initOnboardingTooltip();
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
    // v0.1.15 — 배틀 초대 링크로 들어온 사람이 가챠 완료 시 배너 상태 전환
    if (lockedBattleId) updateBattleLockReady();
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
  if (categories.length < 1) return;

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

  // 최종 결과 미리 결정 — 직전 결과와 연속 중복 방지
  let winner = categories[Math.floor(Math.random() * categories.length)];
  if (categories.length >= 2 && winner === currentTask) {
    do {
      winner = categories[Math.floor(Math.random() * categories.length)];
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

  $timerStatus.textContent = `"${currentTask}" 작업 중...`;
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

  // v0.1.28 — 리셋 시 소감/인증샷 유지 (시작 버튼 누를 때까지 보존)
  // $captureRow.hidden = true; ← 제거됨
  // v0.1.17 — 배틀 결과 버튼은 리셋 시 숨기지 않음 (새 배틀 시작 전까지 유지)

  saveTimerState(null);
  activeBattleId = null;   // v0.1.17 — 배틀 세션 종료
  localStorage.removeItem('tomotto_activeBattleId');
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
  timer.remaining = 0;
  timer.endTime = null;
  updateTimerDisplay();
  $timerDisplay.classList.remove('running');
  $timerDisplay.classList.add('finished');
  $startBtn.disabled = true;
  $pauseBtn.disabled = true;
  $resetBtn.disabled = false;
  // v0.1.20 — 배틀 모드면 파트너 닉네임 포함
  const battlePartner = getBattlePartnerInfo();
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

  // v0.1.36 — 소셜 리더보드 통계 동기화
  syncUserStats();

  // v0.1.33 — 기록 탭 로그 저장
  const _now = Date.now();
  saveLog({
    id: _now,
    date: formatDateStr(new Date(_now)),
    task: currentTask || '',
    durationSec: timer.duration,
    type: activeBattleId ? 'battle' : 'solo',
    battleMode: currentBattleData?.battle?.mode || null,
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
    $battleResultBtn.hidden = false;
    $battleResultBtn.dataset.battleId = activeBattleId;
    // v0.1.29 — 배틀 완료 시 status 'done' 업데이트 (여러 카드 '진행 중' 버그 수정)
    if (sb) {
      sb.from('battles')
        .update({ status: 'done' })
        .eq('id', activeBattleId)
        .then(({ error }) => {
          if (error) console.warn('[Supabase] battles done 업데이트 실패:', error.message);
          else console.log('[Supabase] battles status → done:', activeBattleId);
        });
    }
  }

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
      const { data: existing } = await sb
        .from('user_stats')
        .select('count')
        .eq('nickname', myNickname)
        .eq('period_type', p.period_type)
        .eq('period_key', p.period_key)
        .maybeSingle();
      await sb.from('user_stats').upsert({
        nickname: myNickname,
        period_type: p.period_type,
        period_key: p.period_key,
        count: (existing?.count ?? 0) + 1,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[syncUserStats] 실패:', err);
    }
  }
}

let lbPeriod = 'week'; // 현재 선택된 기간 ('week' | 'month')

async function renderLeaderboard() {
  const $body = document.getElementById('leaderboardBody');
  if (!$body) return;

  if (!myNickname) {
    $body.innerHTML = '<p class="lb-empty">닉네임을 설정하면 여기에 기록이 쌓여요.</p>';
    return;
  }

  // 파트너 닉네임 — Supabase battle_players에서 조회 (localStorage에는 partnerNick 없음)
  let partnerNicks = [];
  if (sb) {
    try {
      // 내가 참여한 배틀 ID 목록
      const { data: myRows } = await sb
        .from('battle_players')
        .select('battle_id')
        .eq('nickname', myNickname);
      if (myRows?.length) {
        const battleIds = myRows.map(r => r.battle_id);
        // 같은 배틀의 다른 참가자 닉네임
        const { data: partners } = await sb
          .from('battle_players')
          .select('nickname')
          .in('battle_id', battleIds)
          .neq('nickname', myNickname);
        if (partners) {
          partnerNicks = [...new Set(partners.map(p => p.nickname))];
        }
      }
    } catch {}
  }

  const now = new Date();
  const periodKey = lbPeriod === 'week' ? getWeekKey(now) : getMonthKey(now);
  const allNicks = [myNickname, ...partnerNicks];

  $body.innerHTML = '<p class="lb-loading">불러오는 중…</p>';

  let rows = [];
  if (sb) {
    try {
      const { data, error } = await sb
        .from('user_stats')
        .select('nickname, count')
        .in('nickname', allNicks)
        .eq('period_type', lbPeriod)
        .eq('period_key', periodKey);
      if (!error && data) rows = data;
    } catch {}
  }

  // 없으면 0으로 채움
  const statsMap = Object.fromEntries(rows.map(r => [r.nickname, r.count]));
  const entries = allNicks.map(nick => ({ nick, count: statsMap[nick] ?? 0 }));
  entries.sort((a, b) => b.count - a.count);

  if (entries.every(e => e.count === 0)) {
    $body.innerHTML = '<p class="lb-empty">아직 기록이 없어요. 타이머를 완료하면 집계돼요!</p>';
    return;
  }

  const maxCount = entries[0].count || 1;
  const medals = ['🥇', '🥈', '🥉'];
  const html = entries.map((e, i) => {
    const isMe = e.nick === myNickname;
    const pct = Math.max(4, Math.round((e.count / maxCount) * 100));
    const medal = medals[i] || `${i + 1}`;
    return `
      <div class="lb-row${isMe ? ' lb-row-me' : ''}">
        <span class="lb-rank">${medal}</span>
        <span class="lb-nick">${e.nick}${isMe ? ' <span class="lb-me-badge">나</span>' : ''}</span>
        <div class="lb-bar-wrap">
          <div class="lb-bar" style="width:${pct}%"></div>
        </div>
        <span class="lb-count">${e.count}회</span>
      </div>`;
  }).join('');
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
  $battleResultSummary.textContent = '결과 불러오는 중...';
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
  const modeLabel = battle.mode === 'common' ? '🍅 TOM MODE' : '🎲 MOTO MODE';
  $battleResultSummary.textContent = `${modeLabel} · ${minutes}분 · ${battle.task_common || '각자 랜덤 가챠'}`;

  const creator = players.find(p => p.is_creator);
  const friend = players.find(p => !p.is_creator);

  function playerCard(player) {
    if (!player) {
      return `<div class="battle-result-card empty">
        <div class="battle-result-nick">—</div>
        <div class="battle-result-role">아직 참여 안 함</div>
        <div class="battle-result-proof empty-proof">—</div>
      </div>`;
    }
    const isMe = player.nickname === myNickname;
    const roleLabel = isMe ? '나' : '상대방';
    const proofHtml = player.proof_url
      ? `<img class="battle-result-img" src="${escapeHtml(player.proof_url)}" alt="인증샷">`
      : `<div class="battle-result-proof empty-proof">인증샷 없음</div>`;
    const noteHtml = player.note
      ? `<div class="battle-result-note">${escapeHtml(player.note)}</div>`
      : '';
    return `<div class="battle-result-card${isMe ? ' is-me' : ''}">
      <div class="battle-result-nick">${escapeHtml(player.nickname)}</div>
      <div class="battle-result-role">${roleLabel}</div>
      ${proofHtml}
      ${noteHtml}
      ${player.proof_uploaded_at ? `<div class="battle-result-time">${new Date(player.proof_uploaded_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</div>` : ''}
    </div>`;
  }

  $battleResultPlayers.innerHTML = `
    ${playerCard(creator)}
    <div class="battle-vs">VS</div>
    ${playerCard(friend)}
  `;
}

$battleResultCloseBtn.addEventListener('click', () => {
  if (typeof $battleResultModal.close === 'function') $battleResultModal.close();
  else $battleResultModal.removeAttribute('open');
});

// v0.1.22 — 배틀 결과 인증샷 탭 → 라이트박스 (dialog 기반, top layer)
$battleResultPlayers.addEventListener('click', (e) => {
  const img = e.target.closest('.battle-result-img');
  if (!img) return;
  if ($imgLightboxDialog.open) {
    $imgLightboxDialog.close();
    return;
  }
  $imgLightboxImg.src = img.src;
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
// v0.1.24: 인앱 카메라 모달 제거 → 네이티브 파일선택 직접 사용
// (모바일: 카메라/갤러리 선택 시트, 데스크탑: 파일 선택창)
$captureBtn.addEventListener('click', () => {
  $captureInput.click();
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
      $captureBtn.textContent = '📤 업로드 중...';
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
    ge(ev.target.result);
  };
  reader.readAsDataURL(file);
  $captureInput.value = '';
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
