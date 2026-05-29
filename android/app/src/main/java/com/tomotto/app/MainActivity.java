package com.tomotto.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

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
                        } catch (ActivityNotFoundException | Exception e) {
                            // 카카오톡 미설치 등 — 무시
                        }
                        return true;
                    }

                    return super.shouldOverrideUrlLoading(view, request);
                }
            }
        );
    }
}
