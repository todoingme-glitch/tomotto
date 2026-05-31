package com.tomotto.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import androidx.core.app.NotificationCompat;

/**
 * AlarmManager가 발사하는 BroadcastReceiver.
 * Doze 모드 / 백그라운드에서도 타이머 완료 알림을 확실하게 표시한다.
 */
public class TimerAlarmReceiver extends BroadcastReceiver {

    public static final String EXTRA_TASK    = "taskName";
    static final String        CHANNEL_ID    = "tomotto_done";
    private static final int   NOTIF_ID      = 1002;

    @Override
    public void onReceive(Context context, Intent intent) {
        String task = intent.getStringExtra(EXTRA_TASK);
        if (task == null) task = "";

        NotificationManager nm =
            (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // 완료 채널 보장 생성
        NotificationChannel ch = new NotificationChannel(
            CHANNEL_ID, "Tomotto 타이머 완료", NotificationManager.IMPORTANCE_HIGH);
        ch.enableVibration(true);
        nm.createNotificationChannel(ch);

        // 탭 시 앱 복귀 + 타이머 섹션 이동 플래그
        Intent tap = new Intent(context, MainActivity.class);
        tap.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        tap.putExtra("from_timer_notification", true);
        PendingIntent pi = PendingIntent.getActivity(
            context, 0, tap,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String content = task.isEmpty()
            ? "집중 세션 완료! 수고했어요 🍅"
            : "\"" + task + "\" 완료! 수고했어요 🍅";

        NotificationCompat.Builder b = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_tomato_notif)
            .setContentTitle("Tomotto")
            .setContentText(content)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH);

        nm.notify(NOTIF_ID, b.build());

        // 진행 중 포그라운드 알림 제거 (이미 종료됐을 수 있지만 안전하게)
        nm.cancel(1001);
    }
}
