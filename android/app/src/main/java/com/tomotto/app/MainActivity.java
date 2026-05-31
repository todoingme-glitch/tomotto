package com.tomotto.app;

import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    /** 앱 링크로 시작됐을 때 Intent에서 추출한 battle ID (최초 1회만 사용) */
    private volatile String mLaunchBattleId = null;

    /**
     * JavaScript에서 window.AndroidBridge.getLaunchBattleId() 로 접근.
     * 네이티브 앱이 배틀 초대 링크로 시작됐을 때 battle ID를 JS에 전달한다.
     */
    public class AndroidBridge {
        @JavascriptInterface
        public String getLaunchBattleId() {
            String id = mLaunchBattleId;
            mLaunchBattleId = null; // 한 번만 반환 — 새로고침 시 재오픔 방지
            return id != null ? id : "";
        }

        /**
         * 타이머 포그라운드 서비스 시작.
         * @param endTimeMs  타이머 종료 시각 (System.currentTimeMillis() 기준 ms)
         * @param taskName   현재 작업명 (알림에 표시, 빈 문자열 허용)
         */
        @JavascriptInterface
        public void startTimerNotification(long endTimeMs, String taskName) {
            requestNotificationPermissionIfNeeded();
            Intent intent = new Intent(MainActivity.this, TimerForegroundService.class);
            intent.setAction(TimerForegroundService.ACTION_START);
            intent.putExtra(TimerForegroundService.EXTRA_END_MS, endTimeMs);
            intent.putExtra(TimerForegroundService.EXTRA_TASK, taskName != null ? taskName : "");
            ContextCompat.startForegroundService(MainActivity.this, intent);
        }

        /** 타이머 포그라운드 서비스 중지 (취소·완료 시 JS에서 호출) */
        @JavascriptInterface
        public void stopTimerNotification() {
            Intent intent = new Intent(MainActivity.this, TimerForegroundService.class);
            intent.setAction(TimerForegroundService.ACTION_STOP);
            stopService(intent);
        }

        /**
         * 앱 종료로 인해 중단된 타이머의 남은 시간(ms)을 반환하고 플래그를 지운다.
         * 중단 이력 없으면 0 반환.
         */
        @JavascriptInterface
        public long getInterruptedTimerRemaining() {
            android.content.SharedPreferences prefs =
                getSharedPreferences("tomotto_prefs", MODE_PRIVATE);
            long remaining = prefs.getLong("interrupted_remaining_ms", 0);
            if (remaining > 0) {
                prefs.edit().remove("interrupted_remaining_ms").apply();
            }
            return remaining;
        }
    }

    /** Android 13+ 알림 권한 요청 */
    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this,
                    android.Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                    new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 200);
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // intent:// / kakaotalk:// 등 커스텀 스킴을 시스템에 위임
        // (기본 WebViewClient는 이를 무시해서 카카오톡 공유가 동작 안 함)
        getBridge().getWebView().setWebViewClient(
            new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString();

                    if (url.startsWith("intent://")
                            || url.startsWith("kakaotalk://")
                            || url.startsWith("kakaolink://")) {
                        try {
                            Intent intent;
                            if (url.startsWith("intent://")) {
                                intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME);
                            } else {
                                intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                            }
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception e) {
                            // 카카오톡 미설치 등 — 무시
                        }
                        return true;
                    }

                    return super.shouldOverrideUrlLoading(view, request);
                }
            }
        );

        // JavascriptInterface 등록 — app.js load 이벤트보다 먼저 사용 가능
        getBridge().getWebView().addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        // 앱이 배틀 링크로 시작된 경우 battle ID 추출
        extractBattleIdFromIntent(getIntent());

        // 타이머 완료 알림 탭으로 시작된 경우 타이머 섹션으로 이동
        if (getIntent() != null && getIntent().getBooleanExtra("from_timer_notification", false)) {
            getBridge().getWebView().postDelayed(() -> navigateToTimer(), 800);
        }
    }

    /** 타이머 섹션으로 JS 이동 */
    private void navigateToTimer() {
        final String js =
            "if(typeof switchTab==='function'){" +
            "  switchTab('personal');" +
            "  requestAnimationFrame(function(){" +
            "    var el=document.querySelector('.timer-section');" +
            "    if(el)el.scrollIntoView({behavior:'smooth',block:'start'});" +
            "  });" +
            "}";
        getBridge().getWebView().post(() ->
            getBridge().getWebView().evaluateJavascript(js, null));
    }

    /**
     * 앱이 이미 실행 중(백그라운드)일 때 배틀 링크를 클릭하면 호출됨.
     * 이미 온보딩을 마친 상태이므로 _handleDeepLinkUrl 를 직접 호출한다.
     */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // 타이머 완료 알림에서 복귀
        if (intent.getBooleanExtra("from_timer_notification", false)) {
            getBridge().getWebView().postDelayed(() -> navigateToTimer(), 300);
            return;
        }
        String battleId = getBattleIdFromUri(intent.getData());
        if (battleId == null) return;
        final String safeId = battleId;
        final String js =
            "if(typeof _handleDeepLinkUrl==='function')" +
            "{_handleDeepLinkUrl('https://tomotto.vercel.app/?battle=" + safeId + "');}";
        getBridge().getWebView().post(() ->
            getBridge().getWebView().evaluateJavascript(js, null));
    }

    private void extractBattleIdFromIntent(Intent intent) {
        if (intent == null) return;
        if (!Intent.ACTION_VIEW.equals(intent.getAction())) return;
        String id = getBattleIdFromUri(intent.getData());
        if (id != null) mLaunchBattleId = id;
    }

    /** battle 쿼리 파라미터 추출 — 영숫자/_/- 만 허용 (인젝션 방지) */
    private String getBattleIdFromUri(Uri uri) {
        if (uri == null) return null;
        String id = uri.getQueryParameter("battle");
        if (id != null && id.matches("[a-zA-Z0-9_-]+")) return id;
        return null;
    }
}
