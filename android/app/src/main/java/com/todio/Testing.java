package com.todio;

public class Testing {
    public static void startTestThread() {
        new Thread(() -> {
            for (int i = 0; i < 100; i++) {
                System.out.println(JuceBridge.getCurrentPosition() + " / " + JuceBridge.getLengthInSeconds() + " | " + JuceBridge.isPlaying());
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }).start();
    }
}
