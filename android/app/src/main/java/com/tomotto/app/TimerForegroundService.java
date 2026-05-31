package com.tomotto.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;

/**
 * Tomotto 타이머 포그라운드 서비스.
 * JS에서 startTimerNotification(endTimeMs) 호출 시 시작되며
 * 매초 알림 영역에 남은 시간을 업데이트한다.
 */
public class TimerForegroundService extends Service {

    public static final String ACTION_START  = "com.tomotto.app.TIMER_START";
    public static final String ACTION_STOP   = "com.tomotto.app.TIMER_STOP";
    public static final String EXTRA_END_MS  = "endTimeMs";
    public static final String EXTRA_TASK    = "taskName";

    private static final String CHANNEL_ID      = "tomotto_timer";
    private static final String CHANNEL_DONE_ID = "tomotto_done";
    private static final int    NOTIF_ID     = 1001;

    private long    mEndTimeMs = 0;
    private String  mTaskName  = "";
    private Handler mHandler;
    private final Runnable mTickRunnable = new Runnable() {
        @Override
        public void run() {
            long remaining = mEndTimeMs - System.currentTimeMillis();
            if (remaining <= 0) {
                showDoneNotification();
                stopSelf();
                return;
            }
            updateNotification(remaining);
            mHandler.postDelayed(this, 1000);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        mHandler = new Handler(Looper.getMainLooper());
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(); return START_NOT_STICKY; }

        if (ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }

        mEndTimeMs = intent.getLongExtra(EXTRA_END_MS, 0);
        mTaskName  = intent.getStringExtra(EXTRA_TASK);
        if (mTaskName == null) mTaskName = "";

        if (mEndTimeMs <= System.currentTimeMillis()) { stopSelf(); return START_NOT_STICKY; }

        startForeground(NOTIF_ID, buildNotification(mEndTimeMs - System.currentTimeMillis()));
        mHandler.removeCallbacks(mTickRunnable);
        mHandler.postDelayed(mTickRunnable, 1000);
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        mHandler.removeCallbacks(mTickRunnable);
        // 앱 스와이프 종료 등으로 서비스가 중단될 때 남은 시간 저장 → 앱 재시작 시 일시정지 복원
        long remaining = mEndTimeMs - System.currentTimeMillis();
        if (remaining > 0) {
            getSharedPreferences("tomotto_prefs", MODE_PRIVATE)
                .edit()
                .putLong("interrupted_remaining_ms", remaining)
                .apply();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    // ── 알림 빌드 ─────────────────────────────────────────────

    private void createChannel() {
        NotificationManager nm = getSystemService(NotificationManager.class);
        // 진행 중 채널 — 소리 없는 조용한 알림
        NotificationChannel ch = new NotificationChannel(
            CHANNEL_ID, "Tomotto 타이머", NotificationManager.IMPORTANCE_LOW);
        ch.setDescription("집중 타이머 진행 상황");
        ch.setSound(null, null);
        ch.enableVibration(false);
        nm.createNotificationChannel(ch);
        // 완료 채널 — 소리+진동 팝업 알림
        NotificationChannel done = new NotificationChannel(
            CHANNEL_DONE_ID, "Tomotto 타이머 완료", NotificationManager.IMPORTANCE_HIGH);
        done.setDescription("타이머 완료 알림");
        done.enableVibration(true);
        nm.createNotificationChannel(done);
    }

    private Notification buildNotification(long remainingMs) {
        String timeStr = formatMs(remainingMs);
        String content = mTaskName.isEmpty()
            ? "⏱ " + timeStr + " 남음"
            : "⏱ " + timeStr + " — " + mTaskName;

        // 탭 시 앱 복귀
        Intent tap = new Intent(this, MainActivity.class);
        tap.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(
            this, 0, tap, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_tomato_notif)
            .setContentTitle("Tomotto — 집중 중")
            .setContentText(content)
            .setContentIntent(pi)
            .setOngoing(true)
            .setSilent(true)
            .setShowWhen(false)
            .build();
    }

    private void updateNotification(long remainingMs) {
        NotificationManager nm = getSystemService(NotificationManager.class);
        nm.notify(NOTIF_ID, buildNotification(remainingMs));
    }

    private void showDoneNotification() {
        String content = mTaskName.isEmpty()
            ? "집중 세션 완료! 수고했어요 🍅"
            : "\"" + mTaskName + "\" 완료! 수고했어요 🍅";

        Intent tap = new Intent(this, MainActivity.class);
        tap.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(
            this, 0, tap, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder b = new NotificationCompat.Builder(this, CHANNEL_DONE_ID)
            .setSmallIcon(R.drawable.ic_tomato_notif)
            .setContentTitle("Tomotto")
            .setContentText(content)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setOngoing(false);

        getSystemService(NotificationManager.class).notify(NOTIF_ID + 1, b.build());
        // 진행 중 알림 제거
        getSystemService(NotificationManager.class).cancel(NOTIF_ID);
    }

    // ── 시간 포맷 ─────────────────────────────────────────────

    private static String formatMs(long ms) {
        if (ms < 0) ms = 0;
        long totalSec = ms / 1000;
        long h = totalSec / 3600;
        long m = (totalSec % 3600) / 60;
        long s = totalSec % 60;
        if (h > 0) {
            return h + ":" + pad(m) + ":" + pad(s);
        }
        return pad(m) + ":" + pad(s);
    }

    private static String pad(long n) {
        return n < 10 ? "0" + n : String.valueOf(n);
    }
}
